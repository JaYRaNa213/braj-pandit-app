import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { colors } from '../assets/constants/colors';
import customerChatOptions from '../assets/customerSupportOptions.json';
import FullScreenLoader from '../components/FullScreenLoader';
import { useChat } from '../context/ChatContext';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import { REACT_APP_BACKEND_URL } from '../utils/domain';
import WithSafeArea from '../components/HOC/SafeAreaView';
import axiosInstance from '../utils/axiosInstance';

const CustomerSupportChatScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  const [messages, setMessages] = useState([]);
  const [isRefreshing, setRefreshing] = useState(false);
  const [inputText, setInputText] = useState('');
  const { socket } = useSocket();
  const route = useRoute();
  const { user } = useSelector((state) => state.user);
  const [ticketId, setTicketId] = useState(null);
  const [ticket, setTicket] = useState(null);
  const { newMessageRecievedSupport } = useChat();
  const id = route?.params?.ticketId;
  const [currentOptions, setCurrentOptions] = useState(
    customerChatOptions.data,
  ); // Track current options to display
  const [parentOption, setParentOption] = useState(null); // Track the parent option
  const scrollViewRef = useRef();
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [showHelpView, setShowHelpView] = useState(false);

  const headerRight = () => (
    <View style={{ flexDirection: 'row' }}>
      <TouchableOpacity
        onPress={() => {
          setShowDeletePopup(true);
        }}
        style={{ marginRight: 24 }}
      >
        <Ionicons name="trash" size={24} color="#fff" />
      </TouchableOpacity>

      {/* <TouchableOpacity
        style={{ marginRight: 24, justifyContent: 'center' }}
        onPress={() => {
          setIsKeyboardOpen(false);
          setShowHelpView(!showHelpView);
        }}
      >
        <Text style={{ color: 'white', textAlignVertical: 'center' }}>
          HELP
        </Text>
      </TouchableOpacity> */}
    </View>
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('support.screenHead'),
      headerRight: () => (ticketId ? headerRight() : null),
    });
  }, [t, navigation, ticketId]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setIsKeyboardOpen(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsKeyboardOpen(false);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const deleteTicket = async () => {
    try {
      const response = await axios.delete(
        `${REACT_APP_BACKEND_URL}/ticket/delete/${ticketId}`,
      );

      if (response?.data?.success) {
        ToastAndroid.show('Ticket deleted succesfully', ToastAndroid.SHORT);
      }
    } catch (error) {
      ToastAndroid.show(
        'Error in deleting ticket, please try again later',
        ToastAndroid.SHORT,
      );

      console.error('Error deleting ticket:', error);
    } finally {
      navigation.navigate('CustomerSupport');
    }
  };

  const handleSendMessage = async (message, option) => {
    // setRefreshing(true);
    if (!message || !message.trim()) {
      return;
    }

    if (option && option.childrenMessages?.length) {
      // If the option has child messages, display them instead of sending the message
      setCurrentOptions(option.childrenMessages);
      setParentOption(option); // Set the clicked option as the parent
      //   setRefreshing(false);
    } else {
      // Normal message sending process
      const isNewTicket = !ticketId;
      setMessages([
        ...messages,
        { sender: 'user', content: message, _id: Math.random() * 10000 },
      ]);

      let newMessagePayload;
      if (ticketId) {
        newMessagePayload = {
          content: message.trim(),
          sender: 'user',
          ticketId: ticketId,
          receiver: '659ad015992a7f3510be4648',
        };
      } else {
        newMessagePayload = {
          userId: user?._id,
          receiver: '659ad015992a7f3510be4648',
          agentId: '659ad015992a7f3510be4648',
          content: message.trim(),
          reason: message.trim(),
          sender: 'user',
        };
      }

      socket.current.emit('newMessageCustomerSupport', newMessagePayload);

      if (isNewTicket) {
        setTimeout(async () => {
          const latestTicketResponse = await axios.get(
            `${REACT_APP_BACKEND_URL}/ticket/latest/${user?._id}`,
          );
          if (latestTicketResponse?.data?.success) {
            setTicketId(latestTicketResponse?.data?.ticket?._id);
            // setRefreshing(false);
          }
        }, 1000);
      }

      setInputText('');
    }
    // setRefreshing(false);
  };

  const fetchMessages = async () => {
    setRefreshing(true);
    try {
      const response = await axios.get(
        `${REACT_APP_BACKEND_URL}/ticket/messages/${ticketId}`,
      );
      setMessages(response.data);
    } catch (error) {
      ToastAndroid.show(
        'Error in fetching messages, please try again later',
        ToastAndroid.SHORT,
      );
      console.error('Error fetching messages:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchTicket = async () => {
    try {
      const response = await axiosInstance.get(
        `/ticket/getTicketByTicketId/${ticketId}`,
      );

      if (response?.data?.success) {
        setTicket(response?.data?.data);
      }
    } catch (error) {
      ToastAndroid.show(
        'Error in fetcing ticket, please try again later',
        ToastAndroid.SHORT,
      );
      console.error('Error fetching ticket:', error);
    }
  };

  useEffect(() => {
    if (ticketId) fetchTicket();
  }, [ticketId]);

  useEffect(() => {
    if (id) {
      setTicketId(id);
    }
  }, [id]);

  useEffect(() => {
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    }, 2000);
  }, [messages, newMessageRecievedSupport]);

  useEffect(() => {
    if (ticketId) {
      fetchMessages();
    }
  }, [ticketId]);

  useEffect(() => {
    if (newMessageRecievedSupport) {
      if (ticketId && newMessageRecievedSupport.ticketId === ticketId) {
        setMessages([
          ...messages,
          {
            sender: 'agent',
            content: newMessageRecievedSupport.message.content,
            _id: Math.random() * 10000,
          },
        ]);
      }
    }
  }, [newMessageRecievedSupport]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDarkMode ? colors.darkBackground : colors.lightBackground,
        position: 'relative',
      }}
    >
      {/* To show the loader while creating ticket */}
      <FullScreenLoader isRefreshing={isRefreshing} />

      {showHelpView && (
        <View
          style={{
            alignItems: 'center',
            width: '100%',
            position: 'absolute',
            bottom: 80,
            zIndex: 10,
          }}
        >
          <View style={styles.supportExecBox}>
            <View
              style={{ alignItems: 'flex-end', width: '80%', marginBottom: 20 }}
            >
              <TouchableOpacity
                style={{}}
                onPress={() => setShowHelpView(false)}
              >
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>
            <Text
              style={[
                styles.supportExecBoxText,
                { color: isDarkMode ? 'white' : 'black' },
              ]}
            >
              Didn't find what you were looking for?
            </Text>
            <View
              style={{
                width: '70%',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <TouchableOpacity
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'row',
                  paddingHorizontal: 8,
                  borderRadius: 12,
                  height: 40,
                  backgroundColor: colors.purple,
                }}
              >
                <Ionicons name="call" size={20} color="#FFFFFF" />
                <Text style={{ color: 'white', marginLeft: 10, fontSize: 16 }}>
                  Talk to Us
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'row',
                  paddingHorizontal: 8,
                  borderRadius: 12,
                  height: 40,
                  backgroundColor: colors.purple,
                }}
              >
                <Ionicons
                  name="chatbubbles-outline"
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={{ color: 'white', marginLeft: 10, fontSize: 16 }}>
                  Chat with Us
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 20}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, backgroundColor:isDarkMode ? colors.darkBackground:colors.lightBackground}}
          ref={scrollViewRef}
          keyboardShouldPersistTaps="handled"
        >
          {/* Show chat options if there is no ticketId or child options to display */}
          {!ticketId && currentOptions.length > 0 ? (
            <View style={{ paddingVertical: 16, paddingHorizontal: 5 }}>
              <Text
                style={{
                  fontSize: 16,
                  marginBottom: 8,
                  color: isDarkMode ? colors.darkTextPrimary : 'black',
                  paddingLeft: 16,
                }}
              >
                {parentOption
                  ? `Select an option for "${parentOption.heading}"`
                  : 'Select an option to start:'}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  width: '100%',
                  gap: 5,
                  padding: 5,
                }}
              >
                {currentOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={{
                      padding: 12,
                      backgroundColor: isDarkMode ? colors.darkSurface : colors.lightGray,
                      borderRadius: 8,
                      marginVertical: 4,
                    }}
                    onPress={() => handleSendMessage(option.heading, option)}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: isDarkMode ? '#CCC' : 'black',
                      }}
                    >
                      {option.heading}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <View style={{ flex: 1, padding: 16 }}>
              {messages.map((msg) => (
                <View
                  key={msg?._id}
                  style={{
                    justifyContent:
                      msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    marginBottom: 12,
                    flexDirection: 'row',
                  }}
                >
                  <View
                    style={{
                      backgroundColor:
                        msg.sender === 'user'
                          ? (isDarkMode ? colors.darkGreen:colors.lightGreen)
                          : colors.purple100,
                      paddingHorizontal: 12,
                      borderRadius: 12,
                      maxWidth: '70%',
                      paddingVertical: 6,
                    }}
                  >
                    <Text
                      style={{
                        color: msg.sender === 'user' ? 'white' : 'black',
                      }}
                    >
                      {msg.content}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {ticket?.ticketStatus === 'CLOSED' ? (
          <View
            style={{
              backgroundColor: colors.purple,
              width: '100%',
              height: 60,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 18, color: 'white' }}>
              This ticket is closed
            </Text>
          </View>
        ) : (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 6,
              paddingBottom: 12,
              margin: 6,
              gap: 6,
              backgroundColor:isDarkMode ? colors.darkBackground: colors.lightBackground
            }}
          >
            <TextInput
              style={{
                flex: 1,
                height: 44,
                paddingHorizontal: 16,
                borderRadius: 30,
                borderColor: isDarkMode ? colors.dark : colors.purple100,
                backgroundColor: isDarkMode ? colors.darkBackground : '#fff',
                color: isDarkMode ? colors.darkText : '#000',
                borderWidth: 0.5,
              }}
              value={inputText}
              onChangeText={setInputText}
              placeholder={t('support.chatScreen.inputPlaceholder')}
              placeholderTextColor={isDarkMode ? colors.darkText : '#aaa'}
            />
            <TouchableOpacity
              onPress={() => handleSendMessage(inputText)}
              style={{
                backgroundColor: isDarkMode ? colors.darkAccent:colors.purple,
                borderRadius: 999,
                padding: 12,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="send-sharp" size={16} color={'white'} />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>

      <Modal
        visible={showDeletePopup}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeletePopup(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 300,
              height: 150,
              padding: 20,
              backgroundColor: isDarkMode ? colors.darkSurface : 'white',
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 18,
                marginBottom: 10,
                color: isDarkMode ? 'white' : 'black',
              }}
            >
              {t('support.deleteTicketBtn')}
            </Text>
            <View style={{ flexDirection: 'row', marginTop: 10, gap: 24 }}>
              <Pressable
                style={{
                  paddingHorizontal: 10,
                  borderRadius: 4,
                  paddingVertical: 4,
                  borderWidth: 1,
                  borderColor: colors.lightGray,
                }}
                onPress={() => setShowDeletePopup(false)}
              >
                <Text style={{ color: isDarkMode ? 'white' : colors.gray }}>
                  {t('support.cancle')}
                </Text>
              </Pressable>
              <Pressable
                style={{
                  paddingHorizontal: 10,
                  borderRadius: 4,
                  paddingVertical: 4,
                  backgroundColor: 'red',
                }}
                onPress={deleteTicket}
              >
                <Text style={{ color: 'white' }}>{t('support.comfirm')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    width: '100%',
    flexDirection: 'flex',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyText: { textAlign: 'center', fontSize: 16 },
  supportExecBox: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: 20,
  },
  supportExecBoxText: {
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 20,
  },
});

export default WithSafeArea(CustomerSupportChatScreen);
