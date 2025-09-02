import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Share,
  Alert,
  ActivityIndicator,
  Dimensions,
  Linking,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../assets/constants/colors';
import Clipboard from '@react-native-clipboard/clipboard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ShareModal = ({ visible, onClose, streamId, astrologerName = 'an astrologer' }) => {
  const [sharing, setSharing] = useState(false);
  
  const shareMessage = `I'm watching ${astrologerName}'s live stream on Vedaz! Join me now!\n\nhttps://vedaz.io/livestream/${streamId}`;
  const shareUrl = `https://vedaz.io/livestream/${streamId}`;

  const handleGeneralShare = async () => {
    try {
      setSharing(true);
      const result = await Share.share({
        message: shareMessage,
        url: shareUrl,
        title: 'Vedaz Live Stream',
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type:', result.activityType);
        } else {
          console.log('Shared successfully');
        }
        onClose();
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing stream:', error);
      Alert.alert('Error', 'Failed to share stream');
    } finally {
      setSharing(false);
    }
  };

  const copyLinkToClipboard = () => {
    Clipboard.setString(`https://vedaz.io/livestream/${streamId}`);
    Alert.alert('Success', 'Link copied to clipboard!');
    onClose();
  };

  const shareToWhatsapp = () => {
    const encodedMessage = encodeURIComponent(shareMessage);
    Linking.openURL(`whatsapp://send?text=${encodedMessage}`)
      .catch(() => {
        Alert.alert('Error', 'WhatsApp is not installed on your device');
      });
  };

  const shareToTelegram = () => {
    const encodedMessage = encodeURIComponent(shareMessage);
    Linking.openURL(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodedMessage}`)
      .catch(() => {
        Alert.alert('Error', 'Could not open Telegram');
      });
  };

  const shareToFacebook = () => {
    // Facebook doesn't allow prefilling message content through deep links
    // so we just open the share dialog with the URL
    Linking.openURL(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`)
      .catch(() => {
        Alert.alert('Error', 'Could not open Facebook');
      });
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
            <Text style={styles.modalTitle}>Share Live Stream</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.modalContent}>
            <Text style={styles.shareText}>
              Share this live stream with your friends!
            </Text>

            <View style={styles.shareOptionsContainer}>
              {/* Copy Link */}
              <TouchableOpacity 
                style={styles.shareOption} 
                onPress={copyLinkToClipboard}
              >
                <View style={[styles.shareIconContainer, { backgroundColor: '#6B7280' }]}>
                  <Ionicons name="copy-outline" size={28} color="white" />
                </View>
                <Text style={styles.shareOptionText}>Copy Link</Text>
              </TouchableOpacity>

              {/* WhatsApp */}
              <TouchableOpacity 
                style={styles.shareOption} 
                onPress={shareToWhatsapp}
              >
                <View style={[styles.shareIconContainer, { backgroundColor: '#25D366' }]}>
                  <Ionicons name="logo-whatsapp" size={28} color="white" />
                </View>
                <Text style={styles.shareOptionText}>WhatsApp</Text>
              </TouchableOpacity>

              {/* Telegram */}
              <TouchableOpacity 
                style={styles.shareOption} 
                onPress={shareToTelegram}
              >
                <View style={[styles.shareIconContainer, { backgroundColor: '#0088cc' }]}>
                  <Ionicons name="paper-plane-outline" size={28} color="white" />
                </View>
                <Text style={styles.shareOptionText}>Telegram</Text>
              </TouchableOpacity>

              {/* Facebook */}
              <TouchableOpacity 
                style={styles.shareOption} 
                onPress={shareToFacebook}
              >
                <View style={[styles.shareIconContainer, { backgroundColor: '#1877F2' }]}>
                  <Ionicons name="logo-facebook" size={28} color="white" />
                </View>
                <Text style={styles.shareOptionText}>Facebook</Text>
              </TouchableOpacity>
            </View>

            {/* Share Button */}
            <TouchableOpacity 
              style={styles.shareButton}
              onPress={handleGeneralShare}
              disabled={sharing}
            >
              {sharing ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="share-social" size={20} color="white" />
                  <Text style={styles.shareButtonText}>More Options</Text>
                </>
              )}
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
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
  modalContent: {
    padding: 20,
  },
  shareText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  shareOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  shareOption: {
    alignItems: 'center',
    width: SCREEN_WIDTH / 4 - 20,
    marginBottom: 20,
  },
  shareIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  shareOptionText: {
    color: 'white',
    fontSize: 13,
  },
  shareButton: {
    backgroundColor: colors.purple,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    shadowColor: colors.purple,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default ShareModal; 