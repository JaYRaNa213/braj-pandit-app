import React, { useEffect, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import KundliInputBirthDate from '../components/kundli/KundliInputBirthDate';
import KundliInputBirthPlace from '../components/kundli/KundliInputBirthPlace';
import KundliInputBirthTime from '../components/kundli/KundliInputBirthTime';
import KundliInputGender from '../components/kundli/KundliInputGender';
import KundliInputName from '../components/kundli/KundliInputName';
import { KundliState } from '../context/KundliProvider';
import { useSaveUserDetailsMutation } from '../redux/api/userApi';
import { useSelector } from 'react-redux';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { colors } from '../assets/constants/colors';

const KundliInputs = ({ navigation }) => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.user);
  const [step, setStep] = useState(1);
  const [suggestionPlaces, setSuggestionPlaces] = useState([]);

  const {
    name,
    gender,
    birthdate,
    birthPlace,
    birthtime,
    setName,
    setGender,
    setBirthdate,
    setBirthPlace,
    setBirthtime,
  } = KundliState();
  const { isDarkMode } = useTheme();

  const onNext = () => {
    switch (step) {
      case 1:
        if (name.trim() === '') {
          alert('Please enter your name');
          return;
        }
        break;
      case 2:
        if (gender.trim() === '') {
          alert('Please select gender');
          return;
        }
        break;
      default:
        break;
    }
    setStep(step + 1);
  };

  useEffect(() => {
    navigation.setOptions({
      title: 'Kundli',
    });
  }, [navigation]);

  const [saveUserDetails] = useSaveUserDetailsMutation();

  const onFinish = async () => {
    if (birthPlace.trim() === '') {
      alert(t('kundli.alertBirthLocation'));
      return;
    }
    if (!suggestionPlaces.includes(birthPlace)) {
      alert(t('kundli.alertSelectCity'));
      return;
    }
    if (user) {
      try {
        const res = await saveUserDetails({
          gender,
          name,
          birthDate: birthdate,
          birthPlace,
          birthtime: birthtime,
          id: user?._id,
        });
        navigation.navigate('KundliDetails', { id: user?._id });
      } catch (error) {
        console.log(error);
      }
    } else {
      navigation.navigate('KundliDetails');
    }
  };

  const renderInput = () => {
    switch (step) {
      case 1:
        return <KundliInputName name={name} setName={setName} />;
      case 2:
        return <KundliInputGender gender={gender} setGender={setGender} />;
      case 3:
        return (
          <KundliInputBirthDate
            birthdate={birthdate}
            setBirthdate={setBirthdate}
          />
        );
      case 4:
        return (
          <KundliInputBirthTime
            birthTime={birthtime}
            setBirthTime={setBirthtime}
          />
        );
      case 5:
        return (
          <KundliInputBirthPlace
            birthPlace={birthPlace}
            setBirthPlace={setBirthPlace}
            suggestionPlaces={suggestionPlaces}
            setSuggestionPlaces={setSuggestionPlaces}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View
      style={{
        paddingTop: 28,
        paddingHorizontal: 12,
        backgroundColor: isDarkMode ? colors.darkBackground : colors.lightBackground,
        flex: 1,
      }}
    >
      {renderInput()}
      {step < 5 && (
        <TouchableOpacity
          style={{
            backgroundColor: colors.purple,
            paddingVertical: 14,
            paddingHorizontal: 20,
            borderRadius: 12,
            alignSelf: 'center',
            marginTop: 28,
            width: '100%',
          }}
          onPress={onNext}
        >
          <Text
            style={{
              color: 'white',
              fontWeight: 'bold',
              textAlign: 'center',
              fontSize: 16,
            }}
          >
            {t('kundli.button1')}
          </Text>
        </TouchableOpacity>
      )}
      {step === 5 && (
        <TouchableOpacity
          style={{
            backgroundColor: colors.purple,
            paddingVertical: 14,
            paddingHorizontal: 20,
            borderRadius: 12,
            alignSelf: 'center',
            marginTop: 28,
            width: '100%',
          }}
          onPress={onFinish}
        >
          <Text
            style={{
              color: 'white',
              fontWeight: 'bold',
              textAlign: 'center',
              fontSize: 16,
            }}
          >
            {t('kundli.button2')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default KundliInputs;
