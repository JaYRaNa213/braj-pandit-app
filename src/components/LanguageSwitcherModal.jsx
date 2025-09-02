import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../../i18n';
import { useTheme } from '../context/ThemeContext'; // Assuming this path is correct

const LanguageSwitcherModal = ({ isVisible, onClose, setLanguage }) => {
  const { isDarkMode } = useTheme();
  const [isLoading, setLoading] = useState(false);

  const languages = [
    { code: 'en', lng: 'English' },
    { code: 'hi', lng: 'हिन्दी' },
    { code: 'bn', lng: 'বাংলা' },
    { code: 'ta', lng: 'தமிழ்' },
    { code: 'ml', lng: 'മലയാളം' },
    { code: 'te', lng: 'తెలుగు' },
  ];

  const handleChangeLanguage = async (langCode) => {
    try {
      setLoading(true);
      await AsyncStorage.setItem('lang', langCode);
      i18n.changeLanguage(langCode);
      setLanguage(langCode);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Modal transparent={true} visible={isVisible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        {isLoading ? (
          <View
            style={[
              styles.modalContainer,
              isDarkMode && styles.darkModalContainer,
            ]}
          >
            <ActivityIndicator size="large" color="#000" />
            <Text>Translating...</Text>
          </View>
        ) : (
          <View
            style={[
              styles.modalContainer,
              isDarkMode && styles.darkModalContainer,
            ]}
          >
            <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>
              Select Language
            </Text>
            <TouchableOpacity style={styles.closeButtonIcon} onPress={onClose}>
              <Text
                style={[styles.closeButtonText, isDarkMode && styles.darkText]}
              >
                X
              </Text>
            </TouchableOpacity>
            <View style={styles.languageGrid}>
              {languages.map((lang, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.languageBox,
                    isDarkMode && styles.darkLanguageBox,
                  ]}
                  onPress={() => handleChangeLanguage(lang.code)}
                >
                  <Text
                    style={[styles.languageText, isDarkMode && styles.darkText]}
                  >
                    {lang.lng}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    paddingVertical: 50,
    position: 'relative',
  },
  darkModalContainer: {
    backgroundColor: '#444',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  darkText: {
    color: 'white',
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  languageBox: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 10,
    margin: 5,
    width: 100,
    alignItems: 'center',
  },
  darkLanguageBox: {
    backgroundColor: '#555',
  },
  languageText: {
    fontSize: 16,
  },
  closeButtonIcon: {
    position: 'absolute',
    top: 10,
    right: 20,
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#333',
  },
});

export default LanguageSwitcherModal;
