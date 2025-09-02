// import axios from 'axios';
import axios from 'axios';
// import * as Notification from 'expo-notifications';
import { Platform, ToastAndroid } from 'react-native';
import FileViewer from 'react-native-file-viewer';
import RNFS from 'react-native-fs';
import { userExist, userNotExist } from '../redux/reducer/userReducer';
import { REACT_APP_BACKEND_URL } from './domain';
import { getToken } from './token';

export const fetchUser = async (getUser, dispatch, setUserFetched) => {
  const token = await getToken();
  console.log('token', token);

  if (token) {
    const { data, error } = await getUser(token);
    if (error) {
      setUserFetched(true);
      return console.log('error in getting user', error);
    }
    if (data) {
      const session = data?.user?.sessions?.find((ses) => ses.token === token);
      dispatch(
        userExist({
          user: data?.user,
          session: session,
        }),
      );
    } else {
      dispatch(userNotExist());
    }
  } else {
    dispatch(userNotExist());
  }
  setUserFetched(true);
};

// export const setupPushNotifications = async (user, saveExpoPushToken) => {
// 	if (user) {
// 		const { status } = await Notification.getPermissionsAsync();
// 		let finalStatus = status;

// 		if (finalStatus !== 'granted') {
// 			const { status } = await Notification.requestPermissionsAsync();
// 			finalStatus = status;
// 		}

// 		if (finalStatus !== 'granted') {
// 			ToastAndroid.show('Notification permission not granted', ToastAndroid.SHORT);

// 			return;
// 		}

// 		const pushToken = await Notification.getExpoPushTokenAsync();
// 		// console.log(pushToken);
// 		try {
// 			const res = await saveExpoPushToken({ userId: user?._id, token: pushToken?.data });
// 			// console.log(res);
// 		} catch (error) {
// 			console.log(error);
// 		}

// 		if (Platform.OS === 'android') {
// 			Notification.setNotificationChannelAsync('default', {
// 				name: 'default',
// 				importance: Notification.AndroidImportance.DEFAULT,
// 			});
// 		}
// 	}
// };

export const getDeviceInfo = () => {
  let osName;
  if (Platform.OS === 'android') {
    osName = 'Android';
  }
  console.log(
    `${osName} ${Platform.constants.Release} | ${Platform.constants.Model}`,
    Platform,
  );
  return `${osName} ${Platform.constants.Release} | ${Platform.constants.Model}`;
};

export const fileFormat = (url = '') => {
  const fileExt = url.split('.').pop().toLowerCase();

  if (fileExt === 'ogg') {
    return 'video';
  }

  if (
    fileExt === 'mp3' ||
    fileExt === 'wav' ||
    fileExt === '3gp' ||
    fileExt === 'mp4' ||
    fileExt === 'webm'
  ) {
    return 'audio';
  }

  if (
    fileExt === 'png' ||
    fileExt === 'jpg' ||
    fileExt === 'jpeg' ||
    fileExt === 'gif'
  ) {
    return 'image';
  }
  if (fileExt === 'pdf' || fileExt === 'doc') {
    return 'document';
  }

  return 'file';
};

export const getFirstTimeUser = async (userId, setIsFree) => {
  const { data } = await axios.get(
    `${REACT_APP_BACKEND_URL}/user/isFirstTimeUser/${userId}`,
  );
  if (data) {
    setIsFree(data?.isFirstTime);
  }
};

export const openFile = async (url) => {
  try {
    // Extract the filename and determine the local file path
    const filename = url.split('/').pop();
    const localPath = `${RNFS.DocumentDirectoryPath}/${filename}`;

    // Check if the file exists locally, else download it
    const fileExists = await RNFS.exists(localPath);

    if (!fileExists) {
      const downloadResult = await RNFS.downloadFile({
        fromUrl: url,
        toFile: localPath,
      }).promise;

      if (downloadResult.statusCode !== 200) {
        ToastAndroid.show('Error', 'Failed to download the file.');
        return;
      }
    }

    // Open the file
    await FileViewer.open(localPath, { showOpenWithDialog: true });
  } catch (error) {
    if (error.message.includes('No app associated with this mime type')) {
      ToastAndroid.show(
        'Error',
        'No app found to open this file type. Please install a suitable app and try again.',
      );
    } else {
      console.error('Error opening file:', error);
      ToastAndroid.show('Error', 'Failed to open file.');
    }
  }
};

export const getSeconds = (futureTime) => {
  const currentTime = new Date().toISOString();
  const deadline = new Date(futureTime);
  const now = new Date(currentTime);
  const secondsLeft = Math.max(0, Math.floor((deadline - now) / 1000));
  return secondsLeft;
};

export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const getAstrologerName = (unique_name, prefixName) => {
  if (!unique_name || !unique_name.trim()) {
    return;
  }
  if (!prefixName) {
    prefixName = 'Acharya';
  }

  const capitalizeWord = (word) =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

  return `${prefixName} ${capitalizeWord(unique_name)}`;
};
