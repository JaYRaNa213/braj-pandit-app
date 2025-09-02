import React from 'react';
import { Dimensions, Image, Pressable, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../context/ThemeContext';
import person from '../assets/images/person.jpg';
import { colors } from '../assets/constants/colors';
import FastImage from '@d11/react-native-fast-image';

const ReviewItemCompact = ({ review,setIsReviewsExpanded }) => {
  const { isDarkMode } = useTheme();
  const reviewDesc=review?.description?.length>100 ?  review?.description?.slice(0,100):review?.description;

  return (
    <View
      style={{
        borderRadius: 10,
        marginBottom: 10,
        width: '100%',
        padding:5,
        backgroundColor: isDarkMode ? colors.darkSurface : 'white',
        flexDirection:'row',
      }}
    >

         {/* Reviewer Info */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width:'20%'
        }}
      >
        <View style={{flexDirection:'column',alignItems:'center'}}>
        <FastImage
          style={{ width: 40, height: 40, borderRadius: 20,marginLeft:5,margin:5}}
          source={{uri:review?.image}}
        />
          <Text
            style={{
              fontSize:16,
              color: isDarkMode ? '#FFF' : '#4B3F72',
              fontWeight: 'bold',
              textAlign:'center'
            }}
          >
            {review?.name}
          </Text>
        </View>
      </View>

      {/* Review Text */}
      <Pressable style={{width:'80%'}} onPress={()=>{setIsReviewsExpanded(true)}}>
            <Text style={{  color: isDarkMode ? colors.darkTextSecondary : colors.dark,
               textAlign:'justify' }}>
            {reviewDesc}...<Text style={{color:isDarkMode ? colors.darkAccent : colors.purple}}>Read More</Text>
          </Text>

          <View style={{ flexDirection: 'row',justifyContent:'flex-end', alignItems: 'center',marginTop:5 }}>
            {[...Array(review?.rating)].map((_, index) => (
              <FontAwesome
                key={index}
                name="star"
                size={16}
                color={isDarkMode ? '#FFD700' : '#FFA725'}
              />
            ))}
          </View>
      </Pressable>
    </View>
  );
};

export default ReviewItemCompact;
