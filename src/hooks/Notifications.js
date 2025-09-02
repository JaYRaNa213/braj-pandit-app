import notifee, {
  AndroidCategory,
  AndroidImportance,
  AndroidStyle,
  AndroidVisibility,
  AuthorizationStatus,
  EventType,
} from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import { useEffect } from 'react';
import { ToastAndroid } from 'react-native';
import { navigate } from '../utils/navigation';

function useBackgroundEventListener() {
  useEffect(() => {
    const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        const category = detail.notification?.android?.category;
        const data = detail.notification?.data;

        if (category === 'message' && data?.chatId) {
          navigate('ActiveChat', { chatId: data.chatId });
        }
      }
    });

    notifee.onBackgroundEvent(async ({ type, detail }) => {
      if (type === EventType.PRESS) {
        const category = detail.notification?.android?.category;
        const data = detail.notification?.data;

        if (category === 'message' && data?.chatId) {
          // Handle deep linking or save for cold start navigation
          navigate('ActiveChat', { chatId: data.chatId });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  notifee.onBackgroundEvent(async ({ type, detail }) => {
    if (type === EventType.PRESS) {
      const category = detail.notification?.android?.category;
      const data = detail.notification?.data;
      if (category === 'message' && data?.chatId) {
        globalThis.pendingChatId = data.chatId;
      }
    }
    return () => unsubscribe();
  });
}

function useNotificationPermission() {
  useEffect(() => {
    const checkPermission = async () => {
      await notifee.getNotificationSettings();
    };
    checkPermission();
  }, []);
}

function useCreateNotificationChannels() {
  useEffect(() => {
    const createChannels = async () => {
      try {
        await notifee.createChannel({
          id: 'general',
          name: 'General',
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibration: true,
          lights: true,
          visibility: AndroidVisibility.PUBLIC,
        });

        await notifee.createChannel({
          id: 'call',
          name: 'Calls',
          importance: AndroidImportance.HIGH,
          sound: 'incoming_call_sound',
          vibration: true,
          vibrationPattern: [300, 500],
          lights: true,
          visibility: AndroidVisibility.PUBLIC,
        });

        await notifee.createChannel({
          id: 'messages',
          name: 'Messages',
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibration: true,
          vibrationPattern: [300, 500],
          lights: true,
          visibility: AndroidVisibility.PUBLIC,
        });
      } catch (error) {
        console.error('Error creating channels:', error);
      }
    };
    createChannels();
  }, []);
}

function useCreateNotification() {
  const callNotification = async (message) => {
    try {
      await notifee.displayNotification({
        title: message.data.title || 'Incoming Call',
        body: message.data.body || '',
        android: {
          channelId: 'call',
          visibility: AndroidVisibility.PUBLIC,
          importance: AndroidImportance.HIGH,
          fullScreenAction: {
            id: 'default',
            launchActivity: 'com.vedaz.user.myapp.IncomingCall',
          },
          pressAction: {
            id: 'default',
            launchActivity: 'com.vedaz.user.myapp.IncomingCall',
          },
          actions: [
            {
              title: 'Accept',
              pressAction: {
                id: 'accept',
                launchActivity: 'com.vedaz.user.myapp.IncomingCall',
              },
            },
            {
              title: 'Decline',
              pressAction: { id: 'reject' },
            },
          ],
        },
      });
    } catch (error) {
      console.log('Error displaying call notification:', error);
    }
  };

  const showGeneralNotification = async ({
    title = 'Notification',
    body = '',
    pic = 'ic_launcher_round',
    imageUrl = '',
    category = 'general',
    chatId = '',
    launchActivity = 'com.vedaz.user.myapp.MainActivity',
  }) => {
    try {
      await notifee.displayNotification({
        title,
        body,
        data: { chatId },
        android: {
          channelId: category === 'message' ? 'messages' : 'general',
          category:
            category === 'message' ? AndroidCategory.MESSAGE : undefined,
          importance: AndroidImportance.HIGH,
          visibility: AndroidVisibility.PUBLIC,
          pressAction: {
            id: 'default',
            launchActivity,
          },
          data: { chatId },
          sound: 'default',
          smallIcon: 'ic_launcher_round',
          largeIcon: pic || 'ic_launcher_round',
          style: {
            type: AndroidStyle.BIGTEXT,
            text: body,
          },
        },
      });
    } catch (error) {
      console.log('Error displaying general notification:', error);
      ToastAndroid.show(
        `Notification Error: ${error.message}`,
        ToastAndroid.LONG,
      );
    }
  };

  return { callNotification, showGeneralNotification };
}

function useBackgroundNotification() {
  const { callNotification, showGeneralNotification } = useCreateNotification();

  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    if (!remoteMessage?.data) {
      return;
    }

    const { category, title, body, imageUrl, pic, chatId } = remoteMessage.data;

    if (category === 'call') {
      await callNotification(remoteMessage);
    } else {
      await showGeneralNotification({
        title,
        body,
        imageUrl,
        pic,
        category,
        chatId,
      });
    }
  });

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      if (!remoteMessage?.data) {
        return;
      }

      const { category, title, body, imageUrl, pic, chatId } =
        remoteMessage.data;

      if (category === 'call') {
        await callNotification(remoteMessage);
      } else {
        await showGeneralNotification({
          title,
          body,
          imageUrl,
          pic,
          category,
          chatId,
        });
      }
    });

    return unsubscribe;
  }, []);
}

export {
  useBackgroundEventListener,
  useBackgroundNotification,
  useCreateNotification,
  useCreateNotificationChannels,
  useNotificationPermission,
};
