import React, { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Sound from 'react-native-sound';
import Video from 'react-native-video';
import { colors } from '../assets/constants/colors';
import { openFile } from '../utils/helper';

const RenderAttachment = ({ file, url, handleImageClick, isDarkMode }) => {
	const [soundInstance, setSoundInstance] = useState(null);
	const [isPlaying, setIsPlaying] = useState(false);

	const handleAudioPlay = () => {
		if (!soundInstance) {
			const sound = new Sound(url, Sound.MAIN_BUNDLE, (error) => {
				if (error) {
					console.error('Failed to load sound', error);
					return;
				}
				setSoundInstance(sound);
				sound.play(() => {
					sound.release();
					setIsPlaying(false);
				});
			});
		} else {
			soundInstance.play(() => {
				soundInstance.release();
				setSoundInstance(null);
				setIsPlaying(false);
			});
		}
		setIsPlaying(true);
	};

	const handlePauseAudio = () => {
		if (soundInstance) {
			soundInstance.pause();
			setIsPlaying(false);
		}
	};

	useEffect(() => {
		return () => {
			if (soundInstance) {
				soundInstance.release();
			}
		};
	}, [soundInstance]);

	// File type wise UI
	const renderAudio = () => (
		<View style={styles.audioContainer}>
			<TouchableOpacity
				style={styles.audioButton}
				onPress={isPlaying ? handlePauseAudio : handleAudioPlay}
			>
				<Ionicons
					name={isPlaying ? 'pause' : 'play'}
					size={24}
					color={isPlaying ? 'red' : 'green'}
				/>
			</TouchableOpacity>
		</View>
	);

	const renderVideo = () => (
		<Video
			source={{ uri: url }}
			style={styles.video}
			controls
			resizeMode="contain"
			onError={(error) => console.error('Video error:', error)}
		/>
	);

	const renderImage = () => (
		<TouchableOpacity onPress={() => handleImageClick(url)}>
			<Image
				source={{ uri: url }}
				style={styles.image}
			/>
		</TouchableOpacity>
	);

	const renderDocument = () => {
		const splittedURL = url.split('/');
		const name = splittedURL[splittedURL.length - 1];
		const splittedName = name.split('.');
		let documentName;
		if (splittedName[0].length < 12) { documentName = splittedName[0] + '.' + splittedName[1]; }
		else { documentName = splittedName[0].slice(0, 12) + '.........' + splittedName[1]; }
		return (<TouchableOpacity
			onPress={() => openFile(url)}
			style={styles.documentContainer}
		>
			<FontAwesome
				name="file-pdf-o"
				size={34}
				color={isDarkMode ? 'white' : 'black'}
			/>
			<Text style={[styles.documentText, { color: isDarkMode ? 'white' : 'black' }]}>
				{documentName}
			</Text>
		</TouchableOpacity>
		);
	};

	const renderDefault = () => (
		<MaterialIcons
			name="file-open"
			size={40}
			color="black"
		/>
	);

	const renderAttachment = () => {
		switch (file) {
			case 'audio':
				return renderAudio();
			case 'video':
				return renderVideo();
			case 'image':
				return renderImage();
			case 'document':
				return renderDocument();
			default:
				return renderDefault();
		}
	};

	return <View>{renderAttachment()}</View>;
};

const styles = StyleSheet.create({
	audioContainer: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	audioButton: {
		backgroundColor: colors.lightGray,
		borderRadius: 50,
		padding: 10,
	},
	video: {
		width: 200,
		height: 150,
	},
	image: {
		width: 160,
		height: 250,
		resizeMode: 'contain',
	},
	documentContainer: {
		padding: 12,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 12,
	},
	documentText: {
		fontSize: 12,
	},
});

export default RenderAttachment;
