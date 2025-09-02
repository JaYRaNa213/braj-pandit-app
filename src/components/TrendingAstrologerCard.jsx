import React, { act, useEffect, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { colors } from '../assets/constants/colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useChat } from '../context/ChatContext';
import { handleStartChatCall } from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

function TrendingAstrologerCard({ astrologer, rank, actionType }) {
  const { isDarkMode } = useTheme();
  const actionWord = actionType === 'chat' ? 'Chat' : 'Call';

  const {
    setCheckEligibilityLoading,
    setWaitListProps,
    openJoinWaitlistModal,
    setTopAstrologersConfig,
    openTopAstrologerModal,
    closeTopAstrologerModal,
  } = useChat();

  const { user } = useSelector((state) => state.user);

  const navigation = useNavigation();

  const handleChatCallBtnClick = async ({ action }) => {
    handleStartChatCall({
      action,
      astrologer,
      navigation,
      user,
      setCheckEligibilityLoading,
      setTopAstrologersConfig,
      openTopAstrologerModal,
      closeTopAstrologerModal,
      openJoinWaitlistModal,
      setWaitListProps,
    });
  };
  return (
    <Pressable
      style={[style.cardStyle,{
        backgroundColor:isDarkMode? colors.darkSurface:colors.lightBackground,
        borderColor: isDarkMode? colors.dark: colors.lightGray,
      }]}
      onPress={() =>
        navigation.navigate('AstrologerProfile', {
          id: astrologer._id,
          action: 'chat',
        })
      }
    >
      <Ionicons
        name="trophy-sharp"
        size={50}
        color={'gold'}
        style={{
          display: rank > 1 ? 'none' : 'flex',
          position: 'absolute',
          right: -5,
          top: -20,
        }}
      />

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          position: 'absolute',
          left: 5,
        }}
      >
        <FontAwesome
          name="hashtag"
          size={24}
          color={isDarkMode ? 'white' : '#FFA725'}
        />
        <Text style={{ fontSize: 24, color:isDarkMode? colors.darkTextPrimary:colors.dark }}>{rank}</Text>
      </View>

      <View style={{ alignItems: 'center' }}>
        <Image
          source={{ uri: astrologer?.image }}
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            borderColor: colors.purple,
            borderWidth: 3,
          }}
        />

        <View style={style.ratingAndOrders}>
          <Text style={[style.ratingAndOrdersText,{color:isDarkMode? colors.darkTextPrimary:colors.dark }]}>
            {parseInt(astrologer.rating, 10).toFixed(1)}
          </Text>
          <FontAwesome name="star" size={16} color="gold" />
        </View>

        <Text style={{ fontSize: 16,color:isDarkMode? colors.darkTextPrimary:colors.dark }}>
          {astrologer?.prefixName + ' ' + astrologer?.unique_name}
        </Text>

        <TouchableOpacity
          style={[style.actionButtons, { backgroundColor: colors.purple }]}
          onPress={() =>{
            if(user)
              {
                handleChatCallBtnClick({
                action: actionType,
                astrologer: astrologer,
                })
              }else
              {
                navigation.navigate('MobileLogin')
              }
            }
            
          }
        >
          <Text style={{ color: 'white' }}>Start {actionWord}</Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  );
}

export default TrendingAstrologerCard;

const style = StyleSheet.create({
  cardStyle: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    width: '45%',
    height: 170,
    position: 'relative',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 12,
  },

  ratingAndOrders: {
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
    marginVertical: 4,
  },
  ratingAndOrdersText: {
    color: colors.purple,
    fontSize: 14,
  },
});
