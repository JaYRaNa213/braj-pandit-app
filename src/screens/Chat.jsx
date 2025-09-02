import React, { useState } from 'react';
import { TextInput, View, StyleSheet, Button } from 'react-native';
import { useSocket } from '../context/SocketContext';

const Chat = () => {
	const [message, setMessage] = useState('');
	const { socket } = useSocket();
	const sendMessage = () => {
		if (socket) {
			socket.current.emit('sendMessage', { message });
		}
	};
	return (
		<View>
			<Button
				title="SendMsg"
				onPress={sendMessage}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
		color: 'black',
		fontSize: 16,
		borderColor: 'black',
		borderWidth: 1,
		height: 50,
		width: 200,
		margin: 100,
	},
});

export default Chat;
