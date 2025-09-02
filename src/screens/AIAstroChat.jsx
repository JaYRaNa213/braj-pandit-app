/* eslint-disable react/no-unstable-nested-components */
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { colors } from '../assets/constants/colors';
import GenderPickerModal from '../components/aiAstro/GenderPickerModal';
import NoAccessModal from '../components/aiAstro/NoAccessModal';
import WithSafeArea from '../components/HOC/SafeAreaView';
import { useChat } from '../context/ChatContext';
import { useTheme } from '../context/ThemeContext';
import { useLazyGetLocationQuery } from '../redux/api/kundliApi';
import axiosInstance from '../utils/axiosInstance';

const AIAstroChat = ({ route }) => {
  let { persona, sessionId } = route?.params;

  const {
    name,
    gender,
    birthdate,
    birthPlace,
    birthtime,
    newAiMessage,
    setNewAiMessage,
    aiChatSessionId,
    setAiChatSessionId,
    aiMessages,
    setAiMessages,
    isLoadingAiMessage,
    setIsLoadingAiMessage,
    selectedAiAstro,
    refetch,
    setRefetch,
  } = useChat();

  if (selectedAiAstro) {
    persona = selectedAiAstro?.persona;
  }
  const personaId = selectedAiAstro._id;

  const [inputText, setInputText] = useState('');
  const [prompt, setPrompt] = useState(null);
  const [isChatInitiated, setIsChatInitiated] = useState(false);
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.user);

  const userId = user?._id;

  const [personName, setPersonName] = useState(name || '');
  const [personGender, setPersonGender] = useState(gender || '');
  const [DOB, setDOB] = useState(birthdate || null);
  const [POB, setPOB] = useState(birthPlace || '');
  const [TOB, setTOB] = useState(birthtime || null);

  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
  const [isGenderPickerVisible, setIsGenderPickerVisible] = useState(false);
  const [isCityPickerVisible, setIsCityPickerVisible] = useState(false);

  const [isCheckingAccess, setIsCheckingAccess] = useState(false);
  const [isBuyingAccess, setIsBuyingAccess] = useState(false);

  const [showNoAccessModal, setShowNoAccessModal] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  const [debounceTimer, setDebounceTimer] = useState(null);
  const [suggestionPlaces, setSuggestionPlaces] = useState([]);
  const [showSuggestionPlaces, setShowSuggestionPlaces] = useState(false);
  const [getLocation] = useLazyGetLocationQuery();
  const [isLoading, setIsLoading] = useState(false);
  const [displayText, setDisplayText] = useState('...');

  useEffect(() => {
    // fade in bubble
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // dot sequence
    const sequence = ['...', '..', '.', '..'];
    let i = 0;

    const interval = setInterval(() => {
      setDisplayText(sequence[i]);
      i = (i + 1) % sequence.length; // loop
    }, 100); // change every 0.5s

    return () => clearInterval(interval);
  }, []);

  const fadeAnim = useState(new Animated.Value(0))[0];
  const spinAnim = useState(new Animated.Value(0))[0];
  const scrollViewRef = useRef(null);
  const naviation = useNavigation();

  // Fade-in animation for messages
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [aiMessages, isLoadingAiMessage]);

  // Spinner animation for ActivityIndicator
  useEffect(() => {
    if (isLoadingAiMessage) {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ).start();
    } else {
      spinAnim.setValue(0);
    }
  }, [isLoadingAiMessage]);

  useEffect(() => {
    // Auto-scroll to the bottom when messages or loading state change
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [aiMessages, isLoadingAiMessage]);

  useEffect(() => {
    setPersonName(name || '');
    setPersonGender(gender || '');
    setDOB(birthdate || null);
    setPOB(birthPlace || '');
    setTOB(birthtime || null);
    setNewAiMessage('');
    setAiChatSessionId(null);
    setAiMessages([]);

    checkAccess();

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, []);

  const debounceCitySearch = (value) => {
    console.log('value', value, value.length);

    if (value.length < 3) {
      setSuggestionPlaces([]);
      setIsCityPickerVisible(false);
    }

    setPOB(value);

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const newDebounceTimer = setTimeout(() => {
      if (value.length > 2) {
        performCitySearch(value);
      } else {
        // extra safeguard: clear suggestions when input cleared
        setSuggestionPlaces([]);
        setIsCityPickerVisible(false);
      }
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

  const checkAccess = async () => {
    setIsCheckingAccess(true);
    try {
      const { data } = await axiosInstance.get(
        `/ai-astro-access/check-access/${personaId}`,
      );
      setHasAccess(data?.hasAccess);
    } catch (error) {
      ToastAndroid.show('Something went wrong');
      console.log(error);
    } finally {
      setIsCheckingAccess(false);
    }
  };

  const handleConfirmAndSend = async () => {
    if (!hasAccess) {
      return setShowNoAccessModal(true);
    }
    if (!DOB || !TOB || !POB || !personName) {
      ToastAndroid.show('Please fill all the fields');
      return;
    }

    const formattedDate = moment(DOB).format('DD/MM/YYYY');
    const formattedTime = moment(TOB).format('HH:mm');

    setDOB(formattedDate);
    setTOB(formattedTime);
    setIsChatInitiated(true);

    // Create the initial prompt with all details
    const initialPrompt = `Hello! I am ${personName}, my gender is ${personGender}, born on ${formattedDate} at ${formattedTime} in ${POB}.`;
    setPrompt(initialPrompt);
  };

  const buyAccess = async () => {
    setIsBuyingAccess(true);
    try {
      const { data } = await axiosInstance.post(
        `/ai-astro-access/buy/${personaId}`,
      );

      if (data?.success) {
        ToastAndroid.show(
          '🎉 Access purchased successfully!',
          ToastAndroid.LONG,
        );
        setShowNoAccessModal(false);
        checkAccess();
        setRefetch(!refetch);
      } else {
        ToastAndroid.show(
          'Something went wrong. Please try again.',
          ToastAndroid.LONG,
        );
      }
    } catch (error) {
      console.error(
        'Buy Access Error:',
        error?.response?.data || error.message,
      );

      ToastAndroid.show('Failed to purchase access.', ToastAndroid.LONG);
    } finally {
      setIsBuyingAccess(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoadingAiMessage) {
      return;
    }
    setPrompt(inputText);
    setInputText('');
  };

  const createUserMessage = () => {
    if (!prompt) {
      return;
    }
    const userMessage = {
      role: 'user',
      content: prompt,
    };
    setAiMessages((prev) => [...prev, userMessage]);
  };

  const handleAskRequest = async (promptToSend) => {
    if (!promptToSend) {
      return;
    }

    const payload = {
      persona,
      prompt: promptToSend,
      userId,
      sessionId: aiChatSessionId,
      aiAstroId: personaId,
      name: selectedAiAstro.name,
      dob: null,
      tob: null,
      pob: null,
    };

    if (!aiChatSessionId) {
      payload.dob = DOB;
      payload.tob = TOB;
      payload.pob = POB;
    }

    createUserMessage();
    setIsLoadingAiMessage(true);
    try {
      await axiosInstance.post('/ai-chat/ask', payload);
    } catch (error) {
      console.error('Error making chat request:', error);
    }
  };

  const handleStopRequest = async () => {
    console.log('Stopping request for session:', aiChatSessionId);

    try {
      const { data } = await axiosInstance.post('/ai-chat/stop', {
        sessionId: aiChatSessionId,
      });
      console.log('Stop response:', data);

      if (data.success) {
        setIsLoadingAiMessage(false);
      }
    } catch (error) {
      ToastAndroid.show('Failed to stop');
      console.log('Error in stopping request', error);
    }
  };

  useEffect(() => {
    if (prompt) {
      handleAskRequest(prompt);
    }
  }, [prompt]);

  const getMessages = async () => {
    setIsLoading(true);
    try {
      const { data } = await axiosInstance.get(
        `/ai-chat/messages/${aiChatSessionId}`,
      );
      setAiMessages(data?.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (aiChatSessionId) {
      setIsChatInitiated(true);
      getMessages();
    } else {
      setIsChatInitiated(false);
      setAiMessages([]);
      setPrompt(null);
      setNewAiMessage('');
      setAiChatSessionId(null);
      setIsLoadingAiMessage(false);
      setInputText('');
    }
  }, [aiChatSessionId]);

  //set aichat sessionId
  useEffect(() => {
    if (sessionId) {
      setAiChatSessionId(sessionId);
    }
  }, [sessionId]);

  useLayoutEffect(() => {
    //set title to persona
    naviation.setOptions({
      title: (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',

            gap: 12,
          }}
        >
          <Image
            source={{ uri: selectedAiAstro.imageUrl }}
            style={{
              width: 34,
              height: 34,
              borderRadius: 1000,
            }}
          />
          <Text
            style={{
              fontSize: 20,
              fontWeight: '400',
              textTransform: 'capitalize',
              color: 'white',
            }}
          >
            {selectedAiAstro?.name}
          </Text>
        </View>
      ),

      //go to history page icon
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 12,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              width: 36,
              height: 36,
              justifyContent: 'center',
              borderRadius: 72,
            }}
            onPress={() =>
              naviation.navigate('AIAstroImages', {
                aiAstroId: personaId,
              })
            }
          >
            {/* show history icon */}
            <Ionicons
              name="image"
              size={20}
              color="white"
              style={{ marginTop: 2 }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 12,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              width: 36,
              height: 36,
              justifyContent: 'center',
              borderRadius: 72,
            }}
            onPress={() => naviation.navigate('AIAstroSessionsHistory')}
          >
            {/* show history icon */}
            <Ionicons
              name="list"
              size={20}
              color="white"
              style={{ marginTop: 2 }}
            />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [naviation]);

  useEffect(() => {
    setAiMessages([]);
  }, [persona]);

  const renderFormattedText = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g); // Split by **bold**
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <Text key={index} style={{ fontWeight: 'bold' }}>
            {part.slice(2, -2)}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 100}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollView,
            isDarkMode && { backgroundColor: colors.darkBackground },
          ]}
          ref={scrollViewRef}
        >
          {!isChatInitiated ? (
            <View style={styles.promptContainer}>
              <Animated.View
                style={[
                  styles.messageBubble,
                  styles.userMessagePending,
                  { opacity: fadeAnim },
                  isDarkMode && { backgroundColor: colors.darkBackground },
                ]}
              >
                <View style={styles.sentenceWrapper}>
                  <Text
                    style={[styles.sentenceText, isDarkMode && styles.textDark]}
                  >
                    {t('helloIAm')}{' '}
                  </Text>

                  {/* Name Input */}
                  <TextInput
                    style={[styles.inlineInput, isDarkMode && styles.inputDark]}
                    placeholder={t('enterName')}
                    placeholderTextColor={
                      isDarkMode ? colors.lightGray : colors.gray
                    }
                    onChangeText={setPersonName}
                    value={personName}
                  />

                  <Text
                    style={[styles.sentenceText, isDarkMode && styles.textDark]}
                  >
                    {' '}
                    {t('myGenderIs')}{' '}
                  </Text>

                  {/* Gender Picker */}
                  <TouchableOpacity
                    style={[styles.inlineInput, styles.pickerBox]}
                    onPress={() => setIsGenderPickerVisible(true)}
                  >
                    <Text
                      style={[
                        styles.pickerText,
                        !personGender && styles.placeholderText,
                        isDarkMode && styles.textDark,
                      ]}
                    >
                      {personGender || t('selectGender')}
                    </Text>
                  </TouchableOpacity>

                  <Text
                    style={[styles.sentenceText, isDarkMode && styles.textDark]}
                  >
                    {' '}
                    {t('bornOn')}{' '}
                  </Text>

                  {/* Date Picker */}
                  <TouchableOpacity
                    style={[styles.inlineInput, styles.pickerBox]}
                    onPress={() => setIsDatePickerVisible(true)}
                  >
                    <Text
                      style={[styles.pickerText, isDarkMode && styles.textDark]}
                    >
                      {DOB
                        ? moment(DOB).format('DD MMM, YYYY')
                        : t('selectDate')}
                    </Text>
                  </TouchableOpacity>

                  <Text
                    style={[styles.sentenceText, isDarkMode && styles.textDark]}
                  >
                    {' '}
                    {t('at')}{' '}
                  </Text>

                  {/* Time Picker */}
                  <TouchableOpacity
                    style={[styles.inlineInput, styles.pickerBox]}
                    onPress={() => setIsTimePickerVisible(true)}
                  >
                    <Text
                      style={[styles.pickerText, isDarkMode && styles.textDark]}
                    >
                      {TOB ? moment(TOB).format('hh:mm A') : t('selectTime')}
                    </Text>
                  </TouchableOpacity>

                  <Text
                    style={[styles.sentenceText, isDarkMode && styles.textDark]}
                  >
                    {' '}
                    {t('inCity')}{' '}
                  </Text>

                  <View>
                    {/* City Input */}
                    <TextInput
                      style={[
                        styles.inlineInput,
                        isDarkMode && styles.inputDark,
                      ]}
                      placeholder={t('enterCity')}
                      placeholderTextColor={
                        isDarkMode ? colors.lightGray : colors.gray
                      }
                      onChangeText={debounceCitySearch}
                      value={POB}
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
                              color: isDarkMode
                                ? colors.darkSurface
                                : colors.lightGray,
                            }}
                            key={index}
                            onPress={() => {
                              setPOB(place);
                              setSuggestionPlaces([]);
                              setIsCityPickerVisible(false);
                            }}
                            style={{
                              borderBottomWidth:
                                index + 1 === suggestionPlaces?.length ? 0 : 1,
                              borderColor: 'gray',
                              padding: 10,
                              borderRadius: 12,
                              color: isDarkMode ? 'white' : 'black',
                              backgroundColor: isDarkMode
                                ? colors.darkSurface
                                : 'white',
                            }}
                          >
                            <Text
                              style={{ color: isDarkMode ? 'white' : 'black' }}
                            >
                              {place}
                            </Text>
                          </Pressable>
                        ))}
                      </ScrollView>
                    )}
                  </View>
                </View>

                <View style={styles.confirmActions}>
                  <Text
                    style={[styles.confirmText, isDarkMode && styles.textDark]}
                  >
                    {t('confirmAndSend')}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.sendButton,
                      isCheckingAccess && { backgroundColor: '#888' },
                    ]}
                    onPress={handleConfirmAndSend}
                    disabled={isCheckingAccess}
                  >
                    <Text style={styles.sendButtonText}>
                      {hasAccess || isCheckingAccess ? 'Send' : 'Buy Now'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
              <View
                style={[
                  styles.infoBox,
                  isDarkMode && { backgroundColor: '#333' },
                ]}
              >
                <Text style={[styles.infoText, isDarkMode && styles.textDark]}>
                  {t('confirmBirthDetails')}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.chatContainer}>
              {aiMessages?.map((message, index) => (
                <View
                  key={index}
                  style={[
                    styles.messageBubble,
                    message.role === 'user'
                      ? [
                          styles.userMessageSent,
                          isDarkMode && {
                            backgroundColor: '#333',
                          },
                        ]
                      : styles.botMessage,
                  ]}
                >
                  <Text
                    style={[styles.botMessage, isDarkMode && styles.textDark]}
                  >
                    {renderFormattedText(message.content)}
                  </Text>
                </View>
              ))}
              {isLoadingAiMessage && (
                <Animated.View
                  style={[
                    styles.messageBubble,
                    styles.botMessage,
                    { opacity: fadeAnim },
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      styles.loadingText,
                      isDarkMode && styles.textDark,
                      !newAiMessage && { fontSize: 24 },
                    ]}
                  >
                    {newAiMessage
                      ? renderFormattedText(newAiMessage)
                      : displayText}
                  </Text>
                </Animated.View>
              )}
              {isLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator
                    size="large"
                    color={colors.black}
                    style={styles.loadingIndicator}
                  />
                </View>
              )}
            </View>
          )}
        </ScrollView>
        {isChatInitiated && (
          <View
            style={[
              styles.inputContainer,
              isDarkMode && styles.inputContainerDark,
            ]}
          >
            <TextInput
              style={[styles.input, isDarkMode && styles.inputDark]}
              value={inputText}
              editable={isChatInitiated}
              onChangeText={setInputText}
              placeholder={t('typeMessage')}
              placeholderTextColor={isDarkMode ? colors.lightGray : colors.gray}
            />
            {isLoadingAiMessage ? (
              <TouchableOpacity
                style={styles.sendIconButton}
                onPress={handleStopRequest}
              >
                <Ionicons name="stop-sharp" size={20} color={colors.white} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.sendIconButton,
                  (!inputText.trim() || isLoadingAiMessage) &&
                    styles.disabledButton,
                ]}
                onPress={handleSend}
                disabled={!inputText.trim()}
              >
                <Ionicons name="send-sharp" size={20} color={colors.white} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Gender Picker Modal */}
      <GenderPickerModal
        isGenderPickerVisible={isGenderPickerVisible}
        setIsGenderPickerVisible={setIsGenderPickerVisible}
        personGender={personGender}
        setPersonGender={setPersonGender}
      />

      {/* City Picker Modal */}
      {/* <CityPickerModal
        setIsCityPickerVisible={setIsCityPickerVisible}
        isCityPickerVisible={isCityPickerVisible}
        setPOB={setPOB}
        suggestionPlaces={suggestionPlaces}
      /> */}

      {/* Date and Time Pickers */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={(val) => {
          setDOB(val);
          setIsDatePickerVisible(false);
        }}
        onCancel={() => setIsDatePickerVisible(false)}
      />
      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={(val) => {
          setTOB(val);
          setIsTimePickerVisible(false);
        }}
        onCancel={() => setIsTimePickerVisible(false)}
      />

      <NoAccessModal
        available_balance={user?.available_balance}
        onBuyAccess={buyAccess}
        onClose={() => setShowNoAccessModal(false)}
        visible={showNoAccessModal}
        astro={selectedAiAstro}
        isLoading={isBuyingAccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    padding: 12,
    flexGrow: 1,
  },
  promptContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  chatContainer: {
    flex: 1,
    paddingBottom: 20,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
    marginVertical: 8,
  },
  userMessagePending: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
    alignSelf: 'flex-end',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userMessageSent: {
    backgroundColor: colors.secondary,
    alignSelf: 'flex-end',
    maxWidth: '80%',
    borderRadius: 12,
  },
  botMessage: {
    fontSize: 17,
    lineHeight: 26,
    color: '#222',
  },
  sentenceWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  sentenceText: {
    fontSize: 17,
    color: colors.black,
    marginRight: 8,
  },
  inlineInput: {
    minWidth: 100,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    paddingVertical: 2,
    paddingHorizontal: 4,
    fontSize: 16,
    color: colors.black,
    marginRight: 6,
    marginBottom: 4,
  },

  pickerBox: {
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    paddingVertical: 4,
  },

  pickerText: {
    fontSize: 16,
    color: colors.black,
  },

  placeholderText: {
    color: colors.gray,
  },

  inputDark: {
    color: colors.white,
    borderBottomColor: colors.lightGray,
    backgroundColor: colors.darkBackground,
  },
  inlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 4,
    paddingVertical: 4,
  },
  inlineButtonText: {
    fontSize: 16,
    color: colors.primary,
    marginLeft: 6,
    minWidth: 80,
  },
  confirmActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingHorizontal: 8,
  },
  confirmText: {
    fontSize: 14,
    color: colors.gray,
    marginRight: 12,
  },
  sendButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
  },
  sendButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  infoBox: {
    backgroundColor: colors.secondaryLight,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  infoText: {
    fontSize: 14,
    color: colors.gray,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  inputContainerDark: {
    backgroundColor: colors.darkBackground,
    borderTopColor: colors.darkGray,
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.lightGray,
    color: colors.black,
    backgroundColor: colors.white,
  },
  sendIconButton: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: 12,
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: colors.gray,
  },
  picker: {
    width: '100%',
    height: 120,
    color: colors.black,
  },
  loadingText: {
    marginBottom: 8,
  },
  loadingIndicator: {
    marginTop: 8,
  },
  messageText: {
    fontSize: 17,
    color: '#222',
    lineHeight: 22,
  },
  textDark: {
    color: colors.white,
  },
});

export default WithSafeArea(AIAstroChat);
