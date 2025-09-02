import CheckBox from '@react-native-community/checkbox';
import analytics from '@react-native-firebase/analytics';
import { useNavigation, useRoute } from '@react-navigation/native';
import moment from 'moment';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { colors } from '../assets/constants/colors';
import WithSafeArea from '../components/HOC/SafeAreaView';
import { useChat } from '../context/ChatContext';
import { useTheme } from '../context/ThemeContext';
import { useGetAstroProfileQuery } from '../redux/api/astrologerApi';
import { useLazyGetLocationQuery } from '../redux/api/kundliApi';
import axiosInstance from '../utils/axiosInstance';
import { capitalize } from '../utils/helper';

const problemOptions = [
  { id: '1', name: 'Relationship' },
  { id: '2', name: 'Marriage' },
  { id: '3', name: 'Career' },
  { id: '4', name: 'Education' },
  { id: '5', name: 'Finance' },
  { id: '6', name: 'Health' },
  { id: '7', name: 'Children' },
];

const ChatIntakeForm = () => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const { user } = useSelector((state) => state.user);
  const {
    name,
    gender,
    birthdate,
    birthPlace,
    birthtime,
    setName,
    setGender,
    setBirthPlace,
    setBirthtime,
    setBirthdate,
    setPendingRequests,
    pendingRequests,
    refetch,
    setRefetch,
  } = useChat();

  const [loading, setLoading] = useState(false);

  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const astrologerId = route?.params?.id;
  const action = route?.params?.action;

  const [debounceTimer, setDebounceTimer] = useState(null);
  const [suggestionPlaces, setSuggestionPlaces] = useState([]);
  const [showSuggestionPlaces, setShowSuggestionPlaces] = useState(false);

  const [getLocation] = useLazyGetLocationQuery();
  const { data: astrologer } = useGetAstroProfileQuery(astrologerId);

  const [selectedProblems, setSelectedProblems] = useState([]);
  const [showProblemsDropdown, setShowProblemsDropdown] = useState(false);

  const toggleProblem = (problemName) => {
    setSelectedProblems((prevSelected) =>
      prevSelected.includes(problemName)
        ? prevSelected.filter((name) => name !== problemName)
        : [...prevSelected, problemName],
    );
  };

  const getProblemsDisplayString = () => {
    if (selectedProblems.length === 0) {
      return 'Click to Select';
    }

    return selectedProblems.join(', ');
  };

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

  const handlePlaceClick = (place) => {
    setBirthPlace(place);
    setShowSuggestionPlaces(false);
  };

  const handleStartChat = async () => {
    // ✅ GA4 success event
    await analytics().logEvent('chat_request_click', {
      action,
      astrologerId,
      userId: user?._id,
    });
    if (
      action === 'chat' &&
      (!name ||
        !gender ||
        !birthdate ||
        !birthPlace ||
        !birthtime ||
        birthtime === 'Invalid date' ||
        birthdate === 'Invalid date')
    ) {
      ToastAndroid.show(
        'Please fill all fields to start chat',
        ToastAndroid.SHORT,
      );

      // Log event in GA4 for validation failure
      await analytics().logEvent('chat_request_failed', {
        reason: 'missing_fields',
        action,
        astrologerId,
        userId: user?._id,
      });

      return;
    }

    setLoading(true);
    try {
      const payload = {
        action,
        astrologerId,
        name,
        gender,
        problems: selectedProblems,
        dob: moment(birthdate).format('YYYY-MM-DD'),
        tob: moment(birthtime).format('HH:mm'),
        pob: birthPlace,
      };

      const { data } = await axiosInstance.post('/chat-request/new', payload);

      if (data?.success) {
        ToastAndroid.show(
          `${capitalize(action)} requested`,
          ToastAndroid.SHORT,
        );
        setPendingRequests([data?.chatRequest, ...pendingRequests]);
        navigation.navigate('Footer', { screen: 'Astrologers' });
      } else {
        ToastAndroid.show(`Failed to start ${action}`, ToastAndroid.SHORT);

        // ❌ GA4 failed event
        await analytics().logEvent('chat_request_failed', {
          action,
          astrologerId,
          userId: user?._id,
          reason: 'backend_failure',
        });
      }
    } catch (error) {
      console.log('❌ CHAT ERROR:', error.response?.data);

      ToastAndroid.show(
        error?.response?.data?.message || `Failed to start ${action}`,
        ToastAndroid.SHORT,
      );

      // ❌ GA4 error event
      await analytics().logEvent('chat_request_failed', {
        action,
        astrologerId,
        userId: user?._id,
        reason: error?.response?.data?.message || 'exception',
      });
    } finally {
      setLoading(false);
    }
  };

  const isEligibleToStartChat = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get(
        `/chat-request/check-eligibility/${astrologer?._id}`,
      );

      if (data?.success) {
        if (data.isFreeAvailable && data.freeChatLimitPerDay <= 0) {
          ToastAndroid.show(
            'Astrologer is not available for free! Please recharge to continue',
            ToastAndroid.SHORT,
          );
          return navigation.navigate('Recharge');
        }
        if (
          data.isFreeAvailable &&
          !data.isAstroAvailableForFree &&
          data.insufficientBalance
        ) {
          ToastAndroid.show(
            'Astrologer is not available for free! Please recharge to continue',
            ToastAndroid.SHORT,
          );
          navigation.navigate('Footer', { screen: 'Astrologers' });
          return;
        }
        if (!data?.isFreeAvailable) {
          if (data?.insufficientBalance) {
            ToastAndroid.show('Insufficient balance', ToastAndroid.SHORT);

            navigation.navigate('Footer', { screen: 'Astrologers' });
            return;
          }
          if (data?.isAlreadyChatRequested) {
            navigation.navigate('Footer', { screen: 'Astrologers' });
            return; // Exit early
          }

          if (data?.isMaxWaitlistCrossed) {
            ToastAndroid.show(
              'You can join the waitlist of a maximum of 10 astrologers',
              ToastAndroid.SHORT,
            );

            navigation.navigate('Footer', { screen: 'Astrologers' });
            return;
          }
        }
      } else {
        ToastAndroid.show('Failed to start chat', ToastAndroid.SHORT);

        navigation.navigate('Footer', { screen: 'Astrologers' });
        return; // Exit early
      }
    } catch (error) {
      console.error('Error while starting chat:', error); // Log error for debugging
      ToastAndroid.show('Failed to start chat', ToastAndroid.SHORT);
      navigation.navigate('Footer', { screen: 'Astrologers' });
    }
  }, [astrologer?._id, navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('astrologerProfile.Screen1.screenHead'),
    });
  });

  useEffect(() => {
    setName(user?.name || '');
    setGender(user?.gender || '');
    setBirthdate(user?.DOB || '');
    setBirthtime(user?.TOB || '');
    setBirthPlace(user?.POB || '');
  }, [
    navigation,
    setBirthPlace,
    setBirthdate,
    setBirthtime,
    setGender,
    setName,
    user,
  ]);

  useEffect(() => {
    if (user && astrologer) {
      isEligibleToStartChat();
      setRefetch(!refetch);
    }
  }, [user, astrologer]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 20}
      style={{
        flex: 1,
        backgroundColor: isDarkMode ? colors.darkBackground : colors.white,
        alignItems: 'center',
      }}
    >
      <View style={{ alignItems: 'center' }}>
        <ScrollView
          contentContainerStyle={{
            paddingVertical: 20,
            paddingHorizontal: 8,
            gap: 20,
          }}
        >
          <View
            style={[
              styles.card,
              {
                borderColor: isDarkMode ? colors.dark : colors.lightGray,
                backgroundColor: isDarkMode ? colors.darkSurface : 'white',
              },
            ]}
          >
            <Text
              style={[
                styles.cardLabel,
                isDarkMode && { color: colors.darkTextPrimary },
              ]}
            >
              {t('astrologerProfile.Screen1.name')}
            </Text>
            <TextInput
              style={{
                width: '100%',
                borderColor: 'gray',
                borderBottomWidth: 2,
                paddingHorizontal: 8,
                color: isDarkMode ? '#fff' : '#000',
                fontSize: 16,
              }}
              onChangeText={(text) => setName(text)}
              value={name}
              placeholder={t('astrologerProfile.Screen1.placeHolders.name')}
              placeholderTextColor={isDarkMode ? '#999' : '#666'}
            />
          </View>
          <View
            style={[
              {
                gap: 24,
                flexDirection: 'row',
                borderColor: isDarkMode ? colors.dark : colors.lightGray,
                backgroundColor: isDarkMode ? colors.darkSurface : 'white',
              },
              styles.card,
            ]}
          >
            <Text style={[styles.cardLabel, isDarkMode && { color: 'white' }]}>
              {t('astrologerProfile.Screen1.gender')}
            </Text>
            <View style={{ flexDirection: 'row', gap: 18 }}>
              <TouchableOpacity
                onPress={() => setGender('male')}
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
                        gender === 'male'
                          ? isDarkMode
                            ? colors.lightGray
                            : colors.gray
                          : 'transparent',
                    }}
                  />
                </View>
                <Text
                  style={{
                    color: isDarkMode ? colors.lightGray : colors.gray,
                    fontSize: 16,
                  }}
                >
                  {t('astrologerProfile.Screen1.genderType.Male')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setGender('female')}
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
                        gender === 'female'
                          ? isDarkMode
                            ? colors.lightGray
                            : colors.gray
                          : 'transparent',
                    }}
                  />
                </View>
                <Text
                  style={{
                    color: isDarkMode ? colors.lightGray : colors.gray,
                    fontSize: 16,
                  }}
                >
                  {t('astrologerProfile.Screen1.genderType.Female')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View
            style={[
              styles.card,
              {
                borderColor: isDarkMode ? colors.dark : colors.lightGray,
                backgroundColor: isDarkMode ? colors.darkSurface : 'white',
              },
            ]}
          >
            <Text style={[styles.cardLabel, isDarkMode && { color: 'white' }]}>
              {t('astrologerProfile.Screen1.DOB')}
            </Text>

            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center' }}
              onPress={() => setIsDatePickerVisible(!isDatePickerVisible)}
            >
              <FontAwesome
                name="calendar"
                size={20}
                color={isDarkMode ? '#999' : colors.gray}
              />
              <TextInput
                style={{
                  borderColor: 'gray',
                  borderBottomWidth: 2,
                  paddingVertical: 4,
                  color: isDarkMode ? '#fff' : '#000',
                  fontSize: 16,
                  paddingLeft: 20,
                  width: '90%',
                  textAlign: 'left',
                }}
                placeholder={t('astrologerProfile.Screen1.placeHolders.DOB')}
                placeholderTextColor={isDarkMode ? '#999' : colors.gray}
                value={
                  birthdate
                    ? moment(new Date(birthdate)).format('DD MMM, YYYY')
                    : ''
                }
                editable={false}
              />
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={(val) => {
                setBirthdate(val);
                setIsDatePickerVisible(false);
              }}
              onCancel={() => setIsDatePickerVisible(false)}
            />
          </View>
          <View
            style={[
              styles.card,
              {
                borderColor: isDarkMode ? colors.dark : colors.lightGray,
                backgroundColor: isDarkMode ? colors.darkSurface : 'white',
              },
            ]}
          >
            <Text style={[styles.cardLabel, isDarkMode && { color: 'white' }]}>
              {t('astrologerProfile.Screen1.TOB')} :
            </Text>

            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center' }}
              onPress={() => setIsTimePickerVisible(!isTimePickerVisible)}
            >
              <FontAwesome
                name="clock-o"
                size={20}
                color={isDarkMode ? '#999' : colors.gray}
              />
              <TextInput
                style={{
                  borderColor: 'gray',
                  borderBottomWidth: 2,
                  paddingVertical: 4,
                  color: isDarkMode ? '#fff' : '#000',
                  fontSize: 16,
                  paddingLeft: 20,
                  width: '90%',
                  textAlign: 'left',
                }}
                placeholder={t('astrologerProfile.Screen1.placeHolders.TOB')}
                placeholderTextColor={isDarkMode ? '#999' : colors.gray}
                value={birthtime ? moment(birthtime).format('hh:mm A') : ''}
                editable={false}
              />
            </TouchableOpacity>

            <DateTimePickerModal
              isVisible={isTimePickerVisible}
              mode="time"
              onConfirm={(val) => {
                setBirthtime(val);
                setIsTimePickerVisible(false);
              }}
              onCancel={() => setIsTimePickerVisible(false)}
            />
          </View>
          <View
            style={[
              styles.card,
              {
                borderColor: isDarkMode ? colors.dark : colors.lightGray,
                backgroundColor: isDarkMode ? colors.darkSurface : 'white',
              },
            ]}
          >
            <Text style={[styles.cardLabel, isDarkMode && { color: 'white' }]}>
              {t('astrologerProfile.Screen1.POB')} :
            </Text>

            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <Ionicons
                name="location"
                size={20}
                color={isDarkMode ? '#999' : colors.gray}
              />
              <TextInput
                style={{
                  borderColor: 'gray',
                  borderBottomWidth: 2,
                  paddingVertical: 4,
                  color: isDarkMode ? '#fff' : '#000',
                  fontSize: 16,
                  paddingLeft: 20,
                  width: '90%',
                  textAlign: 'left',
                }}
                placeholder={t('astrologerProfile.Screen1.placeHolders.POB')}
                placeholderTextColor={isDarkMode ? '#999' : colors.gray}
                value={birthPlace}
                onChangeText={(value) => debounceCitySearch(value)}
              />
            </TouchableOpacity>

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
                      color: isDarkMode ? colors.gray : colors.lightGray,
                    }}
                    key={index}
                    onPress={() => handlePlaceClick(place)}
                    style={{
                      borderBottomWidth:
                        index + 1 === suggestionPlaces?.length ? 0 : 1,
                      borderColor: 'gray',
                      padding: 10,
                      color: isDarkMode ? 'white' : 'black',
                      backgroundColor: isDarkMode ? colors.darkGray : 'white',
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
          <View
            style={[
              styles.card,
              {
                borderColor: isDarkMode ? colors.dark : colors.lightGray,
                backgroundColor: isDarkMode ? colors.darkSurface : 'white',
              },
            ]}
          >
            <Text style={[styles.cardLabel, isDarkMode && { color: 'white' }]}>
              {t('astrologerProfile.Screen1.problems')} :
            </Text>

            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center' }}
              onPress={() => setShowProblemsDropdown(true)}
            >
              <Entypo
                name="select-arrows"
                size={20}
                color={isDarkMode ? '#999' : colors.gray}
              />
              <Text
                style={{
                  borderColor: 'gray',
                  borderBottomWidth: 2,
                  paddingVertical: 4,
                  color: isDarkMode ? '#fff' : '#000',
                  fontSize: 16,
                  paddingLeft: 20,
                  width: '90%',
                  textAlign: 'left',
                }}
              >
                {getProblemsDisplayString()}
              </Text>
            </TouchableOpacity>

            <Modal
              visible={showProblemsDropdown}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowProblemsDropdown(false)}
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}
              >
                <View
                  style={{
                    backgroundColor: isDarkMode ? colors.darkSurface : '#fff',
                    borderRadius: 10,
                    padding: 20,
                    width: '80%',
                    maxHeight: '60%',
                    elevation: 5, // Android shadow
                    shadowColor: '#000', // iOS shadow
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: 'bold',
                      marginBottom: 15,
                      textAlign: 'center',
                      color: isDarkMode ? colors.darkTextPrimary : colors.black,
                    }}
                  >
                    Select Problems
                  </Text>

                  {problemOptions.map((item) => (
                    <View
                      key={item.id}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 10,
                      }}
                    >
                      <CheckBox
                        value={selectedProblems.includes(item.name)}
                        onValueChange={() => toggleProblem(item.name)}
                        tintColors={{
                          true: isDarkMode ? colors.darkAccent : colors.purple,
                          false: isDarkMode ? colors.darkAccent : colors.purple,
                        }}
                      />
                      <Text
                        style={{
                          marginLeft: 8,
                          fontSize: 16,
                          color: isDarkMode
                            ? colors.darkTextPrimary
                            : colors.black,
                        }}
                      >
                        {item.name}
                      </Text>
                    </View>
                  ))}

                  <View style={{ alignItems: 'flex-end' }}>
                    <TouchableOpacity
                      style={{
                        color: 'white',
                        backgroundColor: colors.purple,
                        paddingHorizontal: 5,
                        paddingVertical: 5,
                        width: 60,
                        borderRadius: 12,
                      }}
                      onPress={() => setShowProblemsDropdown(false)}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          color: 'white',
                          textAlign: 'center',
                        }}
                      >
                        Done
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </View>
        </ScrollView>

        <TouchableOpacity
          onPress={handleStartChat}
          style={{ width: '70%', marginBottom: 20 }}
          disabled={loading}
        >
          <View
            style={{
              backgroundColor: colors.purple,
              padding: 14,
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 12,
              borderRadius: 50,
            }}
          >
            <Text
              style={{
                color: '#fff',
                textAlign: 'center',
                fontSize: 16,
                flexGrow: 1,
                flexShrink: 1,
              }}
            >
              {t('astrologerProfile.Screen1.btnStart')} {t(`extras.${action}`)}{' '}
              {t('astrologerProfile.Screen1.btnWith')} {astrologer?.name}
            </Text>

            {loading && <ActivityIndicator size={'small'} color={'white'} />}
          </View>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 12,
  },
  cardLabel: {
    color: colors.purple,
    fontSize: 18,
    fontWeight: 500,
    marginBottom: 8,
  },
});

export default WithSafeArea(ChatIntakeForm);
