import React from 'react';
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import Modal from 'react-native-modal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userNotExist } from '../redux/reducer/userReducer';
import { useTranslation } from 'react-i18next';
import { useSocket } from '../context/SocketContext';
import axiosInstance from '../utils/axiosInstance';
import { colors } from '../assets/constants/colors';
import { KundliState } from '../context/KundliProvider';

function SideDrawer() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user, session } = useSelector((state) => state.user);
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();
  const { socket, isConnected } = useSocket();
  const { isModalVisible, setModalVisible } = KundliState();

  const handleItemClick = (screen) => {
    navigation.navigate(screen);
    setModalVisible(false);
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
      setModalVisible(false);
    }
  };

  function MenuItem({ title, icon, url, onPress, isNew = false }) {
    return (
      <TouchableOpacity
        style={styles.menuItem}
        onPress={onPress || (() => handleItemClick(url))}
        activeOpacity={0.7}
      >
        <Ionicons
          name={icon}
          size={20}
          color={isDarkMode ? '#E0E0E0' : '#333'}
          style={styles.menuIcon}
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
    <Modal
      isVisible={isModalVisible}
      onSwipeComplete={() => setModalVisible(false)}
      onBackdropPress={() => setModalVisible(false)}
      swipeDirection="left"
      animationIn="slideInRight"
      animationOut="slideOutRight"
      backdropOpacity={0.3}
      style={styles.modal}
      animationInTiming={400}
      animationOutTiming={400}
      backdropTransitionOutTiming={0}
    >
      <View
        style={[
          styles.drawer,
          { backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF' },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          {/* <Text
            style={[
              styles.logo,
              { color: isDarkMode ? '#E0E0E0' : colors.purple },
            ]}
          >
            Vedaz
          </Text> */}
          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <Ionicons
              name="close-outline"
              size={28}
              color={isDarkMode ? '#E0E0E0' : '#333'}
            />
          </TouchableOpacity>
        </View>

        {/* User Info */}
        {user && (
          <View style={styles.userSection}>
            <View style={{flexDirection:'row', justifyContent:'space-between'}}>
            <Pressable
              onPress={() => handleItemClick('Profile')}
              style={styles.userInfo}
            >
              {user?.pic ? (
                <Image source={{ uri: user?.pic }} style={styles.avatar} />
              ) : (
                <Ionicons
                  name="person-circle-outline"
                  size={40}
                  color={isDarkMode ? '#E0E0E0' : '#333'}
                />
              )}
              <View>
                <Text
                  style={[
                    styles.userName,
                    { color: isDarkMode ? '#E0E0E0' : '#333' },
                  ]}
                >
                  {user?.name}
                </Text>
                <Text
                  style={[
                    styles.userPhone,
                    { color: isDarkMode ? '#B0B0B0' : '#666' },
                  ]}
                >
                  {user?.phone}
                </Text>
              </View>
            </Pressable>
            <TouchableOpacity style={{alignItems:'center'}} onPress={() => handleItemClick('Recharge')}>
                <Ionicons name="wallet-outline" size={24} style={{color: isDarkMode ? '#E0E0E0' : '#333'}}/>
                  <Text style={{fontSize: 12, fontWeight:500, color: isDarkMode ? '#E0E0E0' : '#333'}}>
                    ₹ {user?.available_balance?.toFixed(2)}
                </Text>
            </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[
                styles.rechargeButton,
                { backgroundColor: colors.purple },
              ]}
              onPress={() => handleItemClick('Recharge')}
            >
              <Text style={styles.rechargeText}>{t('sidebar.button')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Menu Items */}
        <ScrollView contentContainerStyle={styles.menuContainer}>
          {!user && (<View style={{position:'relative', height:200, marginBottom:20}}>
                        <Image style={{position:'absolute', height:200, width:'100%', borderRadius:20, opacity:0.9}} source={require('../assets/images/namaste.jpg')} />
                        <View style={{margin:10}}>
                            <Text style={{fontSize:20, fontWeight:500}}>{t('sidebar.greeting')}</Text>
                            <Text></Text>
                            <Text style={{fontSize:16, fontWeight:400}}>{t('sidebar.welcomeMsgNotSignedIn')}</Text>
                        </View>
                    </View>)}
          {user && (
            <>
              <MenuItem
                title={t('sidebar.myProfile')}
                url="Profile"
                icon="person-outline"
              />
              <MenuItem
                title={t('sidebar.refer')}
                url="ReferAndEarn"
                icon="share-social-outline"
              />
              <MenuItem
                title={t('sidebar.following')}
                url="Following"
                icon="people-outline"
              />
              <MenuItem
                title={t('sidebar.support')}
                url="CustomerSupport"
                icon="headset-outline"
              />
              <MenuItem
                title={t('sidebar.community')}
                url="Community"
                icon="globe-outline"
              />
            </>
          )}
          {!user && (
            <MenuItem
              title={t('sidebar.login')}
              url="MobileLogin"
              icon="log-in-outline"
            />
          )}
          <MenuItem
            title={t('sidebar.settings')}
            url="Settings"
            icon="settings-outline"
          />
          {user && (
            <MenuItem
              title={t('sidebar.logout')}
              icon="log-out-outline"
              onPress={handleLogout}
            />
          )}
        </ScrollView>

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
            onPress={() =>
              Linking.openURL('https://www.instagram.com/vedaz.io')
            }
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
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-start',
    alignItems:'flex-end'
  },
  drawer: {
    width: '80%',
    height:'100%',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  logo: {
    fontSize: 24,
    fontWeight: '700',
  },
  userSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  userPhone: {
    fontSize: 14,
    fontWeight: '400',
  },
  rechargeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  rechargeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  menuContainer: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '500',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },

  newBadge: {
    backgroundColor: colors.purple,
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginLeft: 'auto',
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
});

export default SideDrawer;
