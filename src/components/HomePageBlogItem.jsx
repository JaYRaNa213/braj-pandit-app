import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../assets/constants/colors';
import { useTheme } from '../context/ThemeContext';

const HomePageBlogItem = ({ blog }) => {
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  return (
    <TouchableOpacity
      style={{
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 8,
        overflow: 'hidden',
        width: 140,
        marginRight: 12,
      }}
      onPress={() => {
        navigation.navigate('BlogDetails', {
          url: blog?.url,
        });
      }}
    >
      <View>
        <Image
          source={{ uri: blog?.image }}
          style={{ width: '100%', height: 100, resizeMode: 'cover' }}
        />
      </View>
      <View style={{ padding: 6 }}>
        <Text
          style={{
            fontSize: 14,
            color: isDarkMode ? 'white' : colors.gray,
          }}
        >
          {blog.title.charAt(0).toUpperCase() +
            blog.title.slice(1).split('-').join(' ')}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default HomePageBlogItem;
