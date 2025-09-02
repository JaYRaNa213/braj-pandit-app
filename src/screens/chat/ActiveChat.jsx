/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unstable-nested-components */
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  NativeModules,
  PermissionsAndroid,
  Platform,
  ScrollView,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import DocumentPicker, { types } from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import ImagePicker from 'react-native-image-crop-picker';
import Sound from 'react-native-sound';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { colors } from '../../assets/constants/colors';
import CountdownTimer from '../../components/CountdownTimer';
import WithSafeArea from '../../components/HOC/SafeAreaView';
import ImageModal from '../../components/ImageModal';
import RechargeMessage from '../../components/RechargeMessage';
import RenderAttachment from '../../components/RenderAttachment';
import { useChat } from '../../context/ChatContext';
import { useSocket } from '../../context/SocketContext';
import { useTheme } from '../../context/ThemeContext';
import { setChatScreenActive } from '../../hooks/Chat';
import axiosInstance from '../../utils/axiosInstance';
import { REACT_APP_BACKEND_URL } from '../../utils/domain';
import { fileFormat, getSeconds } from '../../utils/helper';
import AddPersonDetailsModal from '../../components/AddPersonDetail';
import ProfilesModalSheet from '../../components/ProfilesModalSheet';
import { Menu } from 'react-native-paper';

const audioRecorderPlayer = new AudioRecorderPlayer();
const { ScreenshotPrevention } = NativeModules;

