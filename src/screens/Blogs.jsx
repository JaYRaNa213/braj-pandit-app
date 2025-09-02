import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../assets/constants/colors';
import BlogItem from '../components/BlogItem';
import { SkeletonLoader } from '../components/Loader';
import { useTheme } from '../context/ThemeContext';
import axiosInstance from '../utils/axiosInstance';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import i18n from '../../i18n';
import WithSafeArea from '../components/HOC/SafeAreaView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FilterButton = ({
  category,
  isDarkMode,
  type,
  t,
  isLoading,
  handleTypeChange,
}) => {
  return (
    <TouchableOpacity
      style={{
        backgroundColor: type === category ? (colors.purple) : (isDarkMode ? colors.darkSurface:'white'),
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
        borderColor: isDarkMode ? colors.dark : colors.lightGray,
        borderWidth: 1,
      }}
      onPress={() => handleTypeChange(category)}
      disabled={isLoading}
    >
      <Text
        style={{
          fontSize: 12,
          color: type === category ? 'white' : (isDarkMode ? colors.darkTextPrimary:colors.purple),
        }}
      >
        {t(`blogs.sections.${category}`)}
      </Text>
    </TouchableOpacity>
  );
};

const Blogs = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const { isDarkMode } = useTheme();
  const [type, setType] = useState('');

  const lang = i18n.language;

  const fetchAllBlogs = async (selectedType, newPage = 1) => {
    try {
      const url = `/blog/all?lang=${lang}&page=${newPage}${
        selectedType ? `&type=${selectedType}` : ''
      }`;
      const { data } = await axiosInstance.get(url);

      if (newPage === 1) {
        setBlogs(data?.data?.blogs);
      } else {
        setBlogs((prevBlogs) => [...prevBlogs, ...data?.data?.blogs]);
      }

      setHasMore(data?.data?.blogs.length > 0);
    } catch (error) {
      console.error('Error fetching all blogs:', error);
    } finally {
      setIsLoading(false); // Hide loader after fetching data
      setLoadingMore(false);
    }
  };

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  };
  const insets = useSafeAreaInsets();

  const loadMoreData = debounce(() => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      setPage((prevPage) => prevPage + 1);
    }
  }, 300);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('blogs.screenHead'),
      headerRight: () => (
        <View
          style={{
            flexDirection: 'row',
            marginRight: 14,
            gap: 14,
            alignItems: 'center',
          }}
        >
          <TouchableOpacity onPress={() => navigation.navigate('Search')}>
            <MaterialCommunityIcons name="magnify" size={20} color="white" />
          </TouchableOpacity>
        </View>
      ),
    });
  });

  useEffect(() => {
    fetchAllBlogs(type, page);
  }, [type, page]);

  const handleTypeChange = (newType) => {
    setType(newType);
    setPage(1);
    setIsLoading(true); // Show skeleton loader immediately
    fetchAllBlogs(newType, 1);
  };

  return (
    <>
      {/* <ScrollView ref={scrollViewRef}> */}
      <FlatList
        data={blogs}
        renderItem={({ item }) => <BlogItem blog={item} key={item._id} />}
        keyExtractor={(item) => item._id}
        ListFooterComponent={isLoading ? <SkeletonLoader /> : null}
        contentContainerStyle={{
          paddingVertical: 12,
          paddingBottom: 70,
          paddingHorizontal: 12,
          backgroundColor: isDarkMode ? colors.darkBackground : colors.lightBackground,
        }}
        onEndReached={loadMoreData}
        onEndReachedThreshold={0.2}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={21}
      />
      {/* </ScrollView> */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          backgroundColor: isDarkMode ? colors.darkBackground : colors.lightBackground,
          width: '100%',
          paddingBottom: insets.bottom,
        }}
      >
        <ScrollView
          horizontal
          contentContainerStyle={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingVertical: 12,
            paddingHorizontal: 10,
            gap: 12,
          }}
        >
          <FilterButton
            category={'astrology_blog'}
            isDarkMode={isDarkMode}
            setType={setType}
            t={t}
            type={type}
            isLoading={isLoading}
            handleTypeChange={handleTypeChange}
          />
          <FilterButton
            category={'temple_blog'}
            isDarkMode={isDarkMode}
            setType={setType}
            t={t}
            type={type}
            isLoading={isLoading}
            handleTypeChange={handleTypeChange}
          />
          <FilterButton
            category={'relationship_blog'}
            isDarkMode={isDarkMode}
            setType={setType}
            t={t}
            type={type}
            isLoading={isLoading}
            handleTypeChange={handleTypeChange}
          />
          <FilterButton
            category={'puja_blog'}
            isDarkMode={isDarkMode}
            setType={setType}
            t={t}
            type={type}
            isLoading={isLoading}
            handleTypeChange={handleTypeChange}
          />
        </ScrollView>
      </View>
    </>
  );
};

export default WithSafeArea(Blogs);
