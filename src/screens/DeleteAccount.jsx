import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Button,
  TouchableOpacity,
  Pressable,
  ToastAndroid,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../assets/constants/colors';
import { OtpInput } from 'react-native-otp-entry';
import { ActivityIndicator } from 'react-native';
import {
  useDeleteUserAccountMutation,
  useDeleteUserAccountQuery,
  useLazySendMobileOtpQuery,
  useLazyVerifyMobileOtpQuery,
} from '../redux/api/userApi';
import { useDispatch, useSelector } from 'react-redux';
import { getDeviceInfo } from '../utils/helper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userNotExist } from '../redux/reducer/userReducer';

const DeleteAccount = () => {
  const [text, setText] = useState('');

  const [code, setCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSelector((state) => state.user);

  const [sendMobileOtp] = useLazySendMobileOtpQuery();
  const [verifyMobileOtp] = useLazyVerifyMobileOtpQuery();
  const [deleteUserAccount] = useDeleteUserAccountMutation();

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    setPhoneNumber('' + user?.phone);
  }, [user]);

  const handleSendOtp = async (resend = false) => {
    if (!phoneNumber.trim()) {
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await sendMobileOtp(phoneNumber);
      if (error) {
        return ToastAndroid.show(
          error?.message || 'Error in sending OTP',
          ToastAndroid.SHORT,
        );
      }
      if (data) {
        setShowOtpInput(true);
        if (resend) {
          setCode('');
        }
        ToastAndroid.show('OTP sent successfully', ToastAndroid.SHORT);
      }
    } catch (error) {
      ToastAndroid.show(
        error?.response?.data?.message || 'Failed to send OTP',
        ToastAndroid.SHORT,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!code.trim()) {
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await verifyMobileOtp({
        phone: phoneNumber,
        otp: code,
      });
      if (error) {
        console.log('error in verify', error);

        return ToastAndroid.show(
          error?.data?.message || 'Failed to verify OTP',
          ToastAndroid.SHORT,
        );
      }
      if (data) {
        try {
          const userAgent = await getDeviceInfo();
          const { data, error } = await deleteUserAccount({
            id: user?._id,
            userAgent,
          });

          if (error) {
            return ToastAndroid.show(
              error?.data?.message || 'Failed to delete account',
              ToastAndroid.SHORT,
            );
          }

          if (data) {
            ToastAndroid.show(
              'Account deleted successfully',
              ToastAndroid.SHORT,
            );
            await AsyncStorage.clear();
            dispatch(userNotExist());
            navigation.navigate('Footer', { screen: 'Home' });
          }
        } catch (error) {
          console.log('error', error);
          ToastAndroid.show(
            error?.response?.data?.message || 'Failed to delete account',
            ToastAndroid.SHORT,
          );
        }
      }
    } catch (error) {
      ToastAndroid.show(
        error?.response?.data?.message || 'Failed to delete account',
        ToastAndroid.SHORT,
      );
    } finally {
      setIsLoading(false);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Delete Account',
    });
  });

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDarkMode ? '#222' : 'white',
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 20,
      }}
    >
      {!showOtpInput ? (
        <>
          <Text
            style={{
              color: isDarkMode ? colors.lightGray : colors.gray,
              fontSize: 18,
              fontWeight: 'bold',
            }}
          >
            Why you want to delete your account?
          </Text>

          <TextInput
            style={[
              styles.input,
              isDarkMode ? { color: 'white' } : { color: 'black' },
            ]}
            multiline={true}
            numberOfLines={4}
            placeholder="Reason"
            value={text}
            onChangeText={setText}
            textAlignVertical="top"
          />

          <Pressable
            onPress={handleSendOtp}
            style={{
              backgroundColor: colors.purple,
              paddingVertical: 10,
              borderRadius: 5,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 12,
              width: '100%',
            }}
            android_ripple={{
              color: '#7A3D8B',
            }}
            disabled={isLoading}
          >
            <Text style={{ color: 'white', fontSize: 15 }}>Delete Account</Text>
            {isLoading && (
              <ActivityIndicator
                color={'white'}
                size={'small'}
                style={{ marginLeft: 10 }}
              />
            )}
          </Pressable>
        </>
      ) : (
        <>
          <Text
            style={{
              marginBottom: 20,
              fontSize: 18,
              color: isDarkMode ? colors.lightGray : 'black',
              textAlign: 'center',
            }}
          >
            Enter 4 digit OTP sent to your phone
          </Text>

          <OtpInput
            numberOfDigits={4}
            focusColor="green"
            focusStickBlinkingDuration={500}
            onTextChange={(text) => setCode(text)}
            onFilled={(text) => console.log(`OTP is ${text}`)}
            textInputProps={{
              accessibilityLabel: 'One-Time Password',
            }}
            theme={{
              containerStyle: {
                maxWidth: 200,
                alignSelf: 'center',
                marginVertical: 20,
                flexDirection: 'row',
                justifyContent: 'space-between',
              },
              pinCodeContainerStyle: {
                width: 40,
                height: 55,
                borderWidth: 1,
                borderColor: '#d3d3d3', // Subtle gray border
                borderRadius: 5,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f9f9f9',
              },
              pinCodeTextStyle: {
                fontSize: 18,
                fontWeight: 'bold',
                color: '#333',
              },
              focusedPinCodeContainerStyle: {
                borderColor: 'green',
              },
            }}
          />

          <Pressable
            onPress={handleVerifyOtp}
            style={{
              backgroundColor: colors.purple,
              padding: 12,
              borderRadius: 5,
              alignItems: 'center',
              marginTop: 24,
              flexDirection: 'row',
              justifyContent: 'center',
              marginHorizontal: 40,
            }}
            android_ripple={{
              color: '#7A3D8B',
            }}
            disabled={isLoading}
          >
            <Text
              style={{
                color: 'white',
                fontSize: 15,
              }}
            >
              Confirm Delete Account
            </Text>
            {isLoading && (
              <ActivityIndicator
                color={'white'}
                size={'small'}
                style={{ marginLeft: 10 }}
              />
            )}
          </Pressable>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  input: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    minHeight: 100,
  },
  button: {
    textAlign: 'center',
  },
});

export default DeleteAccount;
