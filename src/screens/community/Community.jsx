import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../assets/constants/colors';
import Question from '../../components/community/Question';
import axiosInstance from '../../utils/axiosInstance';
import { useSelector } from 'react-redux';
import CreateQuestion from './CreateQuestion';
import { useTheme } from '../../context/ThemeContext';
import { t } from 'i18next';

const Community = () => {
  const [activeTab, setActiveTab] = useState('all');
  const navigation = useNavigation();
  const [questions, setQuestions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [visibleReplies, setVisibleReplies] = useState({});
  const [fetchingRepliesFor, setFetchingRepliesFor] = useState(null);
  const abortControllerRef = useRef(new AbortController());
  const debounceTimeout = useRef(null);
  const { user } = useSelector((state) => state.user);
  const [createQuestionModal, setCreateQuestionModal] = useState(false);
  const { isDarkMode } = useTheme();

  // Fetch questions with pagination and category
  const fetchQuestions = async (pageNum = 1, reset = false) => {
    if (isLoading || (pageNum > totalPages && !reset)) {
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await axiosInstance.get('/question/all', {
        params: { category: activeTab, page: pageNum, limit: 10 },
        signal: abortControllerRef.current.signal,
      });

      if (!data.data || data.data.length === 0) {
        setQuestions(reset ? [] : questions);
        setTotalPages(pageNum); // Stop pagination if no data
        return;
      }

      const initializedData = data.data.map((question) => ({
        ...question,
        isLiked: question.likes.includes(question.user._id),
      }));

      setQuestions(
        reset ? initializedData : [...questions, ...initializedData],
      );
      setTotalPages(data.pagination.totalPages || 1);
      setPage(pageNum);
    } catch (error) {
      if (error.name === 'AbortError') {
        return; // Ignore aborted requests
      }
      console.error('Error fetching questions:', error.message);
      Alert.alert('Error', 'Failed to fetch questions. Please try again.');
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
      setRefreshing(false);
    }
  };

  // Fetch replies for a specific question
  const fetchReplies = async (questionId) => {
    setFetchingRepliesFor(questionId);
    try {
      const { data } = await axiosInstance.get(
        `/question/replies/${questionId}`,
        {
          signal: abortControllerRef.current.signal,
        },
      );
      setQuestions((prevQuestions) =>
        prevQuestions.map((question) =>
          question._id === questionId
            ? { ...question, replies: data.data || [] }
            : question,
        ),
      );
      setVisibleReplies((prev) => ({ ...prev, [questionId]: true }));
    } catch (error) {
      if (error.name === 'AbortError') {
        return; // Ignore aborted requests
      }
      console.error('Error fetching replies:', error);
      Alert.alert('Error', 'Failed to fetch replies');
      setVisibleReplies((prev) => ({ ...prev, [questionId]: false }));
    } finally {
      setFetchingRepliesFor(null);
    }
  };

  // Toggle reply visibility and fetch replies if opening
  const toggleReplies = (questionId) => {
    if (!user) {
      return navigation.navigate('MobileLogin');
    }
    setVisibleReplies((prev) => {
      const isOpening = !prev[questionId];
      if (isOpening) {
        fetchReplies(questionId);
      }
      return { ...prev, [questionId]: isOpening };
    });
  };

  // Handle reply submission
  const handleReply = async (questionId, replyText) => {
    if (!user) {
      return navigation.navigate('MobileLogin');
    }
    if (!replyText.trim()) {
      Alert.alert('Error', 'Reply cannot be empty');
      return;
    }

    try {
      const { data } = await axiosInstance.post('/question/reply', {
        questionId: questionId,
        reply: replyText,
      });

      setQuestions((prevQuestions) =>
        prevQuestions.map((q) =>
          q._id === questionId
            ? { ...q, replies: [...(q.replies || []), data?.data?.reply] }
            : q,
        ),
      );
      setVisibleReplies((prev) => ({ ...prev, [questionId]: true }));
    } catch (error) {
      console.error('Error posting reply:', error);
      Alert.alert('Error', 'Failed to post reply');
    }
  };

  // Handle infinite scrolling with debounce
  const handleLoadMore = () => {
    if (page >= totalPages || isFetchingMore || isLoading) {
      return;
    }

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      setIsFetchingMore(true);
      fetchQuestions(page + 1);
    }, 300);
  };

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchQuestions(1, true);
  };

  // Cleanup and fetch on tab change
  useEffect(() => {
    // Cancel ongoing requests
    abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    // Clear debounce timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Reset states
    setQuestions([]);
    setPage(1);
    setTotalPages(1);
    setVisibleReplies({});
    setFetchingRepliesFor(null);
    setIsLoading(false);
    setIsFetchingMore(false);

    // Fetch new questions
    fetchQuestions(1, true);

    // Cleanup on unmount
    return () => {
      abortControllerRef.current.abort();
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [activeTab]);

  // Render each question
  const renderQuestion = ({ item }) => {
    const isRepliesVisible = visibleReplies[item._id] || false;
    return (
      <Question
        question={item}
        setQuestions={setQuestions}
        fetchingRepliesFor={fetchingRepliesFor}
        toggleReplies={toggleReplies}
        isRepliesVisible={isRepliesVisible}
        handleReply={handleReply}
      />
    );
  };

  // Render footer for loading indicator
  const renderFooter = () => {
    if (!isFetchingMore) {
      return null;
    }
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.purple} />
      </View>
    );
  };

  // Render empty state
  const renderEmpty = () => {
    if (isLoading && !refreshing) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
        >
          <ActivityIndicator size="large" color={colors.purple} />
          <Text style={{ fontSize: 16, color: '#6B7280', marginTop: 12 }}>
            Loading questions...
          </Text>
        </View>
      );
    }
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
      >
        <Text style={{ fontSize: 16, color: '#6B7280' }}>
          {questions.length === 0 && !isLoading
            ? 'No questions found. Pull to refresh.'
            : t('nomorequestionstolead')}
        </Text>
      </View>
    );
  };

  const categories = [
    'all',
    'career',
    "women's health",
    'finances',
    'health issues',
    'heartbreak',
    'relationships',
    'social',
    'marriage',
    'others',
  ];

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('vedazcommunity'),
    });
  }, [navigation]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDarkMode ? colors.darkBackground : colors.lightGray,
      }}
    >
      {/* Create Post Button */}
      <View
        style={{
          width: '100%',
          paddingHorizontal: 12,
          marginTop: 20,
        }}
      >
        <Pressable
          onPress={() => setCreateQuestionModal(true)}
          style={{
            flexDirection: 'row',
            backgroundColor: isDarkMode ? colors.darkSurface : '#fff',
            alignItems: 'center',
            minHeight: 70,
            borderRadius: 16,
            paddingHorizontal: 12,
            gap: 10,
            borderWidth: 1,
            borderColor: isDarkMode ? colors.dark : colors.lightGray,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          {/* User Pic */}
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              overflow: 'hidden',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {user?.pic ? (
              <Image
                source={{ uri: user?.pic }}
                style={{
                  width: '100%',
                  height: '100%',
                }}
              />
            ) : (
              <Ionicons name="person-circle-outline" size={48} color={'#888'} />
            )}
          </View>

          {/* Fake Input Box */}
          <View
            style={{
              flex: 1,
              backgroundColor: isDarkMode ? colors.dark : colors.lightGray,
              height: 45,
              borderRadius: 12,
              justifyContent: 'center',
              paddingHorizontal: 12,
              borderWidth: 1,
              borderColor: isDarkMode ? colors.dark : colors.gray,
            }}
          >
            <Text
              style={{
                fontWeight: '400',
                fontSize: 14,
                color: isDarkMode ? colors.darkTextSecondary : '#555',
              }}
            >
              {t("letsStartwhatgoingon")}
            </Text>
          </View>

          {/* Post Button */}
          <View
            style={{
              backgroundColor: colors.purple,
              paddingHorizontal: 16,
              height: 42,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                color: 'white',
                fontWeight: '600',
                fontSize: 14,
              }}
            >
              {t("post")}
            </Text>
          </View>
        </Pressable>
      </View>

      {/* Tab Bar */}
      <ScrollView
        contentContainerStyle={{
          paddingVertical: 8,
          paddingHorizontal: 16,
          flexDirection: 'row',
          gap: 16,
          minHeight: 60,
          maxHeight: 60,
          alignItems: 'center',
        }}
        style={{
          maxHeight: 60,
          flexGrow: 0,
        }}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => setActiveTab(category)}
            style={{
              paddingVertical: 3,
              alignItems: 'center',
              borderBottomWidth: activeTab === category ? 2 : 0,
              borderBottomColor:
                activeTab === category
                  ? isDarkMode
                    ? colors.darkAccent
                    : colors.purple
                  : isDarkMode
                  ? colors.darkTextSecondary
                  : colors.dark,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: activeTab === category ? '700' : '500',
                color:
                  activeTab === category
                    ? isDarkMode
                      ? colors.darkAccent
                      : colors.purple
                    : isDarkMode
                    ? colors.darkTextSecondary
                    : colors.dark,
                textTransform: 'capitalize',
              }}
            >
              {t(`community.${category}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Questions List */}
      <FlatList
        data={questions}
        renderItem={renderQuestion}
        keyExtractor={(item) => item._id}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.8}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        initialNumToRender={10}
        extraData={visibleReplies}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.purple]}
          />
        }
      />

      <CreateQuestion
        createQuestionModal={createQuestionModal}
        setCreateQuestionModal={setCreateQuestionModal}
      />
    </View>
  );
};

export default Community;
