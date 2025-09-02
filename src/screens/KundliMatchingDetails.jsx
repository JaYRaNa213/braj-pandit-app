import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../assets/constants/colors';
import { KundliState } from '../context/KundliProvider';
import { useTheme } from '../context/ThemeContext';
import { useGetKundliMatchingDataMutation } from '../redux/api/kundliApi';
import moment from 'moment';
import WithSafeArea from '../components/HOC/SafeAreaView';

const GunaColumns = [
  'Gun Name',
  'Male Value',
  'Female Value',
  'Points Obtained',
  'Description',
  'Full Score',
];

const gunaKeys = [
  { key: 'tara', boy: 'boy_tara', girl: 'girl_tara', points: 'tara' },
  { key: 'gana', boy: 'boy_gana', girl: 'girl_gana', points: 'gana' },
  { key: 'yoni', boy: 'boy_yoni', girl: 'girl_yoni', points: 'yoni' },
  {
    key: 'bhakoot',
    boy: 'boy_rasi_name',
    girl: 'girl_rasi_name',
    points: 'bhakoot',
  },
  {
    key: 'grahamaitri',
    boy: 'boy_lord',
    girl: 'girl_lord',
    points: 'grahamaitri',
  },
  { key: 'vasya', boy: 'boy_vasya', girl: 'girl_vasya', points: 'vasya' },
  { key: 'nadi', boy: 'boy_nadi', girl: 'girl_nadi', points: 'nadi' },
  { key: 'varna', boy: 'boy_varna', girl: 'girl_varna', points: 'varna' },
];

