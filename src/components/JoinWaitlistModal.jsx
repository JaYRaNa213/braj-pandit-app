import React from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../assets/constants/colors';
import { useChat } from '../context/ChatContext';
import axiosInstance from '../utils/axiosInstance';
import { getAstrologerName } from '../utils/helper';

const JoinWaitlistModal = () => {
  useChat();
  const {
    closeJoinWaitlistModal,
    waitListProps,
    isJoinWaitlistModalOpen,
    openWaitListJoinedModal,
  } = useChat();

  const handleCancel = () => {
    closeJoinWaitlistModal();
  };

  const astrologer = waitListProps?.astrologer;

  const handleJoinWaitlist = async () => {
    try {
      const { data } = await axiosInstance.post('/chat-request/join-waitlist', {
        astrologerId: astrologer?._id,
        action: waitListProps?.action,
      });

      if (data?.success) {
        closeJoinWaitlistModal();
        openWaitListJoinedModal();
      } else {
        ToastAndroid.show('Failed to join waitlist', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Error joining waitlist:', error.response);
      ToastAndroid.show('Error joining waitlist', ToastAndroid.SHORT);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isJoinWaitlistModalOpen}
      onRequestClose={handleCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.profileContainer}>
            <Image
              source={{ uri: astrologer?.image }} // Replace with actual astrologer image URI
              style={styles.profileImage}
            />
            <Text style={styles.nameText}>
              {getAstrologerName(
                astrologer?.unique_name,
                astrologer?.prefixName,
              )}
            </Text>
            <Text style={styles.offlineText}>Currently Offline</Text>
          </View>
          <Text style={styles.notificationText}>
            If you join the waitlist, we will notify {astrologer?.name} to take
            the session, if possible.
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={[styles.buttonText, { color: colors.gray }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.joinButton}
              onPress={handleJoinWaitlist}
            >
              <Text style={styles.buttonText}>Join Waitlist</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 28,
    borderRadius: 8,
    width: '80%',
    maxWidth: 300,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#ddd',
    marginBottom: 8,
  },
  nameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  offlineText: {
    fontSize: 14,
    color: 'red',
    marginTop: 4,
  },
  notificationText: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#D1D5DB', // Gray color
    paddingVertical: 10,
    borderRadius: 24,
    marginRight: 16,
    alignItems: 'center',
  },
  joinButton: {
    flex: 1,
    backgroundColor: colors.purple, // Yellow color
    paddingVertical: 10,
    borderRadius: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
  },
});

export default JoinWaitlistModal;
