import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome'; // Import FontAwesome from expo
import { colors } from '../assets/constants/colors';
import { useTheme } from '../context/ThemeContext';

const ChatAndCallButtons = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const {isDarkMode}=useTheme();
  return (
    <View
      style={{
        position: 'absolute',
        zIndex: 1000,
        bottom: 10,
        left: 14,
        right: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}
    >
      <TouchableOpacity
        style={{
          backgroundColor: isDarkMode ? colors.purple : colors.purple,
          padding: 12,
          borderRadius: 20,
          flexDirection: 'row',
          alignItems: 'center',
          width: '48%',
          justifyContent: 'center',
        }}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('Astrologers')}
      >
        <FontAwesome name="comment" size={20} color="white" />
        <Text
          style={{
            color: 'white',
            fontSize: 13,
            marginLeft: 8,
          }}
        >
          {t('homePage.pageBtn1')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          backgroundColor: isDarkMode ? colors.darkGreen : colors.lightGreen,
          padding: 12,
          borderRadius: 20,
          flexDirection: 'row',
          alignItems: 'center',
          width: '48%',
          justifyContent: 'center',
        }}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('Astrologers')}
      >
        <FontAwesome name="phone" size={20} color="white" />
        <Text
          style={{
            color: 'white',
            fontSize: 13,
            marginLeft: 8,
          }}
        >
          {t('homePage.pageBtn2')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChatAndCallButtons;
