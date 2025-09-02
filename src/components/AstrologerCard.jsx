import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { colors } from '../assets/constants/colors';
import person from '../assets/images/person.jpg';
import { useChat } from '../context/ChatContext';
import { useTheme } from '../context/ThemeContext';
import { useGetAstroProfileQuery } from '../redux/api/astrologerApi';
import { handleStartChatCall } from '../utils/api';
import TestimonialCard from './TestimonialCard';

const AstrologerCard = ({
  astrologer,
  followBtnVisible,
  isFollowingPage,
  handleUnfollow,
  handleFollow,
  index,
}) => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.user);
  const navigation = useNavigation();

  const { isDarkMode } = useTheme();
  const {
    setCheckEligibilityLoading,
    setTopAstrologersConfig,
    openTopAstrologerModal,
    closeTopAstrologerModal,
    openJoinWaitlistModal,
    setWaitListProps,
  } = useChat();

  const { data: astrologerForTestimonial } = useGetAstroProfileQuery(
    astrologer?._id,
  );

  const onlineStatus =
    astrologer?.isOnlineForChat || astrologer?.isOnlineForCall
      ? 'online'
      : 'offline';

  const handleChatCallBtnClick = async (action) => {
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
  const handleNavigate = () => {
    closeTopAstrologerModal();
    navigation.navigate('AstrologerProfile', {
      id: astrologer._id,
      action: 'chat',
    });
  };

  const isSelectedTestimonial = (index) => {
    return (index + 1) % 3 === 0;
  };
  const waitTime = astrologer?.waitTime || 0;

  const taglineBgColor = () => {
    switch (astrologer?.tagline) {
      case 'Rising Star':
        return '#D63384';
      case 'Celebrity':
        return '#0F9D58';
      case 'Vedaz Choice':
        return '#6610F2';
      default:
        return '#6610F2';
    }
  };
  return (
    <View>
      {isSelectedTestimonial(index) && (
        <TestimonialCard astrologer={astrologerForTestimonial} />
      )}
      <Pressable
        style={[
          style.card,
          {
            borderColor: isDarkMode ? colors.dark : colors.lightGray,
            backgroundColor: isDarkMode ? colors.darkSurface : '#fff',
          },
        ]}
        onPress={handleNavigate}
      >
        {astrologer?.tagline && (
          <View
            style={[
              style.taglineContainer,
              { backgroundColor: taglineBgColor() },
            ]}
          >
            <Text style={style.taglineText}>⭐ {astrologer?.tagline}</Text>
          </View>
        )}

        <View style={style.detailesContainer}>
          {/* Profile Pic, OnlineStatus, Stars and order Container */}
          <View style={style.leftContainer}>
            <View style={{ position: 'relative' }}>
              {/* online Status */}
              <View
                style={[
                  style.onlineStatus,
                  {
                    backgroundColor:
                      onlineStatus === 'online' ? colors.lightGreen : 'red',
                  },
                ]}
              />
              {/* Profile Pic */}
              {astrologer.image ? (
                <Image
                  source={{ uri: astrologer.image }}
                  alt={astrologer.name}
                  style={style.profilePic}
                />
              ) : (
                <Image
                  source={person}
                  alt={astrologer.name}
                  style={style.profilePic}
                />
              )}
            </View>
            <View style={style.ratingAndOrders}>
              <Text
                style={[
                  style.ratingAndOrdersText,
                  { color: isDarkMode ? colors.white : colors.purple },
                ]}
              >
                {parseInt(astrologer.rating, 10).toFixed(1)}
              </Text>
              <FontAwesome name="star" size={12} color="gold" />
              <Text
                style={[
                  style.ratingAndOrdersText,
                  {
                    marginLeft: 6,
                    color: isDarkMode ? colors.white : colors.purple,
                  },
                ]}
              >{`${(astrologer.orders / 1000).toFixed(1)}K`}</Text>
              <FontAwesome
                name="shopping-cart"
                size={12}
                color={isDarkMode ? colors.white : colors.black}
              />
            </View>
            {/* Wait Time */}
            {astrologer?.waitTime > 0 && (
              <Text
                style={{
                  fontSize: 12,
                  color: 'red',
                }}
              >
                Wait Time - {astrologer?.waitTime} min
              </Text>
            )}
          </View>
          {/* Profile Information Container */}
          <View style={style.rightSide}>
            {/* Name */}
            <View style={{ flexDirection: 'row', gap: 2 }}>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[
                  style.name,
                  { color: isDarkMode ? 'white' : colors.purple },
                ]}
              >
                {astrologer.name}
              </Text>
              {followBtnVisible && (
                <TouchableOpacity onPress={() => handleFollow(astrologer)}>
                  <Text numberOfLines={1} style={style.followButtonText}>
                    {t('astrologers.card.follow')} +
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={style.astrologerDetailes}>
              <View style={{ gap: 2, width: '60%' }}>
                {/* Specialization */}
                <Text
                  style={{
                    fontSize: 13,
                    color: isDarkMode ? colors.lightGray : colors.gray,
                  }}
                >
                  {astrologer.specialization?.slice(0, 18)}
                  {astrologer.specialization?.length > 18 && ' ...'}
                </Text>
                {/* Language */}
                <Text
                  style={{
                    fontSize: 13,
                    color: isDarkMode ? colors.lightGray : colors.gray,
                  }}
                >
                  {astrologer.language?.slice(0, 18)}
                  {astrologer.language?.length > 18 && ' ...'}
                </Text>
                {/* Experience */}
                <Text
                  style={{
                    fontSize: 13,
                    color: isDarkMode ? colors.lightGray : colors.gray,
                  }}
                >
                  {t('astrologers.card.experience')}: {astrologer.experience}{' '}
                  {t('astrologers.card.years')}
                </Text>
                {/* Discount */}
                {astrologer?.discountedCharges ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: 6,
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        textDecorationLine: 'line-through',
                        color: isDarkMode ? colors.lightGray : colors.gray,
                        fontSize: 12,
                      }}
                    >
                      ₹ {astrologer?.charges}/{t('astrologers.card.min')}
                    </Text>
                    <Text
                      style={{
                        color: isDarkMode ? colors.lightGray : colors.gray,
                      }}
                    >
                      {' '}
                      ₹ {astrologer?.chargeAfterDiscount}/
                      {t('astrologers.card.min')}
                    </Text>
                  </View>
                ) : (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <Text
                      style={{
                        color: isDarkMode ? colors.lightGray : colors.gray,
                      }}
                    >
                      ₹ {astrologer?.charges}/{t('astrologers.card.min')}
                    </Text>
                  </View>
                )}
              </View>
              {/* Show Buttons --> 1. Follow Button --> Following Page,  2. Chat & Call Button for --> astrologer page   */}
              {isFollowingPage ? (
                <View style={style.buttonContainer}>
                  <TouchableOpacity
                    style={[style.button, { backgroundColor: '#EBD3F8' }]}
                    onPress={() => handleUnfollow(astrologer)}
                  >
                    <Text style={style.unfollowText}>
                      {t('astrologers.card.unfollow')}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={style.buttonContainer}>
                  {(astrologer?.isOnlineForChat ||
                    (!astrologer?.isOnlineForChat &&
                      !astrologer?.isOnlineForCall)) && (
                    <TouchableOpacity
                      style={[
                        style.button,
                        {
                          backgroundColor:
                            waitTime > 0 ? 'white' : colors.purple,
                          borderWidth: waitTime > 0 ? 1 : 0,
                          borderColor: waitTime > 0 ? 'red' : 'transparent',
                        },
                      ]}
                      onPress={() => handleChatCallBtnClick('chat')}
                    >
                      <Ionicons
                        name="chatbubble-ellipses-outline"
                        size={16}
                        color={waitTime > 0 ? 'red' : 'white'}
                      />
                      <Text
                        style={[
                          style.buttonText,
                          { color: waitTime > 0 ? 'red' : 'white' },
                        ]}
                      >
                        {t('extras.chat')}
                      </Text>
                    </TouchableOpacity>
                  )}
                  {(astrologer?.isOnlineForCall ||
                    (!astrologer?.isOnlineForChat &&
                      !astrologer?.isOnlineForCall)) && (
                    <TouchableOpacity
                      style={[
                        style.button,
                        {
                          backgroundColor:
                            waitTime > 0
                              ? 'white'
                              : isDarkMode
                              ? colors.darkGreen
                              : colors.lightGreen,
                          borderWidth: waitTime > 0 ? 1 : 0,
                          borderColor: waitTime > 0 ? 'red' : 'transparent',
                        },
                      ]}
                      onPress={() => handleChatCallBtnClick('call')}
                    >
                      <FontAwesome
                        name="phone"
                        size={16}
                        color={waitTime > 0 ? 'red' : 'white'}
                      />
                      <Text
                        style={[
                          style.buttonText,
                          { color: waitTime > 0 ? 'red' : 'white' },
                        ]}
                      >
                        {t('extras.call')}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );
};

const style = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1.5,
    position: 'relative',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taglineContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderBottomRightRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    zIndex: 1000,
  },
  taglineText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.5,
  },

  detailesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  leftContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '28%',
  },
  onlineStatus: {
    width: 12,
    height: 12,
    borderRadius: 1000,
    position: 'absolute',
    right: 0,
    bottom: 10,
    zIndex: 1000,
  },
  profilePic: {
    width: 70,
    height: 70,
    borderRadius: 100,
    marginTop: 16,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginVertical: 4,
  },
  rightSide: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '72%',
    gap: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
    textTransform: 'capitalize',
    width: 160,
  },
  followButtonText: {
    textAlign: 'center',
    fontSize: 12,
    color: 'green',
    fontWeight: '700',
  },
  astrologerDetailes: {
    flexDirection: 'row',
    width: '100%',
  },
  astrologerCharges: {
    fontSize: 14,
  },
  unfollow: {
    fontSize: 12,
    marginLeft: 5,
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingHorizontal: 6,
    width: '40%',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignSelf: 'flex-end',
    width: 80,
  },
  buttonText: {
    fontSize: 14,
    marginLeft: 5,
    color: 'white',
  },
  ratingAndOrders: {
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    gap: 2,
    marginVertical: 4,
  },
  ratingAndOrdersText: {
    fontSize: 14,
  },
});

export default AstrologerCard;
