import React, { useState, useEffect } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import { useChat } from '../context/ChatContext';
import CountdownTimer from './CountdownTimer';
import { getSeconds } from '../utils/helper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PendingRequestItem = ({ request, handleCancelRequest }) => {
  const { setPendingRequests } = useChat();
  const [hasExpired, setHasExpired] = useState(false);

  useEffect(() => {
    if (hasExpired) {
      if (request.status === 'requested') {
        AsyncStorage.removeItem('lastTimestamp');
        setPendingRequests((prev) =>
          prev.map((req) =>
            req._id === request._id ? { ...req, status: 'expired' } : req,
          ),
        );
      } else if (request.status === 'scheduled') {
        AsyncStorage.removeItem('lastTimestamp');
        setPendingRequests((prev) =>
          prev.map((req) =>
            req._id === request._id ? { ...req, status: 'accepted' } : req,
          ),
        );
      }
    }
  }, [hasExpired, request, setPendingRequests]);

  const handleFinish = () => {
    setHasExpired(true);
  };

  const getStatusMessage = () => {
    switch (request.status) {
      case 'expired':
        return (
          <Text style={{ color: 'red', fontSize: 12 }}>
            {request.astroName} missed the {request.action} request.
          </Text>
        );
      case 'rejected':
        return (
          <Text style={{ color: 'red', fontSize: 12 }}>
            {request.astroName} rejected the {request.action} request
          </Text>
        );
      case 'cancelled':
        return (
          <Text style={{ color: 'red', fontSize: 12 }}>
            <Text style={{ textTransform: 'capitalize' }}>
              {request.action}
            </Text>{' '}
            request cancelled by you
          </Text>
        );
      default:
        return null;
    }
  };

  return (
    <View
      key={request._id}
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
        height: 70,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Image
          source={{ uri: request.astroImage }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 80,
          }}
        />
        <View>
          <Text
            style={{
              fontSize: 12,
              fontWeight: 'bold',
              textTransform: 'capitalize',
              color: '#4B0082',
            }}
          >
            {request.astroName}
          </Text>
          <Text style={{ color: '#4B0082', fontSize: 12 }}>
            ₹ {request.astroCharges}/min
          </Text>

          {request?.status === 'requested' && (
            <Text
              style={{
                color: '#4B0082',
                fontSize: 12,
                textTransform: 'capitalize',
              }}
            >
              {request.action} initiated, Wait Time -{' '}
              <CountdownTimer
                onFinish={handleFinish}
                until={getSeconds(request.responseDeadline)}
              />{' '}
              min
            </Text>
          )}
          {request?.status === 'scheduled' && (
            <Text
              style={{
                color: '#4B0082',
                fontSize: 12,
                textTransform: 'capitalize',
              }}
            >
              {request.action} will start in{' '}
              <CountdownTimer
                onFinish={handleFinish}
                until={getSeconds(request.scheduledTime)}
              />{' '}
              min
            </Text>
          )}
          {getStatusMessage(request)}
        </View>
      </View>
      {request?.status === 'requested' || request?.status === 'scheduled' ? (
        <TouchableOpacity
          style={{
            borderWidth: 1,
            borderColor: 'red',
            borderRadius: 5,
            paddingHorizontal: 12,
            paddingVertical: 4,
            justifyContent: 'center',
          }}
          onPress={() => handleCancelRequest(request._id, request.action)}
        >
          <Text style={{ color: 'red', fontSize: 12 }}>Cancel</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() =>
            setPendingRequests((prev) =>
              prev.filter((req) => req._id !== request._id),
            )
          }
        >
          <Entypo name="circle-with-cross" size={22} color={'#222'} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default PendingRequestItem;
