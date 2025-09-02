import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  ScrollView,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import { useTheme } from '../../context/ThemeContext';
import { colors } from '../../assets/constants/colors';
import { useLazyGetLocationQuery } from '../../redux/api/kundliApi';
import { useTranslation } from 'react-i18next';

const GirlDetailsForm = ({
  girlName,
  girlBirthDate,
  girlBirthTime,
  girlBirthPlace,
  setGirlName,
  setGirlBirthDate,
  setGirlBirthTime,
  setGirlBirthPlace,
  suggestionPlaces,
  setSuggestionPlaces,
}) => {
  const { t } = useTranslation();
  const [isExactBirthTimeGirl, setIsExactBirthTimeGirl] = useState(true);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setIsTimePickerVisibility] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [showSuggestionPlaces, setShowSuggestionPlaces] = useState(false);
  const { isDarkMode } = useTheme();

  const [getLocation] = useLazyGetLocationQuery();

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  const debounceCitySearch = (value) => {
    setGirlBirthPlace(value);

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const newDebounceTimer = setTimeout(() => {
      performCitySearch(value);
    }, 800);

    setDebounceTimer(newDebounceTimer);
  };

  const performCitySearch = async (city) => {
    if (city.length <= 2) {
      return;
    }
    try {
      const { data } = await getLocation(city);

      setSuggestionPlaces(data);
      setShowSuggestionPlaces(true);
    } catch (error) {
      console.error('Error fetching location:', error);
    }
  };

  const hanldePlaceClick = (place) => {
    setGirlBirthPlace(place);
    setShowSuggestionPlaces(false);
  };

  return (
    <View
      style={{
        backgroundColor: isDarkMode ? colors.darkSurface : 'white',
        borderRadius: 12,
        padding: 12,
      }}
    >
      <Text
        style={{
          textAlign: 'center',
          fontSize: 18,
          fontWeight: '500',
          color: isDarkMode ? 'white' : 'black',
        }}
      >
        {t('Match Kundli.newMatch.girlsDetailes')}
      </Text>

      {/* Name Field */}
      <View style={{ position: 'relative' }}>
        <Text
          style={{
            fontWeight: '500',
            fontSize: 16,
            marginTop: 12,
            color: isDarkMode ? 'white' : 'black',
          }}
        >
          {t('Match Kundli.newMatch.name')}
        </Text>
        <FontAwesome
          name="user-o"
          size={20}
          color={isDarkMode ? colors.darkTextSecondary : colors.gray}
          style={{ position: 'absolute', top: 56, left: 10 }}
        />
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: isDarkMode ? colors.dark : colors.lightGray,
            marginTop: 12,
            paddingVertical: 10,
            paddingLeft: 40,
            borderRadius: 8,
            color: isDarkMode ? colors.darkTextPrimary : 'black',
          }}
          placeholder={t('Match Kundli.newMatch.placeHolders.name')}
          placeholderTextColor={isDarkMode ? colors.darkTextSecondary : colors.gray}
          value={girlName}
          onChangeText={(val) => setGirlName(val)}
        />
      </View>

      {/* Birth Date Field */}
      <View style={{ position: 'relative' }}>
        <Text
          style={{
            fontWeight: '500',
            fontSize: 16,
            marginTop: 12,
            color: isDarkMode ? 'white' : 'black',
          }}
        >
          {t('Match Kundli.newMatch.birthDate')}
        </Text>
        <FontAwesome
          name="calendar"
          size={20}
          color={isDarkMode ? colors.darkTextSecondary : colors.gray}
          style={{ position: 'absolute', top: 56, left: 10 }}
        />
        <TouchableOpacity onPress={() => setDatePickerVisibility(!isDatePickerVisible)}>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: isDarkMode ? colors.dark : colors.lightGray,
              marginTop: 10,
              paddingVertical: 10,
              paddingLeft: 40,
              borderRadius: 8,
              color: isDarkMode ? colors.darkTextPrimary : 'black',
            }}
            placeholder={t('Match Kundli.newMatch.placeHolders.birthDate')}
            placeholderTextColor={isDarkMode ? colors.darkTextSecondary : colors.gray}
            value={girlBirthDate ? girlBirthDate.toLocaleDateString() : ''}
            editable={false}
          />
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={(val) => setGirlBirthDate(val)}
          onCancel={() => setDatePickerVisibility(false)}
        />
      </View>

      {/* Birth Time Field */}
      <View style={{ position: 'relative' }}>
        <Text
          style={{
            fontWeight: '500',
            fontSize: 16,
            marginTop: 12,
            color: isDarkMode ? 'white' : 'black',
          }}
        >
          {t('Match Kundli.newMatch.birthTime')}
        </Text>
        <FontAwesome
          name="clock-o"
          size={20}
          color={isDarkMode ? colors.darkTextSecondary : colors.gray}
          style={{ position: 'absolute', top: 56, left: 10 }}
        />
        <TouchableOpacity onPress={() => setIsTimePickerVisibility(!isTimePickerVisible)}>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: isDarkMode ? colors.dark : colors.lightGray,
              marginTop: 10,
              paddingVertical: 10,
              paddingLeft: 40,
              borderRadius: 8,
              color: isDarkMode ? colors.darkTextPrimary : 'black',
            }}
            placeholder={t('Match Kundli.newMatch.placeHolders.birthTime')}
            placeholderTextColor={isDarkMode ? colors.darkTextSecondary : colors.gray}
            value={girlBirthTime ? moment(girlBirthTime).format('hh:mm A') : ''}
            editable={false}
          />
        </TouchableOpacity>
        <View style={{ marginTop: 20 }}>
          <TouchableOpacity
            onPress={() => setIsExactBirthTimeGirl(!isExactBirthTimeGirl)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
          >
            <FontAwesome
              name={isExactBirthTimeGirl ? 'square-o' : 'check-square'}
              size={20}
              color={isDarkMode ? colors.darkTextSecondary : colors.gray}
            />
            <Text
              style={{
                fontWeight: '600',
                fontSize: 14,
                color: isDarkMode ? 'white' : 'black',
              }}
            >
              {t('Match Kundli.newMatch.checkbox')}
            </Text>
          </TouchableOpacity>
          <View style={{ marginTop: 8 }}>
            <Text style={{ color: isDarkMode ? colors.darkTextSecondary : colors.gray }}>
              {t('Match Kundli.newMatch.note')}
            </Text>
          </View>
        </View>
        <DateTimePickerModal
          isVisible={isTimePickerVisible}
          mode="time"
          onConfirm={(val) => setGirlBirthTime(val)}
          onCancel={() => setIsTimePickerVisibility(false)}
        />
      </View>

      {/* Birth Place Field */}
      <View style={{ position: 'relative' }}>
        <Text
          style={{
            fontWeight: '500',
            fontSize: 16,
            marginTop: 12,
            color: isDarkMode ? 'white' : 'black',
          }}
        >
          {t('Match Kundli.newMatch.birthPlace')}
        </Text>
        <FontAwesome
          name="location-arrow"
          size={20}
          color={isDarkMode ? colors.darkTextSecondary : colors.gray}
          style={{ position: 'absolute', top: 56, left: 10 }}
        />
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: isDarkMode ? colors.dark : colors.lightGray,
            marginTop: 10,
            paddingVertical: 10,
            paddingLeft: 40,
            borderRadius: 8,
            color: isDarkMode ? colors.darkTextPrimary : 'black',
          }}
          placeholder={t('Match Kundli.newMatch.placeHolders.birthPlace')}
          placeholderTextColor={isDarkMode ? colors.darkTextSecondary : colors.gray}
          value={girlBirthPlace}
          onChangeText={(value) => debounceCitySearch(value)}
          />

        {/* Suggestions */}
        {showSuggestionPlaces && suggestionPlaces?.length > 0 && (
          <ScrollView
            contentContainerStyle={{
              borderWidth: 1,
              borderColor: isDarkMode ? colors.dark : colors.lightGray,
              borderRadius: 12,
              backgroundColor: isDarkMode ? colors.darkSurface : 'white',
            }}
            keyboardShouldPersistTaps="handled"
          >
            {suggestionPlaces.map((place, index) => (
              <Pressable
                key={index}
                android_ripple={{
                  color: isDarkMode ? colors.gray : colors.lightGray,
                }}
                onPress={() => hanldePlaceClick(place)}
                style={{
                  borderBottomWidth: index + 1 === suggestionPlaces.length ? 0 : 1,
                  borderColor: isDarkMode ? colors.dark : colors.lightGray,
                  padding: 10,
                  backgroundColor: isDarkMode ? colors.darkSurface : 'white',
                }}
              >
                <Text style={{ color: isDarkMode ? 'white' : 'black' }}>{place}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    </View>

  );
};

export default GirlDetailsForm;
