import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  Share,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import { colors } from '../../assets/constants/colors';
import axiosInstance from '../../utils/axiosInstance';
import moment from 'moment';
import { ActivityIndicator } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { SvgXml } from 'react-native-svg';
import { VERIFIED_XML } from '../../assets/constants/verified';
import { useTheme } from '../../context/ThemeContext';

const CommunityQuestion = () => {
  const route = useRoute();
  const questionId = route.params?.questionId;
  const navigation = useNavigation();
  const [loadingQuestion, setLoadingQuestion] = useState(true);

  const [loadingReplies, setLoadingReplies] = useState(true);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const { user } = useSelector((state) => state.user);
  const {isDarkMode}=useTheme();

  // Dummy question data with multiple replies
  const [question, setQuestion] = useState({});

  const getQuestion = async () => {
    setLoadingQuestion(true);
    try {
      const { data } = await axiosInstance.get(`/question/${questionId}`);
      setQuestion(data?.data);
      // Fetch replies after getting the question
      fetchReplies();
    } catch (error) {
      console.error('Error fetching question:', error);
      Alert.alert('Error', 'Failed to fetch question details.');
    } finally {
      setLoadingQuestion(false);
    }
  };

  // Handle like button
  const toggleLike = async () => {
    try {
      const { data } = await axiosInstance.get(`/question/like/${questionId}`);
      if (data?.success) {
        setQuestion((prevQuestion) => ({
          ...prevQuestion,
          isLiked: data?.data?.isLiked,
          likes: data?.data?.likes,
          likesCount: data?.data?.likesCount,
        }));
      } else {
        Alert.alert('Error', 'Failed to update like status');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Error', 'Failed to update like status');
    }
  };

  // Handle reply button
  const handleReply = async () => {
    if (!replyText.trim()) {
      Alert.alert('Error', 'Reply cannot be empty');
      return;
    }

    try {
      const { data } = await axiosInstance.post('/question/reply', {
        questionId,
        reply: replyText,
      });
      ToastAndroid.showWithGravity(
        'Reply posted successfully',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );

      setQuestion((prevQuestion) => ({
        ...prevQuestion,
        replies: [...(prevQuestion.replies || []), data.reply],
      }));

      setShowReplyInput(false);
      setReplyText('');
    } catch (error) {
      console.error('Error posting reply:', error);
      Alert.alert('Error', 'Failed to post reply');
    } finally {
      fetchReplies();
    }
  };

  const fetchReplies = async () => {
    setLoadingReplies(true);
    try {
      const { data } = await axiosInstance.get(
        `/question/replies/${questionId}`,
      );
      setQuestion((prevQuestion) => ({
        ...prevQuestion,
        replies: data?.data || [],
      }));
    } catch (error) {
      console.error('Error fetching replies:', error);
      Alert.alert('Error', 'Failed to fetch replies');
    } finally {
      setLoadingReplies(false);
    }
  };

  useEffect(() => {
    getQuestion();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: loadingQuestion
        ? 'Loading...'
        : question?.title?.slice(0, 30) + '...',
      headerTitleStyle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#FFFFFF',
      },
    });
  }, [navigation, question]);

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `${question?.question}\n\nJoin the discussion on Vedaz Community!\n\nhttps://vedaz.io/question/${questionId}`,
        url: `https://vedaz.io/question/${questionId}`,
        title: 'Vedaz Community Question',
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type:', result.activityType);
        } else {
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing question:', error);
      Alert.alert('Error', 'Failed to share question');
    }
  };

  const handleDelete = async (replyId) => {
    try {
      const res = await axiosInstance.put('/question/deleteReply', {
        questionId,
        replyId: replyId,
      });

      if (res?.data?.success) {
        ToastAndroid.show('Reply deleted succesfully', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Error posting reply:', error);
      Alert.alert('Error', 'Failed to delete reply');
    } finally {
      fetchReplies();
    }
  };

  return (
    <View style={{ flex: 1,backgroundColor: isDarkMode ? colors.darkBackground: colors.lightBackground }}>
      <ScrollView
        style={{
          flex: 1,
        }}
        contentContainerStyle={{ paddingTop: 16, paddingHorizontal: 5 }}
      >
        <View
          style={{
            borderRadius: 12,
          }}
        >
          {/* Question Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                overflow: 'hidden',
                backgroundColor: colors.purple,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
                borderWidth: 2,
                borderColor: `${colors.purple}30`,
              }}
            >
              {question?.isAnonymous ? (
                <Text
                  style={{
                    color: 'white',
                    fontSize: 16,
                    textAlign: 'center',
                  }}
                >
                  {question?.user?.name[0]}
                </Text>
              ) : question?.user?.pic ? (
                <Image
                  source={{
                    uri: question?.user?.pic,
                  }}
                  width={44}
                  height={44}
                />
              ) : (
                <Ionicons name="person" size={24} color={'white'} />
              )}
            </View>
            <View
              style={{
                flex: 1,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: '700',
                    color: isDarkMode ? colors.white : colors.black,
                  }}
                >
                  {question?.isAnonymous ? 'Anonymous' : question?.user?.name}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 13,
                  color: '#6B7280',
                  marginTop: 2,
                }}
              >
                {moment(question?.createdAt).fromNow()}
              </Text>
            </View>
          </View>

          {/* Question Content */}
          <Text
            style={{
              fontSize: 16,
              lineHeight: 22,
              marginBottom: 16,
              paddingHorizontal: 5,
              fontWeight: 700,
              color: isDarkMode ? colors.darkTextPrimary : colors.black,
            }}
          >
            {question?.title} ?
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: isDarkMode ? colors.darkTextSecondary : colors.black,
              lineHeight: 22,
              marginBottom: 16,
              paddingHorizontal: 5,
            }}
          >
            {question?.question}
          </Text>

          {/* Engagement Metrics */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 12,
              paddingHorizontal: 8,
              fontWeight: 400,
            }}
          >
            {/*Eng Metrics */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={() => toggleLike(question?._id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  padding: 8,
                  borderRadius: 20,
                }}
              >
                <Ionicons
                  name={question.isLiked ? 'heart' : 'heart-outline'}
                  size={18}
                  color={question.isLiked ? 'red': (isDarkMode ? colors.white : colors.black)}
                />
                <Text
                  style={{
                    fontSize: 14,
                    color: question.isLiked ? 'red': (isDarkMode ? colors.white : colors.black),
                    fontWeight: '600',
                  }}
                >
                  {question?.likesCount || 0}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  padding: 8,
                  borderRadius: 20,
                }}
              >
                <Ionicons name={'chatbubble'} size={18} color={(isDarkMode ? colors.darkAccent: colors.purple)} />
                <Text
                  style={{
                    fontSize: 14,
                    color: (isDarkMode ? colors.darkAccent: colors.purple),
                    fontWeight: '600',
                  }}
                >
                  {question.replies?.length}
                </Text>
              </TouchableOpacity>
            </View>
            {/*Action Buttons*/}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={handleShare}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  padding: 8,
                  borderRadius: 20,
                }}
              >
                <Ionicons
                  name="share-social-outline"
                  size={18}
                  color={isDarkMode ? colors.white : colors.black}
                />
                <Text
                  style={{
                    fontSize: 14,
                    color:isDarkMode ? colors.white : colors.black,
                    fontWeight: '600',
                  }}
                >
                  Share
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowReplyInput(!showReplyInput)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  padding: 8,
                  borderRadius: 20,
                }}
              >
                <Entypo name="reply" size={18} color={isDarkMode ? colors.white : colors.black} />
                <Text
                  style={{
                    fontSize: 14,
                    color: isDarkMode ? colors.white : colors.black,
                    fontWeight: '600',
                  }}
                >
                  Reply
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/*Inline Reply Input Area - Conditionally Rendered */}
          {showReplyInput && (
            <View style={{ width: '100%', borderRadius:12, padding: 5, marginTop: 5,backgroundColor: isDarkMode ? colors.darkSurface: colors.white }}>
              <View
                style={{
                  flexDirection: 'column',
                  width: '100%',
                  justifyContent: 'center',
                }}
              >
                <View style={{ width: '100%', flexDirection: 'row' }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      overflow: 'hidden',
                      backgroundColor: colors.purple,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12,
                      borderWidth: 2,
                      borderColor: `${colors.purple}30`,
                    }}
                  >
                    {user?.pic ? (
                      <Image
                        source={{
                          uri: question?.user?.pic,
                        }}
                        width={44}
                        height={44}
                      />
                    ) : (
                      <Ionicons name="person" size={24} color={'white'} />
                    )}
                  </View>

                  <Text
                    style={{
                      fontSize: 18,
                      color: isDarkMode ? colors.darkTextPrimary: colors.purple,
                      fontWeight: 500,
                      textAlignVertical: 'center',
                    }}
                  >
                    {user?.name}
                  </Text>
                </View>
                <View style={{ width: '100%', marginTop: 10 }}>
                  <TextInput
                    multiline
                    placeholder="Type your reply here..."
                    placeholderTextColor="#6B7280"
                    value={replyText}
                    onChangeText={setReplyText}
                    style={{
                      color:isDarkMode ? colors.darkTextPrimary: colors.black,
                      backgroundColor: isDarkMode ? colors.darkSurface:colors.white,
                      borderRadius: 12,
                      paddingHorizontal: 8,
                      borderWidth:1,
                      borderColor:isDarkMode ? colors.dark: colors.lightGray
                    }}
                  />
                </View>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  gap: 8,
                  marginTop: 10,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setReplyText('');
                    setShowReplyInput(false);
                  }}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 12,
                    backgroundColor: isDarkMode ? colors.darkSurface: '#F3F4F6',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: isDarkMode ? colors.darkText:'#6B7280',
                    }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleReply}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 12,
                    backgroundColor:colors.purple,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: '#FFFFFF',
                    }}
                  >
                    Submit
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Replies Section */}
          <View
            style={{
              marginTop: 8,
              marginBottom: 16,
            }}
          >
            {loadingReplies ? (
              <ActivityIndicator />
            ) : question?.replies?.length === 0 ? (
              <Text
                style={{
                  fontSize: 14,
                  color: '#6B7280',
                  textAlign: 'center',
                }}
              >
                No replies yet. Be the first to reply!
              </Text>
            ) : (
              question?.replies?.map((item) => (
                <View key={item._id}>
                  <View
                    style={{
                      width: '100%',
                      borderWidth: 1,
                      borderColor: isDarkMode ? colors.dark : colors.lightGray,
                      marginBottom: 8,
                    }}
                  />
                  <View
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      marginBottom: 8,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                      }}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          width: '100%',
                          justifyContent: 'space-between',
                        }}
                      >
                        <View style={{ flexDirection: 'row' }}>
                          {/*Image View */}
                          <View
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 18,
                              overflow: 'hidden',
                              backgroundColor: '#9F7AEA',
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginRight: 12,
                              borderWidth: 1,
                              borderColor: '#E5E7EB',
                            }}
                          >
                            {item?.user?.pic ? (
                              <Image
                                source={{
                                  uri: item.user?.pic,
                                }}
                                width={36}
                                height={36}
                              />
                            ) : (
                              <Ionicons
                                name="person"
                                size={24}
                                color={'white'}
                              />
                            )}
                          </View>

                          {/*Commentor Details View */}
                          <View
                            style={{
                              gap: 2,
                              flexDirection: 'column',
                              height: 40,
                            }}
                          >
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                position: 'relative',
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 16,
                                  fontWeight: '600',
                                  color: isDarkMode ? colors.darkTextPrimary : colors.purple,
                                  textAlign: 'left',
                                }}
                              >
                                {item.user?.name}
                              </Text>
                              <View
                                style={{ position: 'absolute', right: -28 }}
                              >
                                {item.user?.role === 'astrologer' && (
                                  <View
                                    style={{
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      position: 'relative',
                                    }}
                                  >
                                    <SvgXml
                                      xml={VERIFIED_XML}
                                      width="28"
                                      height="28"
                                    />
                                    <Ionicons
                                      name="checkmark-sharp"
                                      size={14}
                                      color={'white'}
                                      style={{ position: 'absolute' }}
                                    />
                                  </View>
                                )}
                              </View>
                            </View>
                            <Text
                              style={{
                                fontSize: 10,
                                color: '#6B7280',
                                textAlign: 'left',
                              }}
                            >
                              {moment(item.createdAt).fromNow()}
                            </Text>
                          </View>
                        </View>

                        {/*Action for Reply*/}
                        {user._id === item?.user?._id && (
                          <View>
                            <TouchableOpacity
                              onPress={() => {
                                handleDelete(item._id);
                              }}
                              style={{ marginRight: 12 }}
                            >
                              <Ionicons
                                name="trash"
                                size={20}
                                color={isDarkMode ? colors.darkTextSecondary : colors.dark}
                              />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                      {/*Reply Text View*/}
                      <View
                        style={{
                          flex: 1,
                          marginTop: 2,
                        }}
                      >
                        {item?.reply?.split('#')?.map((text) => (
                          <Text
                            key={text}
                            style={{
                              fontSize: 14,
                              color: isDarkMode ? colors.darkTextSecondary:colors.black,
                              lineHeight: 20,
                              marginBottom: 8,
                              textAlign:'justify'
                            }}
                          >
                            {text.trim()}
                          </Text>
                        ))}
                      </View>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default CommunityQuestion;
