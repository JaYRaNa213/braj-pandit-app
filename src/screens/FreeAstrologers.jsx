import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
} from 'react-native';
import { colors } from '../assets/constants/colors';
import AstrologerCard from '../components/AstrologerCard';
import { useChat } from '../context/ChatContext';
import { useTheme } from '../context/ThemeContext';
import axiosInstance from '../utils/axiosInstance';

const FreeAstrologers = () => {
  const navigation = useNavigation();
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const route = useRoute();
  const { freeMinutes } = route.params;

  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [astrologers, setAstrologers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { isDarkMode } = useTheme();

  const getFreeAstrologers = async () => {
    try {
      const { data } = await axiosInstance.get(
        `/astro/free?page=${page}&limit=10`,
      );
      if (page === 1) {
        setAstrologers(data.data);
      } else {
        setAstrologers((prev) => [...prev, ...data.data]);
      }
    } catch (error) {
      console.error('Error fetching free astrologers:', error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  };

  const { setRefetch, refetch } = useChat();

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  };

  const loadMoreData = debounce(() => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      setPage((prevPage) => prevPage + 1);
    }
  }, 100);

  useEffect(() => {
    getFreeAstrologers();
  }, [page]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `${freeMinutes} min Free Astrologers`,
    });
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    setRefetch(!refetch);
    setPage(1);
    setHasMore(true);
    getFreeAstrologers();
    setRefreshing(false);
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDarkMode ? '#121212' : 'white',
        paddingHorizontal: 12,
      }}
    >
      <FlatList
        data={astrologers}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <AstrologerCard astrologer={item} isFree={true} />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDarkMode ? 'white' : colors.purple}
          />
        }
        numColumns={1}
        onEndReached={loadMoreData}
        onEndReachedThreshold={0.8}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={21}
        // eslint-disable-next-line react/no-unstable-nested-components
        ListFooterComponent={() => {
          if (loadingMore || isLoading) {
            return (
              <ActivityIndicator
                size="large"
                color={isDarkMode ? 'white' : 'black'}
              />
            );
          }
          return null;
        }}
        style={{ marginTop: 12 }}
        contentContainerStyle={{
          justifyContent: 'flex-center',
          alignItems: 'flex-center',
          gap: 12,
          width: '100%',
          flexGrow: 1,
        }}
      />
    </View>
  );
};

export default FreeAstrologers;
