import React, { useEffect, useState } from 'react';
import {
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../assets/constants/colors';
import DeviceInfo from 'react-native-device-info';
import axiosInstance from '../utils/axiosInstance';

const UpdateRequiredModal = () => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);

  const checkAppVersion = async () => {
    try {
      // Get version from the app itself
      const currentVersion = await DeviceInfo.getVersion();
      const response = await axiosInstance.get(
        `/ticket/checkversion?version=${currentVersion}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.requiresUpdate) {
        setUpdateInfo(response.data);
        setShowUpdateModal(true);
      }
    } catch (error) {
      console.error('Error checking app version:', error);
    }
  };

  useEffect(() => {
    checkAppVersion();
  }, []);

  return (
    <Modal
      visible={showUpdateModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {}} // Empty function to prevent closing
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.iconContainer}>
            <Text style={styles.updateIcon}>🔄</Text>
          </View>
          <Text style={styles.modalTitle}>Update Available</Text>
          <Text style={styles.modalText}>
            A new version of Vedaz is available with exciting new features and
            improvements.
          </Text>
          <View style={styles.versionContainer}>
            <View style={styles.versionItem}>
              <Text style={styles.versionLabel}>Current Version</Text>
              <Text style={styles.versionValue}>
                {updateInfo?.currentVersion}
              </Text>
            </View>
            <View style={styles.versionDivider} />
            <View style={styles.versionItem}>
              <Text style={styles.versionLabel}>Required Version</Text>
              <Text style={styles.versionValue}>
                {updateInfo?.minimumVersion}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.updateButton}
            onPress={() => {
              Linking.openURL(
                'https://play.google.com/store/apps/details?id=com.vedaz.user.myapp',
              );
            }}
          >
            <Text style={styles.updateButtonText}>Update Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    width: '85%',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.purple + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  updateIcon: {
    fontSize: 32,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666666',
    fontSize: 16,
    lineHeight: 22,
  },
  versionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  versionItem: {
    flex: 1,
    alignItems: 'center',
  },
  versionLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  versionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  versionDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  updateButton: {
    backgroundColor: colors.purple,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    elevation: 2,
    shadowColor: colors.purple,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  updateButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default UpdateRequiredModal;
