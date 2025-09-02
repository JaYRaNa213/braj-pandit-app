import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../assets/constants/colors';
import { useTheme } from '../context/ThemeContext';

const TempleItem = ({ temple }) => {
  // const [currentIndex, setCurrentIndex] = useState(0);
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();

  const handlePress = () => {
    navigation.navigate('TempleDetails', { title: temple?.url });
  };

  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        marginVertical: 6,
        width: Dimensions.get('window').width - 32,
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: isDarkMode ? colors.darkSurface : colors.lightBackground,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.dark : colors.lightGray,
      }}
      android_ripple={{
        color: isDarkMode ? colors.darkSurface : colors.lightGray,
      }}
      onPress={handlePress}
    >
      <View style={{ height: 130 }}>
        {/* {temple?.image.length > 1 ? (
          <FlatList
            data={temple?.image}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('TempleDetails', { title: temple?.title })
                }
                activeOpacity={1}
              >
                <Image
                  source={{
                    uri: item
                      ? item.replace(/\s/g, '')
                      : 'https://placehold.co/600x400',
                  }}
                  style={{
                    width: Dimensions.get('window').width - 32,
                    height: 220,
                    resizeMode: 'cover',
                  }}
                />
              </TouchableOpacity>
            )}
            onScroll={(event) => {
              const slideIndex = Math.round(
                event.nativeEvent.contentOffset.x /
                  Dimensions.get('window').width,
              );
              setCurrentIndex(slideIndex);
            }}
          />
        ) : (
          <Image
            source={{
              uri: temple?.image[0]
                ? temple?.image[0]
                : 'https://placehold.co/600x400',
            }}
            style={{
              width: Dimensions.get('window').width - 32,
              height: 220,
              resizeMode: 'cover',
            }}
          />
        )} */}
        <Image
          source={{
            uri: temple?.image[0]
              ? temple?.image[0].replace(/\s/g, '')
              : 'https://placehold.co/600x400',
          }}
          style={{
            width: 130,
            height: 130,
            resizeMode: 'cover',
          }}
        />
        {/* <View
          style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            paddingHorizontal: 8,
            borderRadius: 4,
          }}
        >
          <Text style={{ color: '#fff' }}>
            {currentIndex + 1}/{temple?.image.length}
          </Text>
        </View> */}
      </View>
      <View style={{ margin: 8, maxWidth: '60%' }}>
        <Text
          style={{
            fontSize: 16,
            color: isDarkMode ? colors.darkTextPrimary : colors.black,
            fontWeight: 'bold',
            textAlign: 'left',
            marginBottom: 4,
          }}
        >
          {temple?.title
            .split('-')
            .map((item) => item[0]?.toUpperCase() + item.substring(1))
            .join(' ')}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: isDarkMode ? colors.darkTextSecondary : colors.dark,
            fontWeight: '500',
            marginBottom: 4,
          }}
        >
          {temple?.location}
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: isDarkMode ? colors.darkTextSecondary : colors.dark,
            lineHeight: 20,
          }}
        >
          {temple?.overview?.slice(0, 60)}...
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default TempleItem;
