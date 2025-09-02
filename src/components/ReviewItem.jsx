import React from 'react';
import { Image, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../context/ThemeContext';
import person from '../assets/images/person.jpg';
import FastImage from '@d11/react-native-fast-image';
import { colors } from '../assets/constants/colors';

const ReviewItem = ({ review, astrologerName, astrologerImage }) => {
  const { isDarkMode } = useTheme();
  const reply = review.reply;

  return (
    <View
      style={{
        borderRadius: 10,
        marginBottom: 10,
        width: '100%',
        padding:10,
        backgroundColor: isDarkMode ? colors.darkSurface : 'white'
      }}
    >

         {/* Reviewer Info */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start'
        }}
      >
        <FastImage
          source={{ uri: review?.image }}
          style={{ width: 50, height: 50, borderRadius: 25, margin:5, marginLeft:5}}
        />
        <View style={{ marginLeft: 5, marginTop:10, 
                    marginBottom:5, justifyContent:'center'}}>
          <Text
            style={{
              color: isDarkMode ? '#FFF' : '#4B3F72',
              fontWeight: 'bold',
            }}
          >
            {review?.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center',marginTop:5 }}>
            {[...Array(Math.round(review?.rating))].map((_, index) => (
              <FontAwesome
                key={index}
                name="star"
                size={16}
                color={isDarkMode ? '#FFD700' : '#FFA725'}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Review Text */}
      <View style={{paddingVertical:4}}>
            <Text style={{ color: isDarkMode ? colors.lightGray : colors.black, marginBottom: 10, textAlign:'justify' }}>
            {review?.description}
          </Text>
      </View>
      
      {/* Reply Section */}
      {reply && (
        <View style={{flexDirection:'row', justifyContent:'flex-end'}}>
        <View
          style={{
            borderColor: isDarkMode ? '#999' : '#555',
            flexDirection: 'row',
            gap: 12,
          }}
        >
          <View>
            {astrologerImage ? (
              <Image
                source={{ uri: astrologerImage }}
                alt={astrologerName}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 100,
                  marginTop: 10,
                }}
              />
              ) : (
                <Image
                  source={person}
                  alt={astrologerName}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 100,
                  }}
                />
              )}
          </View>
          <View>
            <Text
              style={{
                fontWeight: 'bold',
                marginBottom: 5,
                color: isDarkMode ? '#FFD700' : '#4B3F72', // Optional: a highlight color for "Reply"
              }}
            >
              {astrologerName}
            </Text>
            <Text style={{ color: isDarkMode ? colors.darkTextSecondary : colors.dark}}>
              {reply}
            </Text>
          </View>
        </View>
        </View>
      )}
    </View>
  );
};

export default ReviewItem;
