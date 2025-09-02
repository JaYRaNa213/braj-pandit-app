import { useNavigation, useRoute } from '@react-navigation/native';
import { default as React, useLayoutEffect, useState } from 'react';
import {
  Alert,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { colors } from '../assets/constants/colors';
import { useChat } from '../context/ChatContext';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../utils/axiosInstance';
import DiscountCode from '../components/DiscountCode';
import { useTheme } from '../context/ThemeContext';
import analytics from '@react-native-firebase/analytics';

const PaymentInformation = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useSelector((state) => state.user);
  const { setRefetch, refetch } = useChat();
  const { amount, extra } = route.params || {};
  const { t } = useTranslation();
  const [discountInfo, setDiscountInfo] = useState(null);
  const { isDarkMode } = useTheme();

  const gstPercentage = 18;

  // Calculate discount amount if available
  const discountAmount = discountInfo?.discountAmount || 0;

  // Calculate final amounts
  const amountAfterDiscount = Math.max(0, amount);
  const gstAmount = (amountAfterDiscount * gstPercentage) / 100;
  const payableAmount = amountAfterDiscount + gstAmount;

  // Check if discount is applicable (₹500 or more)
  const isDiscountApplicable = amount >= 500;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Payment Information',
    });
  }, [navigation]);

  const handlePayment = async () => {
    const amountToBeAdded = amount + extra;
    try {
      const {
        data: { key },
      } = await axiosInstance.get('/user/get-key');

      // Prepare payment data
      const paymentData = {
        amount: payableAmount,
      };

      // Add discount code if available
      if (discountInfo && discountInfo.discountCode) {
        paymentData.discountCode = discountInfo.discountCode;
      }

      const { data } = await axiosInstance.post(
        '/payment/checkout',
        paymentData,
      );

      var options = {
        description: 'Recharge',
        image:
          'https://res.cloudinary.com/doetbfahk/image/upload/v1712225662/vedaz_designImage/whitelogo_v1aoo5.png',
        currency: 'INR',
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
          console.log('Payment Success:', razorpayData);

          await analytics().logEvent('recharge', {
            transaction_id: razorpayData.razorpay_payment_id,
            order_id: razorpayData.razorpay_order_id,
            amount: payableAmount, // in INR
            currency: 'INR',
            method: 'razorpay', // could also send "upi", "card", etc.
            status: 'success',
            user_id: user?._id,
            discount: discountAmount || 0,
            extra_cashback: extra || 0,
          });

          // Build verification URL with discount code if applicable
          let verificationUrl = `/payment/verification?amount=${amountToBeAdded}&userId=${user?._id}&isApp=true`;

          if (discountInfo && discountInfo.discountCode) {
            verificationUrl += `&discountCode=${discountInfo.discountCode}`;
          }

          // Manually verify the payment on the backend
          await axiosInstance.post(verificationUrl, {
            razorpay_payment_id: razorpayData.razorpay_payment_id,
            razorpay_order_id: razorpayData.razorpay_order_id,
            razorpay_signature: razorpayData.razorpay_signature,
          });
          ToastAndroid.show('Payment Success', ToastAndroid.SHORT);
          setRefetch(!refetch);
          navigation.goBack();
        })
        .catch((error) => {
          console.log('Payment Error:', error);
          ToastAndroid.show('Payment Failed', ToastAndroid.SHORT);
        });
    } catch (error) {
      console.error('Payment Handling Error:', error.response);
      ToastAndroid.show('Payment Failed', ToastAndroid.SHORT);
    }
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: isDarkMode ? colors.darkBackground : '#f5f5f5',
      }}
    >
      {/* Payment Summary Section */}
      <View
        style={{
          backgroundColor: isDarkMode
            ? colors.darkBackground
            : colors.lightBackground,
          padding: 20,
          borderBottomWidth: 1,
          borderBottomColor: '#e0e0e0',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color: isDarkMode ? colors.darkTextPrimary : colors.black,
            }}
          >
            Recharge Amount
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: isDarkMode ? colors.darkTextPrimary : colors.black,
            }}
          >
            ₹ {amount}
          </Text>
        </View>

        {discountInfo && discountAmount > 0 && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: isDarkMode ? colors.darkTextPrimary : colors.black,
              }}
            >
              {t('Recharge.discount.bonus', {
                code: discountInfo.discountCode,
              })}
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: isDarkMode ? colors.darkTextPrimary : colors.black,
              }}
            >
              + ₹ {discountAmount}
            </Text>
          </View>
        )}

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color: isDarkMode ? colors.darkTextPrimary : colors.black,
            }}
          >
            GST ({gstPercentage}%)
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: isDarkMode ? colors.darkTextPrimary : colors.black,
            }}
          >
            ₹ {gstAmount}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingTop: 10,
            borderTopWidth: 1,
            borderTopColor: '#e0e0e0',
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: isDarkMode ? colors.darkTextPrimary : colors.black,
            }}
          >
            PAYABLE AMOUNT
          </Text>
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: isDarkMode ? colors.darkTextPrimary : colors.black,
            }}
          >
            ₹ {payableAmount}
          </Text>
        </View>

        {discountInfo && discountAmount > 0 && (
          <View
            style={{
              marginTop: 10,
              paddingTop: 10,
              borderTopWidth: 1,
              borderTopColor: '#e0e0e0',
            }}
          >
            <Text
              style={{ fontSize: 16, fontWeight: 'bold', color: '#4CAF50' }}
            >
              {t('Recharge.discount.bonusDesc', {
                amount: `₹${discountAmount}`,
              })}
            </Text>
          </View>
        )}
      </View>

      {/* Offer Section */}
      {extra > 0 && (
        <View
          style={{
            backgroundColor: isDarkMode ? colors.darkSurface : '#e6f7fa',
            margin: 15,
            padding: 15,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: isDarkMode ? colors.darkGreen : '#4CAF50',
            borderStyle: 'dashed',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Ionicons
            name="checkmark-circle"
            size={24}
            color={isDarkMode ? colors.darkGreen : '#4CAF50'}
            style={{ marginRight: 10 }}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: isDarkMode ? colors.darkTextPrimary : colors.darkGreen,
              }}
            >
              ₹ {extra} extra on recharge of ₹ {amount}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: isDarkMode ? colors.darkTextPrimary : colors.gray,
                marginTop: 5,
              }}
            >
              ₹ {extra} Cashback in Vedaz wallet with this recharge
            </Text>
          </View>
        </View>
      )}

      {/* Discount Code Section */}
      <View style={{ margin: 15 }}>
        {isDiscountApplicable ? (
          <DiscountCode amount={amount} onDiscountApplied={setDiscountInfo} />
        ) : (
          <View
            style={{
              padding: 15,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              backgroundColor: isDarkMode ? colors.darkBackground : '#FEF2F2',
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#DC2626',
                marginBottom: 5,
              }}
            >
              Discount Not Available
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: isDarkMode ? colors.darkGray : '#333',
              }}
            >
              Discount codes are only applicable for recharges of ₹500 or more.
            </Text>
          </View>
        )}
      </View>

      {/* Proceed to Pay Button */}
      <TouchableOpacity
        style={{
          backgroundColor: colors.purple,
          paddingVertical: 15,
          margin: 15,
          marginTop: 5,
          borderRadius: 10,
          alignItems: 'center',
        }}
        onPress={handlePayment}
      >
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>
          Proceed to Pay
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default PaymentInformation;
