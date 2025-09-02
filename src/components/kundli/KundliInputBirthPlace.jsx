import FontAwesome from 'react-native-vector-icons/FontAwesome';
import React, { useState, useEffect } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLazyGetLocationQuery } from '../../redux/api/kundliApi';
import { useTranslation } from 'react-i18next';
import { colors } from '../../assets/constants/colors';

const KundliInputBirthPlace = ({
  birthPlace,
  setBirthPlace,
  suggestionPlaces,
  setSuggestionPlaces,
}) => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [showSuggestionPlaces, setShowSuggestionPlaces] = useState(false);

  const [getLocation] = useLazyGetLocationQuery();

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  const debounceCitySearch = (value) => {
    setBirthPlace(value);

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
    setBirthPlace(place);
    setShowSuggestionPlaces(false);
  };

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {[1, 2, 3, 4].map((_, index) => (
          <View
            key={index}
            style={{
              width: 25,
              height: 25,
              borderRadius: 1000,
              backgroundColor: colors.purple,
            }}
          />
        ))}
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
          <FontAwesome name="location-arrow" size={20} color="white" />
        </View>
      </View>
      <View style={{ marginTop: 28 }}>
        <Text
          style={{
            fontSize: 28,
            color: isDarkMode ? 'white' : colors.gray,
            fontWeight: 'bold',
          }}
        >
          {t('kundli.screen5.head1')}
        </Text>
      </View>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: 'gray',
          padding: 10,
          marginTop: 28,
          borderRadius: 12,
          color: isDarkMode ? colors.darkTextPrimary : 'black',
          backgroundColor: isDarkMode ? colors.darkSurface : 'white',
        }}
        placeholder={t('kundli.screen5.inputPlaceholder')}
        placeholderTextColor={isDarkMode ? colors.darkTextSecondary : 'gray'}
        value={birthPlace}
        onChangeText={(value) => debounceCitySearch(value)}
      />
      {showSuggestionPlaces && suggestionPlaces?.length > 0 && (
        <ScrollView
          contentContainerStyle={{
            borderWidth: 1,
            borderColor: 'gray',
            borderRadius: 12,
          }}
        >
          {suggestionPlaces?.map((place, index) => (
            <Pressable
              android_ripple={{
                color: isDarkMode ? colors.darkSurface : colors.lightGray,
              }}
              key={index}
              onPress={() => hanldePlaceClick(place)}
              style={{
                borderBottomWidth:
                  index + 1 === suggestionPlaces?.length ? 0 : 1,
                borderColor: 'gray',
                padding: 10,
                borderRadius:12,
                color: isDarkMode ? 'white' : 'black',
                backgroundColor: isDarkMode ? colors.darkSurface : 'white',
              }}
            >
              <Text style={{ color: isDarkMode ? 'white' : 'black' }}>
                {place}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default KundliInputBirthPlace;
