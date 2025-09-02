import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { React, useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { colors } from '../assets/constants/colors';
import TrendingAstrologerCard from '../components/TrendingAstrologerCard';
import { useChat } from '../context/ChatContext';
import { useGetAllAstrologersQuery } from '../redux/api/astrologerApi';
import { useGetAllChatsQuery } from '../redux/api/chatApi';
import { handleStartChatCall } from '../utils/api';
import { getAstrologerName } from '../utils/helper';
import { useTheme } from '../context/ThemeContext';
import { t } from 'i18next';

const ChatSummary = ({ route }) => {
  const { user } = useSelector((state) => state.user);
  const navigation = useNavigation();
  const { data, isLoadingChatData } = useGetAllChatsQuery();
  const [trendingAstros, setTrendingAstros] = useState([]);
  const { isDarkMode } = useTheme();

  const { data: trendingAstrosData, isLoading } = useGetAllAstrologersQuery({
    page: 1,
    limit: 10,
    isCertified: false,
    expertise: '',
    filterBy: '',
  });

  useEffect(() => {
    setTrendingAstros(trendingAstrosData?.data);
  }, [isLoading]);

  const actionType = 'chat';
  const {
    setCheckEligibilityLoading,
    setWaitListProps,
    openJoinWaitlistModal,
    setTopAstrologersConfig,
    openTopAstrologerModal,
    closeTopAstrologerModal,
  } = useChat();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('footer.chats'),
    });
  });

  const handleChatClick = async (chatId, username, userImage, userId) => {
    navigation.navigate('SingleChat', {
      chatId,
      username,
      userImage,
    });
  };

  const handleChatCallBtnClick = async ({ action, astrologer }) => {
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
    <View
      style={{
        backgroundColor: isDarkMode
          ? colors.darkBackground
          : colors.lightBackground,
        flex: 1,
      }}
    >
      <ScrollView
        contentContainerStyle={{
          alignItems: 'center',
          position: 'relative',
          flexGrow: 1,
          paddingBottom: 100,
        }}
      >
        {user ? (
          isLoadingChatData ? (
            <View
              style={{
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ActivityIndicator size={'large'} color={colors.purple} />
              <Text
                style={{
                  color: isDarkMode ? colors.darkTextPrimary : colors.purple,
                  fontSize: 16,
                  textAlign: 'center',
                }}
              >
                {t('chats.loadingChats')}
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.cardsContainerStyle}>
                {data && data.length === 0 && (
                  <View
                    style={{
                      height: 100,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        color: isDarkMode
                          ? colors.darkTextPrimary
                          : colors.purple,
                        fontSize: 16,
                      }}
                    >
                      So Empty
                    </Text>
                    <Text
                      style={{
                        color: isDarkMode
                          ? colors.darkTextPrimary
                          : colors.purple,
                        fontSize: 16,
                      }}
                    >
                      Looks Like you have not made any chats yet!
                    </Text>
                  </View>
                )}

                {data &&
                  data.length > 0 &&
                  data.map((chat) => (
                    <TouchableOpacity
                      key={chat._id}
                      style={styles.card}
                      activeOpacity={0.8}
                      onPress={() =>
                        handleChatClick(
                          chat._id,
                          getAstrologerName(
                            chat?.astrologer?.unique_name,
                            chat?.astrologer?.prefixName,
                          ),
                          chat?.astrologer?.image,
                          chat?.astrologer?._id,
                        )
                      }
                    >
                      <View
                        style={{
                          width: '50%',
                          flexDirection: 'row',
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                        }}
                      >
                        <Image
                          source={{
                            uri: chat?.astrologer?.image
                              ? chat?.astrologer?.image
                              : require('../assets/images/person.jpg'),
                          }}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 25,
                            marginRight: 15,
                          }}
                        />
                        <View>
                          <Text
                            style={{
                              color: isDarkMode
                                ? colors.darkTextPrimary
                                : colors.purple,
                              fontSize: 18,
                            }}
                          >
                            {getAstrologerName(
                              chat?.astrologer?.unique_name,
                              chat?.astrologer?.prefixName,
                            )}
                          </Text>
                          <Text style={{ fontSize: 12, color: colors.gray }}>
                            {moment(chat?.createdAt).format(
                              'h:mm A - DD MMM YYYY',
                            )}
                          </Text>
                        </View>
                      </View>
                      <View
                        style={{
                          justifyContent: 'center',
                          alignItems: 'flex-end',
                          height: '100%',
                        }}
                      >
                        <TouchableOpacity
                          style={[styles.actionButtons]}
                          onPress={() =>
                            handleChatCallBtnClick({
                              action: actionType,
                              astrologer: chat?.astrologer,
                            })
                          }
                        >
                          <Ionicons
                            name="chatbubble"
                            size={24}
                            color={colors.purple}
                          />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))}
              </View>
            </>
          )
        ) : (
          <View
            style={{
              marginTop: 12,
              width: '90%',
              height: 48,
              backgroundColor: colors.purple,
              borderRadius: 12,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('MobileLogin');
              }}
              style={{
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', textAlign: 'center' }}>
                {t('chats.loginNowToStartChatting')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.trendingAstroContainer}>
          {trendingAstros && trendingAstros.length > 0 && (
            <View>
              <View
                style={{
                  marginTop: 20,
                  width: 'auto',
                  height: 48,
                  paddingHorizontal: 15,
                  borderRadius: 12,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: isDarkMode ? colors.darkTextPrimary : colors.purple,
                    textAlign: 'center',
                    fontSize: 18,
                    fontStyle: 'italic',
                    fontWeight: 500,
                  }}
                >{`${t('chats.hey')} ${
                  user?.name || 'user'
                }! ${t('chats.meetOurTrendingAstrologers')}`}</Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 20,
                  justifyContent: 'center',
                  marginTop: 20,
                }}
              >
                {trendingAstros.map((item, index) => (
                  <TrendingAstrologerCard
                    astrologer={item}
                    rank={index + 1}
                    key={item._id}
                    actionType={actionType}
                  />
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('Astrologers');
        }}
        activeOpacity={0.8}
        style={{
          borderRadius: 12,
          backgroundColor: colors.purple,
          padding: 12,
          paddingHorizontal: 20,
          position: 'absolute',
          right: 20,
          bottom: 20,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <AntDesign name="plus" size={16} color="white" />
        <Text style={{ color: 'white', fontSize: 16 }}> {t('chats.newChat')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 12,
    paddingBottom: 20,
  },
  cardsContainerStyle: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    height: 66,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomColor: colors.lightGray,
    borderBottomWidth: 0.4,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    padding: 8,
  },
  trendingAstroContainer: {
    marginTop: 20,
    alignItems: 'center',
    width: '90%',
  },
});

export default ChatSummary;
