import React, { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useChat } from '../context/ChatContext';
import { useSocket } from '../context/SocketContext';
import { useGetAstroProfileQuery } from '../redux/api/astrologerApi';
import moment from 'moment';
import { useSelector } from 'react-redux';

const UserSideAstroPopup = () => {
  const { socket, timerForUserTimeId } = useSocket();
  const {
    setRequestedAstroId,
    setUserIdRequestedChat,
    setIsChatRequested,
    useTime,
    requestedAstroId,
    isChatScheduledByAstro,
    actionByUser,
    setshowUserSideChatPopUp,
    timeLeftForAstro,
    setDelayTiming,
  } = useChat();
  const { user } = useSelector((state) => state.user);
  const { data: astrologer } = useGetAstroProfileQuery(requestedAstroId);
  const [timer, setTimer] = useState(timeLeftForAstro || 5 * 60);
  const [isRunning, setIsRunning] = useState(true);
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  useEffect(() => {
    let startTimer = 0;

    if (isRunning) {
      startTimer = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }

    return () => clearInterval(startTimer);
  }, [isRunning]);

  useEffect(() => {
    if (timer === 0) {
      setIsRunning(false);
      setIsCancelOpen(true);
    }
  }, [timer]);

  let titleWord = actionByUser === 'Call' ? 'CALL' : 'CHAT';

  const handleCancel = () => {
    if (timerForUserTimeId.current) {
      clearInterval(timerForUserTimeId.current);
      timerForUserTimeId.current = null;
    }
    setRequestedAstroId(null);
    setUserIdRequestedChat(null);
    setIsChatRequested(false);
    socket.current.emit('chatCancel', {
      astroId: requestedAstroId,
      userId: user?._id,
    });
    setDelayTiming(null);
    setshowUserSideChatPopUp(false);
  };

  return (
    <View
      style={{
        position: 'absolute',
        bottom: '4%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: '90%',
          margin: 'auto',
          borderWidth: 1,
          borderColor: '#000',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.8,
          shadowRadius: 2,
          borderRadius: 5,
          padding: 16,
          backgroundColor: '#E5E7EB',
          gap: 20,
        }}
      >
        <View
          style={{ flexDirection: 'row', gap: 10, width: '100%', padding: 5 }}
        >
          <View
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '25%',
            }}
          >
            <Image
              source={{ uri: astrologer?.image }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                objectCenter: 'center',
              }}
            />
            <Text style={{ fontWeight: 'bold', color: '#4B0082' }}>
              {titleWord}
            </Text>
          </View>
          <View
            style={{ display: 'flex', justifyContent: 'start', width: '75%' }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                textTransform: 'capitalize',
                color: '#4B0082',
              }}
            >
              {astrologer?.name}
            </Text>
            <Text style={{ color: '#4B0082' }}>
              ₹ {astrologer?.charges}/min
            </Text>
            {!isChatScheduledByAstro ? (
              <Text style={{ color: '#4B0082', fontSize: 12 }}>
                {actionByUser} initiated consultant gets{' '}
                {moment.utc(timer * 1000).format('mm:ss')} min to accept
              </Text>
            ) : (
              <Text style={{ color: '#4B0082' }}>
                {actionByUser} starts in {useTime} min.
              </Text>
            )}
          </View>
        </View>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20,
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: '#FFFFFF',
              color: '#4B0082',
              borderWidth: 1,
              borderColor: '#4B0082',
              borderRadius: 5,
              paddingHorizontal: 12,
              paddingVertical: 4,
            }}
          >
            <Text style={{ color: '#4B0082' }}>Waiting</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              borderWidth: 1,
              borderColor: 'red',
              borderRadius: 5,
              paddingHorizontal: 12,
              paddingVertical: 4,
            }}
            onPress={handleCancel}
          >
            <Text style={{ color: 'red' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default UserSideAstroPopup;
