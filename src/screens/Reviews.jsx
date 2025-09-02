import React, { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useGetAstroProfileQuery } from '../redux/api/astrologerApi';
import { useTheme } from '../context/ThemeContext';
import ReviewItem from '../components/ReviewItem';
import { colors } from '../assets/constants/colors';

const Reviews = ({ route, navigation }) => {
	const id = route?.params?.astroId;
	const { data, isLoading } = useGetAstroProfileQuery(id);

	const { isDarkMode } = useTheme();

	useEffect(() => {
		if (!isLoading && data?.name) {
			navigation.setOptions({ title: <Text style={{ textTransform: 'capitalize' }}>Reviews of {data?.name}</Text> });
		}
	}, [data, isLoading, navigation]);

	if (isLoading) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<Text>Loading...</Text>
			</View>
		);
	}

	return (
		<ScrollView style={{ paddingHorizontal: 12, backgroundColor: isDarkMode ? colors.darkBackground : colors.lightBackground }}>
			<View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 12 }}>
				{data?.reviews?.map((item, index) => (
					<ReviewItem
						review={item}
						key={index}
						astrologerName={data?.name}
						astrologerImage={data?.image}
					/>
				))}
			</View>
		</ScrollView>
	);
};

export default Reviews;
