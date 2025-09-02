import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  Share,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../assets/constants/colors';
import axiosInstance from '../../utils/axiosInstance';
import Entypo from 'react-native-vector-icons/Entypo';
import { SvgXml } from 'react-native-svg';
import { VERIFIED_XML } from '../../assets/constants/verified';
import { useTheme } from '../../context/ThemeContext';
import { useSelector } from 'react-redux';

const Question = ({
  question,
  setQuestions,
  fetchingRepliesFor,
  toggleReplies,
  isRepliesVisible,
}) => {
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  const { user } = useSelector((state) => state.user);
  const toggleLike = async (questionId) => {
    if (!user) {
      return navigation.navigate('MobileLogin');
    }
    try {
      const { data } = await axiosInstance.get(`/question/like/${questionId}`);
      if (data?.success) {
        setQuestions((prevQuestions) =>
          prevQuestions.map((q) =>
            q._id === questionId
              ? {
                  ...q,
                  isLiked: data?.data?.isLiked,
                  likes: data?.data?.likes,
                  likesCount: data?.data?.likesCount,
                }
              : q,
          ),
        );
      } else {
        Alert.alert('Error', 'Failed to update like status');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Error', 'Failed to update like status');
    }
  };

  const handleReply = (questionId) => {
    if (!user) {
      return navigation.navigate('MobileLogin');
    } else {
      navigation.navigate('CommunityQuestion', {
        questionId: questionId,
      });
    }
  };

  const handleShare = async (questionId, questionText) => {
    if (!user) {
      return navigation.navigate('MobileLogin');
    }
    try {
      await Share.share({
        message: `${questionText}\n\nJoin the discussion on Vedaz Community!\n\nhttps://vedaz.io/question/${questionId}`,
        url: `https://vedaz.io/question/${questionId}`,
        title: 'Vedaz Community Question',
      });
    } catch (error) {
      console.error('Error sharing question:', error);
      Alert.alert('Error', 'Failed to share question');
    }
  };

  return (
    <View
      style={{
        marginHorizontal: 12,
        marginVertical: 8,
        padding: 16,
        backgroundColor: isDarkMode ? colors.darkSurface : colors.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.dark : colors.lightGray,
      }}
    >
      {/* Question Header */}
      <Pressable
        onPress={() =>
          navigation.navigate('CommunityQuestion', {
            questionId: question?._id,
          })
        }
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
            backgroundColor: colors.purple,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
            borderWidth: 2,
            borderColor: `${colors.purple}30`,
            overflow: 'hidden',
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
          ) : (
            <Image
              source={{
                uri: question?.user?.pic,
              }}
              width={44}
              height={44}
            />
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
              {question.isAnonymous ? 'Anonymous' : question.user.name}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 13,
              color: '#6B7280',
              marginTop: 2,
            }}
          >
            {moment(question.createdAt).fromNow()}
          </Text>
        </View>
      </Pressable>

      {/* Question Content */}
      <Pressable
        onPress={() =>
          navigation.navigate('CommunityQuestion', {
            questionId: question?._id,
          })
        }
      >
        <Text
          style={{
            fontSize: 16,
            color: isDarkMode ? colors.lightGray : colors.black,
            lineHeight: 22,
            marginBottom: 16,
          }}
        >
          {question.title.length > 100
            ? `${question.title.slice(0, 100)}...Read More`
            : `${question.title} ?`}
        </Text>
      </Pressable>

      {/* Engagement Metrics */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 5,
        }}
      >
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
              color={
                question.isLiked
                  ? 'red'
                  : isDarkMode
                  ? colors.white
                  : colors.black
              }
            />
            <Text
              style={{
                fontSize: 14,
                color: question.isLiked
                  ? 'red'
                  : isDarkMode
                  ? colors.white
                  : colors.black,
                fontWeight: '600',
              }}
            >
              {question.likesCount || 0}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => toggleReplies(question._id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              padding: 8,
              borderRadius: 20,
            }}
          >
            <Ionicons
              name={isRepliesVisible ? 'chatbubble' : 'chatbubble-outline'}
              size={18}
              color={
                isRepliesVisible
                  ? isDarkMode
                    ? colors.darkAccent
                    : colors.purple
                  : isDarkMode
                  ? colors.white
                  : colors.black
              }
            />
            <Text
              style={{
                fontSize: 14,
                color: isRepliesVisible
                  ? isDarkMode
                    ? colors.darkAccent
                    : colors.purple
                  : isDarkMode
                  ? colors.white
                  : colors.black,
                fontWeight: '600',
              }}
            >
              {question.replies.length}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            onPress={() => handleShare(question._id, question.question)}
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
                color: isDarkMode ? colors.white : colors.black,
                fontWeight: '600',
              }}
            >
              Share
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleReply(question._id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              padding: 8,
              borderRadius: 20,
            }}
          >
            <Entypo
              name="reply"
              size={18}
              color={isDarkMode ? colors.white : colors.black}
            />
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

      {/* Reply Section */}
      {isRepliesVisible && (
        <View>
          {fetchingRepliesFor === question?._id ? (
            <View style={{ padding: 12, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={colors.purple} />
              <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 8 }}>
                Loading replies...
              </Text>
            </View>
          ) : question.replies.length > 0 ? (
            <View>
              {question.replies.map((reply) => (
                <Pressable
                  onPress={() =>
                    navigation.navigate('CommunityQuestion', {
                      questionId: question?._id,
                    })
                  }
                  key={reply?._id}
                  style={{
                    marginTop: 8,
                    marginBottom: 8,
                    backgroundColor: isDarkMode
                      ? colors.darkSurface
                      : colors.white,
                    padding: 12,
                    borderRadius: 10,
                    borderWidth: isDarkMode ? 0.5 : 1,
                    borderColor: isDarkMode ? colors.dark : colors.lightGray,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                    }}
                  >
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: '#9F7AEA',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 12,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        overflow: 'hidden',
                      }}
                    >
                      {reply?.user?.pic ? (
                        <Image
                          source={{
                            uri: reply?.user?.pic,
                          }}
                          width={36}
                          height={36}
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
                          justifyContent: 'space-between',
                          marginBottom: 6,
                        }}
                      >
                        <View
                          style={{ flexDirection: 'row', alignItems: 'center' }}
                        >
                          <Text
                            style={{
                              fontSize: 15,
                              fontWeight: '600',
                              color: isDarkMode ? colors.white : colors.black,
                            }}
                          >
                            {reply?.user?.name || 'Anonymous'}
                          </Text>
                          {reply?.user?.role === 'astrologer' && (
                            <View
                              style={{
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                              }}
                            >
                              <SvgXml
                                xml={VERIFIED_XML}
                                width="22"
                                height="22"
                              />
                              <Ionicons
                                name="checkmark-sharp"
                                size={12}
                                color={'white'}
                                style={{ position: 'absolute' }}
                              />
                            </View>
                          )}
                        </View>
                        <Text
                          style={{
                            fontSize: 12,
                            color: '#6B7280',
                          }}
                        >
                          {moment(reply?.createdAt).fromNow()}
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontSize: 14,
                          color: isDarkMode ? colors.lightGray : colors.black,
                          lineHeight: 20,
                        }}
                      >
                        {reply?.reply?.length > 200
                          ? `${reply?.reply?.slice(0, 200)}...Read More`
                          : reply?.reply}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <View>
              <Text
                style={{
                  fontSize: 14,
                  color: '#6B7280',
                  textAlign: 'center',
                  marginVertical: 12,
                }}
              >
                No replies yet
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default Question;