const KundliMatchingDetails = () => {
  const { t } = useTranslation();
  const [astakootgunas, setAstakootgunas] = useState({});
  const [postKundliMatchingData] = useGetKundliMatchingDataMutation();

  const [loading, setLoading] = useState(false);

  const {
    boyName,
    boyBirthDate,
    boyBirthTime,
    boyBirthPlace,
    girlName,
    girlBirthDate,
    girlBirthTime,
    girlBirthPlace,
  } = KundliState();

  const navigation = useNavigation();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const maleData = {
      d: moment(boyBirthDate).format('DD/MM/YYYY'),
      gender: 'male',
      name: boyName,
      place: boyBirthPlace,
      t: moment(boyBirthTime).format('HH:mm'),
    };
    const femaleData = {
      d: moment(girlBirthDate).format('DD/MM/YYYY'),
      gender: 'female',
      name: girlName,
      place: girlBirthPlace,
      t: moment(girlBirthTime).format('HH:mm'),
    };
    const getAshtaKootPoints = async () => {
      setLoading(true);
      const inputData = {
        maleData: maleData,
        femaleData: femaleData,
      };

      try {
        const { data } = await postKundliMatchingData(inputData);

        setAstakootgunas(data.response);
        setLoading(false);
      } catch (error) {
        console.log(error);
        ToastAndroid.show(
          error?.response?.data?.message || 'Internal server error',
          ToastAndroid.SHORT,
        );
        setLoading(false);
      }
    };
    getAshtaKootPoints();
  }, [
    boyBirthDate,
    boyBirthPlace,
    boyBirthTime,
    boyName,
    girlBirthDate,
    girlBirthPlace,
    girlBirthTime,
    girlName,
    postKundliMatchingData,
  ]);

  const calculateTotalPoints = () => {
    return astakootgunas && Object.values(astakootgunas).pop();
  };

  // Screen
  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('Match Kundli.finalScreen.screenHead'),
    });
  }, [navigation, t]);

  const cellStyle = {
    flex: 1,
    textAlign: 'center',
    color: isDarkMode ? colors.lightGray : colors.gray,
    paddingVertical: 12,
    fontSize: 10,
    textTransform: 'capitalize',
    borderRightWidth: 1,
    borderColor: isDarkMode ? colors.dark : colors.lightGray,
  };

  return (
    <ScrollView
      style={{
        paddingTop: 20,
        paddingHorizontal: 10,
        backgroundColor: isDarkMode ? colors.darkBackground : colors.lightBackground,
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: 10,
          color: isDarkMode ? 'white' : 'black',
        }}
      >
        {t('Match Kundli.finalScreen.head')}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: isDarkMode ? colors.darkTableRowOdd : '#f5f5f5',
          borderWidth: 1,
          borderColor: isDarkMode ? colors.dark : colors.lightGray,
        }}
      >
        {GunaColumns.map((column, index) => (
          <Text
            key={index}
            style={{
              flex: 1,
              textAlign: 'center',
              color: isDarkMode ? colors.darkTextPrimary : colors.gray,
              paddingVertical: 12,
              textTransform: 'capitalize',
              fontSize: 10,
              fontWeight: 'bold',
              borderRightWidth: 1,
              borderColor: isDarkMode ? '#999' : '#ddd',
            }}
          >
            {t(`${column}`)}
          </Text>
        ))}
      </View>
      {loading ? (
        <View
          style={{
            paddingTop: 20,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: isDarkMode ? colors.darkBackground : 'white',
            flex: 1,
          }}
        >
          <ActivityIndicator
            size={'large'}
            color={isDarkMode ? 'white' : colors.purple}
          />
        </View>
      ) : (
        <>
          <View
            style={{
              backgroundColor: isDarkMode ? colors.darkSurface : '#fff',
              borderLeftWidth: 1,
              borderBottomWidth: 1,
              borderRightWidth: 1,
              borderColor: isDarkMode ? colors.dark : colors.lightGray,
            }}
          >
            {gunaKeys.map(({ key, boy, girl, points }, idx) => {
              const guna = astakootgunas[key];
              if (!guna) return null;
              return (
                <View
                  key={key}
                  style={{
                    flexDirection: 'row',
                    borderBottomWidth: 1,
                    borderColor: isDarkMode ? '#999' : '#ddd',
                  }}
                >
                  <Text style={cellStyle}>{guna.name}</Text>
                  <Text style={cellStyle}>{guna[boy]}</Text>
                  <Text style={cellStyle}>{guna[girl]}</Text>
                  <Text style={cellStyle}>{guna.full_score}</Text>
                  <Text style={cellStyle}>{guna.description}</Text>
                  <Text style={cellStyle}>{guna.full_score}</Text>
                </View>
              );
            })}
            {/* Total Score Row */}
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: isDarkMode ? colors.darkTableRowOdd : '#f5f5f5',
              }}
            >
              <Text style={[cellStyle, { fontWeight: 'bold' }]}>
                Total Score
              </Text>
              <Text style={cellStyle}></Text>
              <Text style={cellStyle}></Text>
              <Text style={[cellStyle, { fontWeight: 'bold' }]}>
                {astakootgunas.score}
              </Text>
              <Text style={cellStyle}></Text>
              <Text style={cellStyle}></Text>
            </View>
          </View>


          <View style={{ marginTop: 20, padding: 10, alignItems: 'center' }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: isDarkMode ? colors.lightGray : 'black',
              }}
            >
              {t('Match Kundli.resultText1')} {calculateTotalPoints()}{' '}
              {t('Match Kundli.resultText2')}
            </Text>
          </View>
          {/* <View style={{ marginTop: 20 }}>
            <Text style={{ fontWeight: 'bold' }}>
              {astakootgunas.bot_response}
            </Text>
          </View> */}
        </>
      )}

      <View
        style={{
          padding: 20,
          marginVertical: 10,
          alignItems: 'center',
          backgroundColor: isDarkMode ? colors.darkSurface : '#f0f0f0',
          borderRadius: 8,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: '500',
            color: isDarkMode ? colors.darkTextSecondary : 'black',
            textAlign: 'center',
          }}
        >
          {t('Match Kundli.consult')}
        </Text>
        <TouchableOpacity
          style={{
            marginTop: 15,
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderColor: isDarkMode ? colors.white: '#501873',
            borderWidth: 1,
            borderRadius: 5,
          }}
          onPress={() =>
            navigation.navigate('Footer', { screen: 'Astrologers' })
          }
        >
          <Text
            style={{ color: isDarkMode ? colors.darkTextPrimary: colors.black,fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}
          >
            {t('Match Kundli.consultBtn')}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default WithSafeArea(KundliMatchingDetails);
