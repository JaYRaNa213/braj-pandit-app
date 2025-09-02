import { Linking } from 'react-native';
const ANDROID_PACKAGE_NAME = "com.vedaz.user.myapp";

export const redirectToStoreForFeedback = async () => {
  let url = '';

  if (Platform.OS === 'android') {
    // Option 1: Direct to Play Store review section (preferred for feedback)
    // url = `market://details?id=${ANDROID_PACKAGE_NAME}&showAllReviews=true`; // This used to work better
    url = `market://details?id=${ANDROID_PACKAGE_NAME}`; // Just open the app page. Users can find the review section easily.

    // Fallback for emulators/devices without Play Store: web URL
    // const fallbackUrl = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_NAME}`;

  } else {
    Alert.alert('Unsupported Platform', 'Store redirection is not supported on this platform.');
    return;
  }

  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      // If the native app store cannot be opened, try a web fallback
      console.warn(`Cannot open native store URL: ${url}. Attempting web fallback.`);
      if (Platform.OS === 'android') {
          await Linking.openURL(`https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_NAME}`);
      } 
    }
  } catch (error) {
    console.error('An error occurred trying to open the store link:', error);
    Alert.alert('Error', 'Could not open the app store. Please try again later.');
  }
};