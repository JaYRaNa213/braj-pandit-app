import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Image,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useSelector } from 'react-redux';
import { colors } from '../../assets/constants/colors';
import CountdownTimer from '../../components/CountdownTimer';
import { useChat } from '../../context/ChatContext';
import { useSound } from '../../context/SoundContext';
import { useTheme } from '../../context/ThemeContext';
import axiosInstance from '../../utils/axiosInstance';
import { getSeconds } from '../../utils/helper';

const FullScreenRequest = () => {
  const { isDarkMode } = useTheme();
  const {
    incomingWaitlistedRequest: request,
    setActiveChat,
    setIsFullScreenRequest,
    setNewMessage,
  } = useChat();
  const { user } = useSelector((state) => state.user);

  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  const handleAcceptRequest = async () => {
    setLoading(true);
    stopSound();

    const action = request?.action;
    const reqId = request?._id;

    if (
      !reqId ||
      !action ||
      !['chat', 'call'].includes(action) ||
      !user ||
      reqId === 'undefined' ||
      reqId === undefined ||
      reqId === null ||
      reqId === 'null' ||
      reqId === ''
    ) {
      ToastAndroid.show(
        'Sorry, Something went wrong. Please try again',
        ToastAndroid.SHORT,
      );
      return;
    }

    try {
      if (action === 'chat') {
        const { data } = await axiosInstance.get(
          `/chat-request/user-accept-waitlisted/${reqId}`,
        );
        if (data?.success) {
          ToastAndroid.show('Chat request accepted', ToastAndroid.SHORT);
          setActiveChat(data?.chat);

          setNewMessage(data?.firstMsg);
          setIsFullScreenRequest(false);
          navigation.navigate('ActiveChat', {
            chatId: data?.chat?._id,
          });
        }
      } else {
        const { data } = await axiosInstance.get(
          `/call/user-accept-waitlisted/${reqId}`,
        );
        if (data?.success) {
          ToastAndroid.show('Call request accepted', ToastAndroid.SHORT);
          setActiveChat(data?.data);
          setIsFullScreenRequest(false);
        } else {
          ToastAndroid.show(
            data?.message || `Error in accepting ${action} request`,
            ToastAndroid.SHORT,
          );
        }
      }
    } catch (error) {
      console.log('Error accepting request:', error?.response);
      ToastAndroid.show(
        error?.response?.data?.message ||
          `Error in accepting ${action} request`,
        ToastAndroid.SHORT,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async () => {
    stopSound();

    const reqId = request?._id;
    const action = request?.action;

    if (
      !reqId ||
      !action ||
      !['chat', 'call'].includes(action) ||
      !user ||
      reqId === 'undefined' ||
      reqId === undefined ||
      reqId === null ||
      reqId === 'null' ||
      reqId === ''
    ) {
      ToastAndroid.show(
        'Sorry, Something went wrong. Please try again',
        ToastAndroid.SHORT,
      );
      return;
    }

    try {
      const { data } = await axiosInstance.get(
        `/chat-request/user-reject-waitlisted/${reqId}`,
      );
      if (data.success) {
        ToastAndroid.show('Chat request rejected', ToastAndroid.SHORT);

        setIsFullScreenRequest(false);
      } else {
        ToastAndroid.show(
          `Failed to reject ${action} request`,
          ToastAndroid.SHORT,
        );
      }
    } catch (error) {
      ToastAndroid.show(
        `Failed to reject ${action} request`,
        ToastAndroid.SHORT,
      );
    }
  };

  const { stopSound } = useSound();

  const handleFinish = () => {
    console.log('Time is up!');
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDarkMode ? colors.dark : 'white',
        position: 'absolute',
        width: '100%',
        height: '100%',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          margin: 80,
          justifyContent: 'space-between',
          flex: 1,
        }}
      >
        <View
          style={{
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color: isDarkMode ? 'white' : 'black',
            }}
          >
            Incoming {request?.action} Request from
          </Text>
          <Text
            style={{
              fontSize: 22,
              marginTop: 12,
              fontWeight: '500',
              color: isDarkMode ? 'white' : colors.orange,
            }}
          >
            Vedaz
          </Text>
        </View>
        {/* Display user details */}

        <View
          style={{
            marginTop: 20,
            padding: 30,
            borderRadius: 15,
            width: '100%',
            alignSelf: 'center',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Image
            source={{ uri: request?.astroImage }}
            alt={request?.astroName}
            style={{
              width: 85,
              height: 85,
              borderRadius: 100,
            }}
          />

          <Text
            style={{
              fontSize: 20,
              fontWeight: '600',
              marginBottom: 15,
              textAlign: 'center',
              color: isDarkMode ? 'white' : colors.gray,
              paddingBottom: 10,
              letterSpacing: 1,
            }}
          >
            {request?.astroName}
          </Text>
        </View>

        <View style={{ alignItems: 'center' }}>
          {/* <Text style={{ fontSize: 16, color: isDarkMode ? 'white' : 'black' }}>
            Available Time - {request?.availableMinutes} min
          </Text> */}

          <View style={{ marginTop: 12, flexDirection: 'row', gap: 10 }}>
            <CountdownTimer
              onFinish={handleFinish}
              until={getSeconds(request?.responseDeadline)}
              textColor={isDarkMode ? 'white' : 'black'}
              fontSize={16}
            />
            <Text
              style={{ fontSize: 16, color: isDarkMode ? 'white' : 'black' }}
            >
              min left to respond
            </Text>
          </View>
        </View>
        <View
          style={{
            alignItems: 'center',
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: loading ? '#888' : 'green',
              paddingVertical: 14,
              flexDirection: 'row',
              gap: 14,
              borderRadius: 28,
              alignItems: 'center',
              justifyContent: 'center',
              width: 200,
            }}
            disabled={loading}
            onPress={handleAcceptRequest}
          >
            <AntDesign name="wechat" size={24} color="white" />
            <Text
              style={{
                fontSize: 20,
                color: 'white',
              }}
            >
              {loading ? 'Joining...' : 'Join Now'}
            </Text>
            {loading && (
              <ActivityIndicator
                size="small"
                color="white"
                style={{ marginLeft: 4 }}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleRejectRequest}>
            <Text
              style={{
                marginTop: 28,
                color: 'red',
              }}
            >
              Reject {request?.action} Request
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default FullScreenRequest;
