import AsyncStorage from '@react-native-async-storage/async-storage';
import analytics from '@react-native-firebase/analytics';
import { useNavigation } from '@react-navigation/native';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import { removeListener, startOtpListener } from 'react-native-otp-verify';
import { TextInput } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { colors } from '../assets/constants/colors';
import TrueCallerLogo from '../assets/images/TrueCaller_Logo.png';
import WithSafeArea from '../components/HOC/SafeAreaView';
import { useGoogleSign, useTrucallerAuth } from '../hooks/Authentication';
import {
  useLazySendMobileOtpQuery,
  useLoginWithMobileMutation,
} from '../redux/api/userApi';
import { userExist } from '../redux/reducer/userReducer';
import axiosInstance from '../utils/axiosInstance';
import { getDeviceInfo } from '../utils/helper';

const MobileLogin = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpTimer, setOtpTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { openTruecallerModal, isTruecallerSupported } = useTrucallerAuth();
  const { googleSignin } = useGoogleSign();
  const [sendMobileOtp] = useLazySendMobileOtpQuery();
  const [loginWithMobile] = useLoginWithMobileMutation();

  const handleChangeNumber = () => {
    setShowOtpInput(false);
    setPhoneNumber('');
    setCode('');
  };

  // Start timer for resend OTP
  useEffect(() => {
    let timer;
    if (showOtpInput && otpTimer > 0) {
      timer = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [showOtpInput, otpTimer]);

  const handleVerifyOtp = async (otpCode) => {
    const otp = otpCode || code;
    if (!otp.trim()) {
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await axiosInstance.get(
        `/user/verify-mobile-otp/${phoneNumber}/${otp}`,
      );

      if (data) {
        try {
          const userAgent = await getDeviceInfo();
          const { data: loginData } = await loginWithMobile({
            phoneNumber: `91${phoneNumber}`,
            userAgent,
          });

          if (loginData?.user?.role === 'astrologer') {
            ToastAndroid.show(
              'Login with different credentials, You are an astrologer',
              ToastAndroid.SHORT,
            );

            // GA4 log for astrologer trying login in user app
            await analytics().logEvent('otp_login_rejected', {
              phone: phoneNumber,
              reason: 'astrologer_account',
            });

            setShowOtpInput(false);
            setPhoneNumber('');
            setCode('');
          } else {
            await AsyncStorage.setItem('token', loginData?.token);
            dispatch(
              userExist({
                user: loginData?.user,
                session: loginData?.session,
              }),
            );

            // GA4 log for successful OTP login
            await analytics().logEvent('otp_login_success', {
              phone: phoneNumber,
              userId: loginData?.user?._id,
            });

            if (loginData?.user?.problems?.length > 0) {
              navigation.navigate('Footer', { screen: 'Home' });

              await analytics().logEvent('navigate_home_after_login', {
                userId: loginData?.user?._id,
              });
            } else {
              navigation.navigate('AgeSelection');

              await analytics().logEvent('navigate_age_selection', {
                userId: loginData?.user?._id,
              });
            }
          }
        } catch (err) {
          console.log('error', err);

          // GA4 log for login API failure
          await analytics().logEvent('otp_login_api_error', {
            phone: phoneNumber,
            error: err?.response?.data?.message || 'unknown_error',
          });

          ToastAndroid.show(
            err?.response?.data?.message || 'Failed to verify OTP',
            ToastAndroid.SHORT,
          );
        }
      }
    } catch (error) {
      console.log('Failed to verify otp', error?.response);

      // GA4 log for OTP verify API error
      await analytics().logEvent('otp_verification_api_error', {
        phone: phoneNumber,
        error: error?.response?.data?.message || 'unknown_error',
      });

      ToastAndroid.show(
        error?.response?.data?.message || 'Failed to verify OTP',
        ToastAndroid.SHORT,
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    startOtpListener((message) => {
      console.log('message', message);

      if (message) {
        const match = /(\d{4})/g.exec(message);
        if (match) {
          const otp = match[1];
          console.log('otp', otp);

          setCode(otp);
        }
      }
    });
    return () => removeListener();
  }, []);

  useEffect(() => {
    if (code.length === 4) {
      handleVerifyOtp(code);
    }
  }, [code]);

  const handleSendOtp = async (resend = false) => {
    if (!phoneNumber.trim()) {
      return;
    }

    console.log({ phoneNumber });

    await analytics().logEvent('send_otp_click', {
      method: 'phone_otp',
    });

    setIsLoading(true);
    try {
      const { data, error } = await sendMobileOtp(phoneNumber);

      if (error) {
        console.log('Error in sending otp', error);

        // 🔹 Log error event in GA4
        await analytics().logEvent('send_otp_failed', {
          method: 'phone_otp',
          reason: error?.data?.message || 'unknown_error',
        });

        return ToastAndroid.show(
          error?.data?.message || 'Error in sending OTP',
          ToastAndroid.SHORT,
        );
      }

      if (data) {
        setShowOtpInput(true);
        setOtpTimer(60); // reset timer
        if (resend) {
          setCode('');
        }

        ToastAndroid.show('OTP sent successfully', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.log('Failed to send otp', error?.response);

      // 🔹 Log network/server error in GA4
      await analytics().logEvent('send_otp_failed', {
        method: 'phone_otp',
        reason: error?.response?.data?.message || 'network_or_server_error',
      });

      ToastAndroid.show(
        error?.response?.data?.message || 'Failed to send OTP',
        ToastAndroid.SHORT,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTruecallerSignIn = useCallback(async () => {
    try {
      await analytics().logEvent('login_button_click', {
        method: 'truecaller',
      });
      if (!isTruecallerSupported) {
        ToastAndroid.show(
          'Truecaller is not supported on this device',
          ToastAndroid.SHORT,
        );
        return;
      }
      await analytics().logEvent('login_failed', {
        method: 'truecaller',
        reason: 'not_supported',
      });

      setIsLoading(true); // Add loading state
      await openTruecallerModal();
    } catch (error) {
      console.error('Truecaller log-in failed:', error);
      // 🔹 Log failure event
      await analytics().logEvent('login_failed', {
        method: 'truecaller',
        reason: error?.message || 'unknown_error',
      });
      ToastAndroid.show(
        'Failed to open Truecaller. Please try again.',
        ToastAndroid.SHORT,
      );
    } finally {
      setIsLoading(false); // Reset loading state
    }
  }, [openTruecallerModal, isTruecallerSupported]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '',

      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => (
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: 20,
            gap: 4,
          }}
          onPress={() => navigation.navigate('Footer', { screen: 'Home' })}
        >
          <Text style={{ fontSize: 15 }}>Skip</Text>
        </TouchableOpacity>
      ),
      headerStyle: {
        backgroundColor: '#fff',
        shadowColor: 'transparent',
        elevation: 0,
        borderBottomWidth: 0,
        height: 80,
      },
      headerTitleStyle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.purple,
      },
    });
  }, [navigation]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 20,
          backgroundColor: colors.lightBackground,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top Branding */}
        <View style={{ marginTop: 40, alignItems: 'center' }}>
          <Image
            source={require('../assets/images/app_logo.png')}
            style={{
              width: 80,
              height: 80,
              marginBottom: 12,
              borderRadius: 20,
              resizeMode: 'contain',
            }}
          />
          <Text
            style={{
              fontSize: 28,
              fontWeight: '700',
            }}
          >
            Welcome Back ✨
          </Text>
          <Text
            style={{
              marginTop: 6,
              fontSize: 14,
              color: '#555',
            }}
          >
            Login to continue with Vedaz
          </Text>
        </View>

        {/* Card Container */}
        <View
          style={{
            marginTop: 40,
            backgroundColor: '#FFF',
            padding: 12,
          }}
        >
          {/* Phone Input */}
          <TextInput
            mode="outlined"
            label="Phone Number"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            disabled={showOtpInput}
            left={<TextInput.Affix text="+91" textStyle={{ color: 'black' }} />}
            style={{
              marginBottom: 24,
              backgroundColor: '#FFF',
              color: 'black',
              fontSize: 14,
            }}
            maxLength={10}
            placeholder="Enter 10 digit phone number"
            placeholderTextColor={'#999'}
            right={
              <TextInput.Affix
                textStyle={{ color: 'black' }}
                text={`/${10 - phoneNumber.length}`}
              />
            }
            textColor="black"
            outlineColor="#999"
            outlineStyle={{ borderRadius: 12 }}
            activeOutlineColor={colors.gray}
          />

          {!showOtpInput ? (
            <Pressable
              onPress={() => handleSendOtp(false)}
              style={{
                backgroundColor:
                  phoneNumber.length === 10 ? colors.purple : '#9e9d9dff',
                padding: 14,
                borderRadius: 12,
                alignItems: 'center',
              }}
              disabled={isLoading || phoneNumber.length !== 10}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text
                  style={{ color: '#FFF', fontSize: 16, fontWeight: '600' }}
                >
                  Send OTP
                </Text>
              )}
            </Pressable>
          ) : (
            <>
              {/* OTP Input */}
              <TextInput
                mode="outlined"
                label="Enter OTP"
                keyboardType="number-pad"
                value={code}
                onChangeText={setCode}
                maxLength={4}
                style={{
                  marginBottom: 24,
                  backgroundColor: '#FFF',
                  color: 'black',
                  fontSize: 14,
                }}
                textColor="black"
                outlineColor="#ccc"
                outlineStyle={{ borderRadius: 12 }}
                activeOutlineColor={colors.gray}
              />
              <Pressable
                onPress={handleVerifyOtp}
                style={{
                  backgroundColor:
                    code.length === 4 ? colors.purple : '#9e9d9dff',
                  padding: 14,
                  borderRadius: 12,
                  alignItems: 'center',
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text
                    style={{ color: '#FFF', fontSize: 16, fontWeight: '600' }}
                  >
                    Verify OTP
                  </Text>
                )}
              </Pressable>
              {/* Resend OTP + Change Number */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 18,
                }}
              >
                {otpTimer > 0 ? (
                  <Text style={{ color: '#888' }}>
                    Resend OTP in {otpTimer}s
                  </Text>
                ) : (
                  <TouchableOpacity onPress={() => handleSendOtp(true)}>
                    <Text style={{ color: colors.purple, fontWeight: '600' }}>
                      Resend OTP
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={handleChangeNumber}>
                  <Text style={{ color: colors.purple, fontWeight: '600' }}>
                    Change Number
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Divider */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 28,
            marginHorizontal: 12,
          }}
        >
          <View style={{ flex: 1, height: 1, backgroundColor: '#CCC' }} />
          <Text style={{ marginHorizontal: 12, color: '#888' }}>OR</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: '#CCC' }} />
        </View>

        {/* Social Logins */}
        <View style={{ flexDirection: 'row', gap: 14, marginHorizontal: 12 }}>
          <TouchableOpacity
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: '#0173EF',
              borderRadius: 12,
              padding: 8,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              backgroundColor: '#EAF3FF',
            }}
            onPress={handleTruecallerSignIn}
          >
            <Image
              source={TrueCallerLogo}
              style={{ width: 100, height: 24, resizeMode: 'contain' }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: '#DB4437',
              borderRadius: 12,
              padding: 8,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              backgroundColor: '#FDECEA',
            }}
            onPress={googleSignin}
          >
            <Image
              source={require('../assets/images/google_Logo.png')}
              style={{ width: 100, height: 24, resizeMode: 'contain' }}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default WithSafeArea(MobileLogin);
