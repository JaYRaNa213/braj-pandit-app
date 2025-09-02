import { Picker } from '@react-native-picker/picker';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, FlatList, Image, View } from 'react-native';
import Video from 'react-native-video';
import { SkeletonLoader } from '../components/Loader';
import TempleItem from '../components/TempleItem';
import { useTheme } from '../context/ThemeContext';
import axiosInstance from '../utils/axiosInstance';
import i18n from '../../i18n';
import FreeAstrologersBtn from '../components/FreeAstrologersBtn';
import { colors } from '../assets/constants/colors';

const Temples = () => {
  const { t } = useTranslation();
  const [temples, setTemples] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [states, setStates] = useState([]);
  const lang = i18n.language;
  const [selectedState, setSelectedState] = useState(null);

  const flatListRef = useRef(null);
  const [shouldPlayNext, setShouldPlayNext] = useState(true);
  const { isDarkMode } = useTheme();
  const navigation = useNavigation();
  const isFocused = useIsFocused(); // Hook to detect if the screen is in focus

  const fetchAllTemples = async (state = 'all') => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(
        `/temple/all?page=${page}&state=${state}&lang=${lang}`,
      );

      if (data?.data?.temples.length > 0) {
        setTemples((prevTemples) =>
          state !== 'all'
            ? data.data.temples
            : [...prevTemples, ...data.data.temples],
        );
        setHasMore(true);
      } else {
        setHasMore(false);
      }
      setLoadingMore(false);
    } catch (error) {
      console.log('Error fetching all temples ', error);
      setLoadingMore(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStates = async () => {
    try {
      const { data } = await axiosInstance.get('/temple/states');

      setStates(data?.data);
    } catch (error) {
      console.log('Error fetching all states ', error);
    }
  };

  const media = [
    {
      type: 'image',
      source:
        'https://res.cloudinary.com/doetbfahk/image/upload/v1718027652/Vedaz_App/Tirupati_yb299z.jpg',
    },
    {
      type: 'image',
      source:
        'https://res.cloudinary.com/doetbfahk/image/upload/v1718027633/Vedaz_App/Badrinath_Temple___Uttarakhand_jg9ex9.jpg',
    },
    {
      type: 'video',
      source:
        'https://res.cloudinary.com/doetbfahk/video/upload/v1718027689/Vedaz_App/VN20240517_211031_qe1ngk.mp4',
    },
    {
      type: 'video',
      source:
        'https://res.cloudinary.com/doetbfahk/video/upload/v1718027669/Vedaz_App/VN20240517_094213_kybrwl.mp4',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (shouldPlayNext && isFocused) {
        // Only update when the screen is focused
        setCurrentIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % media.length;
          flatListRef.current.scrollToIndex({ index: nextIndex });
          return nextIndex;
        });
      }
    }, 5000); // change every 5 seconds

    return () => clearInterval(interval);
  }, [shouldPlayNext, isFocused, media.length]);

  const renderMediaItem = ({ item, index }) => {
    const handlePlaybackStatusUpdate = (status) => {
      if (status.didJustFinish) {
        setShouldPlayNext(true);
      } else {
        setShouldPlayNext(false);
      }
    };

    if (item.type === 'video') {
      return (
        <Video
          source={{ uri: item.source }}
          style={{
            width: Dimensions.get('window').width,
            height: 220,
            resizeMode: 'cover',
          }}
          resizeMode="cover"
          paused={!isFocused || currentIndex !== index} // Play only if the screen is focused and it's the current video
          onProgress={handlePlaybackStatusUpdate}
          repeat={true}
        />
      );
    } else {
      return (
        <Image
          source={{ uri: item.source }}
          style={{
            width: Dimensions.get('window').width,
            height: 220,
            resizeMode: 'cover',
          }}
        />
      );
    }
  };

  const renderItem = ({ item }) => (
    <View style={{ marginHorizontal: 16, flexDirection: 'column' }}>
      <TempleItem temple={item} key={item._id} />
    </View>
  );

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  };

  const loadMoreData = debounce(() => {
    if (!loadingMore && hasMore && !selectedState) {
      setLoadingMore(true);
      setPage((prevPage) => prevPage + 1);
    }
  }, 300);

  const headerRight = () => (
    <Picker
      selectedValue={'all'}
      style={{ height: 'auto', width: 150, color: 'white' }}
      dropdownIconColor={'white'}
      onValueChange={(itemValue) => {
        setSelectedState(itemValue);
        fetchAllTemples(itemValue);
      }}
    >
      {/* for All Data  */}
      <Picker.Item label="All" value="all" />
      {states?.map((state) => (
        <Picker.Item label={state} value={state} key={state} />
      ))}
    </Picker>
  );

  useEffect(() => {
    if (!selectedState) {
      fetchAllTemples();
    }
  }, [page]);

  useEffect(() => {
    fetchAllStates();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => headerRight(),
    });
  }, [navigation, states]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('Temples.screenHead'),
    });
  });

  return (
    <>
      <FlatList
        ListHeaderComponent={
          <View style={{ height: 100, overflow: 'hidden', marginBottom: 16 }}>
            <FlatList
              ref={flatListRef}
              data={media}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderMediaItem}
              onScroll={(event) => {
                const slideIndex = Math.round(
                  event.nativeEvent.contentOffset.x /
                    Dimensions.get('window').width,
                );
                setCurrentIndex(slideIndex);
              }}
            />
            <View
              style={{
                position: 'absolute',
                bottom: 10,
                flexDirection: 'row',
                alignSelf: 'center',
              }}
            >
              {media.map((_, index) => (
                <View
                  key={index}
                  style={{
                    height: 4,
                    width: 40,
                    borderRadius: 4,
                    backgroundColor: '#fff',
                    marginHorizontal: 8,
                    opacity: index === currentIndex ? 1 : 0.5,
                  }}
                />
              ))}
            </View>
          </View>
        }
        onEndReached={loadMoreData}
        onEndReachedThreshold={0.2}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        data={temples}
        numColumns={1}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListFooterComponent={loading ? <SkeletonLoader /> : null}
        style={{ backgroundColor: isDarkMode ? colors.darkBackground : colors.lightBackground }}
      />
      <FreeAstrologersBtn />
    </>
  );
};

export default Temples;
