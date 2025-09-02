import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { colors } from '../assets/constants/colors';
import { useChat } from '../context/ChatContext';
import { useTheme } from '../context/ThemeContext';
import axiosInstance from '../utils/axiosInstance';
import WithSafeArea from '../components/HOC/SafeAreaView';

const Recharge = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.user);
  const [rechargePlans, setRechargePlans] = useState([]);

  const { isDarkMode } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [customAmount, setCustomAmount] = useState(''); // State for custom recharge amount
  const [discountInfo, setDiscountInfo] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [selectedExtra, setSelectedExtra] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const navigation = useNavigation();
  const { setRefetch, refetch } = useChat();

  const getRechargePlans = async () => {
    const userType = user?.hasRecharged ? 'old' : 'new';
    try {
      const { data } = await axiosInstance.get(`/recharge-plan/${userType}`);
      if (data) {
        setRechargePlans(data);
      }
    } catch (error) {
      console.error('Error fetching recharge plans:', error);
    }
  };

  useEffect(() => {
    getRechargePlans();
  }, [user]);

  const handleCardClick = (amount, extra, index) => {
    setSelectedAmount(amount);
    setSelectedExtra(extra || 0);
    setSelectedPackage(index);
    setCustomAmount(''); // Clear any custom amount when a package is selected

    // Navigate directly to payment information
    if (user) {
      navigation.navigate('PaymentInformation', {
        amount,
        extra: extra || 0,
      });
    } else {
      navigation.navigate('MobileLogin');
    }
  };

  const handleCustomAmount = (text) => {
    setCustomAmount(text.replace(/[^0-9]/g, ''));
    const amount = parseFloat(text) || 0;
    setSelectedAmount(amount);
    setSelectedExtra(0);
    setSelectedPackage(null); // Clear selected package when entering custom amount
  };

  const handleContinue = () => {
    const amount = parseFloat(customAmount) || 0;

    if (!amount || amount <= 0) {
      ToastAndroid.show('Please enter a valid amount', ToastAndroid.SHORT);
      return;
    }

    if (user) {
      navigation.navigate('PaymentInformation', {
        amount,
        extra: 0,
      });
      setCustomAmount(''); // Reset the input field after navigation
    } else {
      navigation.navigate('MobileLogin');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setRefetch(!refetch);
    setRefreshing(false);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('Recharge.sectionHead'),
    });
  }, [navigation, t]);

  return (
    <ScrollView
      contentContainerStyle={{
        paddingBottom: 30,
        paddingHorizontal: 20,
        backgroundColor: isDarkMode ? colors.darkBackground : '#F8F9FA',
        flexGrow: 1,
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={isDarkMode ? '#FFFFFF' : colors.purple}
        />
      }
      keyboardShouldPersistTaps="handled"
    >
      {/* Header Section */}
      <View
        style={{
          borderRadius: 16,
          paddingVertical: 16,
          paddingHorizontal: 20,
          marginTop: 20,
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontSize: 26,
            fontWeight: 'bold',
            color: isDarkMode ? colors.darkTextPrimary : colors.purple,
            letterSpacing: 1,
            marginBottom: 12,
          }}
        >
          {t('Recharge.head')}
        </Text>
        {user && (
          <View style={{alignItems:'center'}}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 20,
                marginBottom: 20, // Add space for the input field below
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: isDarkMode ? colors.darkTextSecondary : colors.dark,
                }}
              >
                {t('Recharge.availableBalance')}
              </Text>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '700',
                  color: isDarkMode ? colors.darkAccent : colors.purple,
                  marginLeft: 8,
                }}
              >
                ₹ {user?.available_balance?.toFixed(2)}
              </Text>
            </View>

            {/* Custom Recharge Input Section */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent:'space-between',
                width: '100%',
                gap: 10
              }}
            >
              <TextInput
                style={{
                  flex: 1,
                  backgroundColor: isDarkMode ? colors.darkSurface : '#FFFFFF',
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: isDarkMode ? colors.dark : '#E5E7EB',
                  color: isDarkMode ? '#FFFFFF' : '#000000',
                  fontSize: 16,
                  paddingHorizontal:15
                }}
                placeholder={'Enter amount in INR'}
                placeholderTextColor={isDarkMode ? colors.darkTextSecondary : '#999999'}
                keyboardType="numeric"
                value={customAmount}
                onChangeText={handleCustomAmount}
              />

              {/* Continue Button (only for custom amount) */}
            <TouchableOpacity
              onPress={handleContinue}
              style={{
                borderRadius: 20,
                flexDirection:'row',
                borderWidth:1,
                borderColor:isDarkMode ? colors.darkTextPrimary: colors.black,
                paddingHorizontal:10,
                paddingVertical:8
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: isDarkMode ? colors.darkTextPrimary: colors.black,
                }}
              >
                Continue
              </Text>
            </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Recharge Plans Section */}
      <View
        style={{
          marginTop: 30,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: '600',
            color: isDarkMode ? '#FFFFFF' : '#2C3E50',
            textAlign: 'center',
            marginBottom: 20,
            letterSpacing: 0.5,
          }}
        >
          {t('Recharge.recharges')}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          {rechargePlans?.map((plan, index) => (
            <TouchableOpacity
              key={index}
              onPress={() =>
                handleCardClick(plan.amount, plan.extra || 0, index)
              }
              style={{
                width: '31%',
                backgroundColor:
                  selectedPackage === index
                    ? isDarkMode
                      ? colors.purple
                      : '#F0E6FF'
                    : isDarkMode
                    ? colors.darkSurface
                    : '#FFFFFF',
                borderRadius: 16,
                paddingHorizontal: 6,
                paddingVertical: 12,
                alignItems: 'center',
                borderWidth: 2,
                borderColor:
                      selectedPackage === index
                      ? 
                      (isDarkMode
                      ? colors.purple
                      : colors.purple)
                      :
                      (isDarkMode
                      ? colors.dark
                      : colors.lightGray),
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: isDarkMode ? colors.darkTextPrimary : colors.purple,
                  marginBottom: 10,
                }}
              >
                ₹ {plan.amount}
              </Text>
              {plan.extra > 0 && (
                <View
                  style={{
                    backgroundColor: isDarkMode ? colors.darkGreen : '#D4F4D8',
                    paddingVertical: 3,
                    paddingHorizontal: 6,
                    borderRadius: 20,
                    borderWidth: 1
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '600',
                      color: isDarkMode ? '#FFFFFF' : '#28A745',
                      textTransform: 'uppercase',
                    }}
                  >
                    {`+₹${plan.extra} Extra`}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default WithSafeArea(Recharge);
