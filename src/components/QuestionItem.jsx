import FastImage from '@d11/react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { colors } from '../assets/constants/colors';
import person from '../assets/images/person.jpg';
import { useTheme } from '../context/ThemeContext';

const QuestionItem = ({ question, astrologerName, astrologerImage }) => {
  const { isDarkMode } = useTheme();
  const { user } = useSelector((state) => state.user);
  const navigation = useNavigation();

  const replyText =
    question?.reply?.reply?.length > 200
      ? question?.reply?.reply?.slice(0, 200)
      : question?.reply?.reply;

  const handleQuestionPress = () => {
    if (!user) {
      return navigation.navigate('MobileLogin');
    }
    navigation.navigate('CommunityQuestion', {
      questionId: question?.question?._id,
    });
  };

  return (
    <Pressable
      onPress={handleQuestionPress}
      style={{
        borderRadius: 10,
        marginBottom: 10,
        padding: 10,
        backgroundColor: isDarkMode ? colors.darkSurface : colors.white,
      }}
    >
      <View style={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
        {/* Question User Info */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 5,
          }}
        >
          <FastImage
            source={{ uri: question?.question?.user?.pic }}
            style={{ width: 30, height: 30, borderRadius: 20, marginLeft: 5 }}
          />
          <View style={{ justifyContent: 'center' }}>
            <Text
              style={{
                color: isDarkMode ? colors.lightGray : '#4B3F72',
                fontWeight: 'bold',
                fontSize: 18,
                textAlign: 'justify',
              }}
            >
              {question?.question?.user?.name}
            </Text>
          </View>
        </View>

        {/* Question */}
        <View>
          <Text
            style={{
              color: isDarkMode ? colors.darkTextSecondary : colors.dark,
              fontSize: 16,
              lineHeight: 22,
              paddingHorizontal: 5,
              fontWeight: 700,
              textAlign: 'justify',
            }}
          >
            {question?.question?.title} ?
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'column', gap: 5 }}>
        {/* Reply User Info */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          {astrologerImage ? (
            <Image
              source={{ uri: astrologerImage }}
              alt={astrologerName}
              style={{
                width: 30,
                height: 30,
                borderRadius: 100,
              }}
            />
          ) : (
            <Image
              source={person}
              alt={astrologerName}
              style={{
                width: 30,
                height: 30,
                borderRadius: 100,
              }}
            />
          )}
          <View style={{ justifyContent: 'center', marginLeft: 5 }}>
            <Text
              style={{
                color: isDarkMode ? colors.darkTextPrimary : colors.dark,
                fontWeight: 'bold',
                fontSize: 16,
                textAlign: 'center',
              }}
            >
              {astrologerName}
            </Text>
          </View>
        </View>

        {/* Reply */}
        <View>
          <Text
            style={{
              color: isDarkMode ? colors.darkTextPrimary : colors.dark,
              fontSize: 14,
              lineHeight: 22,
              paddingHorizontal: 5,
              fontWeight: 500,
              textAlign: 'justify',
              marginTop: 5,
            }}
          >
            {replyText
              ?.split('#')
              .filter((text) => text.trim() !== '')
              .map((text) => (
                <Text
                  key={text}
                  style={{
                    fontSize: 14,
                    color: isDarkMode ? colors.darkTextSecondary : colors.dark,
                    lineHeight: 20,
                    marginBottom: 8,
                  }}
                >
                  {text.trim()}
                </Text>
              ))}
            ...Read More
          </Text>
        </View>

        <View
          style={{
            borderWidth: 0.5,
            borderColor: isDarkMode ? colors.dark : colors.lightGray,
            marginTop: 10,
          }}
        />
      </View>
    </Pressable>
  );
};

export default QuestionItem;
