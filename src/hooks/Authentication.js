import {
  TRUECALLER_ANDROID_CUSTOMIZATIONS,
  useTruecaller,
} from '@kartikbhalla/react-native-truecaller';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMessaging } from '@react-native-firebase/messaging';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect } from 'react';
import { ToastAndroid } from 'react-native';
import { useDispatch } from 'react-redux';
import { colors } from '../assets/constants/colors';
import { useSdkLoginMutation } from '../redux/api/userApi';
import { userExist } from '../redux/reducer/userReducer';
import { getDeviceInfo } from '../utils/helper';

// TrueCaller Auth
export const useTrucallerAuth = () => {
  const { sendDataForLogin } = useSDKLogin();
  const {
    initializeTruecaller,
    openTruecallerModal,
    user,
    isTruecallerSupported,
    error,
    errorCode,
  } = useTruecaller({
    androidButtonColor: colors.purple,
    androidButtonStyle:
      TRUECALLER_ANDROID_CUSTOMIZATIONS.BUTTON_STYLES.RECTANGLE,
    androidButtonText: TRUECALLER_ANDROID_CUSTOMIZATIONS.BUTTON_TEXTS.ACCEPT,
    androidButtonTextColor: '#FFFFFF',
    androidClientId: process.env.TRUECALLER_ANDROID_CLIENT_ID,
    androidConsentHeading:
      TRUECALLER_ANDROID_CUSTOMIZATIONS.CONSENT_HEADING_TEXTS.LOG_IN_TO,
    androidFooterButtonText:
      TRUECALLER_ANDROID_CUSTOMIZATIONS.FOOTER_BUTTON_TEXTS.MANUALLY,
  });

  useEffect(() => {
    let mounted = true;

    const initializeTruecallerSDK = async () => {
      try {
        if (mounted) {
          await initializeTruecaller();
        }
      } catch (err) {
        console.error('Truecaller SDK initialization failed:', err);
      }
    };

    initializeTruecallerSDK();

    return () => {
      mounted = false;
    };
  }, []);

  // Handle user authentication data safely
  useEffect(() => {
    if (user) {
      try {
        const { firstName, lastName, email, mobileNumber, gender } = user;
        sendDataForLogin({
          name: `${firstName || ''} ${lastName || ''}`,
          email: email || '',
          phone: mobileNumber || 'null',
          gender: gender || 'null',
        });
      } catch (err) {
        console.error('Error processing user data:', err);
      }
    }
  }, [user]);

  // Wrapping openTruecallerModal with error handling
  const safeOpenTruecallerModal = useCallback(async () => {
    try {
      if (isTruecallerSupported) {
        const res = await openTruecallerModal();
      } else {
        console.warn('Truecaller is not supported on this device.');
      }
    } catch (err) {
      console.error('Error opening Truecaller modal:', err);
    }
  }, [isTruecallerSupported, openTruecallerModal]);

  return {
    openTruecallerModal: safeOpenTruecallerModal,
    isTruecallerSupported,
  };
};
// Google Auth
// 1. App Configuration
export const useconfigureGoogleAuth = () => {
  GoogleSignin.configure();
};

//2. Open Model code
export const useGoogleSign = () => {
  const { sendDataForLogin } = useSDKLogin();
  const googleSignin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        const { email, name, gender, phone } = response?.data?.user;
        sendDataForLogin({ email, name, gender, phone });
      }
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            break;
          default:
            console.log('Google Sign-in Error', error);
        }
      } else {
        // an error that's not related to google sign in occurred
        console.log('Non-Google Sign-in Error', error);
      }
    }
  };
  return { googleSignin };
};

// Sending data to backend
export const useSDKLogin = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [sdkLogin] = useSdkLoginMutation();

  const sendDataForLogin = useCallback(
    async ({ name, email, phone, gender }) => {
      try {
        const fcmToken = await getMessaging().getToken();
        const userAgent = await getDeviceInfo();

        console.log('Sending Truecaller Data:', {
          name,
          email,
          phone,
          gender,
          fcmToken,
        });

        const response = await sdkLogin({
          name,
          email,
          phone: phone || null,
          gender: gender || null,
          userAgent,
          fcmToken,
        });

        if (response?.error) {
          console.error('Error during SDK login:', response.error);
          return ToastAndroid.show(
            response.error?.data?.message || 'Error during login',
            ToastAndroid.SHORT,
          );
        }

        if (response?.data) {
          const { token, user, session } = response.data;
          console.log('SDK Login Successful:', response.data);

          // Store token before updating Redux store
          await AsyncStorage.setItem('token', token);
          dispatch(userExist({ user, session }));

          navigation.navigate('Footer', { screen: 'Home' });
        }
      } catch (error) {
        console.error('Unexpected error during SDK login:', error);
        ToastAndroid.show('Unexpected error occurred', ToastAndroid.SHORT);
      }
    },
    [sdkLogin, dispatch, navigation],
  );

  return { sendDataForLogin };
};
