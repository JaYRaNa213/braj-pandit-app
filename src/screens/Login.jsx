import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../assets/constants/colors';
import { useTheme } from '../context/ThemeContext';
import { useLoginMutation } from '../redux/api/userApi';
import { userExist } from '../redux/reducer/userReducer';
import { getDeviceInfo } from '../utils/helper';

function Login() {
  const navigation = useNavigation();
  const { user } = useSelector((state) => state.user);
  const { isDarkMode } = useTheme();
  const [email, setEmail] = useState('');

  const [show, setShow] = useState(false);
  const [login] = useLoginMutation();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => setShow(!show);
  const dispatch = useDispatch();

  const headerRight = () => (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
        gap: 4,
      }}
      onPress={() => navigation.navigate('Footer', { screen: 'Home' })}
    >
      <Text style={{ color: 'white' }}>Skip</Text>
      <AntDesign
        name="right"
        size={12}
        color="white"
        style={{ marginTop: 2 }}
      />
    </TouchableOpacity>
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Vedaz',
      headerRight: () => headerRight(),
    });
  }, [navigation, user]);

  const submitHandler = async () => {
    if (!email || !password) {
      return ToastAndroid.show(
        'Please fill all the fields',
        ToastAndroid.SHORT,
      );
    }
    setIsLoading(true);

    try {
      const userAgent = await getDeviceInfo();

      const data = await login({ email, password, userAgent }).unwrap();

      if (!data?.verified) {
        ToastAndroid.show(
          'Your email is not verified, otp sent to your email',
          ToastAndroid.SHORT,
        );
        Linking.openURL(`https://vedaz.io/verify-otp/${data?.userId}`);
        return;
      }

      if (data?.user?.role === 'astrologer') {
        ToastAndroid.show(
          'Login to Vedaz Astrologer App, You are an astrologer',
          ToastAndroid.SHORT,
        );
      } else {
        await AsyncStorage.setItem('token', data?.token);
        dispatch(userExist({ user: data?.user, session: data?.session }));
        navigation.navigate('Footer', { screen: 'Home' });
      }
      setIsLoading(false);
    } catch (error) {
      ToastAndroid.show(
        error?.response?.data?.message || 'Failed to login',
        ToastAndroid.SHORT,
      );
      console.error(error);
      setIsLoading(false);
    }
  };
  return (
    <ScrollView
      style={{
        padding: 20,
        paddingTop: 70,
        backgroundColor: isDarkMode ? '#222' : 'white',
      }}
      contentContainerStyle={{
        flexGrow: 1,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <Text
        style={{
          textAlign: 'center',
          marginBottom: 30,
          fontSize: 28,
          fontWeight: 'bold',
          color: isDarkMode ? colors.lightGray : 'black',
        }}
      >
        Login
      </Text>
      <TextInput
        style={{
          height: 50,
          borderWidth: 1,
          borderColor: '#dcdcdc',
          borderRadius: 10,
          paddingHorizontal: 15,
          marginBottom: 15,
          backgroundColor: isDarkMode ? '#333' : '#FFF',
          fontSize: 16,
          color: isDarkMode ? '#EDEDED' : '#333',
        }}
        placeholder="Enter Your Email"
        placeholderTextColor={isDarkMode ? '#AAAAAA' : '#999'}
        onChangeText={(text) => setEmail(text)}
        value={email}
      />
      <View style={{ marginBottom: 20 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderColor: '#dcdcdc',
            borderWidth: 1,
            borderRadius: 10,
            backgroundColor: isDarkMode ? '#333' : '#FFF',
          }}
        >
          <TextInput
            style={{
              height: 50,
              flex: 1,
              paddingHorizontal: 12,
              color: isDarkMode ? '#EDEDED' : '#333',
            }}
            placeholder="Enter Your Password"
            placeholderTextColor={isDarkMode ? '#AAAAAA' : '#999'}
            secureTextEntry={!show}
            onChangeText={(text) => setPassword(text)}
            value={password}
          />
          <TouchableOpacity
            onPress={handleClick}
            style={{
              marginRight: 10,
              padding: 8,
            }}
          >
            <AntDesign
              name={show ? 'eye' : 'eyeo'}
              size={24}
              color={isDarkMode ? '#EDEDED' : '#666'}
            />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')}>
        <Text
          style={{
            textAlign: 'right',
            color: isDarkMode ? 'white' : '#4B0082',
          }}
        >
          Forgot Password?
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={submitHandler}
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
        <Text style={{ color: '#FFF', fontSize: 16 }}>Login</Text>
        {isLoading && <ActivityIndicator size="small" color={'white'} />}
      </TouchableOpacity>

      <TouchableOpacity
        style={{ marginTop: 15 }}
        onPress={() => navigation.navigate('Signup')}
      >
        <Text
          style={{
            color: isDarkMode ? 'white' : '#4B0082',
            textAlign: 'center',
            fontSize: 14,
            fontWeight: '500',
          }}
        >
          Don't have an account? Sign Up
        </Text>
      </TouchableOpacity>
      <Text
        style={{
          textAlign: 'center',
          fontSize: 18,
          fontWeight: '500',
          marginVertical: 30,
          color: isDarkMode ? '#EDEDED' : '#333',
        }}
      >
        Or
      </Text>
      <TouchableOpacity
        style={{
          borderWidth: 1,
          borderColor: isDarkMode ? '#4B0082' : '#4B0082',
          padding: 15,
          borderRadius: 10,
          alignItems: 'center',
          backgroundColor: isDarkMode ? '#4B0082' : '#FFF',
        }}
        onPress={() => navigation.navigate('MobileLogin')}
        disabled={isLoading}
      >
        <Text
          style={{
            color: isDarkMode ? '#FFF' : '#4B0082',
            fontSize: 16,
          }}
        >
          Login with Phone OTP
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

export default Login;
