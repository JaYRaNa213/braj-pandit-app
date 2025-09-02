import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import person from '../assets/images/person.jpg';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { colors } from '../assets/constants/colors';
import { useChat } from '../context/ChatContext';
import axiosInstance from '../utils/axiosInstance';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { handleStartChatCall } from '../utils/api';

const AstrologerCardSmall = ({ astrologer }) => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.user);

  const {
    setCheckEligibilityLoading,
    setWaitListProps,
    openJoinWaitlistModal,
    setTopAstrologersConfig,
    openTopAstrologerModal,
    closeTopAstrologerModal,
  } = useChat();
  const onlineStatus = astrologer?.isOnlineForChat ? 'online' : 'offline';

  const navigation = useNavigation();
  const { isDarkMode } = useTheme();

  const handleChatCallBtnClick = async (action) => {
    handleStartChatCall({
      action,
      astrologer,
      navigation,
      user,
      setCheckEligibilityLoading,
      setTopAstrologersConfig,
      openTopAstrologerModal,
      closeTopAstrologerModal,
      openJoinWaitlistModal,
      setWaitListProps,
    });
  };
  return (
    <Pressable
      android_ripple={{
        color: isDarkMode ? colors.gray : colors.lightGray,
        foreground: true,
      }}
      onPress={() =>
        navigation.navigate('AstrologerProfile', {
          id: astrologer._id,
        })
      }
      style={{
        padding: 12,
        width: 140,
        borderRadius: 10,
        overflow: 'hidden',
        borderColor: isDarkMode ? colors.dark : colors.lightGray,
        borderWidth: 1,
        position: 'relative',
        backgroundColor:isDarkMode ? colors.darkSurface : colors.white,
        gap: 6,
        justifyContent: 'space-between',
      }}
    >
      {astrologer?.tagline && (
        <View
          style={{
            position: 'absolute',
            top: 14,
            left: -16,
            backgroundColor: '#501873',
            color: 'white',
            paddingHorizontal: 16,
            zIndex: 1000,
            transform: [{ rotate: '-45deg' }],
          }}
        >
          <Text style={{ fontSize: 8, color: 'white' }}>
            {astrologer?.tagline}
          </Text>
        </View>
      )}
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <View
            style={{
              backgroundColor:
                onlineStatus === 'online' ? colors.lightGreen : 'red',
              width: 12,
              height: 12,
              borderRadius: 1000,
              position: 'absolute',
              right: 3,
              bottom: 3,
              zIndex: 1000,
            }}
          />
          {astrologer.image ? (
            <Image
              source={{ uri: astrologer.image ? astrologer.image : 'asdf' }}
              alt={astrologer.name}
              style={{
                width: 60,
                height: 60,
                borderRadius: 120,
              }}
            />
          ) : (
            <Image
              source={person}
              alt={astrologer.name}
              style={{
                width: 60,
                height: 60,
                borderRadius: 120,
              }}
            />
          )}
        </View>
        <View>
          <Text
            style={{
              fontSize: 13,
              color: isDarkMode ? 'white' : '#501873',
              fontWeight: '500',
              textTransform: 'capitalize',
              textAlign: 'center',
            }}
          >
            {astrologer?.name}
          </Text>
          {astrologer?.discountedCharges ? (
            <View
              style={{
                flexDirection: 'row',
                gap: 6,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  textDecorationLine: 'line-through',
                  fontSize: 12,
                  color: isDarkMode ? 'white' : 'black',
                }}
              >
                ₹ {astrologer?.charges}/{t('astrologers.card.min')}
              </Text>
              <Text
                style={{
                  fontWeight: '600',
                  color: isDarkMode ? 'white' : 'black',
                  fontSize: 12,
                }}
              >
                ₹ {astrologer?.discountedCharges}/{t('astrologers.card.min')}
              </Text>
            </View>
          ) : (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 2,
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontWeight: '600',
                  color: isDarkMode ? 'white' : 'black',
                  fontSize: 12,
                }}
              >
                ₹ {astrologer?.charges}/{t('astrologers.card.min')}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Wait time */}
      {astrologer?.waitTime > 0 && (
        <Text
          style={{
            fontSize: 12,
            color: isDarkMode ? 'white' : 'red',
            textAlign: 'center',
            marginBottom: 4,
          }}
        >
          Wait Time - {astrologer?.waitTime} min
        </Text>
      )}

      <View style={styles.actionButtonContainer}>
        {(astrologer?.isOnlineForChat ||
          (!astrologer?.isOnlineForChat && !astrologer?.isOnlineForCall)) && (
          <TouchableOpacity
            style={[styles.actionButtons, { backgroundColor: isDarkMode ? colors.purple : colors.purple }]}
            onPress={() => handleChatCallBtnClick('chat')}
          >
            <Ionicons name="chatbubble-outline" size={24} color={'white'} />
          </TouchableOpacity>
        )}
        {(astrologer?.isOnlineForCall ||
          (!astrologer?.isOnlineForChat && !astrologer?.isOnlineForCall)) && (
          <TouchableOpacity
            style={[
              styles.actionButtons,
              { backgroundColor: isDarkMode ? colors.darkGreen: colors.lightGreen },
            ]}
            onPress={() => handleChatCallBtnClick('call')}
          >
            <Ionicons name="call-outline" size={24} color={'white'} />
          </TouchableOpacity>
        )}
      </View>
    </Pressable>
  );
};

export default AstrologerCardSmall;

const styles = StyleSheet.create({
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    padding: 8,
  },
  actionButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
});
