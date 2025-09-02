import { useNavigation } from '@react-navigation/native';
import React, { useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { colors } from '../../assets/constants/colors';
import { SkeletonLoaderChat } from '../../components/Loader';
import { useTheme } from '../../context/ThemeContext';
import { useGetAllChatsQuery } from '../../redux/api/chatApi';

const AllChats = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  const { user } = useSelector((state) => state.user);
  const { data, isLoading } = useGetAllChatsQuery();

  const handleChatClick = async (chatId, username, userImage, userId) => {
    navigation.navigate('SingleChat', {
      chatId,
      username,
      userImage,
    });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('chats.screenHead'),
    });
  }, [navigation]);

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: isDarkMode ? '#222' : 'white' }}
      >
        {!isLoading ? (
          <>
            {data?.length ? (
              data?.map((chat) => {
                return (
                  <Pressable
                    key={chat._id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: isDarkMode
                        ? colors.gray
                        : colors.lightGray,
                    }}
                    android_ripple={{
                      color: isDarkMode ? colors.gray : colors.lightGray,
                    }}
                    onPress={() =>
                      handleChatClick(
                        chat._id,
                        user?._id === chat?.users?.sender?._id
                          ? chat.users?.receiver?.name
                          : chat.users?.sender?.name,
                        user?._id === chat?.users?.sender?._id
                          ? chat.users?.receiver?.pic
                          : chat.users?.sender?.pic,
                        user?._id === chat?.users?.sender?._id
                          ? chat?.users?.receiver?._id
                          : chat?.users?.sender?._id,
                      )
                    }
                  >
                    <Image
                      source={
                        chat?.astrologer?.pic
                          ? { uri: chat?.astrologer?.pic }
                          : require('../../assets/images/person.jpg')
                      }
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20, // Circular image
                        marginRight: 15,
                      }}
                    />

                    <View
                      style={{
                        flex: 1,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: '400',
                            color: isDarkMode ? colors.lightGray : 'black',
                          }}
                        >
                          {chat?.astrologer?.name}
                        </Text>
                      </View>
                      <Text
                        style={{
                          color: isDarkMode ? '#999' : '#888',
                          marginTop: 2,
                        }}
                      >
                        {chat?.latestMessage?.content}
                      </Text>
                    </View>
                  </Pressable>
                );
              })
            ) : (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: '50%',
                }}
              >
                <Text
                  style={{
                    color: isDarkMode ? colors.lightGray : colors.gray,
                    fontSize: 18,
                    fontWeight: '400',
                  }}
                >
                  {t('chats.emptyChats')}
                </Text>
              </View>
            )}
          </>
        ) : (
          <SkeletonLoaderChat />
        )}
      </ScrollView>
    </>
  );
};

export default AllChats;
