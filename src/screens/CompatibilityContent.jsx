import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../assets/constants/colors';
import heart from '../assets/images/heart.png';
import { useTheme } from '../context/ThemeContext';
import { useGetBothZodaicCompatibilityQuery } from '../redux/api/compatibilityApi';
import WithSafeArea from '../components/HOC/SafeAreaView';

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

const CompatibilityContent = () => {
  const { t } = useTranslation();
  const route = useRoute();
  const zodiac1 = route.params.zodiac1 || 'aries';
  const zodiac2 = route.params.zodiac2 || 'gemini';
  const scrollViewRef = useRef(null);
  const gender1 = 'male';
  const gender2 = 'female';
  const [selectedZodiac1, setSelectedZodiac1] = useState(zodiac1);
  const [selectedZodiac2, setSelectedZodiac2] = useState(zodiac2);
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();

  const { data } = useGetBothZodaicCompatibilityQuery({
    zodiac1,
    zodiac2,
    gender1,
    gender2,
  });

  const pageData = data?.[0];

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('compatibility.screenHead'),
    });
  }, [navigation, t]);

  const aspectsArray = [
    {
      aspect: 'Friendship',
      description: pageData?.friendship?.Desc,
      question: pageData?.friendship?.Q,
      answer: pageData?.friendship?.A,
      number: pageData?.friendship?.No,
      icon: <FontAwesome5 name="user-friends" size={16} color="white" />,
    },
    {
      aspect: 'Love',
      description: pageData?.love?.Desc,
      question: pageData?.love?.Q,
      answer: pageData?.love?.A,
      number: pageData?.love?.No,
      icon: <AntDesign name="hearto" size={18} color="white" />,
    },
    {
      aspect: 'Sexual',
      description: pageData?.sexual?.Desc,
      question: pageData?.sexual?.Q,
      answer: pageData?.sexual?.A,
      number: pageData?.sexual?.No,
      icon: <FontAwesome name="intersex" size={18} color="white" />,
    },
    {
      aspect: 'Marriage',
      description: pageData?.marriage?.Desc,
      question: pageData?.marriage?.Q,
      answer: pageData?.marriage?.A,
      number: pageData?.marriage?.No,
      icon: (
        <MaterialCommunityIcons name="cards-outline" size={18} color="white" />
      ),
    },
    {
      aspect: 'Communication',
      description: pageData?.communication?.Desc,
      question: pageData?.communication?.Q,
      answer: pageData?.communication?.A,
      number: pageData?.communication?.No,
      icon: <AntDesign name="wifi" size={18} color="white" />,
    },
    {
      aspect: 'Conclusion',
      description: pageData?.conclusion?.Desc,
      question: pageData?.conclusion?.Q,
      answer: pageData?.conclusion?.A,
      number: pageData?.conclusion?.No,
    },
  ];

  const handleSubmit = () => {
    // For Going back to top
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    navigation.navigate('CompatibilityContent', {
      zodiac1: selectedZodiac1,
      zodiac2: selectedZodiac2,
    });
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      style={{ backgroundColor: isDarkMode ? colors.darkBackground : colors.lightBackground }}
    >
      <View
        style={{
          backgroundColor: '#501873',
          paddingVertical: 12,
          paddingHorizontal: 12,
        }}
      >
        <View style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          {/* top side parts starts */}
          <View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
              }}
            >
              <Image
                style={{ width: 70, height: 70 }}
                source={{ uri: pageData?.imgSrc1 }}
                alt={zodiac1}
              />
              <Image
                style={{ width: 30, height: 30 }}
                source={heart}
                alt="heart"
              />
              <Image
                style={{ width: 70, height: 70 }}
                source={{ uri: pageData?.imgSrc2 }}
                alt={zodiac2}
              />
            </View>
          </View>
          {/* top side parts ends */}
          {/* down side part starts */}
          <View style={{ flex: 1, alignItems: 'center', paddingTop: 12 }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: 'white',
                marginBottom: 10,
                textAlign: 'center',
              }}
            >
              {t(`extras.sunsigns.${zodiac1}`) +
                ' ' +
                t('extras.and') +
                ' ' +
                t(`extras.sunsigns.${zodiac2}`) +
                ' ' +
                t('compatibility.compatibility')}
            </Text>
          </View>
        </View>
      </View>
      <View
        style={{
          marginHorizontal: 12,
          justifyContent: 'space-between',
          marginTop: 24,
        }}
      >
        <View style={{ flex: 1 }}>
          {aspectsArray?.map((i, index) => {
            const color =
              i.number < 50 ? (isDarkMode ? colors.darkLessThan50: colors.lightLessThan50) : i.number < 75 ? (isDarkMode ? colors.darkLessThan75: colors.lightLessThan75) : (isDarkMode ? colors.darkMoreThanEqualTo75: colors.lightMoreThanEqualTo75);
            const text = color;
            const isLastItem = index === aspectsArray.length - 1; // Check if it's the last item

            return (
              <View key={i.aspect}>
                <View style={{ justifyContent: 'space-between' }}>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: 'bold',
                      color: isDarkMode ? colors.lightGray : colors.purple,
                    }}
                  >
                    {t(`compatibility.finalScreen.compatibleTypes.${i.aspect}`)}{' '}
                    {i.aspect !== 'Conclusion' &&
                      t('compatibility.compatibility')}
                  </Text>
                  {i.aspect !== 'Conclusion' && (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        width: '60%',
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: color,
                          borderRadius: 100,
                          width: 34,
                          height: 34,
                          marginTop: 8,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {i.icon}
                      </View>
                      <View style={{ marginLeft: 10, width: '100%' }}>
                        <Text style={{ fontSize: 14, color: text }}>
                          {i.number}%
                        </Text>
                        <View
                          style={{
                            height: 6,
                            backgroundColor: '#D3D3D3',
                            borderRadius: 20,
                            overflow: 'hidden',
                            marginTop: 5,
                            width: '100%',
                          }}
                        >
                          <View
                            style={{
                              width: `${i.number ? i.number : '90'}%`,
                              height: '100%',
                              backgroundColor: color,
                            }}
                          />
                        </View>
                      </View>
                    </View>
                  )}
                </View>
                <Text
                  style={{
                    marginTop: 10,
                    fontSize: 16,
                    lineHeight: 22,
                    color: isDarkMode ? colors.darkTextSecondary : colors.dark,
                    textAlign: 'justify',
                  }}
                >
                  {i.description}
                </Text>
                <Text
                  style={{
                    marginTop: 10,
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: isDarkMode ? colors.lightGray : '#000080',
                    textAlign: 'justify',
                  }}
                >
                  {i.question}
                </Text>
                <Text
                  style={{
                    marginTop: 10,
                    fontSize: 16,
                    lineHeight: 22,
                    color: isDarkMode ? colors.darkTextSecondary : colors.dark,
                    textAlign: 'justify',
                  }}
                >
                  {i.answer}
                </Text>
                {isLastItem ? null : (
                  <View
                    style={{
                      width: '90%',
                      height: 1,
                      marginTop: 16,
                      marginBottom: 16,
                    }}
                  />
                )}
              </View>
            );
          })}
        </View>
      </View>
      {/* Card For Changing the zodiac data */}
      <View style={{ flex: 1, justifyContent: 'center', marginVertical: 20 }}>
        <View
          style={{
            borderWidth: 2,
            borderColor: '#D3D3D3',
            borderRadius: 12,
            padding: 12,
            maxWidth: '95%',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: isDarkMode ? colors.lightGray : colors.purple,
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            {t('compatibility.finalScreen.areYouCompatible')} ?
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: isDarkMode ? colors.lightGray : '#4A4A4A',
            }}
          >
            {t('compatibility.finalScreen.chooseZodiacSign')}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              marginTop: 10,
            }}
          >
            <View
              style={{
                flex: 1,
                marginRight: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: isDarkMode ? colors.lightGray : '#808080',
                  textTransform: 'uppercase',
                  marginBottom: 5,
                }}
              >
                {t('compatibility.finalScreen.yourSign')}
              </Text>
              <Picker
                selectedValue={selectedZodiac1}
                onValueChange={(itemValue) => setSelectedZodiac1(itemValue)}
                style={{
                  borderColor: isDarkMode ? colors.lightGray : '#D3D3D3',
                  borderWidth: 1,
                  borderRadius: 4,
                  fontSize: 14,
                  color: isDarkMode ? colors.lightGray : '#4A4A4A',
                }}
              >
                {zodiac.map((i) => (
                  <Picker.Item
                    label={t(`extras.sunsigns.${i}`)}
                    value={i}
                    key={i}
                  />
                ))}
              </Picker>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text
                style={{
                  fontSize: 12,
                  color: isDarkMode ? colors.lightGray : '#808080',
                  textTransform: 'uppercase',
                  marginBottom: 5,
                }}
              >
                {t('compatibility.finalScreen.partnerSign')}
              </Text>
              <Picker
                selectedValue={selectedZodiac2}
                onValueChange={(itemValue) => setSelectedZodiac2(itemValue)}
                style={{
                  color: isDarkMode ? colors.lightGray : '#4A4A4A',
                  borderWidth: 1,
                  borderRadius: 4,
                  fontSize: 14,
                }}
              >
                {zodiac.map((i) => (
                  <Picker.Item
                    label={t(`extras.sunsigns.${i}`)}
                    value={i}
                    key={i}
                  />
                ))}
              </Picker>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleSubmit}
            style={{
              marginTop: 10,
              backgroundColor: '#761E6C',
              borderRadius: 20,
              padding: 10,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: 'white',
                textAlign: 'center',
              }}
            >
              {t('extras.submit')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};
export default WithSafeArea(CompatibilityContent);
