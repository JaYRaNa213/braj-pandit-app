import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Button,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import { REACT_APP_BACKEND_URL } from '../utils/domain';
import { OtpInput } from 'react-native-otp-entry';
import { colors } from '../assets/constants/colors';
import { useTheme } from '../context/ThemeContext';

const PasswordReset = () => {
  const navigation = useNavigation();
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [userId, setUserId] = useState(null);
  const { isDarkMode } = useTheme();

  const handleOtpSubmit = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.put(
        `${REACT_APP_BACKEND_URL}/user/verify-email-otp`,
        { email, otp, userId },
      );
      if (data.success) {
        setIsOtpVerified(true);
        ToastAndroid.show(
          'OTP Verified. You can now reset your password.',
          ToastAndroid.SHORT,
        );
      } else {
        ToastAndroid.show('Invalid OTP. Please try again.', ToastAndroid.SHORT);
      }
    } catch (error) {
      ToastAndroid.show('Error in verifying OTP', ToastAndroid.SHORT);
    }
    setIsLoading(false);
  };

  const submitHandler = async () => {
    if (newPassword !== newPassword2) {
      ToastAndroid.show('Passwords should be the same', ToastAndroid.SHORT);
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await axios.put(
        `${REACT_APP_BACKEND_URL}/user/resetPassword`,
        { email, password: newPassword },
      );
      if (data) {
        ToastAndroid.show('Password reset successfully', ToastAndroid.SHORT);
        navigation.navigate('MobileLogin');
      }
    } catch (error) {
      ToastAndroid.show('Error in resetting password', ToastAndroid.SHORT);
    }
    setIsLoading(false);
  };

  const handleEmailSubmit = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.post(
        `${REACT_APP_BACKEND_URL}/user/send-email-otp`,
        { email },
      );
      if (data.success) {
        setIsOtpSent(true);
        setUserId(data.userId);
        ToastAndroid.show('OTP sent to your email', ToastAndroid.SHORT);
      } else {
        ToastAndroid.show('Error sending OTP', ToastAndroid.SHORT);
      }
    } catch (error) {
      ToastAndroid.show('Error in sending OTP', ToastAndroid.SHORT);
    }
    setIsLoading(false);
  };

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: isDarkMode ? '#333' : '#fff',
        paddingTop: 100,
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: 'bold',
          marginBottom: 20,
          textAlign: 'center',
          color: '#333',
        }}
      >
        Reset Password
      </Text>

      {!isOtpSent ? (
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 16,
              marginBottom: 12,
              color: isDarkMode ? 'white' : '#555',
            }}
          >
            Email
          </Text>
          <TextInput
            style={{
              height: 50,
              borderColor: '#ccc',
              borderWidth: 1,
              borderRadius: 8,
              paddingHorizontal: 10,
              marginBottom: 15,
              fontSize: 16,
              color: '#333',
            }}
            placeholder="Enter Your Email"
            value={email}
            onChangeText={setEmail}
          />
          <TouchableOpacity
            onPress={handleEmailSubmit}
            disabled={isLoading}
            style={{
              backgroundColor: colors.purple,
              padding: 15,
              borderRadius: 10,
              marginTop: 30,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 12,
            }}
          >
            <Text style={{ color: '#FFF', fontSize: 16 }}>Send OTP</Text>
          </TouchableOpacity>
        </View>
      ) : !isOtpVerified ? (
        <View
          style={{
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              marginBottom: 5,
              color: '#555',
            }}
          >
            Enter OTP
          </Text>
          <OtpInput
            numberOfDigits={6}
            focusColor="green"
            focusStickBlinkingDuration={500}
            onTextChange={(text) => setOtp(text)}
            onFilled={(text) => console.log(`OTP is ${text}`)}
            textInputProps={{
              accessibilityLabel: 'One-Time Password',
            }}
            theme={{
              containerStyle: {
                maxWidth: 300,
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
          <Button
            title="Verify OTP"
            onPress={handleOtpSubmit}
            color="#9C51B5"
            disabled={isLoading}
          />
        </View>
      ) : (
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              marginBottom: 20,
            }}
          >
            New Password
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 15,
            }}
          >
            <TextInput
              style={{
                height: 45,
                borderColor: '#ccc',
                borderWidth: 1,
                borderRadius: 8,
                paddingHorizontal: 10,
                marginBottom: 15,
                fontSize: 16,
                color: '#333',
                width: '80%',
              }}
              placeholder="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showPassword1}
            />
            <TouchableOpacity onPress={() => setShowPassword1(!showPassword1)}>
              <Text
                style={{
                  fontSize: 16,
                  color: '#9C51B5',
                  marginLeft: 10,
                }}
              >
                {showPassword1 ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text
            style={{
              marginBottom: 20,
            }}
          >
            Re-enter New Password
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 15,
            }}
          >
            <TextInput
              style={{
                height: 45,
                borderColor: '#ccc',
                borderWidth: 1,
                borderRadius: 8,
                paddingHorizontal: 10,
                marginBottom: 15,
                fontSize: 16,
                color: '#333',
                width: '80%',
              }}
              placeholder="Re-enter New Password"
              value={newPassword2}
              onChangeText={setNewPassword2}
              secureTextEntry={!showPassword2}
            />
            <TouchableOpacity onPress={() => setShowPassword2(!showPassword2)}>
              <Text style={{ fontSize: 16, color: '#9C51B5', marginLeft: 10 }}>
                {showPassword2 ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>

          <Button
            title="Reset Password"
            onPress={submitHandler}
            color="#9C51B5"
            disabled={isLoading}
          />
        </View>
      )}
      {isLoading && (
        <ActivityIndicator
          size="large"
          color="#9C51B5"
          style={{ marginTop: 20 }}
        />
      )}
    </View>
  );
};

export default PasswordReset;
