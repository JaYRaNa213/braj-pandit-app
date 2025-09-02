import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { colors } from '../assets/constants/colors';
import { useTranslation } from 'react-i18next';

const RelationshipCompatibilityCard = ({ compatibility }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();

  return (
    <View
      style={{
        padding: 8,
        width: '100%',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: isDarkMode ? '#555' : '#ccc',
        overflow: 'hidden',
        marginBottom: 16,
        backgroundColor: isDarkMode ? colors.darkSurface : 'white',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Image
          style={{
            width: 40,
            height: 40,
            resizeMode: 'cover',
            marginRight: 8,
          }}
          source={{ uri: compatibility?.imgSrc1 }}
        />
        <Image
          style={{
            width: 20,
            height: 30,
            resizeMode: 'cover',
            marginHorizontal: 8,
          }}
          source={{
            uri: 'https://images.ganeshaspeaks.com/gsv8/icons/ic-heart.webp',
          }}
        />
        <Image
          style={{
            width: 40,
            height: 40,
            resizeMode: 'cover',
            marginLeft: 8,
          }}
          source={{ uri: compatibility?.imgSrc2 }}
        />
      </View>
      <Text
        style={{
          color: isDarkMode ? colors.lightGray : colors.purple,
          fontSize: 20,
          fontWeight: 'bold',
          textAlign: 'center',
          marginTop: 4,
          textTransform: 'capitalize',
        }}
      >
        {t(`extras.sunsigns.${compatibility?.zodiac1}`)} &amp;{' '}
        {t(`extras.sunsigns.${compatibility?.zodiac2}`)}
      </Text>
      <View style={{ marginTop: 6 }}>
        <Text
          style={{
            color: isDarkMode ? colors.lightGray : colors.gray,
            textAlign: 'center',
            fontSize: 13,
          }}
        >
          {compatibility?.friendship?.Desc.slice(0, 150)} . . .
        </Text>
        <View
          style={{
            marginTop: 8,
            alignItems: 'flex-end',
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: isDarkMode ? colors.darkSurface : colors.purple,
              borderRadius: 4,
              paddingVertical: 5,
              paddingHorizontal: 8,
            }}
            onPress={() =>
              navigation.navigate('CompatibilityContent', {
                zodiac1: compatibility.zodiac1,
                zodiac2: compatibility.zodiac2,
              })
            }
          >
            <Text
              style={{
                color: isDarkMode ? colors.darkTextPrimary : 'white',
                fontSize: 14,
                fontWeight: '500',
                textAlign:'justify'
              }}
            >
              {t('extras.readMore')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default RelationshipCompatibilityCard;
