import React from 'react';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { colors } from '../../assets/constants/colors';

const KundliInputGender = ({ gender, setGender }) => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();

  const Input = ({ icon, name }) => {
    return (
      <TouchableOpacity onPress={() => setGender(name.toLowerCase())}>
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.lightGray,
            padding: 8,
            borderRadius: 1000,
            width: 70,
            height: 70,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor:
              gender === name.toLowerCase()
                ? colors.purple
                : isDarkMode
                  ? colors.darkSurface
                  : 'white',
          }}
        >
          <FontAwesome
            name={icon}
            size={40}
            color={
              gender === name.toLowerCase()
                ? 'white'
                : isDarkMode
                  ? colors.lightGray
                  : colors.gray
            }
          />
        </View>
        <Text
          style={{
            textAlign: 'center',
            marginTop: 12,
            fontWeight: 'bold',
            fontSize: 16,
            color: isDarkMode ? 'white' : 'black',
          }}
        >
          {t(`kundli.screen2.gender.${name.toLowerCase()}`)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View
          style={{
            width: 25,
            height: 25,
            borderRadius: 1000,
            backgroundColor: colors.purple,
          }}
        />
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
          <FontAwesome name="intersex" size={20} color="white" />
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
          {t('kundli.screen2.head1')}
        </Text>
      </View>
      <View
        style={{
          marginTop: 28,
          flexDirection: 'row',
          justifyContent: 'space-evenly',
        }}
      >
        <Input icon={'male'} name={'Male'} />
        <Input icon={'female'} name={'Female'} />
        <Input icon={'intersex'} name={'Other'} />
      </View>
    </View>
  );
};

export default KundliInputGender;
