import { ToastAndroid } from 'react-native';
import axiosInstance from './axiosInstance';
import { getAstrologerName } from './helper';

export const getWaitTime = async (id) => {
  const res = await axiosInstance.get(`/astro/wait-time/${id}`);
  return res.data;
};

export const handleStartChatCall = async ({
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
}) => {
  closeTopAstrologerModal();
  setCheckEligibilityLoading(true);
  if (!user) {
    ToastAndroid.show('Please login to continue', ToastAndroid.SHORT);
    setCheckEligibilityLoading(false);
    return navigation.navigate('MobileLogin');
  }

  if (!astrologer?.isCertified) {
    ToastAndroid.show(
      `Sorry, ${astrologer?.name} is not available right now`,
      ToastAndroid.SHORT,
    );
    setCheckEligibilityLoading(false);
    setTopAstrologersConfig({
      astroName: getAstrologerName(
        astrologer?.unique_name,
        astrologer?.prefixName,
      ),
      requestType: action,
    });
    openTopAstrologerModal();
    return;
  }

  if (
    action === 'chat' &&
    astrologer?.communicationMode &&
    astrologer?.communicationMode === 'call'
  ) {
    return ToastAndroid.show(
      'Astrologer is not available to chat.',
      ToastAndroid.SHORT,
    );
  }

  try {
    const { data } = await axiosInstance.get(
      `/chat-request/check-eligibility/${astrologer?._id}/?action=${action}`,
    );

    if (!data?.success) {
      ToastAndroid.show('Failed to start chat', ToastAndroid.SHORT);
      return;
    }

    if (data.isFreeAvailable && data.freeChatLimitPerDay <= 0) {
      ToastAndroid.show(
        'Astrologer is not available for free! Please recharge to continue',
        ToastAndroid.SHORT,
      );
      return navigation.navigate('Recharge');
    }

    if (
      data.isFreeAvailable &&
      !data.isAstroAvailableForFree &&
      data.insufficientBalance
    ) {
      ToastAndroid.show(
        'Astrologer is not available for free! Please recharge to continue',
        ToastAndroid.SHORT,
      );
      return;
    }
    if (data.isFreeAvailable && data.isAstroAvailableForFree) {
      if (data.isAlreadyChatRequested) {
        ToastAndroid.show(
          'You cannot start free chat with astrologer',
          ToastAndroid.SHORT,
        );
        return;
      }
    }

    if (!data.isFreeAvailable) {
      if (data.insufficientBalance) {
        ToastAndroid.show(
          `Min. balance for 2 mins i.e. ₹ ${
            astrologer?.chargeAfterDiscount * 2
          } is required to proceed.`,
          ToastAndroid.SHORT,
        );
        navigation.navigate('Recharge');
        return;
      }

      if (data.isAlreadyChatRequested) {
        ToastAndroid.show(
          'You cannot join waitlist of same astrologer',
          ToastAndroid.SHORT,
        );
        return;
      }

      if (data.isMaxWaitlistCrossed) {
        ToastAndroid.show(
          'You can join waitlist of max 10 astrologers',
          ToastAndroid.SHORT,
        );
        return;
      }
    }

    if (data.isActiveChat) {
      ToastAndroid.show(
        'You have an active chat, Please end the current chat to start a new one',
        ToastAndroid.LONG,
      );
      return;
    }
    if (!data.isOnline) {
      setWaitListProps({
        astrologer,
        action,
      });
      return openJoinWaitlistModal();
    }
  } catch (error) {
    console.log(error);

    ToastAndroid.show('Failed to start chat', ToastAndroid.SHORT);
    return;
  } finally {
    setCheckEligibilityLoading(false);
  }
  navigation.navigate('ChatIntakeForm', {
    id: astrologer?._id,
    action,
  });
};
