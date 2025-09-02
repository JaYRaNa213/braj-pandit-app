import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { useTheme } from '../context/ThemeContext';
import { REACT_APP_BACKEND_URL } from '../utils/domain';

const YoutubeVideos = () => {
	const navigation = useNavigation();
	const [videoIds, setVideoIds] = useState([]);

	const { isDarkMode } = useTheme();

	useLayoutEffect(() => {
		navigation.setOptions({
			title: 'Vedaz Videos',
		});
	}, [navigation]);

	const fetchVideos = async () => {
		try {
			const { data } = await axios.get(`${REACT_APP_BACKEND_URL}/video/get`);
			setVideoIds(data?.videos);
		} catch (error) {
			console.log(error);
		}
	};
	useEffect(() => {
		fetchVideos();
	}, []);

	const renderItem = ({ item }) => (
		<View style={{ overflow: 'hidden', marginBottom: 20, borderRadius: 5 }}>
			<YoutubePlayer
				height={200}
				videoId={item?.videoId}
			/>
		</View>
	);

	return (
		<FlatList
			data={videoIds}
			renderItem={renderItem}
			keyExtractor={(item) => item?._id}
			contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 50, paddingVertical: 20, backgroundColor: isDarkMode ? '#222' : 'white' }}
		/>
	);
};

export default YoutubeVideos;
