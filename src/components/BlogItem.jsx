import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../assets/constants/colors';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const BlogItem = ({ blog }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  return (
    <TouchableOpacity
      style={{
        marginBottom: 20,
        borderRadius: 14,
        overflow: 'hidden',
        width: '100%',
        backgroundColor: isDarkMode ? colors.darkSurface : 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 14,
        elevation: 4,
        flexDirection: 'row',
        height: 130,
      }}
      onPress={() => {
        navigation.navigate('BlogDetails', {
          url: blog?.url,
        });
      }}
    >
      <View>
        <Image
          source={{
            uri: blog?.image ? blog?.image : 'https://placehold.co/600x400',
          }}
          style={{ width: 130, height: 130, resizeMode: 'cover' }}
        />
      </View>
      <View
        style={{
          marginHorizontal: 8,
          marginTop: 8,
          padding: 8,
          maxWidth: '60%',
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: isDarkMode ? 'white' : colors.purple,
          }}
        >
          {blog?.title.charAt(0).toUpperCase() +
            blog?.title.slice(1).split('-').join(' ')}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: isDarkMode ? colors.darkTextSecondary : colors.dark,
            marginTop: 4,
            marginBottom: 8,
          }}
          numberOfLines={2}
        >
          {blog?.cardDescription}
        </Text>
        {/* <View style={{ alignItems: 'flex-end' }}>
          <TouchableOpacity
            style={{
              backgroundColor: 'purple',
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 4,
            }}
            onPress={() => {
              navigation.navigate('BlogDetails', {
                url: blog?.url,
              });
            }}
          >
            <Text style={{ fontSize: 12, color: 'white' }}>
              {t('blogs.read more')}
            </Text>
          </TouchableOpacity>
        </View> */}
      </View>
    </TouchableOpacity>
  );
};

export default BlogItem;
