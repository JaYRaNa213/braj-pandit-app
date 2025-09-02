import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../assets/constants/colors';
import { useChat } from '../context/ChatContext';
import axiosInstance from '../utils/axiosInstance';
import { capitalize } from '../utils/helper';
import PendingRequestItem from './PendingRequestItem';

const ChatsPopUp = () => {
  const { pendingRequests, activeChat, setPendingRequests } = useChat();
  const navigation = useNavigation();
  const [expanded, setExpanded] = useState(true);

  const toggleRequests = () => {
    setExpanded(!expanded);
  };

  const handleCancelRequest = async (chatReqId, action) => {
    try {
      const { data } = await axiosInstance.get(
        `/chat-request/cancel/${chatReqId}`,
      );
      if (data.success) {
        ToastAndroid.show(
          `${capitalize(action)} request cancelled`,
          ToastAndroid.SHORT,
        );
        AsyncStorage.removeItem('lastTimestamp');
        setPendingRequests((prev) =>
          prev.map((request) =>
            request._id === chatReqId
              ? { ...request, status: 'cancelled' }
              : request,
          ),
        );
      }
    } catch (error) {
      ToastAndroid.show(
        `Failed to cancel ${action} request`,
        ToastAndroid.SHORT,
      );
    }
  };

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        width: '100%',
        // height: ,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: '100%',
        }}
      >
        {pendingRequests?.length > 1 && (
          <TouchableOpacity
            onPress={toggleRequests}
            style={{
              alignSelf: 'center',
              marginVertical: 10,
              paddingHorizontal: 12,
              paddingVertical: 6,
              backgroundColor: colors.purple100,
              borderRadius: 50,
              flexDirection: 'row',
              alignItems: 'center',
            }}
            activeOpacity={0.9}
          >
            <MaterialCommunityIcons
              name={expanded ? 'chevron-down' : 'chevron-up'}
              size={24}
              color="#4B0082"
            />
            <View style={{ marginLeft: 8 }}>
              <Text
                style={{ fontSize: 12, color: '#4B0082', fontWeight: '600' }}
              >
                Requested : {pendingRequests?.length}
              </Text>
              {activeChat && (
                <Text
                  style={{ fontSize: 12, color: 'green', fontWeight: '600' }}
                >
                  Active : 1
                </Text>
              )}
            </View>
          </TouchableOpacity>
        )}

        {expanded && (
          <ScrollView
            style={{
              backgroundColor: 'white',
              paddingTop: 12,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              width: '100%',
              borderColor: '#ddd',
              maxHeight: 400,
              borderWidth: 1,
              borderBottomWidth: 0,
            }}
          >
            {activeChat && (
              <View
                style={{
                  width: '100%',
                  borderBottomWidth: 1,
                  borderColor: '#ddd',
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 14,
                  }}
                >
                  <View
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Image
                      source={{
                        uri: activeChat?.astrologer?.pic,
                      }}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 80,
                        objectCenter: 'center',
                      }}
                    />
                  </View>
                  <View style={{ display: 'flex', justifyContent: 'start' }}>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: 'bold',
                        textTransform: 'capitalize',
                        color: '#4B0082',
                      }}
                    >
                      {activeChat?.astrologer?.name}
                    </Text>
                    <Text style={{ color: 'green', fontSize: 12 }}>
                      Chat is in progress
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 20,
                  }}
                >
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderWidth: 1,
                      borderColor: 'green',
                      borderRadius: 5,
                      paddingHorizontal: 20,
                      paddingVertical: 4,
                    }}
                    onPress={() =>
                      navigation.navigate('ActiveChat', {
                        chatId: activeChat?._id,
                      })
                    }
                  >
                    <Text style={{ color: 'green', fontSize: 12 }}>Chat</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {pendingRequests?.map((request) => (
              <PendingRequestItem
                key={request?._id}
                request={request}
                handleCancelRequest={handleCancelRequest}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

export default ChatsPopUp;