const ActiveChat = () => {
  const route = useRoute();
  const { chatId } = route?.params;

  const { socket } = useSocket();
  const { user } = useSelector((state) => state.user);
  const {
    newMessage: newMsg,
    activeChat,
    isCheckingActiveChat,
    setActiveChat,
  } = useChat();

  const [isPersonModalVisible, setPersonModalVisible] = useState(false);
  const [kundliProfiles, setKundliProfiles] = useState([]);
  const [profileToEdit, setProfileToEdit] = useState(null);
  const [isProfileSheetVisible, setIsProfileSheetVisible] = useState(false);

  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState({
    chat: false,
    messages: false,
    endChat: false,
    isSendingFile: false,
  });
  const [newMessage, setNewMessage] = useState('');

  const [showScrollButton, setShowScrollButton] = useState(true);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceUri, setVoiceUri] = useState('');
  const [showVoicePreview, setShowVoicePreview] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [visible, setVisible] = useState(false);
  const [audioToBeSent, setAudioToBeSent] = useState({});
  const [isRechargePopupVisible, setIsRechargePopupVisible] = useState(false);
  const [showRechargeBtn, setShowRechargeBtn] = useState(false);

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [starCount, setStarCount] = useState(0);
  const [reviewDescription, setReviewDescription] = useState('');
  const [order, setOrder] = useState(null);
  const [astroName, setAstroName] = useState('');
  const [astroImage, setAstroImage] = useState('');

  const navigation = useNavigation();
  const { isDarkMode } = useTheme();

  const scrollViewRef = useRef();

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setStarCount(i)}
          style={{ flexDirection: 'row' }}
        >
          <Ionicons
            name={i <= starCount ? 'star' : 'star-outline'} // 'star' for filled, 'star-o' for outline
            size={30}
            color={i <= starCount ? 'gold' : 'lightgray'}
          />
        </TouchableOpacity>,
      );
    }
    return stars;
  };

  const handleSubmit = async () => {
    if (starCount === 0) {
      ToastAndroid.show(
        'Please provide a rating',
        'Tap on the stars to give a rating.',
        ToastAndroid.SHORT,
      );
      return;
    }
    try {
      const response = await axiosInstance.put('/order/updateReview', {
        orderId: order._id,
        starCount: starCount,
        reviewDescription: reviewDescription,
      });
      if (response?.data.success) {
        ToastAndroid.show(
          'Your review has been submitted.',
          ToastAndroid.SHORT,
        );
      }
    } catch (error) {
      ToastAndroid.show('Unable to update review', ToastAndroid.SHORT);
    } finally {
      setShowRatingModal(false);
      setStarCount(0);
      setReviewDescription('');
      navigation.navigate('Footer', { screen: 'Home' });
    }
  };

  const onClose = () => {
    setShowRatingModal(false);
    setStarCount(0);
    setReviewDescription('');
    navigation.navigate('Footer', { screen: 'Home' });
  };

  const getRatingText = () => {
    switch (starCount) {
      case 1: {
        return 'Not what you expected? Tell us more.';
      }
      case 2: {
        return 'Not what you expected? Tell us more.';
      }
      case 3: {
        return 'Could be better. Help us improve.';
      }
      case 4: {
        return "You loved it! We're thrilled.";
      }
      case 5: {
        return 'Exceptional! Truly blessed by your rating.';
      }
      default: {
        return 'Tap to rate and share your experience.';
      }
    }
  };

  const maskPhoneNumber = (text) => {
    const hasExactly10Digits = (str) => {
      const digits = str.replace(/\D/g, '');
      return (
        digits.length === 10 ||
        digits.length === 11 ||
        digits.length === 12 ||
        digits.length === 13
      );
    };

    const maskNumber = (match) => {
      const digits = match.replace(/\D/g, '');
      if (digits.length < 10) {
        return match;
      } // Not a valid phone number

      let result = '';
      let digitIndex = 0;

      for (let i = 0; i < match.length; i++) {
        if (/\d/.test(match[i])) {
          if (digitIndex >= digits.length - 10) {
            result += '*';
          } else {
            result += match[i];
          }
          digitIndex++;
        } else {
          result += match[i];
        }
      }

      return result;
    };

    // Patterns to match phone numbers with various formats
    const patterns = [
      // Match numbers with spaces, dashes, dots, parentheses, and other symbols
      // eslint-disable-next-line no-useless-escape
      /(?:\+?\d{1,3}[\s\-\.\(\)\/_,%&\$#@!]*)?(?:\d[\s\-\.\(\)\/_,%&\$#@!]*){10,}/g,
      // Match numbers without separators
      /\b(?:\+?\d{1,3})?\d{10}\b/g,
    ];

    let maskedText = text;
    patterns.forEach((pattern) => {
      maskedText = maskedText.replace(pattern, (match) => {
        if (hasExactly10Digits(match)) {
          return maskNumber(match);
        }
        return match;
      });
    });

    return maskedText;
  };

  const handleScroll = (event) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const isAtBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    setShowScrollButton(!isAtBottom); // Show button only if not at bottom
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const maskedMessage = maskPhoneNumber(newMessage);
      setMessages([
        ...messages,
        {
          content: maskedMessage,
          _id: Math.floor(Math.random() * 1000),
          sender: {
            role: user?.role,
          },
          chat: chatId,
          createdAt: new Date().toISOString(),
        },
      ]);

      const newMessageObj = {
        chatId: chatId,
        user: activeChat?.user?._id,
        astrologer: activeChat?.astrologer?._id,
        message: maskedMessage,
        sender: {
          role: user?.role,
          _id: user?._id,
        },
      };

      socket.current.emit('newMessage', newMessageObj);

      setNewMessage('');
    }
  };

  const handleEndChat = async () => {
    setIsLoading({ ...isLoading, endChat: true });

    try {
      const { data } = await axios.get(
        `${REACT_APP_BACKEND_URL}/chat-request/end/${activeChat?.chatRequestId}/${activeChat?._id}`,
        { withCredentials: true },
      );
      if (data?.success) {
        ToastAndroid.show('Chat ended successfully', ToastAndroid.SHORT);
        setOrder(data?.data);
        setShowRatingModal(true);
        setActiveChat(null);
      } else {
        ToastAndroid.show('Failed to end chat', ToastAndroid.SHORT);
      }
    } catch (error) {
      ToastAndroid.show('Failed to end chat', ToastAndroid.SHORT);
    } finally {
      setIsLoading({ ...isLoading, endChat: false });
    }
  };

  const onFinish = () => {
    ToastAndroid.show(
      'Chat ended due to insufficient balance',
      ToastAndroid.SHORT,
    );
    setIsRechargePopupVisible(false);
    setActiveChat(null);
    navigation.navigate('Footer', { screen: 'Home' });
  };
  const fetchMessages = async () => {
    setIsLoading({ ...isLoading, messages: true });

    try {
      const { data } = await axiosInstance.get(
        `/message/all/${chatId}?acceptedAt=${activeChat?.acceptedAt}`,
      );
      if (data?.success) {
        setMessages(data.messages?.reverse());
      } else {
        ToastAndroid.show('Failed to get messages', ToastAndroid.SHORT);
      }
    } catch (error) {
      ToastAndroid.show('Failed to get messages', ToastAndroid.SHORT);
    } finally {
      setIsLoading({ ...isLoading, messages: false });
    }
  };

  const openMenu = () => {
    setVisible(true);
  };

  const closeMenu = () => {
    setVisible(false);
  };

  const handleOpenProfiles = () => {
    setIsProfileSheetVisible(true);
  };

  const handleAddProfile = () => {
    setProfileToEdit(null);
    setIsProfileSheetVisible(false);
    setPersonModalVisible(true);
  };

  const handleEditProfile = (profile) => {
    setProfileToEdit(profile);
    setIsProfileSheetVisible(false);
    setPersonModalVisible(true);
  };

  const handleDetailsSubmit = async (details, profileId) => {
    console.log({ details, profileId });

    const chatRequestId = activeChat?.chatRequestId;
    if (!chatRequestId) {
      ToastAndroid.show(
        'Error: Active chat session not found.',
        ToastAndroid.SHORT,
      );
      return;
    }

    try {
      let response;
      if (profileId) {
        response = await axiosInstance.put(
          `/chat-request/${chatRequestId}/kundli/${profileId}`,
          details,
        );
      } else {
        response = await axiosInstance.post(
          `/chat-request/${chatRequestId}/add-kundli`,
          details,
        );
      }

      const { data } = response;
      if (data.success) {
        const successMsg = profileId
          ? 'Profile updated successfully!'
          : 'Details submitted successfully!';
        ToastAndroid.show(successMsg, ToastAndroid.SHORT);
        console.log({ data });

        setMessages((prevMessages) => [...prevMessages, data.newMessage]);
        if (profileId) {
          setActiveChat({
            ...activeChat,
            kundliProfiles: activeChat?.kundliProfiles?.map((profile) => {
              if (profile._id === data?.newProfile?._id) {
                return data?.newProfile;
              }
              return profile;
            }),
          });
        } else {
          setActiveChat({
            ...activeChat,
            kundliProfiles: [
              ...(activeChat?.kundliProfiles ?? []),
              data?.newProfile,
            ],
          });
        }
      } else {
        ToastAndroid.show(
          data.message || 'Failed to submit details.',
          ToastAndroid.SHORT,
        );
      }
    } catch (error) {
      console.error('Error submitting Kundli details:', error);
      ToastAndroid.show(
        'An error occurred. Please try again.',
        ToastAndroid.SHORT,
      );
    } finally {
      setPersonModalVisible(false);
      setProfileToEdit(null);
    }
  };

  useEffect(() => {
    if (activeChat?.kundliProfiles) {
      setKundliProfiles(activeChat.kundliProfiles);
    }
  }, [activeChat]);

  const pickDocument = async () => {
    try {
      // Open the document picker
      const result = await DocumentPicker.pick({
        type: [types.allFiles], // You can specify specific types like types.pdf or types.images
      });

      if (result && result.length > 0) {
        await sendAttachment({
          files: [
            {
              filename: result[0].name,
              mime: result[0].type,
              path: result[0].uri,
            },
          ],
          type: 'document',
        });
      }
    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
      } else {
        console.error('Error picking document:', error);
      }
    }
  };

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.openPicker({
      mediaTypes: 'photo',
    });

    await fileChangeHandler(result, 'Images');
  };

  const sendAttachment = async ({ files, type }) => {
    if (!files || files.length === 0) {
      return;
    }

    setIsLoading({ ...isLoading, isSendingFile: true });

    try {
      const myForm = new FormData();
      myForm.append('chatId', chatId);

      files.forEach((file) => {
        myForm.append('files', {
          uri: file.path,
          name: file.filename,
          type: file.mime,
        });
      });

      const { data } = await axios.post(
        `${REACT_APP_BACKEND_URL}/message/send-attachment`,
        myForm,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (data.success) {
        const message = data?.message;
        setMessages([...messages, message]);

        // Reset the specific file type state if needed
        if (type === 'audio') {
          setVoiceUri(null);
        }
      } else {
        ToastAndroid.show(`Failed to send ${type}`, ToastAndroid.SHORT);
      }
    } catch (error) {
      console.log('Error sending attachment:', error);

      ToastAndroid.show(`Failed to send ${type}`, ToastAndroid.SHORT);
    } finally {
      setIsLoading({ ...isLoading, isSendingFile: false });
    }
  };

  const fileChangeHandler = (file, key) => {
    const files = [file];
    sendAttachment({ files, type: key });
  };

  const handleImageClick = (url) => {
    setIsImageModalVisible(true);
    setImageUrl(url);
  };

  const startRecording = async () => {
    try {
      if (Platform.OS === 'android') {
        const permissions = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        );
        if (!(permissions === PermissionsAndroid.RESULTS.GRANTED)) {
          ToastAndroid.show(
            'Permission to access microphone was denied',
            ToastAndroid.SHORT,
          );
          return;
        }
      }

      setIsRecording(true);

      const fileName = `${Date.now()}.mp3`;
      const path = Platform.select({
        ios: `${RNFS.DocumentDirectoryPath}/${fileName}`, // Save in Document directory
        android: `${RNFS.DocumentDirectoryPath}/${fileName}`, // Save in Document directory
      });

      const result = await audioRecorderPlayer.startRecorder(path);
      setVoiceUri(`${RNFS.DocumentDirectoryPath}/${fileName}`);
      setRecording(result);
    } catch (error) {
      console.error('Failed to start recording:', error);
      ToastAndroid.show('Failed to start recording', ToastAndroid.SHORT);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      if (recording) {
        const result = await audioRecorderPlayer.stopRecorder();
        audioRecorderPlayer.removeRecordBackListener();
        setAudioToBeSent({
          filename: `${Date.now()}.mp3`,
          path: result,
          mime: 'audio/mp3',
        });
        setIsRecording(false);
        setShowVoicePreview(true);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  // Play the recorded voice message
  const playSound = () => {
    if (voiceUri) {
      const newSound = new Sound(voiceUri, Sound.MAIN_BUNDLE, (error) => {
        if (error) {
          return;
        }
        setSound(newSound);
        newSound.play((success) => {
          setIsPlaying(false);
        });
      });
      setIsPlaying(true);
    }
  };

  // Pause the voice preview
  const pauseSound = () => {
    if (sound) {
      sound.pause(() => {
        setIsPlaying(false);
      });
    }
  };

  const sendAudioMessage = async () => {
    if (!audioToBeSent) {
      return;
    }

    await sendAttachment({ files: [audioToBeSent], type: 'audio' });
    setShowVoicePreview(false); // Hide the preview after sending
    setVoiceUri(''); // Reset voice URI
  };

  const handleCancelVoice = () => {
    setShowVoicePreview(false);
    setVoiceUri('');
    if (sound) {
      sound.release(); // Release the sound instance
      setSound(null);
    }
    setIsPlaying(false);
  };

  console.log('activeChat', activeChat);

  const checkAndFetchChat = async () => {
    setIsLoading({ ...isLoading, chat: true });
    try {
      if (!isCheckingActiveChat && !activeChat) {
        try {
          const response = await axiosInstance.get('/chat-request/active-chat');
          const activeChatRes = response.data;

          if (activeChatRes) {
            setActiveChat(activeChatRes);
          } else {
            navigation.navigate('Footer', { screen: 'Home' });
          }
        } catch (err) {
          console.error('Failed to fetch active chat:', err.response);
          navigation.navigate('Footer', { screen: 'Home' });
        }
      }
    } catch (error) {
      console.error('Error checking or fetching chat details:', error);
      ToastAndroid.show(
        'An error occurred while fetching chat details.',
        ToastAndroid.SHORT,
      );
    } finally {
      setIsLoading({ ...isLoading, chat: false });
    }
  };

  useEffect(() => {
    checkAndFetchChat();
  }, [chatId]);

  useEffect(() => {
    if (activeChat) {
      fetchMessages();
      setAstroName(activeChat.astrologer?.name);
      setAstroImage(activeChat.astrologer?.image);
    }
  }, [activeChat?._id]);

  useEffect(() => {
    if (newMsg) {
      setMessages([...messages, newMsg]);
    }
  }, [newMsg]);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);
  useEffect(() => {
    // ScreenshotPrevention.enable(); // Block screenshots on Android

    return () => {
      ScreenshotPrevention.disable(); // Re-enable screenshots when leaving
    };
  }, []);
  const astrologer = activeChat?.astrologer;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <Image
            source={{ uri: order ? astroImage : astrologer?.image }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 1000,
            }}
          />
          <View style={{ flexDirection: 'column', gap: 4 }}>
            <Text
              style={{
                color: 'white',
                fontSize: 14,
                textTransform: 'capitalize',
                letterSpacing: 0.5, // Subtle spacing for sophistication
                fontWeight: '600',
              }}
            >
              {order ? astroName : astrologer?.name}
            </Text>
            <View
              style={{
                minWidth: 60,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-around',
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  opacity: 0.9,
                  fontWeight: '700',
                  color: 'white',
                }}
              >
                Time Left -{' '}
              </Text>
              {activeChat?.timeRemaining ? (
                <CountdownTimer
                  until={getSeconds(activeChat?.timeRemaining)}
                  onFinish={onFinish}
                  setIsRechargePopupVisible={setIsRechargePopupVisible}
                  setShowRechargeBtn={setShowRechargeBtn}
                  fontSize={12}
                  textColor="white"
                />
              ) : (
                <Text
                  style={{
                    fontSize: 12,
                    opacity: 0.9,
                    fontWeight: '700',
                    color: 'white',
                  }}
                >
                  00:00
                </Text>
              )}
            </View>
          </View>
        </View>
      ),
      headerLeft: null,
      headerRight: () => {
        return (
          <View style={{ flexDirection: 'row', gap: 12, marginRight: 8 }}>
            <TouchableOpacity
              style={{
                backgroundColor: '#FF4444',
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.3)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 1,
                opacity: isLoading.endChat ? 0.7 : 1,
              }}
              onPress={handleEndChat}
              disabled={isLoading.endChat}
            >
              {isLoading.endChat ? (
                <ActivityIndicator size={'small'} color={'white'} />
              ) : (
                <Text
                  style={{
                    color: 'white',
                    fontWeight: '600',
                    textShadowColor: 'rgba(0, 0, 0, 0.2)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 1,
                  }}
                >
                  End
                </Text>
              )}
            </TouchableOpacity>
          </View>
        );
      },
    });
  }, [navigation, user, activeChat, showRechargeBtn]);

  useFocusEffect(() => {
    setChatScreenActive(true);
    return () => setChatScreenActive(false);
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 100}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: isDarkMode
            ? colors.darkBackground
            : colors.lightBackground,
        }}
      >
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 20, paddingBottom: 100 }}
          ref={scrollViewRef}
          onScroll={handleScroll} // Track the scroll event
          scrollEventThrottle={16}
        >
          {isLoading.messages ? (
            <View
              style={{
                paddingTop: 20,
                justifyContent: 'center',
                alignItems: 'center',
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
              {messages?.map((message) => (
                <View
                  key={message?._id}
                  style={{
                    backgroundColor:
                      message.sender.role === 'user'
                        ? isDarkMode
                          ? colors.darkTableRowEven
                          : colors.green100
                        : isDarkMode
                        ? colors.darkTableRowOdd
                        : colors.purple100,
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    marginVertical: 5,
                    borderRadius: 20,
                    alignSelf:
                      message.sender.role === 'user'
                        ? 'flex-end'
                        : 'flex-start',
                    maxWidth: '80%',
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    borderWidth: 1,
                    borderColor: isDarkMode ? colors.dark : colors.lightGray,
                  }}
                >
                  {message?.attachments?.length > 0 &&
                    message?.attachments?.map((attachment, index) => {
                      const url = attachment.url;
                      const file = fileFormat(url);

                      return (
                        <View key={index}>
                          <RenderAttachment
                            file={file}
                            url={url}
                            handleImageClick={handleImageClick}
                          />
                        </View>
                      );
                    })}
                  <Text
                    style={{
                      fontSize: 16,
                      color: isDarkMode ? colors.darkText : colors.black,
                    }}
                  >
                    {message.content}
                  </Text>
                  <Text
                    style={{
                      textAlign: 'right',
                      fontSize: 10,
                      color: '#888',
                      marginLeft: 6,
                    }}
                  >
                    {moment(message.createdAt).format('hh:mm a')}
                  </Text>
                </View>
              ))}
            </>
          )}
          {isRechargePopupVisible && (
            <RechargeMessage
              setIsRechargePopupVisible={setIsRechargePopupVisible}
            />
          )}
          {isLoading.isSendingFile && (
            <View
              style={{
                paddingVertical: 20,
                justifyContent: 'center',
                alignItems: 'center',
                flex: 1,
              }}
            >
              <ActivityIndicator
                size={'large'}
                color={isDarkMode ? 'white' : colors.purple}
              />
              <Text>Sending File...</Text>
            </View>
          )}
        </ScrollView>
        {/* Voice message preview section */}
        {showVoicePreview ? (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 10,
              gap: 20,
            }}
          >
            <TouchableOpacity
              onPress={handleCancelVoice}
              style={{
                backgroundColor: isDarkMode
                  ? colors.darkTableRowOdd
                  : '#DDDDDD',
                padding: 10,
                borderRadius: 9999,
              }}
            >
              <MaterialIcons name="cancel" size={24} color="red" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={isPlaying ? pauseSound : playSound}
              style={{
                backgroundColor: isDarkMode
                  ? colors.darkTableRowOdd
                  : '#DDDDDD',
                padding: 10,
                borderRadius: 9999,
              }}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={22}
                color={'green'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={sendAudioMessage}
              style={{
                backgroundColor: 'green',
                padding: 10,
                borderRadius: 9999,
                marginLeft: 10,
              }}
            >
              <Ionicons name="send" size={22} color={'white'} />
            </TouchableOpacity>
          </View>
        ) : (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
          >
            <View
              style={{
                flexDirection: 'column',
                paddingHorizontal: 12,
                paddingBottom: 2,
                margin: 0,
                gap: 3,
              }}
            >
              {/* First row: TextInput and Send button */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <TextInput
                  style={{
                    flex: 1,
                    height: 42,
                    paddingHorizontal: 12,
                    borderRadius: 30,
                    backgroundColor: isDarkMode
                      ? colors.darkTableRowOdd
                      : '#F0F0F0',
                    color: isDarkMode ? colors.darkTextPrimary : '#000',
                  }}
                  value={newMessage}
                  onChangeText={setNewMessage}
                  placeholder="Type a message..."
                  placeholderTextColor={
                    isDarkMode ? colors.darkTextSecondary : '#aaa'
                  }
                />
                <TouchableOpacity
                  onPress={handleSendMessage}
                  style={{
                    backgroundColor: 'green',
                    borderRadius: 9999,
                    padding: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name="send-sharp" size={16} color={'white'} />
                </TouchableOpacity>
              </View>
              {/* Second row: Action buttons */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 18,
                  paddingVertical: 6,
                  justifyContent: 'center',
                }}
              >
                {isRecording ? (
                  <TouchableOpacity
                    style={{
                      backgroundColor: isDarkMode
                        ? colors.darkTableRowOdd
                        : '#DDDDDD',
                      borderRadius: 9999,
                      padding: 8,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    onPress={stopRecording}
                  >
                    <Ionicons name="pause" size={22} color="red" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={{
                      backgroundColor: isDarkMode
                        ? colors.darkTableRowOdd
                        : '#DDDDDD',
                      borderRadius: 9999,
                      padding: 8,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    onPress={startRecording}
                  >
                    <Ionicons
                      name="mic"
                      size={22}
                      color={isDarkMode ? 'white' : colors.purple}
                    />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={{
                    backgroundColor: isDarkMode
                      ? colors.darkTableRowOdd
                      : '#DDDDDD',
                    borderRadius: 9999,
                    padding: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={handleOpenProfiles}
                >
                  <MaterialCommunityIcons
                    name="account-edit"
                    size={24}
                    color={isDarkMode ? 'white' : colors.purple}
                  />
                </TouchableOpacity>
                <Menu
                  visible={visible}
                  onDismiss={closeMenu}
                  anchor={
                    <TouchableOpacity
                      onPress={openMenu}
                      style={{
                        backgroundColor: isDarkMode
                          ? colors.darkTableRowOdd
                          : '#DDDDDD',
                        borderRadius: 9999,
                        padding: 8,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Ionicons
                        name="attach-outline"
                        size={22}
                        color={isDarkMode ? 'white' : colors.purple}
                      />
                    </TouchableOpacity>
                  }
                >
                  <Menu.Item
                    onPress={pickImage}
                    leadingIcon={({ color, size }) => (
                      <Ionicons
                        name="image-outline"
                        size={size}
                        color={color}
                      />
                    )}
                    title="Image"
                  />
                  <Menu.Item
                    onPress={pickDocument}
                    leadingIcon={({ color, size }) => (
                      <Ionicons
                        name="document-outline"
                        size={size}
                        color={color}
                      />
                    )}
                    title="Document"
                  />
                </Menu>
              </View>
            </View>
          </KeyboardAvoidingView>
        )}
        {/* Button to scroll to bottom */}
        {showScrollButton && (
          <TouchableOpacity
            style={{
              position: 'absolute',
              bottom: 120,
              right: 20,
              backgroundColor: isDarkMode ? colors.darkTableRowOdd : 'gray',
              borderRadius: 25,
              opacity: 0.7,
              width: 30,
              height: 30,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={scrollToBottom}
          >
            <Ionicons name="arrow-down" size={14} color="white" />
          </TouchableOpacity>
        )}
        {/* Modal for Full-Screen Image Display */}
        <ImageModal
          isImageModalVisible={isImageModalVisible}
          setIsImageModalVisible={setIsImageModalVisible}
          imageUrl={imageUrl}
        />
      </View>

      <Modal
        visible={showRatingModal}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 20}
            style={{ width: '98%' }}
          >
            {starCount === 0 ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-around',
                  backgroundColor: isDarkMode ? colors.purple : 'white',
                  borderRadius: 20,
                  paddingVertical: 20,
                  paddingHorizontal: 2,
                  marginBottom: 20,
                }}
              >
                <View>
                  <Text
                    style={{
                      fontSize: 12,
                      color: isDarkMode ? 'white' : 'black',
                    }}
                  >
                    Rate your conversation with
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 500,
                      color: isDarkMode ? 'white' : colors.purple,
                    }}
                  >
                    {astroName}
                  </Text>
                </View>

                <View
                  style={{ flexDirection: 'row', justifyContent: 'center' }}
                >
                  {renderStars()}
                </View>

                <View
                  style={{
                    backgroundColor: '#DDDDDD',
                    borderRadius: 12,
                  }}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color="black"
                    onPress={onClose}
                  />
                </View>
              </View>
            ) : (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isDarkMode ? '#2e3338' : 'white',
                  borderRadius: 20,
                  padding: 5,
                  position: 'relative',
                }}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color="black"
                  onPress={onClose}
                  style={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    color: isDarkMode ? 'white' : 'black',
                  }}
                />

                {/* Ratings */}

                <View style={{ alignItems: 'center' }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      marginTop: 50,
                    }}
                  >
                    {renderStars()}
                  </View>

                  <Text
                    style={{
                      marginTop: 5,
                      fontSize: 16,
                      fontWeight: 500,
                      color: isDarkMode ? 'white' : colors.purple,
                    }}
                  >
                    {getRatingText()}
                  </Text>
                </View>

                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 500,
                    color: isDarkMode ? 'white' : colors.purple,
                    alignItems: 'center',
                    marginTop: 20,
                  }}
                >
                  {astroName}
                </Text>

                <View style={{ width: '90%', marginTop: 40 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 500,
                      color: isDarkMode ? 'white' : 'black',
                    }}
                  >
                    Share more about your experience:
                  </Text>

                  <View style={{ marginTop: 10 }}>
                    <TextInput
                      placeholder="Description"
                      multiline={true}
                      numberOfLines={4}
                      value={reviewDescription}
                      onChangeText={setReviewDescription}
                      textAlignVertical="top"
                      placeholderTextColor={isDarkMode ? 'white' : 'black'}
                      style={{
                        backgroundColor: isDarkMode ? '#1b1f22' : '#f5fefd',
                        borderRadius: 12,
                        paddingHorizontal: 8,
                        fontSize: 16,
                        color: isDarkMode ? 'white' : 'black',
                      }}
                    />
                  </View>
                </View>

                <View
                  style={{
                    width: '90%',
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    gap: 8,
                    marginTop: 20,
                    marginBottom: 20,
                  }}
                >
                  <TouchableOpacity
                    onPress={onClose}
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 5,
                      borderRadius: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: 400,
                        color: isDarkMode ? 'white' : 'black',
                      }}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSubmit}
                    style={{
                      backgroundColor: colors.purple,
                      paddingHorizontal: 8,
                      paddingVertical: 5,
                      borderRadius: 12,
                    }}
                  >
                    <Text
                      style={{ fontSize: 16, fontWeight: 400, color: 'white' }}
                    >
                      Submit
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </KeyboardAvoidingView>
        </View>
      </Modal>
      <AddPersonDetailsModal
        visible={isPersonModalVisible}
        onClose={() => setPersonModalVisible(false)}
        onSubmit={handleDetailsSubmit}
        initialData={profileToEdit}
        onClear={() => setProfileToEdit(null)}
      />
      <ProfilesModalSheet
        isVisible={isProfileSheetVisible}
        onClose={() => setIsProfileSheetVisible(false)}
        profiles={kundliProfiles.map((p, index) => ({
          ...p,
          displayName: index === 0 ? `${p.name} (You)` : p.name,
        }))}
        onEdit={handleEditProfile}
        onAdd={handleAddProfile}
      />
    </KeyboardAvoidingView>
  );
};

export default WithSafeArea(ActiveChat);
