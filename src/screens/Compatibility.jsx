import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import React, { useState, useLayoutEffect } from 'react';
import {
  Button,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { colors } from '../assets/constants/colors';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import WithSafeArea from '../components/HOC/SafeAreaView';

const zodiacDates = {
  '3/21-4/19': 'aries',
  '4/20-5/20': 'taurus',
  '5/21-6/20': 'gemini',
  '6/21-7/22': 'cancer',
  '7/23-8/22': 'leo',
  '8/23-9/22': 'virgo',
  '9/23-10/22': 'libra',
  '10/23-11/21': 'scorpio',
  '11/22-12/21': 'sagittarius',
  '12/22-1/19': 'capricorn',
  '1/20-2/18': 'aquarius',
  '2/19-3/20': 'pisces',
};

const zodiac = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
];

const Compatibility = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [person1, setPerson1] = useState({ dob: '', gender: '' });
  const [person2, setPerson2] = useState({ dob: '', gender: '' });
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);

  const { isDarkMode } = useTheme();

  const showDatePicker = (person) => {
    setSelectedPerson(person);
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
    setSelectedPerson(null);
  };

  const handleConfirm = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    if (selectedPerson === 'person1') {
      setPerson1((prev) => ({ ...prev, dob: formattedDate }));
    } else if (selectedPerson === 'person2') {
      setPerson2((prev) => ({ ...prev, dob: formattedDate }));
    }
    hideDatePicker();
  };

  const convertDaytoZodiac = (dob) => {
    const [year, month, day] = dob.split('-');
    const monthNumber = parseInt(month);
    const dayNumber = parseInt(day);

    for (const dateRange in zodiacDates) {
      const [start, end] = dateRange.split('-');
      const [startMonth, startDay] = start.split('/');
      const [endMonth, endDay] = end.split('/');

      if (
        (monthNumber === parseInt(startMonth) &&
          dayNumber >= parseInt(startDay)) ||
        (monthNumber === parseInt(endMonth) && dayNumber <= parseInt(endDay))
      ) {
        return zodiacDates[dateRange];
      }
    }
  };

  const handlePageContent = () => {
    if (!person1.dob || !person2.dob || !person1.gender || !person2.gender) {
      return alert(t('compatibility.error.fillDetailes'));
    }

    const zodiac1 = convertDaytoZodiac(person1.dob);
    const zodiac2 = convertDaytoZodiac(person2.dob);
    const gender1 = person1.gender;
    const gender2 = person2.gender;
    navigation.navigate('CompatibilityContent', {
      zodiac1,
      zodiac2,
      gender1,
      gender2,
    });
  };

  const handleNavigate = (zodiac) => {
    navigation.navigate('RelationCompatibilityGrid', { zodiac: zodiac });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('compatibility.screenHead'),
    });
  });

  return (
    <ScrollView style={{ backgroundColor: isDarkMode ? colors.darkBackground : colors.lightBackground }}>
      <View
        style={{
          flex: 1,
          backgroundColor: '#501873',
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 16,
          paddingHorizontal: 24,
        }}
      >
        <View style={{ alignItems: 'center', flexDirection: 'row' }}>
          <View>
            <Image
              style={{ width: 80, height: 80 }}
              source={require('../assets/images/compatibility.png')}
              alt="couple"
              resizeMode="contain"
            />
          </View>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              width: '50%',
            }}
          >
            <Text
              style={{
                color: 'white',
                fontSize: 20,
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
              {t('compatibility.head1')}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ marginHorizontal: 12 }}>
        <View style={{ flex: 1, alignItems: 'center', paddingTop: 20 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: isDarkMode ? colors.darkTextPrimary : colors.purple,
              marginBottom: 10,
              textAlign: 'center',
            }}
          >
            {t('compatibility.head2')}
          </Text>

          {/* Person 1 Input */}
          <View style={{ width: '100%', marginTop: 20 }}>
            <View style={{ position: 'relative' }}>
              <Text
                style={{
                  fontWeight: '500',
                  fontSize: 16,
                  marginTop: 12,
                  color: isDarkMode ? colors.lightGray : colors.gray,
                }}
              >
                {t('compatibility.person1')}
              </Text>
              <FontAwesome
                name="calendar"
                size={20}
                color={isDarkMode ? colors.lightGray : colors.gray}
                style={{
                  position: 'absolute',
                  top: 56,
                  left: 10,
                }}
              />
              <TouchableOpacity onPress={() => showDatePicker('person1')}>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: isDarkMode ? colors.gray : colors.lightGray,
                    marginTop: 12,
                    paddingVertical: 10,
                    paddingLeft: 40,
                    borderRadius: 8,
                    color: isDarkMode ? colors.lightGray : colors.gray,
                  }}
                  placeholder={t('compatibility.birthDate')}
                  placeholderTextColor={
                    isDarkMode ? colors.lightGray : colors.gray
                  }
                  value={person1.dob}
                  editable={false}
                />
              </TouchableOpacity>
            </View>
            <View
              style={{
                borderWidth: 1,
                borderColor: isDarkMode ? colors.dark : colors.lightGray,
                borderRadius: 8,
                height: 40,
                justifyContent: 'center',
                marginTop: 12,
                overflow: 'hidden',
              }}
            >
              <Picker
                dropdownIconColor={isDarkMode ? colors.darkTextPrimary:colors.black}
                selectedValue={person1.gender}
                onValueChange={(itemValue) =>
                  setPerson1((prev) => ({ ...prev, gender: itemValue }))
                }
                style={{
                  color: isDarkMode ? 'white' : 'black',
                  backgroundColor: isDarkMode ? colors.darkSurface : 'white',
                }}
              >
                <Picker.Item
                  label={t('compatibility.genderOptions.default')}
                  value=""
                  style={{
                    color: isDarkMode ? 'white' : 'black',
                    fontSize: 15,
                    backgroundColor: isDarkMode ? colors.darkSurface : 'white',
                  }}
                />
                <Picker.Item
                  label={t('compatibility.genderOptions.male')}
                  value="male"
                  style={{
                    color: isDarkMode ? 'white' : 'black',
                    fontSize: 15,
                    backgroundColor: isDarkMode ? colors.darkSurface : 'white',
                  }}
                />
                <Picker.Item
                  label={t('compatibility.genderOptions.female')}
                  value="female"
                  style={{
                    color: isDarkMode ? 'white' : 'black',
                    fontSize: 15,
                    backgroundColor: isDarkMode ?  colors.darkSurface : 'white',
                  }}
                />
                <Picker.Item
                  label={t('compatibility.genderOptions.others')}
                  value="other"
                  style={{
                    color: isDarkMode ? 'white' : 'black',
                    fontSize: 15,
                    backgroundColor: isDarkMode ? colors.darkSurface : 'white',
                  }}
                />
                <Picker.Item
                  label={t('compatibility.genderOptions.notDisclose')}
                  value="not-preferred"
                  style={{
                    color: isDarkMode ? 'white' : 'black',
                    fontSize: 15,
                    backgroundColor: isDarkMode ? colors.darkSurface : 'white',
                  }}
                />
              </Picker>
            </View>
          </View>

          {/* Person 2 Input */}
          <View style={{ width: '100%', marginTop: 20 }}>
            <View style={{ position: 'relative' }}>
              <Text
                style={{
                  fontWeight: '500',
                  fontSize: 16,
                  marginTop: 12,
                  color: isDarkMode ? colors.lightGray : colors.gray,
                }}
              >
                {t('compatibility.person2')}
              </Text>
              <FontAwesome
                name="calendar"
                size={20}
                color={isDarkMode ? colors.lightGray : colors.gray}
                style={{
                  position: 'absolute',
                  top: 56,
                  left: 10,
                }}
              />
              <TouchableOpacity onPress={() => showDatePicker('person2')}>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: isDarkMode ? colors.gray : colors.lightGray,
                    marginTop: 12,
                    paddingVertical: 10,
                    paddingLeft: 40,
                    borderRadius: 8,
                    color: isDarkMode ? colors.lightGray : colors.gray,
                  }}
                  placeholder={t('compatibility.birthDate')}
                  placeholderTextColor={
                    isDarkMode ? colors.lightGray : colors.gray
                  }
                  value={person2.dob}
                  editable={false}
                />
              </TouchableOpacity>
            </View>
            <View
              style={{
                borderWidth: 1,
                borderColor: isDarkMode ? colors.gray : colors.lightGray,
                borderRadius: 8,
                height: 40,
                justifyContent: 'center',
                marginTop: 12,
                overflow: 'hidden',
              }}
            >
              <Picker
                dropdownIconColor={isDarkMode ? colors.darkTextPrimary:colors.black}
                selectedValue={person2.gender}
                onValueChange={(itemValue) =>
                  setPerson2((prev) => ({ ...prev, gender: itemValue }))
                }
                style={{
                  color: isDarkMode ? 'white' : 'black',
                  backgroundColor: isDarkMode ? colors.darkSurface : 'white',
                }}
              >
                <Picker.Item
                  label={t('compatibility.genderOptions.default')}
                  value=""
                  style={{
                    color: isDarkMode ? 'white' : 'black',
                    fontSize: 15,
                    backgroundColor: isDarkMode ? colors.darkSurface : 'white',
                  }}
                />
                <Picker.Item
                  label={t('compatibility.genderOptions.male')}
                  value="male"
                  style={{
                    color: isDarkMode ? 'white' : 'black',
                    fontSize: 15,
                    backgroundColor: isDarkMode ? colors.darkSurface : 'white',
                  }}
                />
                <Picker.Item
                  label={t('compatibility.genderOptions.female')}
                  value="female"
                  style={{
                    color: isDarkMode ? 'white' : 'black',
                    fontSize: 15,
                    backgroundColor: isDarkMode ? colors.darkSurface : 'white',
                  }}
                />
                <Picker.Item
                  label={t('compatibility.genderOptions.others')}
                  value="other"
                  style={{
                    color: isDarkMode ? 'white' : 'black',
                    fontSize: 15,
                    backgroundColor: isDarkMode ? colors.darkSurface : 'white',
                  }}
                />
                <Picker.Item
                  label={t('compatibility.genderOptions.notDisclose')}
                  value="not-preferred"
                  style={{
                    color: isDarkMode ? 'white' : 'black',
                    fontSize: 15,
                    backgroundColor: isDarkMode ? colors.darkSurface : 'white',
                  }}
                />
              </Picker>
            </View>
          </View>

          <View style={{ width: '60%', marginTop: 20 }}>
            <Button
              title={t('compatibility.btn')}
              onPress={handlePageContent}
              color="#501873"
            />
          </View>
        </View>

        {/* All Sunsign Compatibility */}
        <View>
          <View
            style={{
              width: '100%',
              height: 1,
              backgroundColor: '#C7C7C7',
              marginBottom: 20,
              marginTop: 20,
            }}
          />
          <View style={{ paddingBottom: 20, marginTop: 20 }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: isDarkMode ? colors.lightGray : colors.purple,
                marginBottom: 10,
                textAlign: 'center',
              }}
            >
              {t('compatibility.head3')}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              {zodiac?.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={{
                    flexBasis: '48%',
                    padding: 10,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: '#ccc',
                    marginBottom: 10,
                  }}
                  onPress={() => handleNavigate(item)}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: 'bold',
                      color: isDarkMode ? colors.lightGray : colors.purple,
                      textAlign: 'center',
                      textTransform: 'capitalize',
                    }}
                  >
                    {t(`extras.sunsigns.${item}`)}{' '}
                    {t('compatibility.compatibility')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </ScrollView>
  );
};

export default WithSafeArea(Compatibility);
