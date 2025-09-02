import notifee, { EventType } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { ToastAndroid } from 'react-native';
import { useSelector } from 'react-redux';
import io from 'socket.io-client';
import { useCreateNotification } from '../hooks/Notifications';
import { socketURL } from '../utils/axiosInstance';
import { useChat } from './ChatContext';
import { useSound } from './SoundContext';
// import { useSound } from './SoundContext';

import { isChatScreenActive } from '../hooks/Chat';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const isConnected = useRef(false);

  const socket = useRef(null);
  const {
    setNewMessageRecievedSupport,
    setPendingRequests,
    pendingRequests,
    setActiveChat,
    setNewMessage,
    setIncomingWaitlistedRequest,
    setIsFullScreenRequest,
    setNewAiMessage,
    aiChatSessionId,
    setAiChatSessionId,
    setAiMessages,
    setIsLoadingAiMessage,
    isLoadingAiMessage,
  } = useChat();
  const { chatRequestAcceptedNotification } = useCreateNotification();
  const { user, loading, session } = useSelector((state) => state.user);
  const navigation = useNavigation();

  const { playSound } = useSound();

  const tokenBufferRef = useRef([]);
  const flushIntervalRef = useRef(null);
  const lastTokenRef = useRef(null);

  useEffect(() => {
    if (!loading && user && session) {
      if (!isConnected.current && !socket.current) {
        socket.current = io(socketURL, {
          reconnection: true,
          reconnectionAttempts: Infinity,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          randomizationFactor: 0.5,
        });
        isConnected.current = true;
      }
      socket.current.on('connect', () => {
        console.log('Socket connected:', socket.current.id);
        socket.current.emit('addUser', {
          sub: user?._id,
          sessionId: session?._id,
          socketId: socket.current.id,
        });
      });

      socket.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      socket.current.on('missedCall', ({ astrologerName, astrologerId }) => {
        ToastAndroid.show(
          `Missed call from ${astrologerName}. They will try to reach you later.`,
          ToastAndroid.LONG,
        );
        AsyncStorage.setItem(
          'lastMissedCall',
          JSON.stringify({
            astrologerName,
            astrologerId,
            timestamp: new Date().toISOString(),
          }),
        );
      });

      socket.current.on(
        'astrologerCalling',
        ({ astrologerName, astrologerId }) => {
          ToastAndroid.show(
            `${astrologerName} is trying to reach you. Tap to start call.`,
            ToastAndroid.LONG,
          );
          navigation.navigate('IncomingCall', {
            astrologerName,
            astrologerId,
          });
        },
      );

      socket.current.on(
        'astrologerOnline',
        ({ astrologerId, astrologerName }) => {
          ToastAndroid.show(
            `${astrologerName} is now online!`,
            ToastAndroid.SHORT,
          );
          // The actual notification will be sent through FCM
        },
      );

      socket.current.on(
        'chatRequestAccepted',
        ({ chatRequestId, astrologerName, chat }) => {
          ToastAndroid.show(
            `${astrologerName} accepted your chat request.`,
            ToastAndroid.SHORT,
          );
          AsyncStorage.removeItem('lastTimestamp');
          setPendingRequests(
            pendingRequests.filter((req) => req._id !== chatRequestId),
          );

          setActiveChat(chat);

          if (!isChatScreenActive()) {
            navigation.navigate('ActiveChat', { chatId: chat._id });
          }
        },
      );
      socket.current.on(
        'callRequestAccepted',
        ({ chatRequestId, astrologerName }) => {
          ToastAndroid.show(
            `${astrologerName} accepted your call request, you will get call from astrologer soon.`,
            ToastAndroid.SHORT,
          );
          AsyncStorage.removeItem('lastTimestamp');

          setPendingRequests([]);
        },
      );
      socket.current.on('chatRequestRejected', (data) => {
        ToastAndroid.show(
          `Sorry, ${data?.astrologerName} is not able to ${data?.action} right now.`,
          ToastAndroid.SHORT,
        );
        AsyncStorage.removeItem('lastTimestamp');
        setPendingRequests((prev) =>
          prev.map((request) =>
            request._id === data?.chatRequestId
              ? { ...request, status: 'rejected' }
              : request,
          ),
        );
      });
      socket.current.on('chatRequestScheduled', (data) => {
        ToastAndroid.show(
          `${data?.astrologerName} has scheduled your ${data?.action} request`,
          ToastAndroid.SHORT,
        );
        AsyncStorage.removeItem('lastTimestamp');
        setPendingRequests((prev) =>
          prev.map((request) =>
            request._id === data?.chatRequestId
              ? {
                  ...request,
                  status: 'scheduled',
                  scheduledTime: data.scheduledTime,
                }
              : request,
          ),
        );
      });

      socket.current.on('callAcceptedByAstro', (data) => {
        AsyncStorage.removeItem('lastTimestamp');
        ToastAndroid.show(
          `${data?.astrologerName || 'Astrologer'} accepted your call request`,
          ToastAndroid.SHORT,
        );
      });

      socket.current.on('chatRequestEnded', ({ message }) => {
        ToastAndroid.show(message, ToastAndroid.SHORT);
        setActiveChat(null);
        AsyncStorage.removeItem('lastTimestamp');
        navigation.navigate('Footer', { screen: 'Home' });
      });
      socket.current.on('newMessageReceived', async (msg) => {
        setNewMessage(msg);
        // const showToast = await !location.pathname.includes('/ongoing-chat');
        // if (showToast) {

        // ToastAndroid.show('New message received', ToastAndroid.SHORT);
      });
      socket.current.on('newMessageRecievedSupport', (newMessage) => {
        setNewMessageRecievedSupport(newMessage);
        ToastAndroid.show('New msg recieved from support', ToastAndroid.show);
      });
      socket.current.on('callBack', (request) => {
        setIncomingWaitlistedRequest(request);
        setIsFullScreenRequest(true);
        playSound();
        ToastAndroid.show(
          `New ${request?.action} request from ${request?.astrologerName}`,
          ToastAndroid.SHORT,
        );
      });

      socket.current.on('aiTokenChunk', ({ token }) => {
        // ignore duplicate token if same as last one
        if (lastTokenRef.current === token) {
          console.log('Duplicate token skipped:', token);
          return;
        }

        lastTokenRef.current = token;
        console.log('AI TOKEN RECEIVED', token);

        setNewAiMessage((prev) => prev + token);
      });
      // Flush token buffer every 100ms
      flushIntervalRef.current = setInterval(() => {
        if (tokenBufferRef.current.length > 0) {
          setNewAiMessage((prev) => prev + tokenBufferRef.current.join(''));
          tokenBufferRef.current = [];
        }
      }, 100);

      // End session handler
      socket.current.on('aiSessionEnd', ({ sessionId, newMessage }) => {
        if (!aiChatSessionId) {
          setAiChatSessionId(sessionId);
        }
        setAiMessages((prev) => [
          ...prev,
          {
            role: newMessage.role || 'assistant',
            content: newMessage.content,
          },
        ]);
        setNewAiMessage('');
        tokenBufferRef.current = [];
        setIsLoadingAiMessage(false);
      });
    }

    // Handle notification presses to navigate to the chat
    const unsubscribeForeground = notifee.onForegroundEvent(
      ({ type, detail }) => {
        if (type === EventType.PRESS) {
          const chatId = detail.notification.data?.chatId;
          if (chatId) {
            navigation.navigate('ActiveChat', { chatId: chatId });
          }
        }
      },
    );

    // Handle background notification presses (app is closed or in background)
    // Only run ONCE in app lifetime
    notifee.onBackgroundEvent(async ({ type, detail }) => {
      if (type === EventType.PRESS) {
        const chatId = detail?.notification?.data?.chatId;
        if (chatId) {
          globalThis.pendingChatId = chatId; // store for later use
        }
      }
    });

    return () => {
      unsubscribeForeground();
      clearInterval(flushIntervalRef.current);
    };
  }, [user, session]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        chatRequestAcceptedNotification, // Also expose this function if needed elsewhere
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
