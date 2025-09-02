import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../context/ThemeContext';
import person from '../assets/images/person.jpg';
import FastImage from '@d11/react-native-fast-image';
import { colors } from '../assets/constants/colors';

const QuestionItemCompact = ({
  setIsCommunityExpanded,
  question,
  astrologerName,
  astrologerImage,
}) => {
  const { isDarkMode } = useTheme();
  const replyText =
    question?.reply?.reply?.length > 130
      ? question?.reply?.reply?.slice(0, 130)
      : question?.reply?.reply;

  return (
    <Pressable
      onPress={() => {
        setIsCommunityExpanded(true);
      }}
      style={{
        borderRadius: 10,
        marginBottom: 5,
        paddingHorizontal: 10,
        backgroundColor: isDarkMode ? colors.darkSurface : colors.white,
      }}
    >
      <View
        style={{
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          marginBottom: 10,
        }}
      >
        {/* Question User Info */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 5,
          }}
        >
          <FastImage
            style={{ width: 30, height: 30, borderRadius: 20, marginLeft: 5 }}
            source={{ uri: question?.question?.user?.pic }}
          />
          <View style={{ justifyContent: 'center' }}>
            <Text
              style={{
                color: isDarkMode ? colors.lightGray : '#4B3F72',
                fontWeight: 'bold',
                fontSize: 16,
                textAlign: 'justify',
                marginLeft:5
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
              marginTop:5
            }}
          >
            {question?.question?.title} ?
          </Text>
        </View>
      </View>

      {/* Reply Section */}
      <View
        style={{
          flexDirection: 'column',
          gap: 5,
          marginLeft: 30,
        }}
      >
        {/*Astro Pic and name*/}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}
        >
          {astrologerImage ? (
            <FastImage
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

          <Text
            style={{
              fontWeight: 'bold',
              marginLeft: 5,
              fontSize: 16,
              color: isDarkMode ? colors.darkTextPrimary : colors.dark, // Optional: a highlight color for "Reply"
            }}
          >
            {astrologerName}
          </Text>
        </View>

        {/*Reply*/}
        <View>
          <Text
            style={{
              color: isDarkMode ? colors.darkTextPrimary : colors.dark,
              fontSize: 14,
              lineHeight: 22,
              paddingHorizontal: 5,
              fontWeight: 500,
              textAlign: 'justify',
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
                    textAlign: 'justify',
                  }}
                >
                  {text.trim()}
                </Text>
              ))}
            ...Read More
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

export default QuestionItemCompact;
