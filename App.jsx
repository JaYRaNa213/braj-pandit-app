import 'react-native-gesture-handler';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  ActivityIndicator,
  Image,
} from 'react-native';
import 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { Provider, useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';

import { colors } from './src/assets/constants/colors';
import SideDrawer from './src/components/SideDrawer';
import StackNavigator from './src/components/StackNavigator';

import KundliProvider from './src/context/KundliProvider';
import { SocketProvider } from './src/context/SocketContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { ChatProvider, useChat } from './src/context/ChatContext';
import { SoundProvider } from './src/context/SoundContext';
import analytics from '@react-native-firebase/analytics';

import {
  useNotificationPermission,
  useCreateNotificationChannels,
  useBackgroundNotification,
  useBackgroundEventListener,
} from './src/hooks/Notifications';

import { store } from './src/redux/store';
import notifee from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import './i18n';
import i18n from './i18n';
import JoinWaitlistModal from './src/components/JoinWaitlistModal';
import TopAstrologersModal from './src/components/TopAstrologersModal';
import WaitlistedModal from './src/components/WaitlistedModal';
import { useconfigureGoogleAuth } from './src/hooks/Authentication';
import { useLazyGetUserProfileQuery } from './src/redux/api/userApi';
import axiosInstance from './src/utils/axiosInstance';
import { fetchUser } from './src/utils/helper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { navigationRef } from './src/utils/navigation';
import FullScreenRequest from './src/screens/chat/FullScreenRequest';
import UpdateRequiredModal from './src/components/UpdateRequireModal';
import { Button } from 'react-native';
import crashlytics from '@react-native-firebase/crashlytics';

const AppWrapper = () => {
  const { loading, user } = useSelector((state) => state.user);
  const [userFetched, setUserFetched] = useState(false);
  const dispatch = useDispatch();
  const [getUser] = useLazyGetUserProfileQuery();
  const {
    refetch,
    checkEligibilityLoading,
    isTopAstrologerModalOpen,
    isJoinWaitlistModalOpen,
    waitListJoinedModalOpen,
    isFullScreenRequest,
  } = useChat();

  // Fetch user profile
  useEffect(() => {
    fetchUser(getUser, dispatch, setUserFetched);
  }, [getUser, dispatch, refetch]);

  // Setup FCM
  useEffect(() => {
    const registerDevice = async () => {
      try {
        await messaging().registerDeviceForRemoteMessages();
        const token = await messaging().getToken();
        console.log('FCM Token:', token);

        if (user?.fcmToken !== token) {
          const res = await axiosInstance.post('/notification/firebaseToken', {
            token,
          });
        }
      } catch (err) {
        console.log('Error during FCM setup:', err);
      }
    };

    registerDevice();
  }, [user]);

  // Request permissions
  useEffect(() => {
    const requestPermission = async () => {
      const settings = await notifee.requestPermission();
    };

    requestPermission().catch((err) =>
      console.log('Permission request error:', err),
    );
  }, []);

  // Load language
  useEffect(() => {
    const fetchLanguage = async () => {
      const lang = await AsyncStorage.getItem('lang');
      if (lang) {
        i18n.changeLanguage(lang);
      }
    };
    fetchLanguage();
  }, []);

  if (!userFetched || loading) {
    return (
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fff',
          zIndex: 1000,
        }}
      >
        <Image
          source={require('./src/assets/images/adaptive-icon.png')}
          style={{
            width: 140,
            height: 140,
            marginBottom: 20,
            borderRadius: 70,
          }}
        />
      </View>
    );
  }

  return (
    <>
      <StackNavigator />
      <SideDrawer />
      {isTopAstrologerModalOpen && <TopAstrologersModal />}
      {isJoinWaitlistModalOpen && <JoinWaitlistModal />}
      {waitListJoinedModalOpen && <WaitlistedModal />}
      {checkEligibilityLoading && (
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 200,
              height: 70,
              backgroundColor: '#fff',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
              gap: 12,
            }}
          >
            <Text>Please wait... </Text>
            <ActivityIndicator size="small" color={colors.purple} />
          </View>
        </View>
      )}
      {isFullScreenRequest && <FullScreenRequest />}
      <UpdateRequiredModal />
    </>
  );
};

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  const linking = {
    prefixes: ['https://www.vedaz.io/app', 'vedaz://app'],
    config: {
      screens: {
        // Authentication
        MobileLogin: 'login/mobile',
        Login: 'login',
        Signup: 'signup',
        ResetPassword: 'reset-password',

        // Home & Footer
        Footer: 'home',
        Settings: 'settings',
        Profile: 'profile',

        // Kundli Screens
        Kundli: 'kundli',
        KundliInputs: 'kundli/inputs',
        KundliDetails: 'kundli/:id',
        KundliMatching: 'kundli/matching',
        KundliMatchingDetails: 'kundli/matching/:matchId',

        // Compatibility
        Compatibility: 'compatibility',
        RelationCompatibilityGrid: 'compatibility/grid',
        CompatibilityContent: 'compatibility/content',

        // Chat & Calls
        AllChats: 'chats',
        ActiveChat: 'chat/:chatId',
        SingleChat: 'chat/single/:chatId',
        ChatIntakeForm: 'chat/intake',

        // Blogs & Community
        Blogs: 'blogs',
        BlogDetails: 'blogs/:blogId',
        Community: 'community',
        CommunityQuestion: 'community/question/:questionId',
        CreateQuestion: 'community/create',

        // Payments & Recharge
        Recharge: 'recharge',
        PaymentInformation: 'payment',

        // Others
        Reviews: 'reviews',
        ReferAndEarn: 'refer',
        Temples: 'temples',
        TempleDetails: 'temples/:templeId',
        GeneralHoroscope: 'horoscope',
        AstrologerProfile: 'astrologer/:id',
        FreeAstrologers: 'astrologers/free',

        // AI Features
        AIAstroChat: 'ai/chat',
        AIAstroSessionsHistory: 'ai/sessions',

        // Misc
        Search: 'search',
        LoveCalculator: 'love/calculator',
        LoveScore: 'love/score',
        YoutubeVideos: 'videos',
      },
    },
  };

  // Only necessary notification hooks
  useNotificationPermission();
  useCreateNotificationChannels();
  useconfigureGoogleAuth();
  useBackgroundNotification();
  useBackgroundEventListener();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (globalThis.pendingChatId && navigationRef.isReady()) {
        const chatId = globalThis.pendingChatId;
        globalThis.pendingChatId = null;
        navigationRef.navigate('ActiveChat', { chatId });
      }
    }, 2000); // delay to allow NavigationContainer + StackNavigator to mount

    return () => clearTimeout(timer);
  }, []);

  const MyTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: 'white',
    },
  };

  const routeNameRef = useRef();

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent={true}
      />
      <SafeAreaProvider>
        <Provider store={store}>
          <NavigationContainer
            theme={MyTheme}
            linking={linking}
            ref={navigationRef}
            onReady={() => {
              routeNameRef.current =
                navigationRef.current.getCurrentRoute().name;
            }}
            onStateChange={async () => {
              const previousRouteName = routeNameRef.current;
              const currentRouteName =
                navigationRef.current.getCurrentRoute().name;

              if (previousRouteName !== currentRouteName) {
                // Log screen view to GA4
                await analytics().logScreenView({
                  screen_name: currentRouteName,
                  screen_class: currentRouteName,
                });
              }

              routeNameRef.current = currentRouteName;
            }}
          >
            <PaperProvider>
              <SoundProvider>
                <ThemeProvider>
                  <ChatProvider>
                    <SocketProvider>
                      <KundliProvider>
                        <AppWrapper />
                        <Toast />
                      </KundliProvider>
                    </SocketProvider>
                  </ChatProvider>
                </ThemeProvider>
              </SoundProvider>
            </PaperProvider>
          </NavigationContainer>
        </Provider>
      </SafeAreaProvider>
    </>
  );
}

export default App;
