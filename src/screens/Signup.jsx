import axios from 'axios';
import React, { useLayoutEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ToastAndroid, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../assets/constants/colors';
import { useDispatch, useSelector } from 'react-redux';
import { useSignUpMutation } from '../redux/api/userApi';
import { OtpInput } from 'react-native-otp-entry';
import { REACT_APP_BACKEND_URL } from '../utils/domain';
import { userExist } from '../redux/reducer/userReducer';
import { useTheme } from '../context/ThemeContext';

const Signup = () => {
	const [show, setShow] = useState(false);
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [password, setPassword] = useState('');
	const [userId, setUserId] = useState('');
	const { isDarkMode } = useTheme();

	const [loading, setLoading] = useState(false);
	const [OTP, setOTP] = useState('');

	const [isOtpSent, setIsOtpSent] = useState(false);

	const navigation = useNavigation();
	const { user } = useSelector((state) => state.user);
	const [signUp] = useSignUpMutation();
	const dispatch = useDispatch();

	const submitHandler = async () => {
		setLoading(true);
		if (!name || !email || !password) {
			ToastAndroid.show('Please fill email and password', ToastAndroid.SHORT);
			return;
		}
		if (phone && phone.length !== 10) {
			ToastAndroid.show('Phone number should be 10 digits', ToastAndroid.SHORT);
			return;
		}
		try {
			const url = '/user/register';
			let data = { name, email, password, phone, url };

			// // Include referralCode in the data object only if it exists
			// if (referralCode) {
			// 	data.referralCode = referralCode;
			// }

			const res = await signUp(data);

			if (res?.data?.userId) {
				ToastAndroid.show('Otp sent to your mail', ToastAndroid.SHORT);
				setUserId(res?.data?.userId);
				setIsOtpSent(true);
			}
			if (res?.error) {
				ToastAndroid.show(res?.error?.data?.message || 'Failed to register user', ToastAndroid.SHORT);
			}
		} catch (error) {
			ToastAndroid.show(res?.error?.data?.message || 'Failed to register user', ToastAndroid.SHORT);
		} finally {
			setLoading(false);
		}
	};

	const handleVerifyOtp = async (e) => {
		setLoading(true);

		try {
			const response = await axios.put(`${REACT_APP_BACKEND_URL}/user/verify-email-otp`, { otp: OTP, userId });

			if (response.data.success) {
				ToastAndroid.show('Your OTP has been successfully verified.', ToastAndroid.SHORT);

				const data = response.data;
				await AsyncStorage.setItem('token', data?.token);
				dispatch(
					userExist({
						user: data?.user,
						session: data?.session,
					})
				);
				navigation.navigate('Footer', { screen: 'Home' });
			} else {
				ToastAndroid.show(response.data.message || 'Please check the OTP and try again.', ToastAndroid.SHORT);
			}
		} catch (error) {
			ToastAndroid.show(error?.response?.data?.message || 'An error occurred. Please try again later.', ToastAndroid.SHORT);
		} finally {
			setLoading(false);
		}
	};

	useLayoutEffect(() => {
		navigation.setOptions({
			title: 'Vedaz',
			headerRight: () => (
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
			),
		});
	}, [navigation, user]);

	if (user) {
		navigation.navigate('Home');
		return null;
	}

	const inputStyles = {
		height: 50,
		borderWidth: 1,
		borderColor: '#dcdcdc',
		borderRadius: 10,
		paddingHorizontal: 15,
		marginBottom: 15,
		backgroundColor: '#ffffff',
		fontSize: 16,
	};

	return (
		<View
			style={{
				flex: 1,
				padding: 20,
				paddingTop: 50,
				// backgroundColor: '#fff',
				backgroundColor: isDarkMode ? '#222' : 'white',
			}}
		>
			{!isOtpSent ? (
				<>
					<Text
						style={{
							fontSize: 26,
							fontWeight: 'bold',
							textAlign: 'center',
							color: isDarkMode ? colors.lightGray : 'black',
							marginBottom: 30,
						}}
					>
						Create Your Account
					</Text>

					<TextInput
						style={[inputStyles, { color: isDarkMode ? '#EDEDED' : '#333' }]}
						placeholder="Enter Your Name"
						value={name}
						onChangeText={setName}
						backgroundColor={isDarkMode ? '#333' : '#FFF'}
						placeholderTextColor={isDarkMode ? '#AAAAAA' : '#999'}
					/>

					<TextInput
						style={[inputStyles, { color: isDarkMode ? '#EDEDED' : '#333' }]}
						placeholder="Enter Your Email"
						value={email}
						onChangeText={setEmail}
						keyboardType="email-address"
						backgroundColor={isDarkMode ? '#333' : '#FFF'}
						placeholderTextColor={isDarkMode ? '#AAAAAA' : '#999'}
					/>

					<TextInput
						style={[inputStyles, { color: isDarkMode ? '#EDEDED' : '#333' }]}
						placeholder="Enter Your Phone"
						value={phone}
						onChangeText={setPhone}
						keyboardType="phone-pad"
						backgroundColor={isDarkMode ? '#333' : '#FFF'}
						placeholderTextColor={isDarkMode ? '#AAAAAA' : '#999'}
					/>

					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							borderWidth: 1,
							borderColor: '#dcdcdc',
							borderRadius: 10,
							backgroundColor: isDarkMode ? '#333' : '#FFF',
							marginBottom: 20,
							paddingHorizontal: 15,
						}}
					>
						<TextInput
							style={{
								flex: 1,
								height: 50,
								fontSize: 16,
								color: isDarkMode ? '#EDEDED' : '#333',
							}}
							placeholder="Password"
							value={password}
							onChangeText={setPassword}
							secureTextEntry={!show}
							placeholderTextColor={isDarkMode ? '#AAAAAA' : '#999'}
						/>
						<TouchableOpacity onPress={() => setShow(!show)}>
							<AntDesign
								name={show ? 'eye' : 'eyeo'}
								size={24}
								color={isDarkMode ? '#AAAAAA' : '#999'}
							/>
						</TouchableOpacity>
					</View>

					<TouchableOpacity
						onPress={submitHandler}
						style={{
							backgroundColor: colors.purple,
							padding: 15,
							borderRadius: 10,
							marginTop: 10,
							alignItems: 'center',
							flexDirection: 'row',
							justifyContent: 'center',
							gap: 12,
						}}
					>
						<Text style={{ color: '#FFF', fontSize: 16 }}>Register Now</Text>
						{loading && (
							<ActivityIndicator
								size="small"
								color={'white'}
							/>
						)}
					</TouchableOpacity>

					<TouchableOpacity
						style={{ marginTop: 15 }}
						onPress={() => navigation.navigate('Login')}
					>
						<Text
							style={{
								color: isDarkMode ? 'white' : '#6A0DAD',
								textAlign: 'center',
								fontSize: 14,
								fontWeight: '500',
							}}
						>
							Already have an account? Log in
						</Text>
					</TouchableOpacity>
				</>
			) : (
				<View
					style={{ backgroundColor: isDarkMode ? '#222' : 'white' }}>
					<>
						<Text
							style={{
								marginBottom: 20,
								fontSize: 18,
								color: 'black',
								textAlign: 'center',
							}}
						>
							Enter 6 digit OTP sent to your mail
						</Text>

						<OtpInput
							numberOfDigits={6}
							focusColor="green"
							focusStickBlinkingDuration={500}
							onTextChange={(text) => setOTP(text)}
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
									borderColor: '#d3d3d3',
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
							disabled={loading}
						>
							<Text
								style={{
									color: 'white',
									fontSize: 15,
								}}
							>
								Confirm OTP
							</Text>
							{loading && (
								<ActivityIndicator
									color={'white'}
									size={'small'}
									style={{ marginLeft: 10 }}
								/>
							)}
						</Pressable>
					</>
				</View>
			)}
		</View>
	);
};

export default Signup;
