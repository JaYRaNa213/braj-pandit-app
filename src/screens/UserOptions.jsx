import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { React, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  Image,
  Linking,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../assets/constants/colors';
import LanguageSwitcherModal from '../components/LanguageSwitcherModal';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import { userNotExist } from '../redux/reducer/userReducer';
import axiosInstance from '../utils/axiosInstance';

function UserOptions({ route }) {
  const { user, session } = useSelector((state) => state.user);
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { socket, isConnected } = useSocket();

  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [language, setLanguage] = useState('en');

  const { isDarkMode, toggleTheme } = useTheme();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('profile.screenHead'),
    });
  }, [navigation]);

  const handleItemClick = (screen) => {
    navigation.navigate(screen);
  };

  const handleLogout = async () => {
    try {
      const { data } = await axiosInstance.get('/user/logout');
      if (data.success) {
        ToastAndroid.show('Logged out successfully', ToastAndroid.SHORT);
        socket.current.emit('logout', {
          userId: user?._id,
          sessionId: session?._id,
        });
        isConnected.current = false;
        socket.current.disconnect();
        await AsyncStorage.clear();
        dispatch(userNotExist());
      } else {
        ToastAndroid.show('Failed to logout', ToastAndroid.SHORT);
      }
    } catch (error) {
      ToastAndroid.show('Failed to logout', ToastAndroid.SHORT);
    } finally {
      navigation.navigate('Footer', { screen: 'Home' });
    }
  };

  function MenuItem({ title, icon, url, onPress, isNew = false }) {
    return (
      <TouchableOpacity
        style={[
          styles.menuItem,
          {
            backgroundColor: isDarkMode ? colors.darkSurface : 'white',
            borderColor: isDarkMode ? colors.dark : colors.lightGray,
          },
        ]}
        onPress={onPress || (() => handleItemClick(url))}
        activeOpacity={0.7}
      >
        <Ionicons
          name={icon}
          size={20}
          color={isDarkMode ? colors.white : colors.black}
          style={[
            styles.menuIcon,
            {
              backgroundColor: isDarkMode
                ? colors.darkBackground
                : colors.lightGray,
            },
          ]}
        />
        <Text
          style={[styles.menuText, { color: isDarkMode ? '#E0E0E0' : '#333' }]}
        >
          {title}
        </Text>

        {isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        {
          backgroundColor: isDarkMode ? colors.darkSurface : colors.lightGray,
        },
      ]}
    >
      {user && (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Profile');
          }}
          style={[styles.userCard, isDarkMode && styles.userCardDark]}
        >
          <View style={styles.leftuserCard}>
            {user?.pic ? (
              <Image source={{ uri: user?.pic }} style={styles.avatar} />
            ) : (
              <Ionicons
                name="person-circle-outline"
                size={40}
                color={isDarkMode ? '#E0E0E0' : '#333'}
              />
            )}
          </View>
          <View style={styles.rightuserCard}>
            <Text
              style={{
                fontSize: 20,
                color: isDarkMode ? 'white' : colors.purple,
              }}
            >
              {user?.name || 'User'}
            </Text>
            <Text style={{ color: isDarkMode ? 'white' : 'black' }}>
              {user?.phone || 'Phone Number'}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {user && (
        <TouchableOpacity
          style={[
            styles.walletCard,
            {
              backgroundColor: isDarkMode ? colors.darkSurface : 'white',
              borderColor: isDarkMode ? colors.dark : colors.lightGray,
            },
          ]}
          onPress={() => {
            handleItemClick('Recharge');
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons
              name="wallet-outline"
              size={24}
              color={isDarkMode ? colors.white : colors.black}
              style={[
                styles.menuIcon,
                {
                  backgroundColor: isDarkMode
                    ? colors.darkBackground
                    : colors.lightGray,
                },
              ]}
            />
            <Text
              style={{
                fontSize: 16,
                fontWeight: 500,
                color: isDarkMode ? '#E0E0E0' : '#333',
              }}
            >
              ₹ {user?.available_balance?.toFixed(2)}
            </Text>
          </View>

          <Text
            style={{
              fontSize: 20,
              color: isDarkMode ? colors.darkAccent : colors.purple,
            }}
          >
            Add Money
          </Text>
        </TouchableOpacity>
      )}

      {!user && (
        <View style={{ position: 'relative', height: 200, marginBottom: 20 }}>
          <Image
            style={{
              position: 'absolute',
              height: 200,
              width: '100%',
              borderRadius: 20,
              opacity: 0.9,
            }}
            source={require('../assets/images/namaste.jpg')}
          />
          <View style={{ margin: 10 }}>
            <Text style={{ fontSize: 20, fontWeight: 500 }}>
              {t('sidebar.greeting')}
            </Text>
            <Text></Text>
            <Text style={{ fontSize: 16, fontWeight: 400 }}>
              {t('sidebar.welcomeMsgNotSignedIn')}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.settings}>
        <TouchableOpacity
          style={[
            styles.ButtonCard,
            {
              backgroundColor: isDarkMode ? colors.darkSurface : 'white',
              borderColor: isDarkMode ? colors.dark : colors.lightGray,
            },
          ]}
          onPress={toggleTheme}
        >
          <Ionicons
            name={isDarkMode ? 'sunny' : 'moon'}
            size={24}
            color={isDarkMode ? colors.white : colors.black}
            style={[
              styles.menuIcon,
              {
                backgroundColor: isDarkMode
                  ? colors.darkBackground
                  : colors.lightGray,
              },
            ]}
          />
          <Text
            style={[
              styles.buttonCardText,
              { color: isDarkMode ? '#E0E0E0' : '#333' },
            ]}
          >
            {isDarkMode
              ? t('settings.screenMode.lightMode')
              : t('settings.screenMode.darkMode')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.ButtonCard,
            {
              backgroundColor: isDarkMode ? colors.darkSurface : 'white',
              borderColor: isDarkMode ? colors.dark : colors.lightGray,
            },
          ]}
          onPress={() => {
            setShowLanguageModal(true);
          }}
        >
          <Ionicons
            name="language"
            size={24}
            color={isDarkMode ? colors.white : colors.black}
            style={[
              styles.menuIcon,
              {
                backgroundColor: isDarkMode
                  ? colors.darkBackground
                  : colors.lightGray,
              },
            ]}
          />
          <Text
            style={[
              styles.buttonCardText,
              { color: isDarkMode ? '#E0E0E0' : '#333' },
            ]}
          >
            {t('settings.language')}
          </Text>
        </TouchableOpacity>
      </View>

      {user && (
        <MenuItem
          title={t('sidebar.myProfile')}
          url="Profile"
          icon="person-outline"
        />
      )}
      {user && (
        <MenuItem
          title={t('sidebar.refer')}
          url="ReferAndEarn"
          icon="share-social-outline"
        />
      )}
      {user && (
        <MenuItem
          title={t('sidebar.following')}
          url="Following"
          icon="people-outline"
        />
      )}
      {user && (
        <MenuItem
          title={t('sidebar.support')}
          url="CustomerSupport"
          icon="headset-outline"
        />
      )}
      {user && (
        <MenuItem
          title={t('sidebar.logout')}
          icon="log-out-outline"
          onPress={handleLogout}
        />
      )}
      {!user && (
        <MenuItem
          title={t('sidebar.login')}
          url="MobileLogin"
          icon="log-in-outline"
        />
      )}

      {/* Social Media Icons */}
      <View style={styles.socialContainer}>
        <TouchableOpacity
          onPress={() =>
            Linking.openURL('https://www.youtube.com/@vedaz_bharat')
          }
        >
          <Ionicons
            name="logo-youtube"
            size={28}
            color={isDarkMode ? '#FF0000' : '#FF0000'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => Linking.openURL('https://www.instagram.com/vedaz.io')}
        >
          <Ionicons
            name="logo-instagram"
            size={28}
            color={isDarkMode ? '#E1306C' : '#E1306C'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            Linking.openURL('https://www.linkedin.com/company/vedazz')
          }
        >
          <Ionicons
            name="logo-linkedin"
            size={28}
            color={isDarkMode ? '#0077B5' : '#0077B5'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => Linking.openURL('https://www.facebook.com/myvedaz')}
        >
          <Ionicons
            name="logo-facebook"
            size={28}
            color={isDarkMode ? '#1877F2' : '#1877F2'}
          />
        </TouchableOpacity>
      </View>

      <LanguageSwitcherModal
        isVisible={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        setLanguage={setLanguage}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 15,
    paddingHorizontal: 8,
  },
  userCard: {
    height: 100,
    borderRadius: 15,
    flexDirection: 'row',
    backgroundColor: colors.lightBackground,
    borderColor: colors.lightGray,
  },
  userCardDark: {
    backgroundColor: colors.darkSurface,
    borderColor: colors.dark,
    borderWidth: 1.5,
  },
  leftuserCard: {
    width: '20%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightuserCard: {
    justifyContent: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingLeft: 16,
    paddingRight: 20,
    borderRadius: 12,
    marginBottom: 4,
    backgroundColor: 'white',
    marginVertical: 10,
    height: 60,
    borderWidth: 1.5,
    borderColor: colors.lightGray,
  },
  settings: {
    flexDirection: 'row',
    gap: 12,
  },
  menuContainer: {
    padding: 16,
  },
  ButtonCard: {
    borderRadius: 12,
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginBottom: 4,
    marginVertical: 10,
    width: (Dimensions.get('screen').width - 16 - 12) / 2,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  buttonCardText: {
    fontSize: 16,
    fontWeight: 500,
    flexShrink: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
    backgroundColor: 'white',
    marginVertical: 10,
    height: 60,
    borderWidth: 1.5,
  },
  menuIcon: {
    marginRight: 16,
    padding: 7,
    borderRadius: 20,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
});

export default UserOptions;
