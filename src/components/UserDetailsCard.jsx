import React from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { useTheme } from '../context/ThemeContext';
import { KundliState } from '../context/KundliProvider';
import { colors } from '../assets/constants/colors';

const UserDetailsCard = ({ userDetail }) => {
	const navigation = useNavigation();
	const { isDarkMode } = useTheme();
	const { setName, setGender, setBirthdate, setBirthPlace, setBirthtime } = KundliState();

	const handleNavigate = () => {
		setName(userDetail?.name);
		setGender(userDetail?.gender);
		setBirthdate(userDetail?.birthDate);
		setBirthtime(userDetail?.birthTime);
		setBirthPlace(userDetail?.setBirthPlace);
		navigation.navigate('KundliDetails');
	};

	const editDetails = () => {
		setName(userDetail?.name);
		setGender(userDetail?.gender);
		setBirthdate(userDetail?.birthDate);
		setBirthtime(userDetail?.birthTime);
		setBirthPlace(userDetail?.setBirthPlace);
		navigation.navigate('KundliInputs');
	};

	return (
		<Pressable
			android_ripple={{
				color: isDarkMode ? colors.gray : colors.lightGray,
			}}
			style={{
				flexDirection: 'row',
				alignItems:'center',
				overflow: 'hidden',
				width: '98%',
				borderRadius: 14,
				backgroundColor: isDarkMode ? colors.darkSurface : colors.white,
				shadowColor: '#000',
				shadowOffset: { width: 2, height: 2 },
				shadowOpacity: 0.25,
				shadowRadius: 14,
				elevation: 4,
				padding: 16,
				marginBottom: 20,
			}}
			onPress={handleNavigate}
		>
			<View
				style={{
					backgroundColor: isDarkMode ? colors.darkAccent:colors.purple,
					width: 40,
					height: 40,
					borderRadius: 10000,
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<Text
					style={{
						color: isDarkMode ? colors.lightGray : 'white',
						fontSize: 16,
						fontWeight: 'bold',
					}}
				>
					{userDetail?.name?.slice(0, 1)[0]}
				</Text>
			</View>
			<View style={{ marginLeft: 20 }}>
				<Text
					style={{
						fontSize: 16,
						fontWeight: 'bold',
						color: isDarkMode ? colors.lightGray : colors.gray,
					}}
				>
					{userDetail?.name}
				</Text>
				<Text
					style={{
						color: isDarkMode ? colors.darkTextSecondary : colors.gray,
					}}
				>
					{moment(userDetail?.birthDate).format('DD MMM, YYYY')}
				</Text>
				<Text
					style={{
						color: isDarkMode ? colors.darkTextSecondary : colors.gray,
					}}
				>
					{moment(userDetail?.birthTime).format('hh:mm A')}
				</Text>
			</View>
			<TouchableOpacity
				onPress={editDetails}
				style={{ marginLeft: 'auto' }}
			>
				<FontAwesome
					name="edit"
					size={24}
					color={isDarkMode ? colors.lightGray : colors.gray}
				/>
			</TouchableOpacity>
		</Pressable>
	);
};

export default UserDetailsCard;
