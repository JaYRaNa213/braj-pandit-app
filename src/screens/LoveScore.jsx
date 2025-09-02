import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Image,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../assets/constants/colors';
import instagram from '../assets/images/instagram.png';
import whatsapp from '../assets/images/whatsapp.png';
import WithSafeArea from '../components/HOC/SafeAreaView';
import { useTheme } from '../context/ThemeContext';

const LoveScore = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const route = useRoute();
  const [lovePercentage, setLovePercentage] = useState({
    love: 0,
    sexual: 0,
    friendship: 0,
    communication: 0,
  });
  const [yourScore, setYourScrore] = useState(false);
  const cacheRef = useRef({});
  const name = route.params.name;

  const hername = route.params.hername;

  const { isDarkMode } = useTheme();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('loveCalculator.screen1.screenHead'),
    });
  }, [navigation, t]);

  function calculateHash(separator) {
    const combinedString = name + separator + hername;
    let hash = 0;
    for (let i = 0; i < combinedString.length; i++) {
      const char = combinedString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    const min = 70;
    const max = 94;
    hash = (hash % (max - min)) + min;
    return hash;
  }

  const calculateLovePercentage = () => {
    if (name === '' || hername === '') {
      // showWarningToast("Please Fill Your and your partner's names", '');
      return;
    }
    const cacheKey = `${name}_${hername}`;
    if (cacheRef.current[cacheKey]) {
      setLovePercentage(cacheRef.current[cacheKey]);
      setYourScrore(true);
      return;
    }
    const compatibility = {
      love: calculateHash('|'),
      sexual: calculateHash('/'),
      friendship: calculateHash('{'),
      communication: calculateHash('}'),
    };
    setLovePercentage(compatibility);
    cacheRef.current = { ...cacheRef.current, [cacheKey]: compatibility };
    setYourScrore(true);
  };

  useEffect(() => {
    calculateLovePercentage();
  }, [name, hername, route]);

  const getDetailedText = (key, percentage) => {
    let index;
    if (percentage < 50) {
      index = 0;
    } else if (percentage < 70) {
      index = 1;
    } else if (percentage < 80) {
      index = 2;
    } else if (percentage < 90) {
      index = 3;
    } else {
      index = 4;
    }
    return t(`loveCalculator.screen1.loveData.${key}${index + 1}`);
  };

  const percentage = Math.round(
    (lovePercentage?.love +
      lovePercentage?.sexual +
      lovePercentage?.friendship +
      lovePercentage?.communication) /
      4,
  );

  const getColor = (colorPercentage) => {
    const color =
      colorPercentage < 50
        ? (isDarkMode ? colors.darkLessThan50: colors.lightLessThan50)
        : colorPercentage < 75
        ? (isDarkMode ? colors.darkLessThan75: colors.lightLessThan75)
        : (isDarkMode ? colors.darkMoreThanEqualTo75: colors.lightMoreThanEqualTo75);
    return color;
  };
  const shareResult = async (platform) => {
    let message = t('loveCalculator.screen1.msg');
    let url = `https://vedaz.io/lovescore/${name}/${hername}?share=true`; // Replace with your actual URL

    switch (platform) {
      case 'facebook':
        message = `${message} #LoveCompatibility #Facebook`;
        break;
      case 'instagram':
        message = `${message} #LoveCompatibility #Instagram`;
        break;
      case 'twitter':
        message = `${message} #LoveCompatibility #Twitter`;
        break;
      default:
        break;
    }

    try {
      await Share.share({
        message: `${message} ${url}`,
      });
    } catch (error) {
      Alert.alert(error.message);
    }
  };
  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      style={{ backgroundColor: isDarkMode ? colors.darkBackground : colors.lightBackground }}
    >
      <View style={{ flex: 1 }}>
        <View
          style={{
            paddingTop: 10,
            backgroundColor: '#501873',
            paddingBottom: 20,
          }}
        >
          <Text
            style={{
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 20,
              textAlign: 'center',
              marginTop: 10,
            }}
          >
            {t('loveCalculator.screen1.woah')}
          </Text>
          <View style={{ position: 'relative', marginTop: 10 }}>
            <View style={{ width: 300, alignSelf: 'center' }}>
              <Image
                source={{
                  uri: 'https://res.cloudinary.com/doetbfahk/image/upload/v1712561178/Ellipse_50_h7ordd.png',
                }}
                style={{ width: '100%', height: 120, alignSelf: 'center' }}
              />
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '40%',
                }}
              >
                <Text
                  style={{ color: '#fff', fontWeight: 'bold', fontSize: 24 }}
                >
                  {percentage}%
                </Text>
              </View>
            </View>
            <View
              style={{
                position: 'absolute',
                bottom: 10,
                left: 70,
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#7E1F6A', fontSize: 12 }}>
                {t('loveCalculator.screen1.bond.love')}
              </Text>
              <Text
                style={{ color: '#7E1F6A', fontWeight: 'bold', fontSize: 12 }}
              >
                {lovePercentage?.love}%
              </Text>
            </View>
            <View
              style={{
                position: 'absolute',
                top: 28,
                right: 94,
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#7E1F6A', fontSize: 12 }}>
                {t('loveCalculator.screen1.bond.communication')}
              </Text>
              <Text
                style={{ color: '#7E1F6A', fontWeight: 'bold', fontSize: 12 }}
              >
                {lovePercentage?.communication}%
              </Text>
            </View>
            <View
              style={{
                position: 'absolute',
                top: 28,
                left: 100,
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#7E1F6A', fontSize: 12 }}>
                {t('loveCalculator.screen1.bond.friendship')}
              </Text>
              <Text
                style={{ color: '#7E1F6A', fontWeight: 'bold', fontSize: 12 }}
              >
                {lovePercentage?.friendship}%
              </Text>
            </View>
            <View
              style={{
                position: 'absolute',
                bottom: 10,
                right: 70,
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#7E1F6A', fontSize: 12 }}>
                {t('loveCalculator.screen1.bond.sexual')}
              </Text>
              <Text
                style={{ color: '#7E1F6A', fontWeight: 'bold', fontSize: 12 }}
              >
                {lovePercentage?.sexual}%
              </Text>
            </View>
          </View>
        </View>
        <View style={{ marginTop: 20, paddingHorizontal: 12 }}>
          <Text
            style={{
              color: isDarkMode ? colors.lightGray : colors.purple,
              textAlign: 'center',
            }}
          >
            {t('loveCalculator.screen1.shortReview')}
          </Text>

          <View style={{ marginVertical: 20, paddingHorizontal: 10 }}>
            <Text
              style={{
                color: isDarkMode ? 'white' : colors.purple,
                fontWeight: 'bold',
                fontSize: 18,
                textAlign: 'center',
                marginVertical: 5,
              }}
            >
              {t('loveCalculator.screen1.head')}
            </Text>
            <View style={{ marginVertical: 5 }}>
              <View
                style={{
                  marginTop: 10,
                  gap: 16,
                }}
              >

                {/*Love Compatibility*/}
                <View
                  style={{
                    overflow: 'hidden',
                    borderRadius: 10,
                    elevation: 5,
                    backgroundColor: isDarkMode ? colors.darkSurface : 'white',
                    marginVertical: 5,
                    padding: 10,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: 10,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <AntDesign
                      name="hearto"
                      size={18}
                      color={isDarkMode ? colors.lightGray : 'black'}
                    />
                    <Text
                      style={{
                        fontWeight: '500',
                        color: isDarkMode ? colors.darkTextSecondary : colors.purple,
                        fontSize: 16,
                      }}
                    >
                      {t('loveCalculator.screen1.bond.love')}{' '}
                      {t('extras.compatibility')}
                    </Text>
                  </View>
                  <View
                    style={{ justifyContent: 'center', paddingHorizontal: 10 }}
                  >
                    <Text
                      style={{
                        textAlign: 'right',
                        color: isDarkMode ? colors.lightGray : colors.purple,
                        fontSize: 14,
                      }}
                    >
                      {lovePercentage?.love}%
                    </Text>
                    <View
                      style={{
                        height: 3,
                        backgroundColor: '#D1D5DB',
                        borderRadius: 5,
                        overflow: 'hidden',
                        width: '100%',
                        marginVertical: 5,
                      }}
                    >
                      <View
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          height: '100%',
                          backgroundColor: getColor(lovePercentage?.love),
                          width: `${lovePercentage?.love}%`,
                        }}
                      />
                    </View>
                  </View>
                  <Text
                    style={{
                      textAlign: 'center',
                      color: isDarkMode ? colors.lightGray : colors.gray,
                      fontSize: 14,
                      paddingBottom: 25,
                      marginTop: 12,
                    }}
                  >
                    {getDetailedText('love', lovePercentage.love)}
                  </Text>
                </View>

                {/*Sexual Compatibility*/}
                <View
                  style={{
                    overflow: 'hidden',
                    borderRadius: 10,
                    elevation: 5,
                    backgroundColor: isDarkMode ? colors.darkSurface : 'white',
                    marginVertical: 5,
                    padding: 10,
                  }}
                >
                  <View
                    style={{
                      fontWeight: 'bold',
                      paddingHorizontal: 5,
                      color: '#7E1F6A',
                      fontSize: 18,
                      flexDirection: 'row',
                      gap: 10,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <FontAwesome
                      name="intersex"
                      size={18}
                      color={isDarkMode ? colors.lightGray : 'black'}
                    />
                    <Text
                      style={{
                        fontWeight: '500',
                        color: isDarkMode ? colors.darkTextSecondary : colors.purple,
                        fontSize: 16,
                      }}
                    >
                      {t('loveCalculator.screen1.bond.sexual')}{' '}
                      {t('extras.compatibility')}
                    </Text>
                  </View>
                  <View
                    style={{ justifyContent: 'center', paddingHorizontal: 10 }}
                  >
                    <Text
                      style={{
                        textAlign: 'right',
                        color: isDarkMode ? colors.lightGray : colors.purple,
                        fontSize: 14,
                      }}
                    >
                      {lovePercentage?.sexual}%
                    </Text>
                    <View
                      style={{
                        height: 3,
                        backgroundColor: '#D1D5DB',
                        borderRadius: 5,
                        overflow: 'hidden',
                        width: '100%',
                        marginVertical: 5,
                      }}
                    >
                      <View
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          height: '100%',
                          backgroundColor: getColor(lovePercentage?.sexual),
                          width: `${lovePercentage?.sexual}%`,
                        }}
                      />
                    </View>
                  </View>
                  <Text
                    style={{
                      textAlign: 'center',
                      color: isDarkMode ? colors.lightGray : colors.gray,
                      fontSize: 14,
                      paddingBottom: 25,
                      marginTop: 12,
                    }}
                  >
                    {getDetailedText('sexual', lovePercentage.sexual)}
                  </Text>
                </View>

                {/*Friendship Compatibility*/}
                <View
                  style={{
                    overflow: 'hidden',
                    borderRadius: 10,
                    elevation: 5,
                    backgroundColor: isDarkMode ? colors.darkSurface : 'white',
                    marginVertical: 5,
                    padding: 10,
                  }}
                >
                  <View
                    style={{
                      fontWeight: 'bold',
                      paddingHorizontal: 5,
                      color: '#7E1F6A',
                      fontSize: 18,
                      flexDirection: 'row',
                      gap: 10,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <FontAwesome5
                      name="user-friends"
                      size={16}
                      color={isDarkMode ? colors.lightGray : 'black'}
                    />
                    <Text
                      style={{
                        fontWeight: '500',
                        color: isDarkMode ? colors.darkTextSecondary : colors.purple,

                        fontSize: 16,
                      }}
                    >
                      {t('loveCalculator.screen1.bond.friendship')}{' '}
                      {t('extras.compatibility')}
                    </Text>
                  </View>
                  <View
                    style={{ justifyContent: 'center', paddingHorizontal: 10 }}
                  >
                    <Text
                      style={{
                        textAlign: 'right',
                        color: isDarkMode ? colors.lightGray : colors.purple,
                        fontSize: 14,
                      }}
                    >
                      {lovePercentage?.friendship}%
                    </Text>
                    <View
                      style={{
                        height: 3,
                        backgroundColor: '#D1D5DB',
                        borderRadius: 5,
                        overflow: 'hidden',
                        width: '100%',
                        marginVertical: 5,
                      }}
                    >
                      <View
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          height: '100%',
                          backgroundColor: getColor(lovePercentage?.friendship),
                          width: `${lovePercentage?.friendship}%`,
                        }}
                      />
                    </View>
                  </View>
                  <Text
                    style={{
                      textAlign: 'center',
                      color: isDarkMode ? colors.lightGray : colors.gray,
                      fontSize: 14,
                      paddingBottom: 25,
                      marginTop: 12,
                    }}
                  >
                    {getDetailedText('friendship', lovePercentage.friendship)}
                  </Text>
                </View>

                {/*Communication Compatibility*/}
                <View
                  style={{
                    overflow: 'hidden',
                    borderRadius: 10,
                    elevation: 5,
                    backgroundColor: isDarkMode ? colors.darkSurface : 'white',
                    marginVertical: 5,
                    padding: 10,
                  }}
                >
                  <View
                    style={{
                      fontWeight: 'bold',
                      paddingHorizontal: 5,
                      color: '#7E1F6A',
                      fontSize: 18,
                      flexDirection: 'row',
                      gap: 10,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <AntDesign
                      name="wifi"
                      size={18}
                      color={isDarkMode ? colors.lightGray : 'black'}
                    />
                    <Text
                      style={{
                        fontWeight: '500',
                        color: isDarkMode ? colors.darkTextSecondary : colors.purple,
                        fontSize: 16,
                      }}
                    >
                      {t('loveCalculator.screen1.bond.communication')}{' '}
                      {t('extras.compatibility')}
                    </Text>
                  </View>
                  <View
                    style={{ justifyContent: 'center', paddingHorizontal: 10 }}
                  >
                    <Text
                      style={{
                        textAlign: 'right',
                        color: isDarkMode ? colors.lightGray : colors.purple,
                        fontSize: 14,
                      }}
                    >
                      {lovePercentage?.communication}%
                    </Text>
                    <View
                      style={{
                        height: 3,
                        backgroundColor: '#D1D5DB',
                        borderRadius: 5,
                        overflow: 'hidden',
                        width: '100%',
                        marginVertical: 5,
                      }}
                    >
                      <View
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          height: '100%',
                          backgroundColor: getColor(
                            lovePercentage?.communication,
                          ),
                          width: `${lovePercentage?.communication}%`,
                        }}
                      />
                    </View>
                  </View>
                  <Text
                    style={{
                      textAlign: 'center',
                      color: isDarkMode ? colors.lightGray : colors.gray,
                      fontSize: 14,
                      paddingBottom: 25,
                      marginTop: 12,
                    }}
                  >
                    {getDetailedText(
                      'communication',
                      lovePercentage.communication,
                    )}
                  </Text>
                </View>

              </View>
            </View>
            <Text
              style={{
                textAlign: 'center',
                marginTop: 20,
                color: isDarkMode ? colors.lightGray : 'black',
              }}
            >
              {t('loveCalculator.screen1.shareOn')}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingTop: 8,
                gap: 4,
                marginHorizontal: 'auto',
                width: '100%',
                justifyContent: 'center',
              }}
            >
              <TouchableOpacity onPress={() => shareResult('whatsapp')}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                  }}
                >
                  <Image source={whatsapp} style={{ width: 24, height: 24 }} />
                  <Text
                    style={{
                      fontWeight: 'bold',
                      fontSize: 16,
                      color: isDarkMode ? colors.lightGray : 'black',
                    }}
                  >
                    {t('loveCalculator.screen1.social.whatsapp')}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => shareResult('instagram')}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                  }}
                >
                  <Image source={instagram} style={{ width: 24, height: 24 }} />
                  <Text
                    style={{
                      fontWeight: 'bold',
                      fontSize: 16,
                      color: isDarkMode ? colors.lightGray : 'black',
                    }}
                  >
                    {t('loveCalculator.screen1.social.insta')}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default WithSafeArea(LoveScore);
