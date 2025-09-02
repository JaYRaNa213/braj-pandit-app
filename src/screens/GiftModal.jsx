import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../assets/constants/colors';
import axiosInstance from '../utils/axiosInstance';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { userExist } from '../redux/reducer/userReducer';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const GiftModal = ({ visible, onClose, onSendGift, streamId, channelId }) => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [selectedGift, setSelectedGift] = useState(null);
  const navigation = useNavigation();

  // Function to safely get wallet balance as a number
  const getWalletBalance = () => {
    if (!user) return 0;

    // Use available_balance instead of walletBalance
    const balance = user.available_balance || 0;
    return typeof balance === 'string' ? parseFloat(balance) : Number(balance);
  };

  // Check if wallet balance is sufficient for the selected gift
  const hasInsufficientBalance = () => {
    if (!selectedGift) return false;
    const walletBalance = getWalletBalance();
    const giftPrice = Number(selectedGift.price);
    return walletBalance < giftPrice;
  };

  useEffect(() => {
    if (visible) {
      fetchGifts();
    }
  }, [visible]);

  const fetchGifts = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/gifts?isActive=true');

      if (response.data.success && response.data.gifts) {
        setGifts(response.data.gifts);
      } else {
        Alert.alert('Error', 'Failed to load gifts');
      }
    } catch (error) {
      console.error('Error fetching gifts:', error);
      Alert.alert('Error', 'Failed to load gifts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGiftSelect = (gift) => {
    setSelectedGift(gift);
  };

  // Function to update user wallet balance in Redux
  const updateUserWalletBalance = (newBalance) => {
    if (!user) return;

    // Create updated user object with new balance
    const updatedUser = {
      ...user,
      available_balance: newBalance,
    };

    // Update Redux state with the new user data
    dispatch(
      userExist({
        user: updatedUser,
        session: null,
      }),
    );
  };

  const handleSendGift = async () => {
    if (!selectedGift) return;
    if (!streamId && !channelId) {
      Alert.alert('Error', 'Stream information not available');
      return;
    }

    // Check if user has sufficient balance
    if (hasInsufficientBalance()) {
      Alert.alert(
        'Insufficient Balance',
        "You don't have enough balance to send this gift. Would you like to recharge?",
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Recharge Now',
            onPress: () => {
              onClose(); // Close the gift modal
              navigation.navigate('Recharge'); // Navigate to the recharge page
            },
          },
        ],
      );
      return;
    }

    try {
      setSending(true);

      // Send gift to backend using the gift-service API
      const response = await axiosInstance.post('/gift-service/send', {
        giftId: selectedGift._id,
        streamId: streamId,
        channelId: channelId,
        message: `Gift sent: ${selectedGift.name}`,
      });

      if (response.data && response.data.success) {
        // Get updated balance from response if available, otherwise calculate it
        const newBalance =
          response.data.updatedBalance !== undefined
            ? response.data.updatedBalance
            : getWalletBalance() - selectedGift.price;

        // Update the wallet balance in Redux state
        updateUserWalletBalance(newBalance);

        // Call the onSendGift callback with the gift data and response
        if (onSendGift) {
          onSendGift({
            ...selectedGift,
            channelId,
            response: response.data,
          });
        }

        // Reset selected gift and close modal
        setSelectedGift(null);
        onClose();
      } else {
        throw new Error(response.data?.msg || 'Failed to send gift');
      }
    } catch (error) {
      console.error('Error sending gift:', error);

      // Handle insufficient balance error
      if (error.response?.data?.msg === 'Insufficient balance') {
        Alert.alert(
          'Insufficient Balance',
          "You don't have enough balance to send this gift. Would you like to recharge?",
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Recharge Now',
              onPress: () => {
                onClose(); // Close the gift modal
                navigation.navigate('Recharge'); // Navigate to the recharge page
              },
            },
          ],
        );
      } else {
        const errorMessage =
          error.response?.data?.msg || error.message || 'Failed to send gift';
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setSending(false);
    }
  };

  const renderGiftItem = ({ item }) => {
    const isSelected = selectedGift?._id === item._id;

    return (
      <TouchableOpacity
        style={[styles.giftItem, isSelected && styles.selectedGiftItem]}
        onPress={() => handleGiftSelect(item)}
      >
        <View style={styles.giftImageContainer}>
          <Image
            source={{ uri: item.icon || item.image }}
            style={styles.giftImage}
            resizeMode="contain"
          />
        </View>
        <Text
          style={[styles.giftName, isSelected && styles.selectedGiftText]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <View
          style={[
            styles.priceContainer,
            isSelected && styles.selectedPriceContainer,
          ]}
        >
          <Ionicons
            name="diamond"
            size={12}
            color={isSelected ? 'white' : colors.purple}
          />
          <Text
            style={[styles.giftPrice, isSelected && styles.selectedGiftText]}
          >
            {item.price}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Send Gift</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Wallet balance display */}
          <View style={styles.walletContainer}>
            <Ionicons name="wallet" size={18} color={colors.purple} />
            <Text style={styles.walletText}>Wallet Balance: </Text>
            <Text style={styles.walletBalance}>{getWalletBalance()}</Text>
            <TouchableOpacity
              style={styles.rechargeButton}
              onPress={() => {
                onClose();
                navigation.navigate('Recharge');
              }}
            >
              <Text style={styles.rechargeButtonText}>Recharge</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.modalContent}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.purple} />
                <Text style={styles.loadingText}>Loading gifts...</Text>
              </View>
            ) : gifts.length > 0 ? (
              <>
                <FlatList
                  data={gifts}
                  renderItem={renderGiftItem}
                  keyExtractor={(item) => item._id}
                  numColumns={3}
                  contentContainerStyle={styles.giftsGrid}
                  showsVerticalScrollIndicator={false}
                />

                {/* Send Button */}
                {selectedGift && (
                  <View style={styles.sendButtonContainer}>
                    <TouchableOpacity
                      style={[
                        styles.sendButton,
                        hasInsufficientBalance() && styles.sendButtonDisabled,
                      ]}
                      onPress={handleSendGift}
                      disabled={sending || hasInsufficientBalance()}
                    >
                      {sending ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <>
                          <Ionicons name="gift" size={20} color="white" />
                          <Text style={styles.sendButtonText}>
                            Send {selectedGift.name}
                          </Text>
                          <View style={styles.sendPriceContainer}>
                            <Ionicons name="diamond" size={14} color="white" />
                            <Text style={styles.sendPriceText}>
                              {selectedGift.price}
                            </Text>
                          </View>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.noGiftsContainer}>
                <Ionicons
                  name="gift-outline"
                  size={50}
                  color="rgba(255,255,255,0.5)"
                />
                <Text style={styles.noGiftsText}>No gifts available</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 5,
  },
  walletContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  walletText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 8,
  },
  walletBalance: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  rechargeButton: {
    backgroundColor: colors.purple,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  rechargeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  giftsGrid: {
    paddingBottom: 20,
  },
  giftItem: {
    flex: 1,
    margin: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 120,
  },
  selectedGiftItem: {
    backgroundColor: colors.purple,
    borderColor: colors.purple,
    shadowColor: colors.purple,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  giftImageContainer: {
    width: 50,
    height: 50,
    marginBottom: 8,
  },
  giftImage: {
    width: '100%',
    height: '100%',
  },
  giftName: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  selectedGiftText: {
    color: 'white',
    fontWeight: 'bold',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  selectedPriceContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  giftPrice: {
    color: colors.purple,
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  sendButtonContainer: {
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  sendButton: {
    backgroundColor: colors.purple,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    shadowColor: colors.purple,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#666',
    shadowColor: '#666',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    marginRight: 12,
  },
  sendPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sendPriceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  noGiftsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noGiftsText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    marginTop: 10,
  },
});

export default GiftModal;
