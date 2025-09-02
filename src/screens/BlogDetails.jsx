import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import FontAwesome from 'react-native-vector-icons/FontAwesome'; // Import FontAwesome from expo/vector-icons
import { colors } from '../assets/constants/colors';
import { useTheme } from '../context/ThemeContext';
import { REACT_APP_BACKEND_URL } from '../utils/domain';
import WithSafeArea from '../components/HOC/SafeAreaView';

const BlogDetails = ({ route }) => {
  const url = route.params?.url;
  const navigation = useNavigation();
  const [blog, setBlog] = useState({});

  const { isDarkMode } = useTheme();
  let lang = 'en';

  const fetchBlogByUrl = async () => {
    try {
      const res = await axios.get(
        `${REACT_APP_BACKEND_URL}/blog/${url}?lang=${lang}`,
      );
      setBlog(res.data.data);
    } catch (error) {
      console.log('Error fetching all blogs ', error);
    }
  };

  const headerRight = () => (
    <TouchableOpacity
      onPress={() => {
        const message = `Check out this blog: ${
          blog?.title
        }\n\nRead more at: ${`https://www.vedaz.io/blogs/${blog?.url}`}`;
        const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(
          message,
        )}`;
        Linking.openURL(whatsappUrl);
      }}
      style={{
        marginRight: 15,
        backgroundColor: 'green',
        borderRadius: 34,
        width: 38,
        height: 38,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <FontAwesome name="whatsapp" size={24} color="white" />
    </TouchableOpacity>
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: (
        <Text style={{ fontSize: 16, textTransform: 'capitalize' }}>
          {blog?.category?.split('_').join(' ')}
        </Text>
      ),
      headerRight: () => headerRight(),
    });
  }, [url, blog, navigation, blog?.title]);

  useEffect(() => {
    fetchBlogByUrl();
  }, [url]);

  const markdownStyles = {
    body: {
      color: isDarkMode ? colors.darkTextSecondary : colors.dark,
    },
    heading1: {
      color: isDarkMode ? colors.darkTextPrimary : 'black',
      fontSize: 24,
      fontWeight: 'bold',
    },
    heading2: {
      color: isDarkMode ? colors.darkTextPrimary : 'black',
      fontSize: 20,
      fontWeight: 'bold',
    },
    heading3: {
      color: isDarkMode ? colors.darkTextPrimary : 'black',
      fontSize: 18,
      fontWeight: 'bold',
    },
    text: {
      color: isDarkMode ? colors.darkTextSecondary : colors.dark,
      fontSize: 16,
      textAlign: 'justify',
      width: '100%',
    },
    link: {
      color: isDarkMode ? '#ADD8E6' : '#0000EE', // Light blue for dark mode, default blue for light mode
    },
    listItem: {
      color: isDarkMode ? 'white' : 'black',
    },
  };

  return (
    <ScrollView
      style={{
        paddingHorizontal: 12,
        backgroundColor: isDarkMode ? colors.darkBackground : colors.lightBackground,
      }}
    >
      <View style={{ marginVertical: 12 }}>
        {blog && blog.title && blog.content ? (
          <>
            <Text
              style={{
                fontSize: 24,
                textTransform: 'capitalize',
                marginVertical: 12,
                fontWeight: 'bold',
                color:isDarkMode? colors.darkTextPrimary:colors.black,
              }}
            >
              {blog?.title}
            </Text>
            <Markdown style={markdownStyles} mergeStyle={false}>
              {blog?.content}
            </Markdown>
          </>
        ) : (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              backgroundColor: isDarkMode ? colors.darkBackground : colors.lightBackground,
              flex: 1,
            }}
          >
            <ActivityIndicator
              size={'large'}
              color={isDarkMode ? 'white' : colors.purple}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default WithSafeArea(BlogDetails);
