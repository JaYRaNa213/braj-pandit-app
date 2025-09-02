import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useSelector } from 'react-redux';
import { colors } from '../assets/constants/colors';
import AstrologerCard from '../components/AstrologerCard';
import { useChat } from '../context/ChatContext';
import { useTheme } from '../context/ThemeContext';
import { useLazyGetAstroProfileQuery } from '../redux/api/astrologerApi';
import { useUnfollowAstrologerMutation } from '../redux/api/userApi';
import axiosInstance from '../utils/axiosInstance';
import WithSafeArea from '../components/HOC/SafeAreaView';

const Following = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user } = useSelector((state) => state.user);
  const [astrologers, setAstrologers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isError, setIsError] = useState(false);
  const [getAstrologer] = useLazyGetAstroProfileQuery();
  const { isDarkMode } = useTheme();

  const { setRefetch, refetch } = useChat();
  const [unFollowAstrologer] = useUnfollowAstrologerMutation();

  const onRefresh = () => {
    setRefreshing(true);
    setRefetch(!refetch);
    getAstrologer();
    fetchAstrologers();
    setRefreshing(false);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('following.screenHead'),
    });
  });

  const handleUnfollow = async (astrologer) => {
    try {
      const res = await unFollowAstrologer({
        userId: user?._id,
        astroId: astrologer._id,
      });

      if (res.data) {
        ToastAndroid.show(
          `You unfollowed ${astrologer?.name}, successfully`,
          ToastAndroid.SHORT,
        );
      }
      if (res.error) {
        ToastAndroid.show(
          `Error in unfollowing ${astrologer?.name}`,
          ToastAndroid.SHORT,
        );
      }
      setRefetch(!refetch);
    } catch (error) {
      ToastAndroid.show(
        `Error in unfollowing ${astrologer?.name}`,
        ToastAndroid.SHORT,
      );
      console.log(error);
    }
  };

  const fetchAstrologers = async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const { res } = await axiosInstance.get('/astro/user-followings');
      if(res && res.success)
      {
        setAstrologers(res?.data)
      }
    } catch (error) {
      console.error('Error fetching astrologers:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAstrologers();
  }, [user]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: isDarkMode ? '#222' : 'white',
        }}
      >
        <ActivityIndicator
          size="large"
          color={isDarkMode ? 'white' : colors.purple}
        />
      </View>
    );
  }

  if (isError) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          backgroundColor: isDarkMode ? '#222' : 'white',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: isDarkMode ? 'white' : colors.purple }}>
          Error loading astrologers
        </Text>
      </View>
    );
  }

  if (astrologers.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent:'center',
          backgroundColor: isDarkMode ? colors.darkBackground : colors.lightBackground,
          paddingHorizontal: 20,
        }}
      >
        <AntDesign name="deleteuser" size={90} color="#EBD3F8" />
        <Text
          style={{
            color: isDarkMode ? 'white' : colors.purple,
            fontSize: 18,
            textAlign: 'center',
            marginTop: 20,
          }}
        >
          {t('following.emptyChat.head1')}
        </Text>
        <Text
          style={{
            color: isDarkMode ? colors.lightGray : colors.gray,
            fontSize: 16,
            textAlign: 'center',
            marginTop: 10,
          }}
        >
          {t('following.emptyChat.head2')}.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 12,
        backgroundColor: isDarkMode ? colors.darkBackground : colors.lightBackground,
      }}
    >
      <FlatList
        data={astrologers}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <AstrologerCard
            astrologer={item}
            isFree={true}
            isFollowingPage={true}
            handleUnfollow={handleUnfollow}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDarkMode ? 'white' : colors.purple}
          />
        }
        numColumns={1}
        style={{ marginTop: 4 }}
        contentContainerStyle={{
          justifyContent: 'center',
          alignItems: 'center',
          gap: 13,
          width: '100%',
          marginTop: 10,
          paddingBottom: 30,
        }}
      />
    </View>
  );
};

export default WithSafeArea(Following);
