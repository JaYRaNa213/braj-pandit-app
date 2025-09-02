import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  useMemo,
} from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import Svg, { Line, Text as SvgText } from 'react-native-svg';
import { colors } from '../assets/constants/colors';
import { KundliState } from '../context/KundliProvider';
import { useTheme } from '../context/ThemeContext';
import { useGetKundliDataMutation } from '../redux/api/kundliApi';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import WithSafeArea from '../components/HOC/SafeAreaView';

// Converts snake_case or camelCase to "Title Case"
function prettifyKey(str) {
  if (!str) return '';
  // Replace underscores and camelCase with spaces, then capitalize each word
  return str
    .replace(/_/g, ' ') // snake_case to space
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase to space
    .replace(/\b\w/g, (c) => c.toUpperCase()); // capitalize
}

const KundliDetails = ({ route }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
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
  const [chartData, setChartData] = useState({
    imgUrl: '',
    imgChart: null,
    imgNavamsa: null,
    imgDasamsa: null,
    imgSaptamsa: null,
    imgDwadasamsa: null,
    imgShodasamsa: null,
    imgVimsamsa: null,
    imgKhavedamsa: null,
    imgAkshavedamsa: null,
    imgShastiamsa: null,
    planetDetail: [],
    planetList: [],
    antardasha: [],
  });

  const [mahadashaData, setMahadashaData] = useState({
    mahadasha: [],
    mahadasha_order: [],
    start_year: null,
    dasha_start_date: null,
    dasha_remaining_at_birth: null,
  });

  const [antardashaData, setAntardashaData] = useState({
    antardashas: [],
    antardasha_order: [],
  });

  const [getData] = useGetKundliDataMutation();

  const [activeTab, setActiveTab] = useState('Basic');
  const tabs = ['Basic', 'Kundli', 'KP', 'Charts', 'Reports'];

  const reportTabs = ['List of Yogas', 'Planet Details', 'Dosha', 'Friendship'];
  const [activeReportTab, setActiveReportTab] = useState(reportTabs[0]);

  const planetDetails = useMemo(
    () => ({
      ASCENDENT: {
        rashi: 'KANYA',
        ansh: '09:48:36',
        nakshatra: 'UTTARPHAL',
        nakshatracharan: 4,
      },
      JUPITER: {
        rashi: 'TULA',
        ansh: '09:06:33',
        nakshatra: 'SWATI',
        nakshatracharan: 1,
      },
      KETU: {
        rashi: 'KARKA',
        ansh: '03:29:30',
        nakshatra: 'PUSHYA',
        nakshatracharan: 1,
      },
      MARS: {
        rashi: 'MESHA',
        ansh: '01:20:02',
        nakshatra: 'ASHWINI',
        nakshatracharan: 1,
      },
      MERCURY: {
        rashi: 'VRISHCHIK',
        ansh: '29:21:49',
        nakshatra: 'JYESHTHA',
        nakshatracharan: 4,
      },
      MOON: {
        rashi: 'KARKA',
        ansh: '04:21:23',
        nakshatra: 'PUSHYA',
        nakshatracharan: 1,
      },
      RAHU: {
        rashi: 'MAKAR',
        ansh: '03:29:30',
        nakshatra: 'UTTARASADA',
        nakshatracharan: 3,
      },
      SATURN: {
        rashi: 'MITHUN',
        ansh: '18:33:43',
        nakshatra: 'ARDRA',
        nakshatracharan: 4,
      },
      SUN: {
        rashi: 'DHANUSH',
        ansh: '12:23:25',
        nakshatra: 'MULA',
        nakshatracharan: 4,
      },
      VENUS: {
        rashi: 'MAKAR',
        ansh: '24:12:02',
        nakshatra: 'DHANISHTHA',
        nakshatracharan: 1,
      },
    }),
    [],
  );

  const generatePlanetDetail = useCallback((data) => {
    const headingRow = ['Planets', ...Object.keys(data)];
    return headingRow;
  }, []);

  const generatePlanetList = useCallback(
    (data) => {
      const planetList = Object.entries(data).map(([key, value]) => {
        return {
          planet: key,
          degree: value,
          details: planetDetails[key],
        };
      });
      return planetList;
    },
    [planetDetails],
  );

  const [kundliResponseData, setKundliResponseData] = useState(null);
  const [planetData, setPlanetData] = useState(null);
  const [kpData, setKpData] = useState({});
  const [shabdBala, setShabdBala] = useState({});
  const [yogas, setYogas] = useState([]);
  const [friendship, setFriendship] = useState({});
  const [dosha, setDosha] = useState({});

  useEffect(() => {
    const kundliData = {
      name: name,
      gender: gender,
      place: birthPlace,
      d: moment(birthdate).format('DD/MM/YYYY'),
      t: moment(birthtime).format('HH:mm'),
    };

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [
          kundliResponse,
          d1Response,
          d9Response,
          d10Response,
          d7Response,
          d12Response,
          d16Response,
          d20Response,
          d40Response,
          d45Response,
          d60Response,
          planetResponse,
          mahadashaResponse,
          antardashaResponse,
          kpResonse,
          shabdResponse,
          YogResponse,
          FriendshipResponse,
          DoshResponse,
        ] = await Promise.all([
          getData({ url: '/extended-kundli-details', kundliData }),
          getData({ url: '/chart-image?div=D1&isApp=true', kundliData }),
          getData({ url: '/chart-image?div=D9&isApp=true', kundliData }),
          getData({ url: '/chart-image?div=D10&isApp=true', kundliData }),
          getData({ url: '/chart-image?div=D7&isApp=true', kundliData }),
          getData({ url: '/chart-image?div=D12&isApp=true', kundliData }),
          getData({ url: '/chart-image?div=D16&isApp=true', kundliData }),
          getData({ url: '/chart-image?div=D20&isApp=true', kundliData }),
          getData({ url: '/chart-image?div=D40&isApp=true', kundliData }),
          getData({ url: '/chart-image?div=D45&isApp=true', kundliData }),
          getData({ url: '/chart-image?div=D60&isApp=true', kundliData }),
          getData({ url: '/planet-detail', kundliData }),
          getData({ url: '/mahadasha', kundliData }),
          getData({ url: '/antardasha', kundliData }),
          getData({ url: '/kp-planet', kundliData }),
          getData({ url: '/shad-bala', kundliData }),
          getData({ url: '/list-of-yogas', kundliData }),
          getData({ url: '/friendship-detail', kundliData }),
          getData({ url: '/mangaldosh', kundliData }),
        ]);

        setChartData((prevData) => ({
          ...prevData,
          imgUrl: kundliResponse?.data?.url || '',
          imgChart: {
            svgProps: { height: 500, width: 500 },
            components: d1Response?.data?.components || [],
          },
          imgNavamsa: {
            svgProps: { height: 500, width: 500 },
            components: d9Response?.data?.components || [],
          },
          imgDasamsa: {
            svgProps: { height: 500, width: 500 },
            components: d10Response?.data?.components || [],
          },
          imgSaptamsa: {
            svgProps: { height: 500, width: 500 },
            components: d7Response?.data?.components || [],
          },
          imgDwadasamsa: {
            svgProps: { height: 500, width: 500 },
            components: d12Response?.data?.components || [],
          },
          imgShodasamsa: {
            svgProps: { height: 500, width: 500 },
            components: d16Response?.data?.components || [],
          },
          imgVimsamsa: {
            svgProps: { height: 500, width: 500 },
            components: d20Response?.data?.components || [],
          },
          imgKhavedamsa: {
            svgProps: { height: 500, width: 500 },
            components: d40Response?.data?.components || [],
          },
          imgAkshavedamsa: {
            svgProps: { height: 500, width: 500 },
            components: d45Response?.data?.components || [],
          },
          imgShastiamsa: {
            svgProps: { height: 500, width: 500 },
            components: d60Response?.data?.components || [],
          },
          planetDetail: generatePlanetDetail(
            planetResponse?.data?.planets_assoc || {},
          ),
          planetList: generatePlanetList(
            planetResponse?.data?.planets_assoc || {},
          ),
          mahadasha: mahadashaResponse?.data || [],
          antardasha: antardashaResponse?.data?.ad || [],
        }));

        setMahadashaData({
          mahadasha: mahadashaResponse?.data?.response?.mahadasha || [],
          mahadasha_order:
            mahadashaResponse?.data?.response?.mahadasha_order || [],
          start_year: mahadashaResponse?.data?.response?.start_year || null,
          dasha_start_date:
            mahadashaResponse?.data?.response?.dasha_start_date || null,
          dasha_remaining_at_birth:
            mahadashaResponse?.data?.response?.dasha_remaining_at_birth || null,
        });

        setAntardashaData({
          antardashas: antardashaResponse?.data?.response?.antardashas || [],
          antardasha_order:
            antardashaResponse?.data?.response?.antardasha_order || [],
        });

        setKundliResponseData(kundliResponse?.data);
        setPlanetData(planetResponse?.data?.response);
        setKpData(kpResonse?.data?.response || {});
        setShabdBala(shabdResponse?.data?.response || {});
        setYogas(YogResponse?.data?.response?.yogas_list || []);
        setFriendship(FriendshipResponse?.data?.response || {});
        setDosha(DoshResponse?.data?.response || {});
        setIsLoading(false);
      } catch (error) {
        console.error('Fetch Data Error:', error);
        setIsLoading(false);
      }
    };
    fetchData();
  }, [
    navigation,
    name,
    gender,
    birthdate,
    birthPlace,
    birthtime,
    getData,
    generatePlanetDetail,
    generatePlanetList,
  ]);

  const arr = [
    {
      title: 'Description',
      desc: "Ascendant is one of the most sought concepts in astrology when it comes to predicting the minute events in your life. At the time of birth, the sign that rises in the sky is the person's ascendant. It helps in making predictions about the minute events, unlike your Moon or Sun sign that help in making weekly, monthly or yearly predictions for you. ",
    },
    {
      title: 'Personality',
      desc: 'Those born with the Taurus ascendant are relatively introverted, despite the fact they represent the animal bull. These people like to create their own little world stud with luxuries and comfort. However, they are also aware of the fact that having these luxuries will require hard work and commitment and thus always try to achieve greater and better things in life. Despite being an introvert, Taurus ascendants are really friendly and fun-loving. These people also have a great sense of humor, and you could never get bored when around them. However, one should know that these people never reveal all of them to anybody. They have their secrets which they try to deal with personally. No matter how close you are with a Taurus ascendant, you would hardly know about their sorrows.',
    },
    {
      title: 'Physical',
      desc: 'Ruled by the planet Venus, Taurus ascendants possess a short physique that is inclined to carelessness. They are generally gifted with a lovely face, full of large, gleaming eyes, nicely formed ears, nose, and seductive lips. In terms of physical shape, they are not too lucky. They have a square-shaped figure with no pleasing curves and a full-fat figure, with the possibility of a mark somewhat on the sides or back. People born with Taurus rising have a delightful persona. These natives also have large, powerful necks. Consider a bull to understand why Taurus Ascendants possess such a powerful appearance.',
    },
    {
      title: 'Health',
      desc: "The Taurus natives usually are good with health for the most part of their life. But they, too, have their weak spots in various instances. The people born under the rising sign of Taurus are prone to nervous system issues. Having a good sleep is very important for these people as if they don't, they develop skin problems faster than anyone else. Their romance with intimacy can leave them suffering from sexual diseases. Also, these people should not ignore problems when in the bladder, neck, or chest area.",
    },
    {
      title: 'Career',
      desc: "Taurus rising people are absolutely eager to put in the effort and persevere in order to succeed, but their desire for stability and ease of mind leads them to choose a steady income with little chance of loss. It delights them to work effectively with genuine stuff rather than theoretical ideas. They prefer to see actual outcomes. Anything that retains them tied to the ground is beneficial to them. Working in the food or in the construction industry would be great for the people who are Taurus ascendants. They don't wish to be pressured when working and require time to collect information and process it properly since they dislike making mistakes. Plus, they will be frustrated and exhausted by a fast-paced profession that emphasizes quantity above quality.",
    },
    {
      title: 'Relationship',
      desc: "When it comes to relationships, a Taurus ascendant is very sensual, aka a sex lover. However, they move very cautiously when it comes to love and relationships. They always seek long-lasting love as they don't like change. They will never judge you based on your looks but personality. These people are very firm about their values and principles in life. It is one of their magnetic qualities that attract others. On the downside, they can be really impulsive and unreasonable at times, which is one thing that could hamper their relationship. However, once the moment passes by, they often find themselves the culprit. Thus it is recommended that Taurus ascendants think well before they speak.",
    },
  ];

  useFocusEffect(
    useCallback(() => {
      // Clear all states when the screen loses focus
      return () => {
        setName('');
        setGender('');
        setBirthPlace('');
        setBirthtime(new Date());
        setBirthdate(new Date());
      };
    }, [setName, setGender, setBirthPlace, setBirthtime, setBirthdate]),
  );
  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('kundli.screenHead'),
    });
  });

  const [selectedMahadasha, setSelectedMahadasha] = useState(null);
  const [selectedMahadashaIdx, setSelectedMahadashaIdx] = useState(null);

  function formatBalaType(str) {
    return str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  const shabdBalaColumnWidths = [
    130, // Bala Type
    80, // Sun
    80, // Moon
    80, // Mars
    80, // Mercury
    80, // Jupiter
    80, // Venus
    80, // Saturn
    80, // Rahu
    80, // Ketu
  ];
  const shabdBalaPlanets = [
    'Sun',
    'Moon',
    'Mars',
    'Mercury',
    'Jupiter',
    'Venus',
    'Saturn',
    'Rahu',
    'Ketu',
  ];

  // Add consistent column widths for KP-Planets
  const kpPlanetsColumnWidths = [
    110, // Full Name
    90, // Zodiac
    70, // Retro
    70, // House
    180, // Pseudo Nakshatra
    190, // Pseudo Nakshatra No
    190, // Pseudo Nakshatra Pada
    140, // Pseudo Nakshatra Lord
  ];
  const kpPlanetsHeaders = [
    'Full Name',
    'Zodiac',
    'Retro',
    'House',
    'Pseudo Nakshatra',
    'Pseudo Nakshatra No',
    'Pseudo Nakshatra Pada',
    'Pseudo Nakshatra Lord',
  ];

  return (
    <>
      {isLoading ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: isDarkMode ? colors.darkBackground : colors.lightBackground,
            minHeight: 400,
          }}
        >
          <ActivityIndicator size="large" color={colors.primary || '#9b4dca'} />
        </View>
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{
              backgroundColor: isDarkMode ? colors.darkBackground:colors.lightBackground,
              minHeight:50,
              maxHeight:50,
            }}
          >
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={{
                  borderBottomWidth: activeTab === tab ? 3 : 1,
                  borderColor: activeTab === tab
                              ? (isDarkMode ? colors.darkAccent: colors.purple)
                              : 'transparent',
                  minWidth: 70,
                  margin:5,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    color: activeTab === tab ? (isDarkMode ? colors.darkAccent:colors.purple) : (isDarkMode? colors.darkTextSecondary:'#232b3b'),
                    fontWeight: activeTab === tab ? 'bold' : 'normal',
                    fontSize: 18,
                    textAlign: 'center',
                  }}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <ScrollView
            style={{ backgroundColor: isDarkMode ? colors.darkBackground : colors.lightBackground }}
          >
            <View>
              {activeTab === 'Basic' && kundliResponseData && (
                <View style={{ padding: 16 }}>
                  {/* User Details */}
                  <View
                    style={{
                      backgroundColor: isDarkMode ? colors.darkSurface : colors.white,
                      borderRadius: 10,
                      padding: 16,
                      marginBottom: 16,
                      elevation: 2,
                      shadowColor: '#000',
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: 'bold',
                        fontSize: 18,
                        marginBottom: 12,
                        color:isDarkMode ? colors.darkTextPrimary:colors.black,
                      }}
                    >
                      User Details
                    </Text>
                    {[
                      { label: 'Name', value: name },
                      { label: 'Place', value: birthPlace },
                      {
                        label: 'Date',
                        value: moment(birthdate).format('DD/MM/YYYY'),
                      },
                      {
                        label: 'Time',
                        value: moment(birthtime).format('HH:mm'),
                      },
                      {
                        label: 'Timezone',
                        value: 'GMT + 5:30 (Indian Standard Time)',
                      },
                      { label: 'Gender', value: gender },
                    ].map((item) => (
                      <View
                        key={item.label}
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginBottom: 6,
                        }}
                      >
                        <Text style={{ fontWeight:'bold',color: isDarkMode ? colors.darkTextSecondary : colors.dark }}>
                          {item.label}
                        </Text>
                        <Text
                          style={{
                            fontWeight: 'bold',
                            color: isDarkMode ? colors.darkTextSecondary : colors.dark,
                          }}
                        >
                          {item.value}
                        </Text>
                      </View>
                    ))}
                  </View>
                  {/* Avakhada Details */}
                  <View
                    style={{
                      backgroundColor: isDarkMode ? colors.darkSurface : colors.white,
                      borderRadius: 10,
                      padding: 16,
                      elevation: 2,
                      shadowColor: '#000',
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      borderColor:isDarkMode ? colors.dark: colors.lightGray,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: 'bold',
                        fontSize: 18,
                        marginBottom: 12,
                        color:isDarkMode ? colors.darkTextPrimary:colors.black,
                      }}
                    >
                      Avakhada Details
                    </Text>
                    {kundliResponseData.response &&
                      Object.entries(kundliResponseData.response).map(
                        ([key, value]) => (
                          <View
                            key={key}
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              marginBottom: 6,
                            }}
                          >
                            <Text
                              style={{ fontWeight:'bold',color: isDarkMode ? colors.darkTextSecondary : colors.dark }}
                            >
                              {prettifyKey(key)}
                            </Text>
                            <Text
                              style={{
                                fontWeight: 'bold',
                                color: isDarkMode ? colors.darkTextSecondary : colors.dark,
                              }}
                            >
                              {value}
                            </Text>
                          </View>
                        ),
                      )}
                  </View>
                </View>
              )}
              {activeTab === 'Kundli' && (
                <View style={{ padding: 16 }}>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      fontSize: 18,
                      marginBottom: 12,
                      color:isDarkMode ?colors.darkTextPrimary:colors.black
                    }}
                  >
                    Planets
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={true}
                    style={{ marginBottom: 8 }}
                  >
                    <View>
                      {/* Table Header */}
                      <View
                        style={{
                          flexDirection: 'row',
                          backgroundColor: isDarkMode ? colors.darkSurface:'#f6f7fa',
                          borderTopLeftRadius: 8,
                          borderTopRightRadius: 8,
                          borderWidth: 1,
                          borderColor: isDarkMode ? colors.dark:'#e0e0e0',
                          paddingVertical: 8,
                        }}
                      >
                        <Text
                          style={{
                            minWidth: 90,
                            fontWeight: 'bold',
                            paddingHorizontal: 8,
                            color:isDarkMode ?colors.darkTextPrimary:colors.black
                          }}
                        >
                          Planet
                        </Text>
                        <Text
                          style={{
                            minWidth: 80,
                            fontWeight: 'bold',
                            paddingHorizontal: 8,
                            color:isDarkMode ?colors.darkTextPrimary:colors.black
                          }}
                        >
                          Zodiac
                        </Text>
                        <Text
                          style={{
                            minWidth: 130,
                            fontWeight: 'bold',
                            paddingHorizontal: 8,
                            color:isDarkMode ?colors.darkTextPrimary:colors.black
                          }}
                        >
                          Nakshatra
                        </Text>
                        <Text
                          style={{
                            minWidth: 130,
                            fontWeight: 'bold',
                            paddingHorizontal: 8,
                            color:isDarkMode ?colors.darkTextPrimary:colors.black
                          }}
                        >
                          Nakshatra Lord
                        </Text>
                        <Text
                          style={{
                            minWidth: 110,
                            fontWeight: 'bold',
                            paddingHorizontal: 8,
                            textAlign: 'center',
                            color:isDarkMode ?colors.darkTextPrimary:colors.black
                          }}
                        >
                          Nakshatra Pada
                        </Text>
                        <Text
                          style={{
                            minWidth: 110,
                            fontWeight: 'bold',
                            paddingHorizontal: 8,
                            textAlign: 'center',
                            color:isDarkMode ?colors.darkTextPrimary:colors.black
                          }}
                        >
                          Local Degree
                        </Text>
                      </View>
                      {/* Table Rows */}
                      {planetData ? (
                        Object.values(planetData)
                          .filter((planet) => planet.full_name)
                          .map((planet, idx) => (
                            <View
                              key={planet.full_name + idx}
                              style={{
                                flexDirection: 'row',
                                borderWidth: 1,
                                borderColor: isDarkMode ? colors.dark: colors.lightGray,
                                paddingVertical: 8,
                                backgroundColor:
                                  idx % 2 === 0 ? (isDarkMode ? colors.darkTableRowEven: '#fff') : (isDarkMode? colors.darkTableRowOdd:'#f6f7fa'),
                              }}
                            >
                              <Text
                                style={{ minWidth: 90, paddingHorizontal: 8, color:isDarkMode ? colors.darkTextSecondary:colors.black }}
                              >
                                {planet.full_name || '-'}
                              </Text>
                              <Text
                                style={{ minWidth: 80, paddingHorizontal: 8,color:isDarkMode ? colors.darkTextSecondary:colors.black}}
                              >
                                {planet.zodiac || '-'}
                              </Text>
                              <Text
                                style={{ minWidth: 130, paddingHorizontal: 8 ,color:isDarkMode ? colors.darkTextSecondary:colors.black}}
                              >
                                {planet.nakshatra || '-'}
                              </Text>
                              <Text
                                style={{ minWidth: 130, paddingHorizontal: 8 ,color:isDarkMode ? colors.darkTextSecondary:colors.black}}
                              >
                                {planet.nakshatra_lord || '-'}
                              </Text>
                              <Text
                                style={{
                                  minWidth: 110,
                                  paddingHorizontal: 8,
                                  textAlign: 'center'
                                  ,color:isDarkMode ? colors.darkTextSecondary:colors.black
                                }}
                              >
                                {planet.nakshatra_pada || '-'}
                              </Text>
                              <Text
                                style={{
                                  minWidth: 110,
                                  paddingHorizontal: 8,
                                  textAlign: 'center',
                                  color:isDarkMode ? colors.darkTextSecondary:colors.black
                                }}
                              >
                                {planet.local_degree
                                  ? planet.local_degree.toFixed(3) + '°'
                                  : '-'}
                              </Text>
                            </View>
                          ))
                      ) : (
                        <Text style={{ marginTop: 16, color: 'gray' }}>
                          No planet data available.
                        </Text>
                      )}
                    </View>
                  </ScrollView>

                  {selectedMahadashaIdx === null ? (
                    // Mahadasha Table
                    <View style={{ marginTop: 24 }}>
                      <Text
                        style={{
                          fontWeight: 'bold',
                          fontSize: 18,
                          marginBottom: 12,
                          color: isDarkMode ? colors.darkTextPrimary : colors.black,
                        }}
                      >
                        Mahadasha
                      </Text>

                      <Text
                        style={{
                          color: isDarkMode ? colors.darkAccent : 'gray',
                          marginBottom: 12,
                          fontStyle: 'italic',
                        }}
                      >
                        Explore AntarDasha by clicking on a planet
                      </Text>

                      {/* Table Header */}
                      <View
                        style={{
                          flexDirection: 'row',
                          backgroundColor: isDarkMode ? colors.darkSurface : '#f6f7fa',
                          borderTopLeftRadius: 8,
                          borderTopRightRadius: 8,
                          borderWidth: 1,
                          borderColor: isDarkMode ? colors.dark : '#e0e0e0',
                          paddingVertical: 8,
                        }}
                      >
                        <Text
                          style={{
                            flex: 1,
                            fontWeight: 'bold',
                            textAlign: 'left',
                            color: isDarkMode ? colors.darkTextPrimary : colors.black,
                            paddingHorizontal: 8,
                          }}
                        >
                          Planet
                        </Text>
                        <Text
                          style={{
                            flex: 1,
                            fontWeight: 'bold',
                            textAlign: 'left',
                            color: isDarkMode ? colors.darkTextPrimary : colors.black,
                            paddingHorizontal: 8,
                          }}
                        >
                          Start Date
                        </Text>
                        <Text
                          style={{
                            flex: 1,
                            fontWeight: 'bold',
                            textAlign: 'left',
                            color: isDarkMode ? colors.darkTextPrimary : colors.black,
                            paddingHorizontal: 8,
                          }}
                        >
                          End Date
                        </Text>
                      </View>

                      {/* Table Rows */}
                      {mahadashaData.mahadasha && mahadashaData.mahadasha.length > 0 ? (
                        mahadashaData.mahadasha.map((planet, idx) => {
                          const startDate =
                            idx === 0
                              ? mahadashaData.mahadasha_order[0]
                              : mahadashaData.mahadasha_order[idx - 1];
                          const endDate = mahadashaData.mahadasha_order[idx];

                          return (
                            <TouchableOpacity
                              key={planet + idx}
                              onPress={() => setSelectedMahadashaIdx(idx)}
                              style={{
                                flexDirection: 'row',
                                borderWidth: 1,
                                borderColor: isDarkMode ? colors.dark : '#e0e0e0',
                                paddingVertical: 8,
                                backgroundColor:
                                  idx % 2 === 0
                                    ? isDarkMode
                                      ? colors.darkTableRowEven
                                      : '#fff'
                                    : isDarkMode
                                    ? colors.darkTableRowOdd
                                    : '#f6f7fa',
                              }}
                            >
                              <Text
                                style={{
                                  flex: 1,
                                  paddingHorizontal: 8,
                                  color: isDarkMode ? colors.darkTextSecondary : colors.black,
                                }}
                              >
                                {planet || '-'}
                              </Text>
                              <Text
                                style={{
                                  flex: 1,
                                  paddingHorizontal: 8,
                                  color: isDarkMode ? colors.darkTextSecondary : colors.black,
                                }}
                              >
                                {startDate
                                  ? new Date(startDate).toLocaleDateString()
                                  : '-'}
                              </Text>
                              <Text
                                style={{
                                  flex: 1,
                                  paddingHorizontal: 8,
                                  color: isDarkMode ? colors.darkTextSecondary : colors.black,
                                }}
                              >
                                {endDate
                                  ? new Date(endDate).toLocaleDateString()
                                  : '-'}
                              </Text>
                            </TouchableOpacity>
                          );
                        })
                      ) : (
                        <Text
                          style={{
                            marginTop: 16,
                            color: isDarkMode ? colors.darkTextSecondary : 'gray',
                          }}
                        >
                          No mahadasha data available.
                        </Text>
                      )}
                    </View>

                  ) : (
                    // Antardasha Table
                    <View style={{ marginTop: 24 }}>
                      <TouchableOpacity
                        onPress={() => setSelectedMahadashaIdx(null)}
                        style={{
                          backgroundColor: colors.purple,
                          borderRadius: 6,
                          paddingVertical: 6,
                          paddingHorizontal: 16,
                          alignSelf: 'flex-start',
                          marginBottom: 12,
                        }}
                      >
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>
                          {'< Back to Mahadasha'}
                        </Text>
                      </TouchableOpacity>

                      <Text
                        style={{
                          fontWeight: 'bold',
                          fontSize: 18,
                          marginBottom: 12,
                          color: isDarkMode ? colors.darkTextPrimary : colors.black,
                        }}
                      >
                        Antardasha
                      </Text>

                      {/* Header Row */}
                      <View
                        style={{
                          flexDirection: 'row',
                          backgroundColor: isDarkMode ? colors.darkSurface : '#f6f7fa',
                          borderTopLeftRadius: 8,
                          borderTopRightRadius: 8,
                          borderWidth: 1,
                          borderColor: isDarkMode ? colors.dark : colors.lightGray,
                          paddingVertical: 8,
                        }}
                      >
                        <Text
                          style={{
                            flex: 2,
                            fontWeight: 'bold',
                            textAlign: 'left',
                            color: isDarkMode ? colors.darkTextPrimary : colors.black,
                          }}
                        >
                          Antardasha
                        </Text>
                        <Text
                          style={{
                            flex: 1,
                            fontWeight: 'bold',
                            textAlign: 'left',
                            color: isDarkMode ? colors.darkTextPrimary : colors.black,
                          }}
                        >
                          Start Date
                        </Text>
                        <Text
                          style={{
                            flex: 1,
                            fontWeight: 'bold',
                            textAlign: 'left',
                            color: isDarkMode ? colors.darkTextPrimary : colors.black,
                          }}
                        >
                          End Date
                        </Text>
                      </View>

                      {/* Table Rows */}
                      {antardashaData.antardashas[selectedMahadashaIdx] &&
                        antardashaData.antardashas[selectedMahadashaIdx].map(
                          (antardasha, idx) => {
                            const startDate =
                              antardashaData.antardasha_order[selectedMahadashaIdx][idx];
                            const endDate =
                              antardashaData.antardasha_order[selectedMahadashaIdx][idx + 1];

                            return (
                              <View
                                key={antardasha + idx}
                                style={{
                                  flexDirection: 'row',
                                  borderWidth: 1,
                                  borderColor: isDarkMode ? colors.dark : colors.lightGray,
                                  paddingVertical: 8,
                                  backgroundColor: idx % 2 === 0
                                    ? (isDarkMode ? colors.darkTableRowEven : '#fff')
                                    : (isDarkMode ? colors.darkTableRowOdd : '#f6f7fa'),
                                }}
                              >
                                <Text
                                  style={{
                                    flex: 2,
                                    color: isDarkMode ? colors.darkTextSecondary : colors.black,
                                  }}
                                >
                                  {antardasha || '-'}
                                </Text>
                                <Text
                                  style={{
                                    flex: 1,
                                    color: isDarkMode ? colors.darkTextSecondary : colors.black,
                                  }}
                                >
                                  {startDate
                                    ? new Date(startDate).toLocaleDateString()
                                    : '-'}
                                </Text>
                                <Text
                                  style={{
                                    flex: 1,
                                    color: isDarkMode ? colors.darkTextSecondary : colors.black,
                                  }}
                                >
                                  {endDate
                                    ? new Date(endDate).toLocaleDateString()
                                    : '-'}
                                </Text>
                              </View>
                            );
                          },
                        )}
                    </View>

                  )}
                </View>
              )}
              {activeTab === 'KP' && (
               <View style={{ padding: 16 }}>
                  {/* KP-Planets Header */}
                  <Text
                    style={{
                      fontWeight: 'bold',
                      fontSize: 18,
                      marginBottom: 12,
                      color: isDarkMode ? colors.darkTextPrimary : colors.black,
                    }}
                  >
                    KP-Planets
                  </Text>

                  {/* KP-Planets Table */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={true}
                    style={{ marginBottom: 8 }}
                  >
                    <View>
                      {/* Table Header */}
                      <View
                        style={{
                          flexDirection: 'row',
                          backgroundColor: isDarkMode ? colors.darkSurface : '#f6f7fa',
                          borderTopLeftRadius: 8,
                          borderTopRightRadius: 8,
                          borderWidth: 1,
                          borderColor: isDarkMode ? colors.dark : colors.lightGray,
                          paddingVertical: 8,
                        }}
                      >
                        {kpPlanetsHeaders.map((header, i) => (
                          <Text
                            key={header}
                            style={{
                              minWidth: kpPlanetsColumnWidths[i],
                              fontWeight: 'bold',
                              color: isDarkMode ? colors.darkTextPrimary : 'black',
                              paddingHorizontal: 8,
                            }}
                          >
                            {header}
                          </Text>
                        ))}
                      </View>

                      {/* Table Rows */}
                      {Object.values(kpData)
                        .filter((item) => typeof item === 'object' && item.full_name)
                        .map((item, idx) => (
                          <View
                            key={item.full_name + idx}
                            style={{
                              flexDirection: 'row',
                              borderWidth: 1,
                              borderColor: isDarkMode ? colors.dark : colors.lightGray,
                              paddingVertical: 8,
                              backgroundColor:
                                idx % 2 === 0
                                  ? isDarkMode
                                    ? colors.darkTableRowEven
                                    : '#fff'
                                  : isDarkMode
                                  ? colors.darkTableRowOdd
                                  : '#f6f7fa',
                            }}
                          >
                            <Text
                              style={{
                                minWidth: kpPlanetsColumnWidths[0],
                                paddingHorizontal: 8,
                                color: isDarkMode ? colors.darkTextSecondary : colors.black,
                              }}
                            >
                              {item.full_name || '-'}
                            </Text>
                            <Text
                              style={{
                                minWidth: kpPlanetsColumnWidths[1],
                                paddingHorizontal: 8,
                                color: isDarkMode ? colors.darkTextSecondary : colors.black,
                              }}
                            >
                              {item.zodiac || '-'}
                            </Text>
                            <Text
                              style={{
                                minWidth: kpPlanetsColumnWidths[2],
                                paddingHorizontal: 8,
                                color: isDarkMode ? colors.darkTextSecondary : colors.black,
                              }}
                            >
                              {item.retro ? 'true' : 'false'}
                            </Text>
                            <Text
                              style={{
                                minWidth: kpPlanetsColumnWidths[3],
                                paddingHorizontal: 8,
                                color: isDarkMode ? colors.darkTextSecondary : colors.black,
                              }}
                            >
                              {item.house || '-'}
                            </Text>
                            <Text
                              style={{
                                minWidth: kpPlanetsColumnWidths[4],
                                paddingHorizontal: 8,
                                color: isDarkMode ? colors.darkTextSecondary : colors.black,
                              }}
                            >
                              {item.pseudo_nakshatra || '-'}
                            </Text>
                            <Text
                              style={{
                                minWidth: kpPlanetsColumnWidths[5],
                                paddingHorizontal: 8,
                                color: isDarkMode ? colors.darkTextSecondary : colors.black,
                              }}
                            >
                              {item.pseudo_nakshatra_no || '-'}
                            </Text>
                            <Text
                              style={{
                                minWidth: kpPlanetsColumnWidths[6],
                                paddingHorizontal: 8,
                                color: isDarkMode ? colors.darkTextSecondary : colors.black,
                              }}
                            >
                              {item.pseudo_nakshatra_pada || '-'}
                            </Text>
                            <Text
                              style={{
                                minWidth: kpPlanetsColumnWidths[7],
                                paddingHorizontal: 8,
                                color: isDarkMode ? colors.darkTextSecondary : colors.black,
                              }}
                            >
                              {item.pseudo_nakshatra_lord || '-'}
                            </Text>
                          </View>
                        ))}
                    </View>
                  </ScrollView>

                  {/* Shabd Bala Table */}
                  <View style={{ marginTop: 32 }}>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        fontSize: 18,
                        marginBottom: 12,
                        color: isDarkMode ? colors.darkTextPrimary : colors.black,
                      }}
                    >
                      Shabd Bala
                    </Text>

                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={true}
                      style={{ marginBottom: 8 }}
                    >
                      <View>
                        {/* Table Header */}
                        <View
                          style={{
                            flexDirection: 'row',
                            backgroundColor: isDarkMode ? colors.darkSurface : '#f6f7fa',
                            borderTopLeftRadius: 8,
                            borderTopRightRadius: 8,
                            borderWidth: 1,
                            borderColor: isDarkMode ? colors.dark : colors.lightGray,
                            paddingVertical: 8,
                          }}
                        >
                          <Text
                            style={{
                              minWidth: 120,
                              fontWeight: 'bold',
                              color: isDarkMode ? colors.darkTextPrimary : 'black',
                              paddingHorizontal: 8,
                            }}
                          >
                            Bala Type
                          </Text>
                          {shabdBalaPlanets.map((planet, i) => (
                            <Text
                              key={planet}
                              style={{
                                minWidth: shabdBalaColumnWidths[i + 1],
                                fontWeight: 'bold',
                                color: isDarkMode ? colors.darkTextPrimary : 'black',
                                paddingHorizontal: 8,
                              }}
                            >
                              {planet}
                            </Text>
                          ))}
                        </View>

                        {/* Table Rows */}
                        {Object.entries(shabdBala).map(([balaType, values], idx) => (
                          <View
                            key={balaType}
                            style={{
                              flexDirection: 'row',
                              borderWidth: 1,
                              borderColor: isDarkMode ? colors.dark : '#e0e0e0',
                              paddingVertical: 8,
                              backgroundColor:
                                idx % 2 === 0
                                  ? isDarkMode
                                    ? colors.darkTableRowEven
                                    : '#fff'
                                  : isDarkMode
                                  ? colors.darkTableRowOdd
                                  : '#f6f7fa',
                            }}
                          >
                            <Text
                              style={{
                                minWidth: shabdBalaColumnWidths[0],
                                paddingHorizontal: 8,
                                color: isDarkMode ? colors.darkTextSecondary : colors.black,
                              }}
                            >
                              {prettifyKey(balaType)}
                            </Text>
                            {shabdBalaPlanets.map((planet, i) => (
                              <Text
                                key={planet}
                                style={{
                                  minWidth: shabdBalaColumnWidths[i + 1],
                                  paddingHorizontal: 8,
                                  color: isDarkMode ? colors.darkTextSecondary : colors.black,
                                }}
                              >
                                {values && values[planet] !== undefined && values[planet] !== null
                                  ? typeof values[planet] === 'number'
                                    ? values[planet].toFixed(2)
                                    : values[planet]
                                  : 'N/A'}
                              </Text>
                            ))}
                          </View>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                </View>
              )}
              {activeTab === 'Charts' && (
                <View style={{ padding: 16 }}>
                  {[
                    { data: chartData.imgChart, title: 'Rashi / Birth Chart (D1)' },
                    { data: chartData.imgNavamsa, title: 'Navamsa (D9)' },
                    { data: chartData.imgDasamsa, title: 'Dasamsa (D10)' },
                    { data: chartData.imgSaptamsa, title: 'Saptamsa (D7)' },
                    { data: chartData.imgDwadasamsa, title: 'Dwadasamsa (D12)' },
                    { data: chartData.imgShodasamsa, title: 'Shodasamsa (D16)' },
                    { data: chartData.imgVimsamsa, title: 'Vimsamsa (D20)' },
                    { data: chartData.imgKhavedamsa, title: 'Khavedamsa (D40)' },
                    { data: chartData.imgAkshavedamsa, title: 'Akshavedamsa (D45)' },
                    { data: chartData.imgShastiamsa, title: 'Shastiamsa (D60)' },
                  ].map(
                    (chart, index) =>
                      chart.data && (
                        <View
                          key={index}
                          style={{
                            alignItems: 'center',
                            marginBottom: 32,
                            width: '100%',
                          }}
                        >
                          {/* Title */}
                          <Text
                            style={{
                              fontWeight: 'bold',
                              fontSize: 16,
                              marginBottom: 12,
                              textAlign: 'center',
                              color: isDarkMode ? colors.darkTextPrimary : colors.black,
                            }}
                          >
                            {chart.title}
                          </Text>

                          <Svg
                            width={300}
                            height={300}
                            viewBox={`0 0 ${
                              chart.data.svgProps?.width || 500
                            } ${chart.data.svgProps?.height || 500}`}
                            style={{
                              backgroundColor: '#fdf1e2',
                              borderRadius: 8,
                            }}
                          >
                            {chart.data.components?.map((comp) => {
                              if (comp.type === 'Line') {
                                return (
                                  <Line
                                    key={comp.key}
                                    x1={comp.x1}
                                    y1={comp.y1}
                                    x2={comp.x2}
                                    y2={comp.y2}
                                    stroke={comp.stroke}
                                    strokeWidth={comp.strokeWidth}
                                  />
                                );
                              }
                              if (comp.type === 'Text') {
                                return (
                                  <SvgText
                                    key={comp.key}
                                    x={comp.x}
                                    y={comp.y}
                                    fontFamily={comp.fontFamily}
                                    fontSize={comp.fontSize}
                                    fontWeight={comp.fontWeight}
                                    textAnchor={comp.textAnchor}
                                    fill={comp.fill || '#232b3b'}
                                    letterSpacing={comp.letterSpacing}
                                  >
                                    {comp.text}
                                  </SvgText>
                                );
                              }
                              return null;
                            })}
                          </Svg>
                        </View>
                      ),
                  )}
                </View>
              )}
              {activeTab === 'Reports' && (
                <View style={{ padding: 16 }}>
                  {/* Secondary Tab Bar */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={true}
                    style={{ marginBottom: 16 }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        borderBottomWidth: 1,
                        borderColor: isDarkMode ? colors.darkBorder : '#e0e0e0',
                      }}
                    >
                      {reportTabs.map((tab) => (
                        <TouchableOpacity
                          key={tab}
                          onPress={() => setActiveReportTab(tab)}
                          style={{
                            marginRight: 24,
                            paddingBottom: 8,
                            borderBottomWidth: activeReportTab === tab ? 3 : 0,
                            borderColor: activeReportTab === tab
                              ? colors.darkAccent
                              : 'transparent',
                          }}
                        >
                          <Text
                            style={{
                              fontWeight: activeReportTab === tab ? 'bold' : 'normal',
                              color: activeReportTab === tab ? (isDarkMode ? colors.darkAccent:colors.purple) : (isDarkMode? colors.darkTextSecondary:'#232b3b'),
                              fontSize: 16,
                            }}
                          >
                            {tab}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>

                  {/* Tab Content */}
                  {activeReportTab === 'List of Yogas' && (
                    <>
                      <Text
                        style={{
                          fontWeight: 'bold',
                          fontSize: 18,
                          marginBottom: 12,
                          color: isDarkMode ? colors.darkTextPrimary : colors.black,
                        }}
                      >
                        List of Yogas
                      </Text>
                      {yogas.length === 0 ? (
                        <Text style={{ color: isDarkMode ? colors.darkTextSecondary : 'gray' }}>
                          No yogas found.
                        </Text>
                      ) : (
                        yogas.map((yoga, idx) => (
                          <View
                            key={yoga.yoga + idx}
                            style={{
                              backgroundColor: isDarkMode ? colors.darkSurface : '#fff',
                              borderRadius: 8,
                              padding: 16,
                              marginBottom: 16,
                              borderWidth: 1,
                              borderColor: isDarkMode ? colors.darkBorder : '#e0e0e0',
                            }}
                          >
                            <Text
                              style={{
                                fontWeight: 'bold',
                                fontSize: 16,
                                marginBottom: 4,
                                color: isDarkMode ? colors.darkTextPrimary : colors.black,
                              }}
                            >
                              {yoga.yoga}
                            </Text>
                            <Text
                              style={{
                                marginBottom: 8,
                                color: isDarkMode ? colors.darkTextSecondary : colors.black,
                              }}
                            >
                              {yoga.meaning}
                            </Text>
                            <Text style={{ fontWeight: 'bold', marginBottom: 2, color: isDarkMode ? colors.darkTextPrimary : colors.black }}>
                              Strength:{' '}
                              <Text style={{ fontWeight: 'normal' }}>
                                {yoga.strength_in_percentage}%
                              </Text>
                            </Text>
                            <Text style={{ fontWeight: 'bold', marginBottom: 2, color: isDarkMode ? colors.darkTextPrimary : colors.black }}>
                              Planets:{' '}
                              <Text style={{ fontWeight: 'normal' }}>
                                {yoga.planets_involved.join(', ')}
                              </Text>
                            </Text>
                            <Text style={{ fontWeight: 'bold', color: isDarkMode ? colors.darkTextPrimary : colors.black }}>
                              Houses:{' '}
                              <Text style={{ fontWeight: 'normal' }}>
                                {yoga.houses_involved.join(', ')}
                              </Text>
                            </Text>
                          </View>
                        ))
                      )}
                    </>
                  )}

                  {activeReportTab === 'Planet Details' && (
                    <Text style={{ color: isDarkMode ? colors.darkTextPrimary : colors.black }}>
                      Planet Details content goes here.
                    </Text>
                  )}

                  {activeReportTab === 'Dosha' && (
                    <View>
                      <Text
                        style={{
                          fontWeight: 'bold',
                          fontSize: 20,
                          marginBottom: 16,
                          color: isDarkMode ? colors.darkTextPrimary : colors.black,
                        }}
                      >
                        Mangal Dosha Analysis
                      </Text>
                      {/* Dosha Status Card */}
                      <View
                        style={{
                          backgroundColor: isDarkMode ? colors.darkSurface : '#fff',
                          borderRadius: 8,
                          padding: 16,
                          marginBottom: 16,
                          borderWidth: 1,
                          borderColor: isDarkMode ? colors.darkBorder : '#e0e0e0',
                        }}
                      >
                        <Text
                          style={{
                            fontWeight: 'bold',
                            fontSize: 16,
                            marginBottom: 8,
                            color: isDarkMode ? colors.darkTextPrimary : colors.black,
                          }}
                        >
                          Dosha Status:
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                          <Text style={{ fontSize: 18, color: '#e53935', marginRight: 8 }}>
                            ✖
                          </Text>
                          <Text style={{ color: '#e53935', fontWeight: 'bold', fontSize: 16 }}>
                            {dosha.is_dosha_present ? 'Dosha Present' : 'No Dosha'}
                          </Text>
                        </View>
                        <Text style={{ marginBottom: 4, color: isDarkMode ? colors.darkTextSecondary : colors.black }}>
                          {dosha.bot_response}
                        </Text>
                        <Text style={{ marginBottom: 4, color: isDarkMode ? colors.darkTextSecondary : colors.black }}>
                          Dosha Score: {dosha.score}%
                        </Text>
                        <Text style={{ color: isDarkMode ? colors.darkTextSecondary : colors.black }}>
                          Anshik (Partial) Dosha:{' '}
                          {dosha.is_dosha_present_mars_from_moon ? 'Yes' : 'No'}
                        </Text>
                      </View>

                      {/* Factors */}
                      <View
                        style={{
                          backgroundColor: isDarkMode ? colors.darkSurface : '#fff',
                          borderRadius: 8,
                          padding: 16,
                          marginBottom: 16,
                          borderWidth: 1,
                          borderColor: isDarkMode ? colors.darkBorder : '#e0e0e0',
                        }}
                      >
                        <Text
                          style={{
                            fontWeight: 'bold',
                            fontSize: 16,
                            marginBottom: 8,
                            color: isDarkMode ? colors.darkTextPrimary : colors.black,
                          }}
                        >
                          Factors Contributing to Dosha:
                        </Text>
                        {dosha.factors &&
                          Object.entries(dosha.factors).map(([planet, reason], idx) => (
                            <Text
                              key={planet + idx}
                              style={{ marginBottom: 4, color: isDarkMode ? colors.darkTextSecondary : colors.black }}
                            >
                              {planet}: {reason}
                            </Text>
                          ))}
                      </View>

                      {/* Cancellation Info */}
                      {dosha.cancellation &&
                        dosha.cancellation.cancellationReason &&
                        dosha.cancellation.cancellationReason.length > 0 && (
                          <View
                            style={{
                              backgroundColor: isDarkMode ? colors.darkSurface : '#fff',
                              borderRadius: 8,
                              padding: 16,
                              marginBottom: 16,
                              borderWidth: 1,
                              borderColor: isDarkMode ? colors.darkBorder : '#e0e0e0',
                            }}
                          >
                            <Text
                              style={{
                                fontWeight: 'bold',
                                fontSize: 16,
                                marginBottom: 8,
                                color: isDarkMode ? colors.darkTextPrimary : colors.black,
                              }}
                            >
                              Dosha Cancellation:
                            </Text>
                            <Text
                              style={{
                                marginBottom: 4,
                                color: isDarkMode ? colors.darkTextSecondary : colors.black,
                              }}
                            >
                              Cancellation Score: {dosha.cancellation.cancellationScore}
                            </Text>
                            {dosha.cancellation.cancellationReason.map((reason, idx) => (
                              <Text
                                key={idx}
                                style={{ marginBottom: 2, color: isDarkMode ? colors.darkTextSecondary : colors.black }}
                              >
                                {reason}
                              </Text>
                            ))}
                          </View>
                        )}
                    </View>
                  )}

                  {activeReportTab === 'Friendship' && (
                    <View
                      style={{
                        backgroundColor: isDarkMode ? colors.darkSurface : '#fff',
                        borderRadius: 8,
                        padding: 24,
                        marginBottom: 16,
                        borderWidth: 1,
                        borderColor: isDarkMode ? colors.dark : colors.lightGray,
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: 'bold',
                          fontSize: 18,
                          marginBottom: 16,
                          color: isDarkMode ? colors.darkTextPrimary : colors.black,
                        }}
                      >
                        Permanent Friendship Table
                      </Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                        <View>
                          <View
                            style={{
                              flexDirection: 'row',
                              borderWidth: 1,
                              borderColor: isDarkMode ? colors.dark : colors.lightGray,
                              paddingBottom: 8,
                            }}
                          >
                            {['Planet', 'Friends', 'Neutral', 'Enemies'].map((header, i) => (
                              <Text
                                key={header}
                                style={{
                                  minWidth: i === 0 ? 100 : i === 1 ? 220 : 180,
                                  fontWeight: 'bold',
                                  fontSize: 16,
                                  paddingHorizontal: 8,
                                  color: isDarkMode ? colors.darkTextPrimary : colors.black,
                                }}
                              >
                                {header}
                              </Text>
                            ))}
                          </View>
                          {friendship.permanent_table &&
                            Object.entries(friendship.permanent_table).map(
                              ([planet, data], idx) => (
                                <View
                                  key={planet}
                                  style={{
                                    flexDirection: 'row',
                                    borderWidth: 1,
                                    borderColor: isDarkMode ? colors.dark : colors.lightGray,
                                    paddingVertical: 8,
                                    backgroundColor:
                                      idx % 2 === 0
                                        ? (isDarkMode ? colors.darkTableRowEven : '#fff')
                                        : (isDarkMode ? colors.darkTableRowOdd : '#f6f7fa'),
                                  }}
                                >
                                  <Text
                                    style={{ minWidth: 100, paddingHorizontal: 8, color: isDarkMode ? colors.darkTextSecondary : colors.black }}
                                  >
                                    {planet}
                                  </Text>
                                  <Text
                                    style={{ minWidth: 220, paddingHorizontal: 8, color: isDarkMode ? colors.darkTextSecondary : colors.black }}
                                  >
                                    {data.Friends?.length ? data.Friends.join(', ') : '-'}
                                  </Text>
                                  <Text
                                    style={{ minWidth: 180, paddingHorizontal: 8, color: isDarkMode ? colors.darkTextSecondary : colors.black }}
                                  >
                                    {data.Neutral?.length ? data.Neutral.join(', ') : '-'}
                                  </Text>
                                  <Text
                                    style={{ minWidth: 180, paddingHorizontal: 8, color: isDarkMode ? colors.darkTextSecondary : colors.black }}
                                  >
                                    {data.Enemies?.length ? data.Enemies.join(', ') : '-'}
                                  </Text>
                                </View>
                              )
                            )}
                        </View>
                      </ScrollView>
                    </View>
                  )}
                </View>
              )}
            </View>
          </ScrollView>
        </>
      )}
    </>
  );
};

export default WithSafeArea(KundliDetails);
