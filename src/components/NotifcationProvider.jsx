import React, { useEffect } from 'react';
import notifee, { AndroidBadgeIconType, AndroidCategory, AndroidImportance, AndroidVisibility, EventType } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import { useNavigation } from '@react-navigation/native';

const NotificationProvider = () => {
    const navigation = useNavigation();
    // Handle Foreground Notifications


    return null;
};

export default NotificationProvider;
