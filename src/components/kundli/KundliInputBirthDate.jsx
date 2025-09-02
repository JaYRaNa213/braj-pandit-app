import FontAwesome from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from '@mohalla-tech/react-native-date-time-picker';
import React from 'react';
import { colors } from '../../assets/constants/colors';
import { Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const KundliInputBirthDate = ({ birthdate, setBirthdate }) => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();

  const date = new Date(birthdate);

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
          <FontAwesome name="calendar" size={18} color="white" />
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
          {t('kundli.screen3.head1')}
        </Text>
      </View>
      <View style={{ marginHorizontal: 20, marginTop: 28 }}>
        <DateTimePicker
          initialValue={date}
          onChange={(selectedDate) => setBirthdate(selectedDate)}
          mode="date"
          separatorColor={isDarkMode ? 'white' : 'black'}
          listItemStyle={{ color: isDarkMode ? 'white' : 'black' }}
        />
      </View>
    </View>
  );
};

export default KundliInputBirthDate;
