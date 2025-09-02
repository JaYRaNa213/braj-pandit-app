import React from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Assuming you use React Navigation
import Ionicons from 'react-native-vector-icons/Ionicons'; // Ensure you have this icon library installed
import { useChat } from '../context/ChatContext';

const WaitlistedModal = ({ isVisible, onClose, astrologer, user }) => {
  const navigation = useNavigation();
  const { waitListProps, closeWaitListJoinedModal } = useChat();
  const handleClose = () => {
    closeWaitListJoinedModal();
    navigation.navigate('Footer', { screen: 'Astrologers' });
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeText}>X</Text>
          </TouchableOpacity>
          <View style={styles.modalBody}>
            <Text style={styles.waitlistText}>Waitlist Joined!</Text>
            <Text style={styles.offlineText}>
              {waitListProps?.astrologer?.name} is currently Offline
            </Text>
            <View style={styles.avatarContainer}>
              {user?.pic ? (
                <Image
                  source={{ uri: user?.pic }} // Replace with actual user avatar URI
                  style={styles.avatar}
                />
              ) : (
                <Ionicons name="person-circle-sharp" size={64} color="gray" />
              )}
              <Image
                source={{ uri: waitListProps?.astrologer?.image }} // Replace with actual astrologer image URI
                style={styles.avatar}
              />
            </View>
            <Text style={styles.infoText}>
              Your chat will start when Astrologer is online
            </Text>
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
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 8,
    width: '80%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 16,
  },
  closeText: {
    fontSize: 24,
    color: '#666',
  },
  modalBody: {
    alignItems: 'center',
  },
  waitlistText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981', // Green color
    marginBottom: 8,
  },
  offlineText: {
    fontSize: 16,
    color: '#DC2626', // Red color
    marginBottom: 16,
  },
  avatarContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginHorizontal: 4,
  },
  infoText: {
    fontSize: 16,
    color: '#4B5563', // Gray color
    textAlign: 'center',
    marginTop: 16,
  },
});

export default WaitlistedModal;
