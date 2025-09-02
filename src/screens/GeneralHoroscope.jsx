import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import i18n from '../../i18n';
import { colors } from '../assets/constants/colors';
import AstrologerCardSmall from '../components/AstrologerCardSmall';
import { useTheme } from '../context/ThemeContext';
import { useGetAllAstrologersQuery } from '../redux/api/astrologerApi';
import axiosInstance from '../utils/axiosInstance';
import FreeAstrologersBtn from '../components/FreeAstrologersBtn';
import WithSafeArea from '../components/HOC/SafeAreaView';

const GeneralHoroscope = ({ navigation }) => {
  const { t } = useTranslation();
  const [zodiacImages, setZodiacImages] = useState([]);
  const [type, setType] = useState('weekly-horoscope');
  const [zodiac, setZodiac] = useState('aries');
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useTheme();
  const [lang] = i18n.language;

  const [checkType, setCheckType] = useState('monthly-horoscope');
  const [checkContent, setCheckContent] = useState([]);
  const [checkLoading, setCheckLoading] = useState(false);
  const [weeklyContent, setWeeklyContent] = useState({});

  const fetchAllZodiacImages = async () => {
    try {
      const { data } = await axiosInstance.get('/horoscope/zodiacImages', {
        timeout: 10000,
      });
      setZodiacImages(data?.data);
    } catch (catchError) {
      console.error('Error fetching zodiac images:', catchError);
    }
  };
  const fetchHoroscope = async ({
    type,
    zodiac,
    setContent,
    setLoading,
    year,
    customYearly,
  }) => {
    setLoading(true);
    try {
      let url;
      if (customYearly) {
        // For current year tab: /api/horoscope/yearly/:zodiac?year=YYYY
        url = `/horoscope/yearly/${zodiac}?year=${year}`;
      } else if (type === 'yearly-horoscope' && !year) {
        // For yearly tab: /api/horoscope/yearly/:zodiac
        url = `/horoscope/yearly/${zodiac}`;
      } else if (type === 'horoscope-tomorrow') {
        url = `/horoscope/tomorrow/${zodiac}`;
      } else if (type === 'yearly-horoscope' && year) {
        url = `/horoscope?type=yearly-horoscope&zodiac=${zodiac}&year=${year}`;
      } else {
        url = `/horoscope?type=${type}&zodiac=${zodiac}`;
      }

      const { data } = await axiosInstance.get(url, {
        timeout: 10000,
      });

      if (data?.success && data?.data) {
        // Handle yearly horoscope with phases or summary object
        if (
          (type === 'yearly-horoscope' || customYearly) &&
          (data.data.phases || typeof data.data === 'object')
        ) {
          setContent(data.data);
        }
        // Handle horoscope-tomorrow type differently
        else if (type === 'horoscope-tomorrow') {
          const horoscopeData = data.data;

          const contentData = [
            {
              title: 'love',
              desc: horoscopeData.love,
            },
            {
              title: 'career',
              desc: horoscopeData.career,
            },
            {
              title: 'health',
              desc: horoscopeData.health,
            },
            {
              title: 'money',
              desc: horoscopeData.money,
            },
          ];

          setContent(contentData);
        }
        // Handle weekly horoscope
        else if (type === 'weekly-horoscope' && data?.data?.[0]) {
          const horoscopeData = data.data[0];

          setWeeklyContent({
            para: horoscopeData.para,
            para2: horoscopeData.love,
            para3: horoscopeData.career,
          });
        }
        // Handle today horoscope
        else if (type === 'horoscope-today' && data?.data?.[0]) {
          const horoscopeData = data.data[0];
          const contentData = [
            {
              title: 'love',
              desc: horoscopeData.love,
            },
            {
              title: 'career',
              desc: horoscopeData.career,
            },
            {
              title: 'health',
              desc: horoscopeData.health,
            },
            {
              title: 'money',
              desc: horoscopeData.money,
            },
          ];

          setContent(contentData);
        }
        // Handle monthly
        else if (data?.data?.[0]) {
          const horoscopeData = data.data[0];

          const contentData = [
            {
              title: 'love',
              desc: horoscopeData.love,
            },
            {
              title: 'career',
              desc: horoscopeData.career,
            },
            {
              title: 'health',
              desc: horoscopeData.health,
            },
            {
              title: 'money',
              desc: horoscopeData.money,
            },
          ];

          setContent(contentData);
        }
      }
    } catch (catchError) {
      console.log('Error fetching horoscope:', catchError);
    } finally {
      setLoading(false);
    }
  };

  const { data: astrologers } = useGetAllAstrologersQuery({
    page: 1,
    limit: 10,
    isCertified: false,
    expertise: 'all',
  });

  useEffect(() => {
    fetchAllZodiacImages();
    // fetchContent({ type, zodiac, setContent, setLoading });
  }, []);

  useEffect(() => {
    fetchHoroscope({ type, zodiac, setContent, setLoading });
  }, [zodiac, type]);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    if (checkType === 'current-year') {
      fetchHoroscope({
        type: 'yearly-horoscope',
        zodiac,
        setContent: setCheckContent,
        setLoading: setCheckLoading,
        year: currentYear,
        customYearly: true,
      });
    } else if (checkType === 'yearly-horoscope') {
      fetchHoroscope({
        type: 'yearly-horoscope',
        zodiac,
        setContent: setCheckContent,
        setLoading: setCheckLoading,
        // no year, no customYearly
      });
    } else {
      fetchHoroscope({
        type: checkType,
        zodiac,
        setContent: setCheckContent,
        setLoading: setCheckLoading,
      });
    }
  }, [checkType, zodiac]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('horoscope.screenHead'),
    });
  });

  return (
    <>
      <ScrollView
        style={{
          paddingHorizontal: 12,
          backgroundColor: isDarkMode ? colors.darkBackground : colors.lightBackground,
        }}
      >
        {/* Horoscope*/}
        <ScrollView
          horizontal
          style={{ marginTop: 12 }}
          showsHorizontalScrollIndicator={false}
        >
          {zodiacImages?.map((i) => (
            <TouchableOpacity
              style={{ alignItems: 'center', marginRight: 12 }}
              onPress={() => setZodiac(i.zodiac)}
              key={i.zodiac}
            >
              <Image
                source={{ uri: i.imgSrc }}
                style={{
                  width: zodiac === i.zodiac ? 80 : 70,
                  height: zodiac === i.zodiac ? 80 : 70,
                  backgroundColor:
                    zodiac === i.zodiac
                      ? isDarkMode
                        ? colors.dark
                        : colors.purple
                      : isDarkMode
                      ? colors.darkBackground
                      : 'white',
                  borderRadius: 1000,
                }}
              />
              <Text style={{ color: isDarkMode ? 'white' : 'black' }}>
                {t(`extras.sunsigns.${i?.zodiac?.trim()}`)}{' '}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {/* Horoscope Categories */}
        <View
          style={{
            marginTop: 20,
            borderColor: isDarkMode ? 'gray' : 'gray',
            borderRadius: 18,
            flexDirection: 'row',
            overflow: 'hidden',
          }}
        >
          {['weekly-horoscope', 'horoscope-today', 'horoscope-tomorrow'].map(
            (time) => (
              <TouchableOpacity
                key={time}
                style={{
                  justifyContent: 'center',
                  width: '33.33%',
                  alignItems: 'center',
                  borderRightWidth: time !== 'horoscope-tomorrow' ? 1 : 0,
                  paddingVertical: 4,
                  backgroundColor: type === time ? (colors.purple) : (isDarkMode ? colors.darkSurface:colors.white),
                }}
                onPress={() => setType(time)}
              >
                <Text
                  style={{
                    color: type === time ? 'white' : (isDarkMode ? colors.white : colors.purple),
                    textTransform: 'capitalize',
                    fontSize:16,
                    fontWeight:500
                  }}
                >
                  {time === 'weekly-horoscope'
                    ? t('horoscope.time.weekly')
                    : time === 'horoscope-today'
                    ? t('horoscope.time.today')
                    : t('horoscope.time.tomorrow')}
                </Text>
              </TouchableOpacity>
            ),
          )}
        </View>
        {/* Horoscope Contents */}
        <View style={{ marginTop: 16 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: isDarkMode ? 'white' : colors.purple,
              textTransform: 'capitalize',
            }}
          >
            {t(`horoscope.time.${type}`)}
          </Text>
          {/* {loading ? (
          <View
            style={{
              paddingTop: 20,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: isDarkMode ? '#222' : 'white',
              flex: 1,
            }}
          >
            <ActivityIndicator
              size={'large'}
              color={isDarkMode ? 'white' : colors.purple}
            />
          </View>
        ) : ( */}
          <View style={{ marginTop: 8, gap: 12 }}>
            {type === 'weekly-horoscope' ? (
              <View
                style={{
                  borderWidth:1,
                  paddingHorizontal: 9,
                  paddingVertical:9,
                  borderRadius: 8,
                  gap:5,
                  borderColor:isDarkMode ? colors.dark: colors.lightGray,
                  backgroundColor: isDarkMode ? colors.darkSurface:colors.white,
                }}
              >
                  {weeklyContent?.para && <Text
                    style={{
                      textAlign: 'justify',
                      color: isDarkMode ? colors.darkTextSecondary : colors.gray,
                    }}
                  >
                    {weeklyContent?.para}
                  </Text>}
                  {weeklyContent?.para2 && <Text
                    style={{
                      textAlign: 'justify',
                      color: isDarkMode ? colors.darkTextSecondary : colors.gray,
                    }}
                  >
                    {weeklyContent?.para2}
                  </Text>}
                  {weeklyContent?.para3 && <Text
                    style={{
                      textAlign: 'justify',
                      color: isDarkMode ? colors.lightGray : colors.gray,
                    }}
                  >
                    {weeklyContent?.para3}
                  </Text>}
                </View>
            ) : (
              <>
                {content?.map((i) => (
                  <View
                    style={{
                      borderWidth: 1,
                      padding: 8,
                      borderRadius: 8,
                      borderColor: isDarkMode ? colors.dark : colors.lightGray,
                      backgroundColor:isDarkMode ? colors.darkSurface:colors.white,
                    }}
                    key={i.title}
                  >
                    <View>
                      <Text
                        style={{
                          fontWeight: '600',
                          fontSize: 16,
                          color: isDarkMode ? 'white' : 'black',
                        }}
                      >
                        {t(`horoscope.category.${i.title}`)}
                      </Text>
                    </View>
                    <View style={{}}>
                      <Text
                        style={{
                          textAlign: 'justify',
                          color: isDarkMode ? colors.darkTextSecondary : colors.dark,
                        }}
                      >
                        {i.desc}
                      </Text>
                    </View>
                  </View>
                ))}
              </>
            )}
          </View>
          {/* )} */}
        </View>
        {/* Astrologers */}
        <View style={{ marginTop: 20 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 20,
                color: isDarkMode ? 'white' : 'black',
              }}
            >
              {t('horoscope.sectHead2')}
            </Text>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center' }}
              onPress={() => navigation.navigate('Astrologers')}
            >
              <Text style={{ color: isDarkMode ? 'white' : 'black' }}>
                {t('extras.seeAll')}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={isDarkMode ? 'white' : 'black'}
              />
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 14 }}
          >
            {astrologers?.data?.map((i) => (
              <AstrologerCardSmall astrologer={i} key={i._id} />
            ))}
          </ScrollView>
        </View>
        {/* Also Check Section */}
        <View style={{ marginTop: 20 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: isDarkMode ? 'white' : 'black',
            }}
          >
            {t('extras.alsoCheck')}
          </Text>
          <View
            style={{
              marginTop: 20,
              borderRadius: 18,
              flexDirection: 'row',
              overflow: 'hidden',
            }}
          >
            {(() => {
              const currentYear = new Date().getFullYear();
              const nextYear = currentYear + 1;
              const tabs = [
                {
                  key: 'monthly-horoscope',
                  label: t('horoscope.time.monthly'),
                  value: 'monthly-horoscope',
                },
                {
                  key: 'current-year',
                  label: String(currentYear),
                  value: 'current-year',
                },
                {
                  key: 'yearly-horoscope',
                  label: 'Yearly',
                  value: 'yearly-horoscope',
                },
              ];
              return tabs.map((tab, idx) => (
                <TouchableOpacity
                  key={tab.key}
                  style={{
                    justifyContent: 'center',
                    width: `${100 / tabs.length}%`,
                    alignItems: 'center',
                    borderRightWidth: idx !== tabs.length - 1 ? 1 : 0,
                    paddingVertical: 4,
                    backgroundColor:
                      checkType === tab.value ? (colors.purple) : (isDarkMode ? colors.darkSurface:colors.white),
                  }}
                  onPress={() => setCheckType(tab.value)}
                >
                  <Text
                    style={{
                      color: checkType === tab.value ? 'white' : (isDarkMode ? colors.white : colors.purple),
                      textTransform: 'capitalize',
                    }}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ));
            })()}
          </View>
          <View
            style={{
              marginTop: 12,  
              borderRadius: 12,
              padding: 8,
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                fontSize: 18,
                fontWeight: '600',
                color: isDarkMode ? 'white' : 'black',
                marginBottom:8,
              }}
            >
              {t(`extras.sunsigns.${zodiac.split(' ')[0]}`)}{' '}
              {checkType === 'current-year'
                ? new Date().getFullYear()
                : t(`horoscope.time.${checkType}`)}
            </Text>
            <View
              style={{
                color: colors.gray,
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {/* Yearly Horoscope Rendering */}
              {(checkType === 'yearly-horoscope' ||
                checkType === 'current-year') &&
              checkContent &&
              checkContent.phases ? (
                checkContent.phases.map((phase, idx) => (
                  <View
                    key={idx}
                    style={{
                      marginBottom: 24,
                      backgroundColor: isDarkMode ? colors.darkSurface : colors.gray100,
                      borderRadius: 8,
                      padding: 16,
                    }}
                  >
                    <Text
                      style={{
                        color: isDarkMode ? colors.darkTextPrimary : colors.purple,
                        fontWeight: 'bold',
                        fontSize: 18,
                        marginBottom: 8,
                      }}
                    >
                      Phase {phase.phase} <Text style={{fontSize:16}}>(Score: {phase.score})</Text>
                    </Text>
                    {[
                      { key: 'physique', label: 'Physical Well-being' },
                      { key: 'health', label: 'Health' },
                      { key: 'relationship', label: 'Relationship' },
                      { key: 'career', label: 'Career' },
                      { key: 'travel', label: 'Travel' },
                      { key: 'family', label: 'Family' },
                    ].map(
                      (section) =>
                        phase[section.key] && (
                          <View key={section.key} style={{ marginBottom: 12 }}>
                            <Text
                              style={{
                                fontWeight: 'bold',
                                fontSize: 16,
                                marginTop: 8,
                                color: isDarkMode ? colors.darkAccent : '#232b3b',
                              }}
                            >
                              {section.label} <Text
                              style={{
                                fontWeight: '600',
                              }}
                            >
                             ( Score: {phase[section.key].score})
                            </Text>
                            </Text>
                            
                            <Text
                              style={{
                                color: isDarkMode ? colors.darkTextSecondary : colors.dark,
                                textAlign: 'justify',
                              }}
                            >
                              {phase[section.key].prediction}
                            </Text>
                          </View>
                        ),
                    )}
                  </View>
                ))
              ) : (
                // Default rendering for monthly
                <View style={{gap:20, width:'100%'}}>
                  {Array.isArray(checkContent) &&
                    checkContent.map((i) => (
                      <View key={i.title} style={{
                            gap:10,
                            backgroundColor:isDarkMode ? colors.darkSurface: colors.white, 
                            borderColor: isDarkMode? colors.dark: colors.lightGray, 
                            borderWidth:0,
                            borderRadius:12,
                            paddingHorizontal:10}}>
                        <Text
                          style={{
                            fontWeight: '600',
                            fontSize: 16,
                            color: isDarkMode ? colors.darkTextPrimary : 'black',
                          }}
                        >
                          {t(`horoscope.category.${i.title}`)}:
                        </Text>
                        <Text
                          style={{
                            textAlign: 'justify',
                            color: isDarkMode ? colors.darkTextSecondary : colors.dark,
                          }}
                        >
                          {i.desc}
                        </Text>
                      </View>
                    ))}
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
      <FreeAstrologersBtn />
    </>
  );
};

export default WithSafeArea(GeneralHoroscope);
