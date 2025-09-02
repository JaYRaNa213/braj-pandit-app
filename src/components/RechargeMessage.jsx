import React, { useState } from 'react';
import {
  Alert,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { useSelector } from 'react-redux';
import { colors } from '../assets/constants/colors';
import { useChat } from '../context/ChatContext';
import { useSocket } from '../context/SocketContext';
import axiosInstance from '../utils/axiosInstance';
import { useTheme } from '../context/ThemeContext';

const RechargeMessage = ({ setIsRechargePopupVisible }) => {
  const { user } = useSelector((state) => state.user);
  const { setRefetch, refetch, setActiveChat } = useChat();
  const { socket } = useSocket();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const {isDarkMode}=useTheme();
  const handlePayment = async () => {
    if (!selectedPlan) {
      ToastAndroid.show('Please select a plan', ToastAndroid.SHORT);
      return;
    }
    const amount = selectedPlan.amount;
    const extra = selectedPlan.extra || 0;

    const payableAmount = amount + (amount * 18) / 100;

    try {
      const {
        data: { key },
      } = await axiosInstance.get('/user/get-key');

      const { data } = await axiosInstance.post('/payment/checkout', {
        amount: payableAmount,
      });

      const amountToBeAdded = amount + extra;

      var options = {
        description: 'Recharge',
        image:
          'https://res.cloudinary.com/doetbfahk/image/upload/v1712225662/vedaz_designImage/whitelogo_v1aoo5.png',
        currency: '₹',
        key: key,
        amount: payableAmount * 100, // Razorpay expects amount in paise
        name: 'Vedaz',
        order_id: data?.order?.id,
        prefill: {
          email: user?.email || 'gaurav.kumar@example.com',
          contact: user?.phone || '9191919191',
          name: user?.name || 'Gaurav Kumar',
        },
        theme: { color: colors.purple },
      };

      RazorpayCheckout.open(options)
        .then(async (razorpayData) => {
          // Manually verify the payment on the backend
          await axiosInstance.post(
            `/payment/verification?amount=${amountToBeAdded}&userId=${user?._id}&isApp=true`,
            {
              razorpay_payment_id: razorpayData.razorpay_payment_id,
              razorpay_order_id: razorpayData.razorpay_order_id,
              razorpay_signature: razorpayData.razorpay_signature,
            },
          );
          ToastAndroid.show('Payment Success', ToastAndroid.SHORT);
          setTimeout(async () => {
            try {
              const response = await axiosInstance.get(
                '/chat-request/active-chat',
                { withCredentials: true },
              );
              const activeChatRes = response.data;

              if (activeChatRes) {
                setActiveChat(activeChatRes);
              }
              setRefetch(!refetch);
              socket.current.emit('rechargeDuringChat', {
                astroId: activeChatRes?.astrologer?._id,
              });
              setIsRechargePopupVisible(false);
            } catch (err) {
              console.error('Failed to fetch active chats:', err);
            }
          }, 3000);
        })
        .catch((error) => {
          console.log('Payment Error:', error);
          Alert.alert('Error', 'Error in payment');
        });
    } catch (error) {
      console.error('Payment Handling Error:', error);
    }
  };

  const rechargePlansForNewUsers = [
    {
      amount: 1,
      extra: 50,
    },
    {
      amount: 50,
      extra: 50,
      percent: 100,
    },
    {
      amount: 100,
      extra: 100,
      percent: 100,
    },
    // {
    //   amount: 200,
    //   extra: 100,
    //   percent: 50,
    // },
    // {
    //   amount: 500,
    //   extra: 250,
    //   percent: 50,
    // },
    // {
    //   amount: 1000,
    //   extra: 200,
    //   percent: 20,
    // },
    // {
    //   amount: 2000,
    //   extra: 400,
    //   percent: 20,
    // },
    // {
    //   amount: 3000,
    //   extra: 300,
    //   percent: 10,
    // },
    // {
    //   amount: 4000,
    //   extra: 600,
    //   percent: 15,
    // },
    // {
    //   amount: 8000,
    //   extra: 1200,
    //   percent: 15,
    // },
  ];

  const rechargePlansForOldUsers = [
    {
      amount: 50,
    },
    {
      amount: 100,
      extra: 35,
      percent: 35,
    },
    {
      amount: 200,
      extra: 80,
      percent: 40,
    },
    // {
    //   amount: 500,
    //   extra: 175,
    //   percent: 35,
    // },
    // {
    //   amount: 1000,
    //   extra: 250,
    //   percent: 25,
    // },
    // {
    //   amount: 2000,
    //   extra: 500,
    //   percent: 25,
    // },
    // {
    //   amount: 3000,
    //   extra: 600,
    //   percent: 20,
    // },
    // {
    //   amount: 4000,
    //   extra: 800,
    //   percent: 20,
    // },
    // {
    //   amount: 5000,
    //   extra: 1000,
    //   percent: 20,
    // },
    // {
    //   amount: 8000,
    //   extra: 1600,
    //   percent: 20,
    // },
    // {
    //   amount: 10000,
    //   extra: 2000,
    //   percent: 20,
    // },
  ];
  const rechargePlans = user?.hasRecharged
    ? rechargePlansForOldUsers
    : rechargePlansForNewUsers;

  return (
    <View
      style={{
        backgroundColor: isDarkMode ? colors.darkBackground: colors.lightBackground,
        padding: 15,
        borderRadius: 12,
        marginVertical: 10,
        alignSelf: 'flex-start',
        width: '90%',
        borderWidth:1,
        borderColor: isDarkMode ? colors.dark : colors.lightGray
      }}
    >
      <Text
        style={{
          color: 'red',
          fontSize: 18,
          fontWeight: 'bold',
          textAlign: 'center',
        }}
      >
        Low Balance!
      </Text>
      <Text
        style={{
          color: isDarkMode ? colors.darkTextPrimary: '#333',
          fontSize: 14,
          textAlign: 'center',
          marginVertical: 8,
        }}
      >
        Recharge now to continue chatting.
      </Text>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 10,
          marginTop: 10,
        }}
      >
        {rechargePlans.map((plan, index) => (
          <TouchableOpacity
            key={index}
            style={{
              padding: 6,
              borderRadius: 6,
              alignItems: 'center',
              borderWidth: selectedPlan?.amount === plan.amount ? 2 : 0.4,
              borderColor: isDarkMode ? colors.darkGreen : 'green',
              width: '30%',
            }}
            onPress={() => setSelectedPlan(plan)}
          >
            <Text
              style={{
                color: isDarkMode? colors.darkTextPrimary : colors.purple,
                fontWeight: '600',
                fontSize: 14,
              }}
            >
              {plan.amount} ₹
            </Text>
            {plan.extra > 0 && (
              <Text
                style={{
                  fontSize: 12,
                  marginTop: 4,
                  color:isDarkMode ? colors.darkTextSecondary : colors.black,
                }}
              >
                + {plan.extra} ₹
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
      <Text style={{ fontSize: 12, textAlign: 'left', marginTop: 10,color:isDarkMode ? colors.darkTextSecondary : colors.black }}>
        +18% GST
      </Text>
      <TouchableOpacity
        style={{
          backgroundColor: isDarkMode ? colors.darkGreen : 'green',
          paddingVertical: 10,
          paddingHorizontal: 16,
          borderRadius: 12,
          marginTop: 24,
          alignSelf: 'flex-end',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
          elevation: 2,
        }}
        onPress={handlePayment}
      >
        <Text
          style={{
            color: 'white',
            fontWeight: '600',
            fontSize: 14,
          }}
        >
          Recharge
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default RechargeMessage;
