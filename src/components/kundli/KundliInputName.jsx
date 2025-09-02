import React from 'react';
import { Text, TextInput, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { colors } from '../../assets/constants/colors';

const KundliInputName = ({ name, setName }) => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View
          style={{
            backgroundColor: colors.purple,
            borderRadius: 1000,
            width: 36,
            height: 36,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <FontAwesome name="user-o" size={20} color="white" />
        </View>
        <View
          style={{
            width: 25,
            height: 25,
            borderRadius: 1000,
            backgroundColor: colors.lightGray,
          }}
        />
        <View
          style={{
            width: 25,
            height: 25,
            borderRadius: 1000,
            backgroundColor: colors.lightGray,
          }}
        />
        <View
          style={{
            width: 25,
            height: 25,
            borderRadius: 1000,
            backgroundColor: colors.lightGray,
          }}
        />
        <View
          style={{
            width: 25,
            height: 25,
            borderRadius: 1000,
            backgroundColor: colors.lightGray,
          }}
        />
      </View>
      <View
        style={{
          marginTop: 28,
        }}
      >
        <Text
          style={{
            fontSize: 28,
            color: isDarkMode ? 'white' : colors.gray,
            fontWeight: 'bold',
          }}
        >
          {t('kundli.screen1.head1')}
        </Text>
        <Text
          style={{
            fontSize: 28,
            color: isDarkMode ? 'white' : colors.gray,
            fontWeight: 'bold',
          }}
        >
          {t('kundli.screen1.head2')}
        </Text>
      </View>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: 'gray',
          padding: 10,
          marginVertical: 28,
          borderRadius: 12,
          backgroundColor: isDarkMode ? colors.darkSurface : 'white',
          color: isDarkMode ? 'white' : 'black',
        }}
        placeholder={t('kundli.screen1.inputPlaceholder')}
        placeholderTextColor={isDarkMode ? colors.darkTextSecondary : 'gray'}
        value={name}
        onChangeText={setName}
      />
    </View>
  );
};

export default KundliInputName;
