import React from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { colors } from '../assets/constants/colors';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useChat } from '../context/ChatContext';
import { useGetAstroProfileQuery } from '../redux/api/astrologerApi';
import { useSocket } from '../context/SocketContext';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
const IncomingChatReqestPopup = () => {
	const { socket, timerForUserTimeId } = useSocket();
	const { setRequestedAstroId, setUserIdRequestedChat, setIsChatRequested, requestedAstroId, setshowUserSideChatPopUp, setDelayTiming, setShowIncomingChatPopUp } = useChat();
	const { user } = useSelector((state) => state.user);

	const { data: astrologer } = useGetAstroProfileQuery(requestedAstroId);
	const navigation = useNavigation();
	const handleStartChat = () => {
		setShowIncomingChatPopUp(false);
		navigation.navigate('ActiveChat', {
			astroId: requestedAstroId,
		});
	};
	const handleRejectChat = () => {
		setShowIncomingChatPopUp(false);
		if (timerForUserTimeId.current) {
			clearInterval(timerForUserTimeId.current);
			timerForUserTimeId.current = null;
		}
		setRequestedAstroId(null);
		setUserIdRequestedChat(null);
		setIsChatRequested(false);
		socket.current.emit('chatCancel', {
			astroId: requestedAstroId,
			userId: user?._id,
		});
		setDelayTiming(null);
		setshowUserSideChatPopUp(false);
	};
	return (
		<View
			style={{
				flex: 1,
				backgroundColor: '#fff',
				position: 'absolute',
				width: '100%',
				height: '100%',
				alignItems: 'center',
			}}
		>
			<View
				style={{
					margin: 80,
					justifyContent: 'space-between',
					flex: 1,
				}}
			>
				<View
					style={{
						alignItems: 'center',
					}}
				>
					<Text
						style={{
							fontSize: 16,
						}}
					>
						Incoming Chat Request from
					</Text>
					<Text
						style={{
							fontSize: 22,
							marginTop: 12,
							fontWeight: '500',
							color: colors.purple,
						}}
					>
						Vedaz
					</Text>
				</View>
				<View
					style={{
						alignItems: 'center',
					}}
				>
					<Image
						height={120}
						width={120}
						style={{
							borderRadius: 9999,
						}}
						source={{ uri: astrologer?.image || 'image' }}
					/>
					<Text
						style={{
							marginTop: 12,
							fontSize: 24,
						}}
					>
						{astrologer?.name}
					</Text>
				</View>

				<View
					style={{
						alignItems: 'center',
					}}
				>
					<TouchableOpacity
						style={{
							backgroundColor: 'green',
							paddingHorizontal: 38,
							paddingVertical: 14,
							flexDirection: 'row',
							gap: 14,
							borderRadius: 28,
							alignItems: 'center',
						}}
						onPress={handleStartChat}
					>
						<AntDesign
							name='wechat'
							size={24}
							color='white'
						/>
						<Text
							style={{
								fontSize: 20,
								color: 'white',
							}}
						>
							Start Chat
						</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={handleRejectChat}>
						<Text
							style={{
								marginTop: 28,
								color: 'red',
							}}
						>
							Reject Chat Request
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
};

export default IncomingChatReqestPopup;
