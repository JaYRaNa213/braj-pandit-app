import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, ScrollView, Text, View } from 'react-native';
import { colors } from '../assets/constants/colors';
import { zodiacBrief } from '../assets/constants/zodiacBrief';
import RelationshipCompatibilityCard from '../components/RelationShipCompatibilityCard';
import { useTheme } from '../context/ThemeContext';
import { useGetZodaicCompatibilityQuery } from '../redux/api/compatibilityApi';
import axiosInstance from '../utils/axiosInstance';
import WithSafeArea from '../components/HOC/SafeAreaView';

const RelationShipCompatibilityGrid = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  const route = useRoute();
  const { zodiac } = route.params;
  const { data, isLoading } = useGetZodaicCompatibilityQuery(zodiac);
  const compatibilities = data?.compatibilities;

  const [zodiacImage, setZodiacImage] = useState('');

  useEffect(() => {
    const getZodiacImage = async () => {
      try {
        const res = await axiosInstance.get(
          `/horoscope/zodiacImage?zodiac=${zodiac}`,
        );
        setZodiacImage(res.data.data.imgSrc);
      } catch (error) {
        console.log('Error fetching zodiac image ', error);
      }
    };
    getZodiacImage();
  }, [zodiac]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title:
        t(`extras.sunsigns.${zodiac}`) + ' ' + t('compatibility.compatibility'),
    });
  }, [navigation, t, zodiac]);

  if (isLoading) {
    return (
      <View
        style={{
          paddingTop: 20,
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
      contentContainerStyle={{ backgroundColor: isDarkMode ? colors.darkBackground : colors.lightBackground }}
    >
      <View
        style={{
          backgroundColor: colors.purple,
          paddingBottom: 6,
          paddingHorizontal: 12,
          flexDirection: 'row',
          justifyContent: 'space-around',
          gap: 20,
        }}
      >
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: '30%',
          }}
        >
          <Image
            style={{
              width: 120,
              aspectRatio: 1,
            }}
            source={{ uri: zodiacImage }}
            alt={zodiac}
          />
        </View>
        <View
          style={{
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            width: '60%',
          }}
        >
          <View
            style={{
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              spaceY: 3,
            }}
          >
            <Text
              style={{
                color: 'white',
                fontSize: 14,
                marginTop: 4,
                textAlign: 'center',
              }}
            >
              {zodiacBrief[zodiac]}
            </Text>
          </View>
        </View>
      </View>
      <View
        style={{
          marginVertical: 16,
          gap: 8,
          paddingHorizontal: 12,
        }}
      >
        {compatibilities?.map((i) => (
          <RelationshipCompatibilityCard compatibility={i} key={i?._id} />
        ))}
      </View>
    </ScrollView>
  );
};

export default WithSafeArea(RelationShipCompatibilityGrid);
