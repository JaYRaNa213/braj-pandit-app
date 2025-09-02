import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { colors } from '../assets/constants/colors';
import { useTheme } from '../context/ThemeContext';
import axiosInstance from '../utils/axiosInstance';
import i18n from '../../i18n';
import WithSafeArea from '../components/HOC/SafeAreaView';

const TempleDetails = ({ route }) => {
  const { t } = useTranslation();
  const { title } = route?.params;
  const lang = i18n.language;
  const [temple, setTemple] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // const { data, isLoading } = useGetTempleByTitleQuery(title);
  // const temple = data?.data;
  const displayTitle = temple?.title
    ?.split('-')
    .map((item) => item[0].toUpperCase() + item.substring(1))
    .join(' ');
  const [currentIndex, setCurrentIndex] = useState(0);
  const { isDarkMode } = useTheme();
  const navigation = useNavigation();

  const travelHeading = ['Airplane', 'Train', 'Bus'];

  const fetchTempleDetails = async () => {
    setIsLoading(true);
    try {
      const { data } = await axiosInstance.get(
        `/temple/?title=${title}&lang=${lang}`,
      );

      setTemple(data?.data);
    } catch (error) {
      console.log('Error fetching temple ', error);
    } finally {
      setIsLoading(false);
    }
  };

  const headerRight = () => (
    <TouchableOpacity
      onPress={() => {
        const message = `Check out this temple: ${
          temple?.title
        }\n\nRead more at: ${`https://www.vedaz.io/temples/${temple?.title}`}`;
        const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(
          message,
        )}`;
        Linking.openURL(whatsappUrl);
      }}
      style={{
        marginRight: 15,
        backgroundColor: 'green',
        borderRadius: 34,
        width: 38,
        height: 38,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <FontAwesome name="whatsapp" size={24} color="white" />
    </TouchableOpacity>
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: (
        <Text style={{ textTransform: 'capitalize' }}>{displayTitle}</Text>
      ),
      headerRight: () => headerRight(),
    });
  }, [navigation, temple, displayTitle]);

  useEffect(() => {
    fetchTempleDetails();
  }, []);

  if (isLoading) {
    return (
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: isDarkMode ? colors.darkBackground : colors.lightBackground,
          flex: 1,
        }}
      >
        <ActivityIndicator
          size={'large'}
          color={isDarkMode ? 'white' : colors.purple}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={{
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: isDarkMode ? colors.darkBackground : colors.lightBackground,
      }}
    >
      <View style={{ height: 220, overflow: 'hidden', borderRadius: 12 }}>
        {temple?.image?.length > 1 ? (
          <FlatList
            data={temple?.image}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item.replace(/\s/g, '') }}
                style={{
                  width: Dimensions.get('window').width - 24,
                  height: 220,
                  resizeMode: 'cover',
                  overflow: 'hidden',
                }}
              />
            )}
            onScroll={(event) => {
              const slideIndex = Math.round(
                event.nativeEvent.contentOffset.x /
                  Dimensions.get('window').width,
              );
              setCurrentIndex(slideIndex);
            }}
          />
        ) : (
          <Image
            source={{ uri: temple?.image?.[0] }}
            style={{
              width: Dimensions.get('window').width - 32,
              height: 220,
              resizeMode: 'cover',
            }}
          />
        )}
        <View
          style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            paddingHorizontal: 8,
            borderRadius: 4,
          }}
        >
          <Text style={{ color: '#fff' }}>
            {currentIndex + 1}/{temple?.image?.length}
          </Text>
        </View>
      </View>

      <View style={{ marginTop: 8 }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            textAlign: 'center',
            color: isDarkMode ? colors.darkTextPrimary : colors.black,
            textTransform: 'capitalize',
          }}
        >
          {displayTitle}
        </Text>
        <Text
          style={{
            textAlign: 'center',
            marginTop: 3,
            color: isDarkMode ? colors.darkTextSecondary : colors.dark,
          }}
        >
          {temple?.location}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginVertical: 8,
          }}
        >
          <Text style={{color: isDarkMode ? colors.darkTextSecondary : colors.dark }}>Timings:</Text>
          {temple?.templeTimings?.map((timing, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginLeft: 4,
              }}
            >
              <Text style={{ color: isDarkMode ? '#fff' : '#000' }}>
                {timing}
              </Text>
            </View>
          ))}
        </View>
      </View>

      
      <View style={{ marginTop: 20 }}>
        {/*About*/}
        <View>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '500',
              color: isDarkMode ? colors.darkTextPrimary : colors.black,
            }}
          >
            {t('Temples.templeDetailes.about')}
          </Text>
          <Text
            style={{
              textAlign: 'justify',
              fontSize: 16,
              lineHeight: 22,
              marginTop:8,
              color: isDarkMode ? colors.darkTextSecondary : colors.dark,
            }}
          >
            {temple?.overview}
          </Text>
        </View>
        
        {/*History*/}
        <View style={{ marginTop: 20 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: isDarkMode ? colors.darkTextPrimary : colors.black,
            }}
          >
            {t('Temples.templeDetailes.history')}
          </Text>
          <Text
            style={{
              textAlign: 'justify',
              fontSize: 16,
              lineHeight: 22,
              marginTop:8,
              color: isDarkMode ? colors.darkTextSecondary : colors.dark,
            }}
          >
            {temple?.history}
          </Text>
        </View>

        {/*Architecture*/}
        <View style={{ marginTop: 20 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: isDarkMode ? colors.darkTextPrimary : colors.black,
            }}
          >
            {t('Temples.templeDetailes.architecture')}
          </Text>
          <Text
            style={{
              textAlign: 'justify',
              fontSize: 16,
              lineHeight: 22,
              marginTop:8,
              color: isDarkMode ? colors.darkTextSecondary : colors.dark,
            }}
          >
            {temple?.architecture}
          </Text>
        </View>

        {/*Significance*/}
        <View style={{ marginTop: 20 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: isDarkMode ? colors.darkTextPrimary : colors.black,
            }}
          >
            {t('Temples.templeDetailes.significance')}
          </Text>
          <Text
            style={{
              textAlign: 'justify',
              fontSize: 16,
              lineHeight: 22,
              marginTop:8,
              color: isDarkMode ? colors.darkTextSecondary : colors.dark,
            }}
          >
            {temple?.significance}
          </Text>
        </View>

        {/*Timings*/}
        <View style={{ marginTop: 20 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: isDarkMode ? colors.darkTextPrimary : colors.black,
            }}
          >
            {displayTitle} {t('Temples.templeDetailes.timings')}
          </Text>
          <View
            style={{ marginTop: 8, flexDirection: 'row', flexWrap: 'wrap' }}
          >
            {temple?.eventTimings?.map(
              (timing, index) =>
                timing.title && (
                  <View
                    key={index}
                    style={{
                      backgroundColor: isDarkMode ? colors.darkTableRowOdd : '#F0F0F0',
                      borderRadius: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 8,
                      marginRight: 8,
                      marginBottom: 8,
                      width: '100%',
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: isDarkMode ? '#555' : '#F0F0F0',
                        borderRadius: 20,
                        padding: 8,
                        marginRight: 8,
                      }}
                    >
                      <AntDesign
                        name="calendar"
                        size={24}
                        color={isDarkMode ? '#fff' : '#501873'}
                      />
                    </View>
                    <View style={{ flexDirection: 'column' }}>
                      <Text
                        style={{
                          fontWeight: 'bold',
                          color: isDarkMode ? colors.darkTextPrimary : colors.black,
                        }}
                      >
                        {timing.title}
                      </Text>
                      <Text style={{ color: isDarkMode ? colors.darkTextSecondary : colors.dark }}>
                        {timing.startTime} - {timing.endTime}
                      </Text>
                    </View>
                  </View>
                ),
            )}
          </View>
        </View>

        {/*Offerings*/}
        <View style={{ marginTop: 20 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: isDarkMode ? colors.darkTextPrimary : colors.black,
            }}
          >
            {t('Temples.templeDetailes.offerings')}
          </Text>
          <Text
            style={{
              textAlign: 'justify',
              fontSize: 16,
              lineHeight: 22,
              marginTop:8,
              color: isDarkMode ? colors.darkTextSecondary : colors.dark,
            }}
          >
            {temple?.offerings}
          </Text>
        </View>

        {/*How to Reach*/}
        <View style={{ marginTop: 20 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: isDarkMode ? colors.darkTextPrimary : colors.black,
            }}
          >
            {t('Temples.templeDetailes.travel')}: {displayTitle}{' '}
            {t('Temples.templeDetailes.distance')}
          </Text>
          <View style={{ marginTop: 8 }}>
            {temple?.travel?.map((item, index) => (
              <View
                key={index}
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: isDarkMode ? '#555' : '#CCC',
                  paddingBottom: 8,
                  marginBottom: 8,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '600',
                      color: isDarkMode ? colors.darkTextPrimary : colors.black,
                    }}
                  >
                    {travelHeading?.[index]}
                  </Text>
                </View>
                <Text
                  style={{
                    marginTop: 8,
                    fontSize: 16,
                    textAlign:'justify',
                    color: isDarkMode ? colors.darkTextSecondary : colors.dark,
                  }}
                >
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default WithSafeArea(TempleDetails);
