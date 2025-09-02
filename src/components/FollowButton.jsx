import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  Modal,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../assets/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseURL } from '../utils/axiosInstance';
import Toast from 'react-native-toast-message';

const FollowButton = ({
  astrologerId,
  initialFollowState = false,
  onFollowChange,
}) => {
  const [isFollowing, setIsFollowing] = useState(initialFollowState);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userJson = await AsyncStorage.getItem('userData');
        if (userJson) {
          const user = JSON.parse(userJson);
          setUserData(user);

          if (user._id && astrologerId) {
            checkFollowStatusFromUserData(user, astrologerId);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, [astrologerId]);

  const checkFollowStatusFromUserData = (user, astroId) => {
    try {
      if (user.following && Array.isArray(user.following)) {
        const isUserFollowing = user.following.some((id) => {
          if (typeof id === 'string') return id === astroId;
          if (id && id._id) return id._id === astroId;
          return false;
        });

        setIsFollowing(isUserFollowing);

        if (isUserFollowing !== initialFollowState && onFollowChange) {
          onFollowChange(isUserFollowing);
        }
      } else {
        setIsFollowing(false);
      }
    } catch (error) {
      console.error('Error checking follow status from user data:', error);
    }
  };

  const toggleFollow = async () => {
    if (!userData || !userData._id) {
      Toast.show({
        type: 'info',
        text1: 'Login Required',
        text2: 'Please login to follow this astrologer',
        position: 'top',
        visibilityTime: 3000,
      });
      setShowPopup(false);
      return;
    }

    try {
      setIsLoading(true);

      let authToken = null;
      try {
        authToken = await AsyncStorage.getItem('token');
      } catch (error) {
        console.error('💥 Error accessing AsyncStorage:', error);
      }

      if (!authToken) {
        authToken = userData.token;

        if (!authToken) {
          try {
            const userJson = await AsyncStorage.getItem('userData');
            if (userJson) {
              const storedUser = JSON.parse(userJson);
              if (storedUser && storedUser.token) {
                authToken = storedUser.token;
              }
            }
          } catch (error) {
            console.error('💥 Error accessing AsyncStorage userData:', error);
          }
        }
      }

      if (!authToken) {
        Toast.show({
          type: 'error',
          text1: 'Authentication Error',
          text2: 'Please login again to continue',
          position: 'top',
          visibilityTime: 3000,
        });
        setIsLoading(false);
        setShowPopup(false);
        return;
      }

      const endpoint = isFollowing ? '/user/unfollow' : '/user/follow';

      const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          astroId: astrologerId,
          userId: userData._id,
        }),
      });

      const responseText = await response.text();

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        result = {};
      }

      if (!response.ok) {
        const isAlreadyFollowingCase =
          !isFollowing &&
          (responseText.includes('already following') ||
            result.message?.includes('already following'));

        if (isAlreadyFollowingCase) {
          setIsFollowing(true);
          if (onFollowChange) {
            onFollowChange(true);
          }
          Toast.show({
            type: 'info',
            text1: 'Already Following',
            text2: 'You are already following this astrologer',
            position: 'top',
            visibilityTime: 2000,
          });
          setShowPopup(false);
          setIsLoading(false);
          return;
        }

        const isNotFollowingCase =
          isFollowing &&
          (responseText.includes('not following') ||
            result.message?.includes('not following'));

        if (isNotFollowingCase) {
          setIsFollowing(false);
          if (onFollowChange) {
            onFollowChange(false);
          }
          Toast.show({
            type: 'info',
            text1: 'Not Following',
            text2: 'You are not following this astrologer',
            position: 'top',
            visibilityTime: 2000,
          });
          setShowPopup(false);
          setIsLoading(false);
          return;
        }

        throw new Error(
          result.message ||
            `Failed to update follow status (${response.status})`,
        );
      }

      const newFollowState = isFollowing ? false : true;
      setIsFollowing(newFollowState);

      if (onFollowChange) {
        onFollowChange(!isFollowing);
      }

      Toast.show({
        type: 'success',
        text1: isFollowing ? 'Unfollowed' : 'Following',
        text2: isFollowing
          ? 'You have unfollowed this astrologer'
          : 'You are now following this astrologer',
        position: 'top',
        visibilityTime: 2000,
      });

      setShowPopup(false);
    } catch (error) {
      console.error('Error toggling follow status:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update follow status. Please try again.',
        position: 'top',
        visibilityTime: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOutsidePress = () => {
    if (!isLoading) {
      setShowPopup(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.followBtn}
        onPress={() => setShowPopup(true)}
      >
        <Ionicons
          name={isFollowing ? 'heart' : 'heart-outline'}
          size={24}
          color="white"
        />
        <Text style={styles.followBtnText}>
          {isFollowing ? 'Following' : 'Follow'}
        </Text>
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={showPopup}
        animationType="fade"
        onRequestClose={() => setShowPopup(false)}
      >
        <TouchableWithoutFeedback onPress={handleOutsidePress}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  {isFollowing
                    ? 'Unfollow this astrologer?'
                    : 'Follow this astrologer?'}
                </Text>
                <Text style={styles.modalText}>
                  {isFollowing
                    ? 'You will no longer receive notifications about their live sessions.'
                    : 'You will be notified when they go live.'}
                </Text>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowPopup(false)}
                    disabled={isLoading}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      isFollowing
                        ? styles.unfollowButton
                        : styles.followActionButton,
                    ]}
                    onPress={toggleFollow}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.actionButtonText}>
                        {isFollowing ? 'Unfollow' : 'Follow'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.purple,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'white',
    marginBottom: 10,
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    minWidth: 160,
  },
  followBtnText: {
    color: 'white',
    marginLeft: 10,
    fontWeight: 'bold',
    fontSize: 18,
    textTransform: 'uppercase',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  modalText: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    backgroundColor: '#f1f1f1',
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  followActionButton: {
    backgroundColor: colors.purple,
  },
  unfollowButton: {
    backgroundColor: '#FF4081',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default FollowButton;
