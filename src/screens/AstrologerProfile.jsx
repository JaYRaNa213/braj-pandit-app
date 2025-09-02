import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Image,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { colors } from '../assets/constants/colors';
import person from '../assets/images/person.jpg';
import AstrologerCardSmall from '../components/AstrologerCardSmall';
import FreeAstrologersBtn from '../components/FreeAstrologersBtn';
import GalleryModal from '../components/GalleryModal';
import WithSafeArea from '../components/HOC/SafeAreaView';
import ImageModal from '../components/ImageModal';
import QuestionItem from '../components/QuestionItem';
import QuestionItemCompact from '../components/QuestionItemCompact';
import ReviewItem from '../components/ReviewItem';
import ReviewItemCompact from '../components/ReviewItemCompact';
import { useChat } from '../context/ChatContext';
import { useTheme } from '../context/ThemeContext';
import { useGetAstroProfileQuery } from '../redux/api/astrologerApi';
import {
  useFollowAstrologerMutation,
  useUnfollowAstrologerMutation,
} from '../redux/api/userApi';
import { handleStartChatCall } from '../utils/api';
import axiosInstance from '../utils/axiosInstance';

const AstrologerProfile = ({ route, navigation }) => {
  const { t } = useTranslation();
  const [showMore, setShowMore] = useState(false);
  const [isReviewsExpanded, setIsReviewsExpanded] = useState(false);
  const [isCommunityExpanded, setIsCommunityExpanded] = useState(false);
  const [replies, setReplies] = useState([]);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [isGalleryModalVisible, setIsGalleryModalVisible] = useState(false);
  const [similarAstrologers, setSimilarAstrologers] = useState([]);
  const [imageUrl, setImageUrl] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { id } = route?.params;
  const [isFollowingPage, setIsFollowingPage] = useState(
    user?.following?.includes(astrologer?._id),
  );

  const { isDarkMode } = useTheme();
  const { user } = useSelector((state) => state.user);
  const {
    data: astrologer,
    isLoading,
    refetch: refetchAstro,
  } = useGetAstroProfileQuery(id);
  const [followAstrologer] = useFollowAstrologerMutation();
  const [unfollowAstrologer] = useUnfollowAstrologerMutation();
  const {
    setRefetch,
    refetch,
    setCheckEligibilityLoading,
    setTopAstrologersConfig,
    openTopAstrologerModal,
    closeTopAstrologerModal,
    openJoinWaitlistModal,
    setWaitListProps,
  } = useChat();

  const handleImageClick = (url) => {
    setImageUrl(url);
    setIsImageModalVisible(true);
  };

  const astroState = astrologer?.state?.toLowerCase()?.split(/\s+/).join('-');
  const astroCity = astrologer?.city?.toLowerCase()?.split(/\s+/).join('-');
  const link = astroState
    ? `astrologers/best-astrologer-in-${astroCity}-${astroState}/${astrologer?.unique_name}`
    : `astrologers/best-astrologer/${astrologer?.unique_name}`;

  const headerRight = () => (
    <TouchableOpacity
      onPress={() => {
        const message = `🌟 Discover ${astrologer?.name}, an expert astrologer on Vedaz! Specializing in ${astrologer?.specialization}, they offer amazing insights. Connect with them now at: https://www.vedaz.io/${link} - Check out their profile now!`;
        const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(
          message,
        )}`;
        Linking.openURL(whatsappUrl);
      }}
      style={{
        marginRight: 15,
        backgroundColor: 'white',
        borderRadius: 16,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 12,
      }}
    >
      <FontAwesome name="whatsapp" size={20} color="green" />
      <Text style={{ color: 'green' }}>Share</Text>
    </TouchableOpacity>
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: (
        <Text style={{ textTransform: 'capitalize' }}>{astrologer?.name}</Text>
      ),
      headerRight: () => headerRight(),
    });
  }, [navigation, astrologer]);

  useEffect(() => {
    if (astrologer) {
      fetchQuestionsReplies();
      fetchSimilarAstrologers();
    }
  }, [navigation, astrologer]);

  const fetchSimilarAstrologers = async () => {
    try {
      const { data } = await axiosInstance.get(
        `/astro/similar?expertise=${astrologer?.expertise
          ?.split(',')
          .map((item) => item.trim())
          .join('-')}&id=${astrologer?._id}`,
      );
      setSimilarAstrologers(data);
    } catch (error) {
      console.log('Error fetching all astrolgoers ', error);
    }
  };

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

  const toggleReview = () => {
    setIsReviewsExpanded(!isReviewsExpanded);
  };

  const toggleCommunity = () => {
    setIsCommunityExpanded(!isCommunityExpanded);
  };

  if (isLoading) {
    return (
      <View
        style={{
          paddingTop: 20,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: isDarkMode ? '#222' : 'white',
          flex: 1,
        }}
      >
        <ActivityIndicator
          size={'large'}
          color={isDarkMode ? 'white' : colors.purple}
        />
      </View>
    );
  }

  const handleFollow = async () => {
    if (!user) {
      ToastAndroid.show(
        'Login to follow your favourite astrolgoer',
        ToastAndroid.SHORT,
      );
      return navigation.navigate('MobileLogin');
    }
    try {
      const res = await followAstrologer({
        userId: user?._id,
        astroId: astrologer._id,
      });

      if (res.data) {
        ToastAndroid.show(
          `You followed ${astrologer?.name}, successfully`,
          ToastAndroid.SHORT,
        );

        setIsFollowingPage(true);
      }
      if (res.error) {
        ToastAndroid.show(
          `Error in following ${astrologer?.name}`,
          ToastAndroid.SHORT,
        );
        console.log(res.error);
      }
    } catch (error) {
      ToastAndroid.show(
        `Error in following ${astrologer?.name}`,
        ToastAndroid.SHORT,
      );
      console.log(error);
    } finally {
      setRefetch(!refetch);
    }
  };

  const handleUnFollow = async () => {
    if (!user) {
      ToastAndroid.show(
        'Login to follow your favourite astrolgoer',
        ToastAndroid.SHORT,
      );
      return navigation.navigate('MobileLogin');
    }
    try {
      const res = await unfollowAstrologer({
        userId: user?._id,
        astroId: astrologer._id,
      });

      if (res.data) {
        ToastAndroid.show(
          `You unfollowed ${astrologer?.name}, successfully`,
          ToastAndroid.SHORT,
        );
        setIsFollowingPage(false);
      }
      if (res.error) {
        ToastAndroid.show(
          `Error in unfollowing ${astrologer?.name}`,
          ToastAndroid.SHORT,
        );
        console.log(res.error);
      }
    } catch (error) {
      ToastAndroid.show(
        `Error in unfollowing ${astrologer?.name}`,
        ToastAndroid.SHORT,
      );
      console.log(error);
    } finally {
      setRefetch(!refetch);
    }
  };

  const toggleFollow = () => {
    if (isFollowingPage) {
      handleUnFollow();
    } else {
      handleFollow();
    }
  };

  const fetchQuestionsReplies = async () => {
    try {
      const res = await axiosInstance.get(
        `/reply/questionAnsByAstro/${astrologer._id}`,
      );

      if (res?.data?.success) {
        setReplies(res?.data?.data);
      } else {
        ToastAndroid.show(
          'Error in fetching questions and replies',
          ToastAndroid.SHORT,
        );
      }
    } catch (error) {
      ToastAndroid.show('Something went wrong', ToastAndroid.SHORT);
      console.log(error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setRefetch(!refetch);
    refetchAstro();
    setRefreshing(false);
  };

  const onlineStatus =
    astrologer?.isOnlineForChat || astrologer?.isOnlineForCall
      ? 'online'
      : 'offline';

  return (
    <>
      <View
        style={{
          flex: 1,
          backgroundColor: isDarkMode
            ? colors.darkBackground
            : colors.lightBackground,
          paddingHorizontal: 12,
          paddingTop: 10,
          paddingBottom: 10,
        }}
      >
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={isDarkMode ? 'white' : colors.purple}
            />
          }
        >
          {/*Astro Card*/}
          <View
            style={{
              backgroundColor: isDarkMode
                ? colors.darkSurface
                : colors.lightBackground,
              paddingVertical: 5,
              borderRadius: 10,
              borderWidth: 0.5,
              borderColor: isDarkMode ? colors.dark : colors.lightGray,
            }}
          >
            <View style={styles.detailesContainer}>
              {/* Profile Pic, OnlineStatus, Stars and order Container */}
              <View style={styles.leftContainer}>
                <View style={{ position: 'relative' }}>
                  {/* online Status */}
                  <View
                    style={[
                      styles.onlineStatus,
                      {
                        backgroundColor:
                          onlineStatus === 'online' ? colors.lightGreen : 'red',
                      },
                    ]}
                  />
                  {/* Profile Pic */}
                  {astrologer.image ? (
                    <Image
                      source={{ uri: astrologer?.image }}
                      alt={astrologer?.name}
                      style={styles.profilePic}
                    />
                  ) : (
                    <Image
                      source={person}
                      alt={astrologer?.name}
                      style={styles.profilePic}
                    />
                  )}
                </View>
                <View style={styles.ratingAndOrders}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text
                      style={[
                        styles.ratingAndOrdersText,
                        {
                          borderColor: isDarkMode
                            ? colors.darkAccent
                            : colors.purple,
                          color: isDarkMode ? colors.darkAccent : colors.purple,
                        },
                      ]}
                    >
                      {parseInt(astrologer.rating, 10).toFixed(1)}
                    </Text>
                    <View
                      style={{
                        backgroundColor: isDarkMode
                          ? colors.darkAccent
                          : colors.purple,
                        borderTopRightRadius: 12,
                        borderBottomRightRadius: 12,
                        paddingHorizontal: 5,
                        paddingVertical: 5,
                      }}
                    >
                      <FontAwesome name="star" size={16} color="gold" />
                    </View>
                  </View>
                </View>
              </View>
              {/* Profile Information Container */}
              <View style={styles.rightSide}>
                {/* Name */}
                <View style={{ flexDirection: 'row', gap: 2 }}>
                  <Text
                    style={[
                      styles.name,
                      { color: isDarkMode ? colors.white : colors.purple },
                    ]}
                  >
                    {astrologer.name}
                  </Text>
                </View>
                <View style={styles.astrologerDetailes}>
                  <View style={{ gap: 2 }}>
                    {/* Specialization */}
                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: 14,
                        color: isDarkMode
                          ? colors.darkTextSecondary
                          : colors.gray,
                        maxWidth: 200,
                        textTransform: 'capitalize',
                      }}
                    >
                      {astrologer.specialization?.slice(0, 18)}
                    </Text>
                    {/* Language */}
                    <Text
                      style={{
                        fontSize: 14,
                        color: isDarkMode
                          ? colors.darkTextSecondary
                          : colors.gray,
                      }}
                    >
                      {astrologer.language}
                    </Text>
                    {/* Experience */}
                    <Text
                      style={{
                        fontSize: 14,
                        color: isDarkMode
                          ? colors.darkTextSecondary
                          : colors.gray,
                      }}
                    >
                      {t('astrologers.card.experience')}:{' '}
                      {astrologer.experience} {t('astrologers.card.years')}
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
                            color: isDarkMode
                              ? colors.darkTextSecondary
                              : colors.gray,
                            fontSize: 14,
                          }}
                        >
                          ₹ {astrologer?.charges}/{t('astrologers.card.min')}
                        </Text>
                        <Text
                          style={{
                            color: isDarkMode
                              ? colors.darkTextSecondary
                              : colors.gray,
                            fontSize: 14,
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
                            color: isDarkMode
                              ? colors.darkTextSecondary
                              : colors.gray,
                            fontSize: 14,
                          }}
                        >
                          ₹ {astrologer?.charges}/{t('astrologers.card.min')}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 10,
                  width: 'auto',
                  justifyContent: 'space-between',
                  height: '100%',
                }}
              >
                <TouchableOpacity
                  style={{
                    paddingHorizontal: 5,
                    paddingVertical: 5,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 16,
                  }}
                  onPress={toggleFollow}
                >
                  <Text
                    style={[
                      styles.actionButtonText,
                      { color: isFollowingPage ? 'red' : 'green' },
                    ]}
                  >
                    {isFollowingPage ? 'Unfollow' : 'Follow'}
                  </Text>
                </TouchableOpacity>
                {astrologer?.waitTime > 0 && (
                  <Text style={{ color: 'red' }}>
                    Wait Time - {astrologer?.waitTime} min
                  </Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.actionButtons}>
            {(astrologer?.isOnlineForChat ||
              (!astrologer?.isOnlineForChat &&
                !astrologer?.isOnlineForCall)) && (
              <TouchableOpacity
                style={[
                  styles.actionbutton,
                  { backgroundColor: colors.purple },
                ]}
                onPress={() => handleChatCallBtnClick('chat')}
              >
                <Ionicons name="chatbubble-outline" size={16} color={'white'} />
                <Text style={[styles.actionButtonText, { color: 'white' }]}>
                  {t('extras.chat')}
                </Text>
              </TouchableOpacity>
            )}
            {(astrologer?.isOnlineForCall ||
              (!astrologer?.isOnlineForChat &&
                !astrologer?.isOnlineForCall)) && (
              <TouchableOpacity
                style={[styles.actionbutton, { backgroundColor: 'green' }]}
                onPress={() => handleChatCallBtnClick('call')}
              >
                <FontAwesome name="phone" size={16} color="white" />
                <Text style={[styles.actionButtonText, { color: 'white' }]}>
                  {t('extras.call')}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/*About Astrologer Section*/}
          <View
            style={[
              styles.section,
              {
                backgroundColor: isDarkMode ? colors.darkSurface : colors.white,
                borderColor: isDarkMode ? colors.dark : colors.lightGray,
              },
            ]}
          >
            <View style={[styles.sectionHeader]}>
              <Text
                style={[
                  styles.sectionText,
                  { color: isDarkMode ? colors.darkAccent : colors.purple },
                ]}
              >
                {t('astrologerProfile.about')} {astrologer?.name}
              </Text>
              <TouchableOpacity
                style={{
                  borderRadius: 18,
                  padding: 2,
                  width: 40,
                  height: 40,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginLeft: 10,
                }}
                onPress={() => {
                  setIsGalleryModalVisible(true);
                }}
              >
                <Ionicons
                  name="images-outline"
                  size={24}
                  color={isDarkMode ? colors.lightGray : colors.black}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.sectionContent}>
              {showMore ? (
                <View style={{ gap: 5 }}>
                  <Text
                    style={{
                      textAlign: 'justify',
                      color: isDarkMode
                        ? colors.darkTextSecondary
                        : colors.dark,
                      fontWeight: 400,
                      fontSize: 16,
                      lineHeight: 22,
                    }}
                  >
                    {astrologer?.details}
                  </Text>
                  <Text
                    style={{
                      textAlign: 'justify',
                      color: isDarkMode
                        ? colors.darkTextSecondary
                        : colors.dark,
                      fontWeight: 400,
                      fontSize: 16,
                      lineHeight: 22,
                    }}
                  >
                    {astrologer?.details2}
                  </Text>
                  <Text
                    style={{
                      textAlign: 'justify',
                      color: isDarkMode
                        ? colors.darkTextSecondary
                        : colors.dark,
                      fontWeight: 400,
                      fontSize: 16,
                      lineHeight: 22,
                    }}
                  >
                    {astrologer?.details3}
                  </Text>

                  <Text
                    style={{
                      color: isDarkMode
                        ? colors.darkTextSecondary
                        : colors.dark,
                      fontWeight: 400,
                      fontSize: 16,
                      lineHeight: 22,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: 'bold',
                        color: isDarkMode
                          ? colors.darkTextSecondary
                          : colors.dark,
                      }}
                    >
                      {t('astrologerProfile.specialization')} :{' '}
                    </Text>
                    {astrologer?.specialization}
                  </Text>

                  <Text
                    style={{
                      color: isDarkMode
                        ? colors.darkTextSecondary
                        : colors.dark,
                      fontWeight: 400,
                      fontSize: 16,
                      lineHeight: 22,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: 'bold',
                        color: isDarkMode
                          ? colors.darkTextSecondary
                          : colors.dark,
                      }}
                    >
                      {t('astrologerProfile.language')} :{' '}
                    </Text>
                    {astrologer?.language}
                  </Text>

                  <View style={{ alignItems: 'flex-end' }}>
                    <TouchableOpacity onPress={() => setShowMore(false)}>
                      <Text
                        style={{ color: isDarkMode ? 'white' : colors.purple }}
                      >
                        {t('astrologerProfile.show less')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View>
                  <Text
                    style={{
                      color: isDarkMode
                        ? colors.darkTextSecondary
                        : colors.dark,
                      fontSize: 16,
                      lineHeight: 20,
                    }}
                  >
                    {astrologer?.details?.slice(0, 200)}...
                  </Text>
                  <View style={{ alignItems: 'flex-end' }}>
                    {astrologer?.details?.length +
                      astrologer?.details2?.length +
                      astrologer?.details3?.length >
                      200 && (
                      <TouchableOpacity onPress={() => setShowMore(true)}>
                        <Text
                          style={{
                            color: isDarkMode
                              ? colors.darkAccent
                              : colors.purple,
                          }}
                        >
                          Read More
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            </View>
          </View>

          <View style={{ alignItems: 'center' }}>
            <TouchableOpacity
              style={{
                width: '100%',
                backgroundColor: colors.purple,
                marginTop: 10,
                paddingVertical: 8,
                borderRadius: 26,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 5,
              }}
              onPress={() => navigation.navigate('Community')}
            >
              <Text
                style={{
                  color: 'white',
                  fontSize: 16,
                  fontWeight: 400,
                  textAlign: 'center',
                }}
              >
                Ask a Question
              </Text>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={18}
                color="white"
                style={{ marginLeft: 5 }}
              />
            </TouchableOpacity>
          </View>

          {/*Reviews Section*/}
          {astrologer?.reviews?.length > 0 && (
            <View
              style={[
                styles.section,
                {
                  backgroundColor: isDarkMode
                    ? colors.darkSurface
                    : colors.white,
                  borderColor: isDarkMode ? colors.dark : colors.lightGray,
                },
              ]}
            >
              <View style={styles.sectionHeader}>
                <Text
                  style={[
                    styles.sectionText,
                    { color: isDarkMode ? colors.darkAccent : colors.purple },
                  ]}
                >
                  {t('astrologerProfile.reviews&Recomm')}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text
                    style={{
                      marginRight: 10,
                      color: isDarkMode ? colors.darkAccent : colors.purple,
                      fontWeight: 500,
                      fontSize: 14,
                    }}
                  >
                    Overall Rating: {parseInt(astrologer.rating, 10).toFixed(1)}
                    <Text
                      style={{
                        color: isDarkMode ? colors.white : colors.black,
                        fontWeight: 500,
                        fontSize: 12,
                        marginLeft: 2,
                      }}
                    >{` (${(astrologer.orders / 1000).toFixed(1)}K)`}</Text>
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.arrowBg,
                      {
                        backgroundColor: isDarkMode
                          ? colors.darkBackground
                          : colors.lightGray,
                      },
                    ]}
                    onPress={toggleReview}
                  >
                    <Ionicons
                      name={isReviewsExpanded ? 'chevron-up' : 'chevron-down'}
                      size={24}
                      color={isDarkMode ? colors.white : colors.black}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={[styles.sectionContent]}>
                {/* {isReviewsExpanded &&
                  astrologer?.reviews
                    ?.slice(0, 3)
                    ?.map((item, index) => (
                      <ReviewItem
                        review={item}
                        key={index}
                        astrologerName={astrologer?.name}
                        astrologerImage={astrologer?.image}
                      />
                    ))} */}

                {astrologer?.reviews
                  ?.slice(0, isReviewsExpanded ? 5 : 1) // <--- CHANGE #1: Changed 1 to 5
                  ?.map((item, index) => (
                    <ReviewItem // <--- CHANGE #2: Changed from ReviewItemCompact
                      review={item}
                      key={index}
                      astrologerName={astrologer?.name}
                      astrologerImage={astrologer?.image}
                    />
                  ))}
              </View>
              <View style={styles.sectionFooter}>
                <TouchableOpacity
                  style={{
                    backgroundColor: colors.purple,
                    paddingHorizontal: 16,
                    paddingVertical: 6,
                    borderRadius: 16,
                  }}
                  onPress={() =>
                    navigation.navigate('Reviews', { astroId: id })
                  }
                >
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 14,
                      fontWeight: 400,
                      textAlign: 'center',
                    }}
                  >
                    {t('astrologerProfile.reviews')}{' '}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/*Community Section*/}
          {replies?.length > 0 && (
            <View
              style={[
                styles.section,
                {
                  backgroundColor: isDarkMode
                    ? colors.darkSurface
                    : colors.white,
                  borderColor: isDarkMode ? colors.dark : colors.lightGray,
                },
              ]}
            >
              <View style={styles.sectionHeader}>
                <Text
                  style={[
                    styles.sectionText,
                    {
                      fontSize: 16,
                      color: isDarkMode ? colors.darkAccent : colors.purple,
                    },
                  ]}
                >
                  Questions answered by {astrologer?.name}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.arrowBg,
                    {
                      backgroundColor: isDarkMode
                        ? colors.darkBackground
                        : colors.lightGray,
                    },
                  ]}
                  onPress={toggleCommunity}
                >
                  <Ionicons
                    name={isCommunityExpanded ? 'chevron-up' : 'chevron-down'}
                    size={24}
                    color={isDarkMode ? colors.white : colors.black}
                    style={{ width: 24 }}
                  />
                </TouchableOpacity>
              </View>
              <View style={[styles.sectionContent]}>
                {isCommunityExpanded &&
                  replies
                    ?.slice(0, 3)
                    ?.map((item, index) => (
                      <QuestionItem
                        question={item}
                        key={index}
                        astrologerName={astrologer?.name}
                        astrologerImage={astrologer?.image}
                      />
                    ))}

                {!isCommunityExpanded &&
                  replies
                    ?.slice(0, 1)
                    ?.map((item, index) => (
                      <QuestionItemCompact
                        question={item}
                        key={index}
                        astrologerName={astrologer?.name}
                        astrologerImage={astrologer?.image}
                        setIsCommunityExpanded={setIsCommunityExpanded}
                      />
                    ))}
              </View>
            </View>
          )}

          {/*Similar Astrologers*/}
          <View
            style={[
              styles.section,
              {
                backgroundColor: isDarkMode ? colors.darkSurface : colors.white,
                borderColor: isDarkMode ? colors.dark : colors.lightGray,
              },
            ]}
          >
            <View style={[styles.sectionHeader, { marginBottom: 10 }]}>
              <Text
                style={[
                  styles.sectionText,
                  { color: isDarkMode ? colors.darkAccent : colors.purple },
                ]}
              >
                Similar Astrologers
              </Text>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('Footer', { screen: 'Astrologers' });
                }}
                style={[
                  styles.footerButton,
                  {
                    flexDirection: 'row',
                    width: 'auto',
                    alignItems: 'center',
                    paddingHorizontal: 8,
                  },
                ]}
              >
                <Text
                  style={{
                    marginRight: 5,
                    fontSize: 16,
                    color: isDarkMode ? colors.white : colors.black,
                  }}
                >
                  See All
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={isDarkMode ? colors.white : colors.black}
                />
              </TouchableOpacity>
            </View>
            {astrologer && similarAstrologers && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 14 }}
              >
                {similarAstrologers?.map((i) => (
                  <AstrologerCardSmall
                    astrologer={i}
                    key={i._id}
                    isFree={true}
                  />
                ))}
              </ScrollView>
            )}
          </View>
        </ScrollView>

        <GalleryModal
          images={astrologer?.additionalImages}
          isGalleryModalVisible={isGalleryModalVisible}
          setIsGalleryModalVisible={setIsGalleryModalVisible}
          handleImageClick={handleImageClick}
        />
        <ImageModal
          isImageModalVisible={isImageModalVisible}
          setIsImageModalVisible={setIsImageModalVisible}
          imageUrl={imageUrl}
        />
      </View>
      <FreeAstrologersBtn marginBottom={76} />
    </>
  );
};
const styles = StyleSheet.create({
  section: {
    marginTop: 10,
    marginBottom: 5,
    borderRadius: 10,
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 0.5,
    borderColor: colors.lightGray,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  sectionText: {
    fontSize: 18,
    fontWeight: 500,
    color: colors.purple,
  },
  sectionContent: {
    marginTop: 5,
  },
  sectionFooter: {
    alignItems: 'flex-end',
  },
  footerButton: {
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRadius: 15,
    width: '50%',
  },
  arrowBg: {
    backgroundColor: colors.lightGray,
    borderRadius: 20,
    padding: 3,
  },
  detailesContainer: {
    flexDirection: 'row',
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
    marginTop: 10,
  },
  ratingAndOrders: {
    gap: 2,
    marginTop: 5,
  },
  ratingAndOrdersText: {
    color: colors.purple,
    fontSize: 16,
    borderWidth: 1.5,
    paddingHorizontal: 5,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '500',
    textTransform: 'capitalize',
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
    width: '50%',
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
    gap: 10,
  },
  actionbutton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'white',
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    borderRadius: 28,
  },
  actionButtonText: {
    fontSize: 16,
  },
});

export default WithSafeArea(AstrologerProfile);
