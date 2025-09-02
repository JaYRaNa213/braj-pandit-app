import Clipboard from '@react-native-clipboard/clipboard'; // Non-Expo Clipboard library
import { useNavigation } from '@react-navigation/native';
import React, { useLayoutEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import FreeAstrologersBtn from '../components/FreeAstrologersBtn';
import { useTheme } from '../context/ThemeContext';
import { colors } from '../assets/constants/colors';

const ReferAndEarn = () => {
  const { user } = useSelector((state) => state.user);
  const { isDarkMode } = useTheme();
  const [copied, setCopied] = useState(false);

  const [referralCode] = useState(user?.referralCode);
  const navigation = useNavigation();

  const handleCopy = () => {
    Clipboard.setString(referralCode); // Use non-Expo Clipboard library
    setCopied(true);
    Alert.alert('Copied to clipboard!', 'Your referral code has been copied.');
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Use my referral code ${referralCode} and earn ₹10 on signup! \n\nSign up here: https://vedaz.io/signin-with-email?referralCode=${referralCode}`,
        title: 'Refer and Earn', // The title is primarily for iOS and may not appear on Android.
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type: ', result.activityType);
        } else {
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'An error occurred while trying to share the referral code.',
      );
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Refer and Earn',
    });
  }, [navigation]);

  return (
    <>
      <ScrollView
        contentContainerStyle={{
          flex: 1,
          paddingHorizontal: 20,
          paddingVertical: 10,
          gap: 25,
          alignItems: 'center',
          justifyContent:'center',
          backgroundColor: isDarkMode ? colors.darkBackground : colors.lightBackground,
        }}
      >
        <View style={{ width: '100%' }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: '500',
              textAlign: 'center',
              color: isDarkMode ? 'white' : '#2c3e50',
            }}
          >
            Refer and Earn Rs. 100
          </Text>
          <Text
            style={{
              fontSize: 14,
              paddingHorizontal: 10,
              color: '#7f8c8d',
              textAlign: 'center',
            }}
          >
            Share your referral code with 10 friends and earn Rs. 100!
          </Text>
        </View>

        <Image
          source={require('../assets/images/refer-and-earn.jpg')}
          style={{
            width: 130,
            height: 100,
          }}
        />
        {/* Card Referal Card */}
        <View
          style={{
            width: '90%',
            padding: 10,
            backgroundColor: isDarkMode ? colors.darkSurface : 'white',
            borderRadius: 12,
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 3 },
            flex: 'column',
            gap: 14,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              color: isDarkMode ? '#f8f9fa' : '#7f8c8d',
              fontWeight: '500',
              textAlign: 'center',
            }}
          >
            Your Referral Code
          </Text>
          <TextInput
            style={{
              fontSize: 22,
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 8,
              textAlign: 'center',
              backgroundColor: '#f8f9fa',
              fontWeight: 'bold',
              color: '#34495e',
            }}
            value={referralCode}
            editable={false}
            selectTextOnFocus
          />
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#3498db',
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 8,
              justifyContent: 'center',
            }}
            onPress={handleCopy}
          >
            <Ionicons name="clipboard" size={24} color="#fff" />
            <Text style={{ fontSize: 16, color: '#fff', marginLeft: 8 }}>
              Copy Code
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#28a745',
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 8,
              justifyContent: 'center',
            }}
            onPress={handleShare}
          >
            <MaterialIcons name="share" size={24} color="#fff" />
            <Text style={{ fontSize: 16, color: '#fff', marginLeft: 8 }}>
              Share Code
            </Text>
          </TouchableOpacity>
        </View>

        <Text
          style={{
            fontSize: 13,
            color: isDarkMode ? '#DDD' : '#34495e',
            textAlign: 'center',
            paddingHorizontal: 20,
          }}
        >
          Your friends will receive exclusive rewards when they sign up using
          your referral code. Don’t miss out on the fun!
        </Text>
      </ScrollView>
      <FreeAstrologersBtn />
    </>
  );
};

export default ReferAndEarn;
