import React, { useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../assets/constants/colors';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const LoveCalculator = () => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [hername, setherName] = useState('');
  const [gender1, setGender1] = useState('');
  const [gender2, setGender2] = useState('');

  const navigation = useNavigation();

  const { isDarkMode } = useTheme();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('loveCalculator.screenHead'),
    });
  }, [navigation, t]);

  const submitHandler = () => {
    if (name === '' || hername === '' || gender1 === '' || gender2 === '') {
      Alert.alert(t('Please fill all details'));
      return;
    }

    navigation.navigate('LoveScore', { name, hername });
  };

  return (
    <ScrollView
      style={{ backgroundColor: isDarkMode ? colors.darkBackground : colors.lightBackground }}
      keyboardShouldPersistTaps="handled"
    >
      <View
        style={{
          flex: 1,
          backgroundColor: colors.purple,
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 16,
          paddingHorizontal: 24,
        }}
      >
        <View style={{ alignItems: 'center', flexDirection: 'row' }}>
          <View style={{ width: '30%' }}>
            <Image
              style={{ width: 80, height: 80 }}
              source={{
                uri: 'https://res.cloudinary.com/doetbfahk/image/upload/v1712314827/vedaz_designImage/lovecalculator1_dg7eol.png',
              }}
              resizeMode="contain"
            />
          </View>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              width: '70%',
            }}
          >
            <Text
              style={{
                color: isDarkMode ? 'white' : 'white',
                fontSize: 20,
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
              {t('loveCalculator.head1')}
            </Text>
          </View>
        </View>
      </View>
      <View
        style={{
          flex: 1,
          marginHorizontal: 12,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 20,
        }}
      >
        <View>
          <Text
            style={{
              color: isDarkMode ? 'white' : '#501873',
              fontSize: 20,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 10,
            }}
          >
            {t('loveCalculator.head2')}
          </Text>
          <TextInput
            style={{
              backgroundColor: isDarkMode ? colors.darkSurface : 'white',
              borderColor: isDarkMode ? colors.dark:colors.lightGray,
              borderWidth: 2,
              padding: 10,
              borderRadius: 20,
              color: isDarkMode ? 'white' : 'black',  
            }}
            placeholder={t('loveCalculator.placeHolders.firstName')}
            placeholderTextColor={isDarkMode ? '#cccccc' : '#aaaaaa'}
            maxLength={30}
            value={name}
            onChangeText={(text) => setName(text)}
          />

          {/* Gender1 */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              marginVertical: 15,
            }}
          >
            <TouchableOpacity
              onPress={() => setGender1('male')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderWidth: 2,
                  borderRadius: 100,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  borderColor: isDarkMode ? colors.lightGray : colors.gray,
                }}
              >
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 100,
                    backgroundColor:
                      gender1 === 'male'
                        ? isDarkMode
                          ? colors.lightGray
                          : colors.gray
                        : 'transparent',
                  }}
                ></View>
              </View>
              <Text
                style={{
                  color: isDarkMode ? colors.lightGray : colors.gray,
                  fontSize: 16,
                }}
              >
                {t('loveCalculator.male')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setGender1('female')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderWidth: 2,
                  borderRadius: 100,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  borderColor: isDarkMode ? colors.lightGray : colors.gray,
                }}
              >
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 100,
                    backgroundColor:
                      gender1 === 'female'
                        ? isDarkMode
                          ? colors.lightGray
                          : colors.gray
                        : 'transparent',
                  }}
                ></View>
              </View>
              <Text
                style={{
                  color: isDarkMode ? colors.lightGray : colors.gray,
                  fontSize: 16,
                }}
              >
                {t('loveCalculator.female')}
              </Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 16,
              marginBottom: 40,
            }}
          >
            <View
              style={{
                width: '100%',
                height: 1,
                backgroundColor: '#E5E5E5',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View style={{ width: 80, height: 80, position: 'absolute' }}>
                <Image
                  source={{
                    uri: 'https://images.ganeshaspeaks.com/gsv8/icons/ic-heart.webp',
                  }}
                  style={{ flex: 1, resizeMode: 'contain' }}
                />
              </View>
            </View>
          </View>

          <TextInput
            style={{
              backgroundColor: isDarkMode ? colors.darkSurface : 'white',
              borderColor: isDarkMode ? colors.dark:colors.lightGray,
              borderWidth: 2,
              padding: 10,
              borderRadius: 20,
              color: isDarkMode ? 'white' : 'black',
            }}
            placeholder={t('loveCalculator.placeHolders.secondName')}
            placeholderTextColor={isDarkMode ? '#cccccc' : '#aaaaaa'}
            maxLength={30}
            value={hername}
            onChangeText={(text) => setherName(text)}
          />
          {/* Gender2 */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              marginVertical: 15,
            }}
          >
            <TouchableOpacity
              onPress={() => setGender2('male')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderWidth: 2,
                  borderRadius: 100,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  borderColor: isDarkMode ? colors.lightGray : colors.gray,
                }}
              >
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 100,
                    backgroundColor:
                      gender2 === 'male'
                        ? isDarkMode
                          ? colors.lightGray
                          : colors.gray
                        : 'transparent',
                  }}
                ></View>
              </View>
              <Text
                style={{
                  color: isDarkMode ? colors.lightGray : colors.gray,
                  fontSize: 16,
                }}
              >
                {t('loveCalculator.male')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setGender2('female')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderWidth: 2,
                  borderRadius: 100,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  borderColor: isDarkMode ? colors.lightGray : colors.gray,
                }}
              >
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 100,
                    backgroundColor:
                      gender2 === 'female'
                        ? isDarkMode
                          ? colors.lightGray
                          : colors.gray
                        : 'transparent',
                  }}
                ></View>
              </View>
              <Text
                style={{
                  color: isDarkMode ? colors.lightGray : colors.gray,
                  fontSize: 16,
                }}
              >
                {t('loveCalculator.female')}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: '#501873',
              padding: 10,
              borderRadius: 20,
              marginTop: 20,
            }}
            onPress={submitHandler}
          >
            <Text
              style={{
                color: 'white',
                fontSize: 16,
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
              {t('loveCalculator.btn')}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ width: '90%', marginVertical: 20 }}>
          <Text
            style={{
              textAlign: 'center',
              color: isDarkMode ? 'white' : 'black',
            }}
          >
            {t('loveCalculator.description')}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default LoveCalculator;
