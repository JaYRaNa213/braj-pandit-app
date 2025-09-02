import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../assets/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseURL } from '../utils/axiosInstance';
import Toast from 'react-native-toast-message';

const FollowPopup = ({
  visible,
  onClose,
  astrologerId,
  astrologerName = 'this astrologer',
}) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (visible) {
      loadUserData();
    }
  }, [visible]);

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

  const checkFollowStatusFromUserData = (user, astroId) => {
    try {
      setIsLoading(true);
      console.log('===== FOLLOW STATUS CHECK IN POPUP =====');
      console.log('User ID:', user._id);
      console.log('Astrologer ID:', astroId);
      console.log('===========================================');

      // Check if user has a following array and if astrologer ID is in it
      if (user.following && Array.isArray(user.following)) {
        const isUserFollowing = user.following.some((id) => {
          if (typeof id === 'string') return id === astroId;
          if (id && id._id) return id._id === astroId;
          return false;
        });

        console.log('Follow status from user data:', isUserFollowing);
        setIsFollowing(isUserFollowing);
      } else {
        console.log('No following array found in user data');
        setIsFollowing(false);
      }
    } catch (error) {
      console.error('Error checking follow status from user data:', error);
    } finally {
      setIsLoading(false);
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
      onClose();
      return;
    }

    try {
      setIsLoading(true);

      console.log('\n🔑 ===== TOKEN SEARCH IN POPUP =====');

      // Always try AsyncStorage first since that's where token is actually stored
      let authToken = null;
      try {
        authToken = await AsyncStorage.getItem('token');
        if (authToken) {
          console.log('✅ Found token in AsyncStorage');
          console.log('🔑 Token preview:', authToken.substring(0, 20) + '...');
        } else {
          console.log('❌ No token in AsyncStorage');
        }
      } catch (error) {
        console.error('💥 Error accessing AsyncStorage:', error);
      }

      // Fallback to userData token if AsyncStorage fails
      if (!authToken) {
        authToken = userData.token;
        console.log(
          '🔍 Fallback token from userData:',
          authToken ? 'Found' : 'Not Found',
        );
        if (authToken) {
          console.log(
            '🔑 Fallback token preview:',
            authToken.substring(0, 20) + '...',
          );
        } else {
          // Last resort - try userData from AsyncStorage
          try {
            const userJson = await AsyncStorage.getItem('userData');
            if (userJson) {
              const storedUser = JSON.parse(userJson);
              if (storedUser && storedUser.token) {
                authToken = storedUser.token;
                console.log(
                  '✅ Found token in AsyncStorage userData (last resort)',
                );
                console.log(
                  '🔑 Token preview:',
                  authToken.substring(0, 20) + '...',
                );
              } else {
                console.log('❌ No token in stored userData');
              }
            } else {
              console.log('❌ No userData found in AsyncStorage');
            }
          } catch (error) {
            console.error('💥 Error accessing AsyncStorage userData:', error);
          }
        }
      }

      // Check if we have a token
      if (!authToken) {
        console.error('No authentication token available');
        Toast.show({
          type: 'error',
          text1: 'Authentication Error',
          text2: 'Please login again to continue',
          position: 'top',
          visibilityTime: 3000,
        });
        setIsLoading(false);
        onClose();
        return;
      }

      // Use the correct endpoint based on action - matches web app implementation
      const endpoint = isFollowing ? '/user/unfollow' : '/user/follow';

      console.log('===== FOLLOW POPUP API CALL =====');
      console.log('Using endpoint:', endpoint);
      console.log('User ID:', userData._id);
      console.log('Astrologer ID:', astrologerId);
      console.log('Token available:', !!authToken);
      console.log('==================================');

      // Make API call to follow/unfollow astrologer
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          astroId: astrologerId,
          userId: userData._id, // Temporarily adding userId until backend is updated
        }),
      });

      // Get response as text for debugging
      const responseText = await response.text();

      // Parse JSON if possible
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('Error parsing response:', e);
        // Continue with empty result if parsing fails
        result = {};
      }

      // Check if there are specific error cases we need to handle
      if (!response.ok) {
        // Check for "already following" special case
        const isAlreadyFollowingCase =
          !isFollowing &&
          (responseText.includes('already following') ||
            result.message?.includes('already following'));

        if (isAlreadyFollowingCase) {
          // If backend says already following but UI shows not following, update UI
          console.log('Already following this astrologer, updating UI');
          setIsFollowing(true);

          Toast.show({
            type: 'info',
            text1: 'Already Following',
            text2: `You are already following ${astrologerName}`,
            position: 'top',
            visibilityTime: 2000,
          });

          setTimeout(() => onClose(), 500);
          setIsLoading(false);
          return;
        }

        // Check for "not following" special case
        const isNotFollowingCase =
          isFollowing &&
          (responseText.includes('not following') ||
            result.message?.includes('not following'));

        if (isNotFollowingCase) {
          // If backend says not following but UI shows following, update UI
          console.log('Not following this astrologer, updating UI');
          setIsFollowing(false);

          Toast.show({
            type: 'info',
            text1: 'Not Following',
            text2: `You are not following ${astrologerName}`,
            position: 'top',
            visibilityTime: 2000,
          });

          setTimeout(() => onClose(), 500);
          setIsLoading(false);
          return;
        }

        // For other errors, throw
        throw new Error(
          result.message ||
            `Failed to update follow status (${response.status})`,
        );
      }

      // Update local state for success case
      const newFollowState = isFollowing ? false : true;
      setIsFollowing(newFollowState);

      // Show success message
      Toast.show({
        type: 'success',
        text1: isFollowing ? 'Unfollowed' : 'Following',
        text2: isFollowing
          ? `You have unfollowed ${astrologerName}`
          : `You are now following ${astrologerName}`,
        position: 'top',
        visibilityTime: 2000,
      });

      // Close the popup after successful action
      setTimeout(() => onClose(), 500);
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

  // Close when clicking outside the popup
  const handleBackdropPress = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={styles.title}>
                {isFollowing ? 'Unfollow Astrologer?' : 'Follow Astrologer?'}
              </Text>

              <Text style={styles.description}>
                {isFollowing
                  ? `You'll no longer receive updates from ${astrologerName}`
                  : `Follow ${astrologerName} to get notified about their live sessions and updates`}
              </Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onClose}
                  disabled={isLoading}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.followButton,
                    isFollowing
                      ? styles.unfollowButton
                      : styles.followingButton,
                  ]}
                  onPress={toggleFollow}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <View style={styles.followButtonContent}>
                      <Ionicons
                        name={isFollowing ? 'heart-dislike' : 'heart'}
                        size={18}
                        color="#fff"
                      />
                      <Text style={styles.followButtonText}>
                        {isFollowing ? 'Unfollow' : 'Follow'}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  followButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  followingButton: {
    backgroundColor: colors.purple,
  },
  unfollowButton: {
    backgroundColor: '#FF4081',
  },
  followButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  followButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default FollowPopup;
