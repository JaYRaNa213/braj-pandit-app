import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import i18n from '../../i18n';
import { colors } from '../assets/constants/colors';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNRestart from 'react-native-restart';

const Settings = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { isDarkMode, toggleTheme } = useTheme();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [language, setLanguage] = useState('en');
  const { user } = useSelector((state) => state.user);

  const languages = [
    { code: 'en', lng: 'English' },
    { code: 'hi', lng: 'हिन्दी' },
    { code: 'bn', lng: 'বাংলা' },
    { code: 'ta', lng: 'தமிழ்' },
    { code: 'ml', lng: 'മലയാളം' },
    { code: 'kn', lng: 'ಕನ್ನಡ' },
  ];

  const handleChangeLanguage = async (langCode) => {
    await AsyncStorage.setItem('lang', langCode);
    setLanguage(langCode);
    i18n.changeLanguage(langCode);
    setShowLanguageModal(false);
    RNRestart.restart();
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('settings.screenHead'),
    });
  }, [navigation, language, t]);

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <OptionButton
        icon={isDarkMode ? 'sunny' : 'moon'}
        text={
          isDarkMode
            ? t('settings.screenMode.lightMode')
            : t('settings.screenMode.darkMode')
        }
        onPress={toggleTheme}
      />

      <OptionButton
        icon="language"
        text={t('settings.language')}
        onPress={() => setShowLanguageModal(true)}
      />

      <Modal
        transparent={true}
        visible={showLanguageModal}
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              isDarkMode && styles.darkModalContainer,
            ]}
          >
            <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>
              Select Language
            </Text>
            <TouchableOpacity
              style={{ position: 'absolute', top: 10, right: 20 }}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={{ fontSize: 20 }}>X</Text>
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
        </View>
      </Modal>

      {user && (
        <TouchableOpacity
          style={[
            styles.optionContainer,
            isDarkMode && styles.darkOptionContainer,
          ]}
          onPress={() => navigation.navigate('DeleteAccount')}
        >
          <View style={{ flexDirection: 'row' }}>
            <MaterialIcons name={'delete'} size={24} color="red" />
            <Text style={[styles.optionText, { color: 'red' }]}>
              Delete Account
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const OptionButton = ({ icon, text, onPress }) => {
  const { isDarkMode } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.optionContainer, isDarkMode && styles.darkOptionContainer]}
      onPress={onPress}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons
          name={icon}
          size={24}
          color={isDarkMode ? 'white' : 'black'}
        />
        <Text style={[styles.optionText, isDarkMode && styles.darkOptionText]}>
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  darkContainer: { backgroundColor: '#333' },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  darkOptionContainer: { backgroundColor: '#444' },
  optionText: { marginLeft: 10, fontSize: 16 },
  darkOptionText: { color: 'white' },
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
  },
  darkModalContainer: { backgroundColor: '#444' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  darkText: { color: 'white' },
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
  darkLanguageBox: { backgroundColor: '#555' },
  languageText: { fontSize: 16 },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 10,
  },
  closeButtonText: { color: 'white', fontWeight: 'bold' },
});

export default Settings;
