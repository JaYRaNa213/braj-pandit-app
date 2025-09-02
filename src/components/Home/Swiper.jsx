import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../assets/constants/colors';
import { useTheme } from '../../context/ThemeContext';
import AstrologerCardSmall from '../AstrologerCardSmall';
import { SkeletonLoaderAstrologerCardSmall } from '../Loader';

const Swiper = ({ astrologers, heading, expertise, astroLoading }) => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const navigation = useNavigation();

  return (
    <View style={{ marginHorizontal: 12, marginTop: 20, width: '100%' }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 16,
          flex: 1,
        }}
      >
        <Text
          style={{
            fontWeight: '500',
            fontSize: 18,
            width: '70%',
            color: isDarkMode ? 'white' : colors.purple,
          }}
        >
          {heading}
        </Text>
        <TouchableOpacity
          style={{
            width: '30%',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => navigation.navigate('Astrologers')}
        >
          <Text style={{ color: isDarkMode ? 'white' : 'black' }}>
            {t('extras.seeAll')}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isDarkMode ? 'white' : 'black'}
          />
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 14 }}
      >
        {!astroLoading
          ? astrologers?.map((i) => (
              <AstrologerCardSmall astrologer={i} key={i._id} isFree={true} />
            ))
          : Array.from({ length: 5 }).map((_, index) => (
              <SkeletonLoaderAstrologerCardSmall key={index} />
            ))}
      </ScrollView>
    </View>
  );
};

export default Swiper;
