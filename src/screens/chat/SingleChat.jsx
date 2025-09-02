import moment from 'moment';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Image,
  NativeModules,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { colors } from '../../assets/constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { useGetMessegesQuery } from '../../redux/api/chatApi';
import RenderAttachment from '../../components/RenderAttachment';
import ImageModal from '../../components/ImageModal';
import { fileFormat } from '../../utils/helper';
import FullScreenLoader from '../../components/FullScreenLoader';
const { ScreenshotPrevention } = NativeModules;
const SingleChat = () => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState([]);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const { user } = useSelector((state) => state.user);
  const { isDarkMode } = useTheme();
  const route = useRoute();
  const [imageUrl, setImageUrl] = useState('');
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const { chatId, username, userImage } = route.params;

  const { data: initialMessages, isLoading } = useGetMessegesQuery({ chatId });
  const scrollViewRef = useRef();

  useEffect(() => {
    ScreenshotPrevention.enable(); // Block screenshots on Android

    return () => {
      ScreenshotPrevention.disable(); // Re-enable screenshots when leaving
    };
  }, []);
  useLayoutEffect(() => {
    navigation.setOptions({
      title: (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <Image
            style={{
              width: 30,
              height: 30,
              borderRadius: 25,
            }}
            source={
              userImage
                ? { uri: userImage }
                : require('../../assets/images/person.jpg')
            }
          />
          <Text
            style={{
              color: 'white',
              fontSize: 16,
              textTransform: 'capitalize',
            }}
          >
            {username}
          </Text>
        </View>
      ),
    });
  }, [navigation, userImage, username]);

  const isUserSender = (sender) => {
    return sender?._id === user?._id;
  };

  useEffect(() => {
    setMessages(initialMessages);
    setTimeout(() => scrollToBottom(), 100);
  }, [messages, initialMessages]);

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  const formatDate = (date) => {
    if (moment(date).isSame(moment(), 'day')) {
      return 'Today';
    } else if (moment(date).isSame(moment().subtract(1, 'days'), 'day')) {
      return 'Yesterday';
    } else {
      return moment(date).format('MMMM D, YYYY');
    }
  };

  const handleImageClick = (url) => {
    setIsImageModalVisible(true);
    setImageUrl(url);
  };

  const groupedMessages =
    messages?.length > 0 &&
    messages?.reduce((groups, message) => {
      const date = formatDate(message.createdAt);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
      return groups;
    }, {});

  const handleScroll = useCallback((event) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const isAtBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    setShowScrollButton(!isAtBottom); // Show button only if not at bottom
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: isDarkMode ? '#222' : '#f5f5f5' }}>
      <FullScreenLoader isRefreshing={isLoading} />
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 20 }}
        ref={scrollViewRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {Object.keys(groupedMessages).map((date, index) => (
          <View key={index}>
            <Text
              style={{
                color: isDarkMode ? '#ffffff' : '#000000',
                textAlign: 'center',
                marginVertical: 10,
              }}
            >
              {date}
            </Text>
            {groupedMessages[date]?.map((message) => (
              <View
                key={message?._id}
                style={{
                  backgroundColor: isUserSender(message.sender)
                    ? isDarkMode
                      ? '#444'
                      : colors.green100
                    : isDarkMode
                    ? '#333'
                    : colors.orange100,
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  marginVertical: 5,
                  borderRadius: 20,
                  alignSelf: isUserSender(message.sender)
                    ? 'flex-end'
                    : 'flex-start',
                  // maxWidth: '80%',
                  flexDirection: 'row',
                  alignItems: 'flex-end',
                }}
              >
                {message?.attachments?.length > 0 &&
                  message?.attachments?.map((attachment, index) => {
                    const url = attachment.url;
                    const file = fileFormat(url);

                    return (
                      <View key={index} style={{ maxWidth: '80%' }}>
                        <RenderAttachment
                          file={file}
                          url={url}
                          handleImageClick={handleImageClick}
                        />
                      </View>
                    );
                  })}
                {message.content && (
                  <Text
                    style={{
                      fontSize: 16,
                      color: isDarkMode ? '#ffffff' : '#000000',
                      maxWidth: '75%',
                    }}
                  >
                    {message.content}
                  </Text>
                )}
                <Text
                  style={{
                    textAlign: 'right',
                    fontSize: 10,
                    color: '#888',
                    marginHorizontal: 6,
                  }}
                >
                  {moment(message.createdAt).format('hh:mm a')}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Button to scroll to bottom */}
      {showScrollButton && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            bottom: 80,
            right: 20,
            backgroundColor: 'gray',
            borderRadius: 25,
            opacity: 0.7,
            width: 30,
            height: 30,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={scrollToBottom}
        >
          <Ionicons name="arrow-down" size={14} color="white" />
        </TouchableOpacity>
      )}

      {/* Modal for Full-Screen Image Display */}
      <ImageModal
        isImageModalVisible={isImageModalVisible}
        setIsImageModalVisible={setIsImageModalVisible}
        imageUrl={imageUrl}
      />
    </View>
  );
};

export default SingleChat;
