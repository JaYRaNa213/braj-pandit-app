import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useLayoutEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  Modal,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../assets/constants/colors';
import { redirectToStoreForFeedback } from '../utils/connectToPlayStore';
import axiosInstance from '../utils/axiosInstance';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator } from 'react-native-paper';
import WithSafeArea from '../components/HOC/SafeAreaView';
import { useTheme } from '../context/ThemeContext';

const languages = [
  { code: 'en', lng: 'English' },
  { code: 'hi', lng: 'हिन्दी' },
  { code: 'bn', lng: 'বাংলা' },
  { code: 'ta', lng: 'தமிழ்' },
  { code: 'ml', lng: 'മലയാളം' },
  { code: 'kn', lng: 'ಕನ್ನಡ' },
];

const PalmReadingResult = ({ route }) => {
  const navigation = useNavigation();
  const { i18n } = useTranslation();
  const [expandedSections, setExpandedSections] = useState({});
  const [animationValues, setAnimationValues] = useState({});
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [language, setLanguage] = useState(i18n.language);
  const [result, setResult] = useState(route.params.result);
  const timerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const {isDarkMode}=useTheme();

  // Keep useCallback for headerRight to prevent navigation options re-rendering
  const headerRight = React.useCallback(
    () => (
      <TouchableOpacity
        onPress={() => setShowLanguageModal(true)}
        style={{ marginRight: 12 }}
      >
        <Ionicons name="language" size={24} color="#fff" />
      </TouchableOpacity>
    ),
    [],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Palm Reading Insights',
      headerRight,
    });
  }, [navigation, headerRight]);

  useEffect(() => {
    timerRef.current = setTimeout(() => setIsTimeUp(true), 120000);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  async function handleLanguageChange(lang) {
    setIsLoading(true);

    if (lang === language) {
      return;
    }

    try {
      const response = await axiosInstance.post('/palm/translateFortune', {
        result,
        newLanguage: lang,
      });

      if (response?.data?.success) {
        setResult(response.data.data);
        setLanguage(lang);
        await i18n.changeLanguage(lang);
        setShowLanguageModal(false);
      }
    } catch (error) {
      console.error('Error translating fortune:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function toggleSection(key) {
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

    if (!animationValues[key]) {
      const newAnimValue = new Animated.Value(0);
      setAnimationValues((prev) => ({ ...prev, [key]: newAnimValue }));
      Animated.timing(newAnimValue, {
        toValue: expandedSections[key] ? 0 : 1,
        duration: 400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(animationValues[key], {
        toValue: expandedSections[key] ? 0 : 1,
        duration: 400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }).start();
    }
  }

  function getMaxHeight(key) {
    return animationValues[key]?.interpolate({
      inputRange: [0, 1],
      outputRange: [128, 800],
    });
  }

  const sections = [
    {
      title: 'Love and Marriage',
      key: 'loveAndMarriage',
      icon: '❤️',
      data: [
        { label: 'Heart Line', value: result.loveAndMarriage.heartLine },
        {
          label: 'Marriage Lines',
          value: result.loveAndMarriage.marriageLines,
        },
        {
          label: 'Girdle of Venus',
          value: result.loveAndMarriage.girdleOfVenus,
        },
        {
          label: 'Relationship Challenges',
          value: result.loveAndMarriage.relationshipChallenges,
        },
      ],
    },
    {
      title: 'Career',
      key: 'career',
      icon: '💼',
      data: [
        { label: 'Head Line', value: result.career.headLine },
        { label: 'Fate Line', value: result.career.fateLine },
        { label: 'Sun Line', value: result.career.sunLine },
      ],
    },
    {
      title: 'Finance',
      key: 'finance',
      icon: '💰',
      data: [
        { label: 'Fate Line', value: result.finance.fateLine },
        { label: 'Money Lines', value: result.finance.moneyLines },
        { label: 'Sun Line', value: result.finance.sunLine },
      ],
    },
    {
      title: 'Health',
      key: 'health',
      icon: '🩺',
      data: [
        { label: 'Life Line', value: result.health.lifeLine },
        { label: 'Stress Lines', value: result.health.stressLines },
        { label: 'Mount of Venus', value: result.health.mountOfVenus },
      ],
    },
    {
      title: 'Life Changes',
      key: 'lifeChanges',
      icon: '🔄',
      data: [
        {
          label: 'Fate Line Branches',
          value: result.lifeChanges.fateLineBranches,
        },
        {
          label: 'Line Interactions',
          value: result.lifeChanges.lineInteractions,
        },
        { label: 'Turning Points', value: result.lifeChanges.turningPoints },
      ],
    },
    {
      title: 'Overall Summary',
      key: 'overallSummary',
      icon: '✨',
      data: [{ label: 'Summary', value: result.overallSummary }],
    },
  ];

  function redirectToStore() {
    redirectToStoreForFeedback();
    setIsTimeUp(false);
  }

  return (
    <ScrollView contentContainerStyle={[styles.container,{backgroundColor: isDarkMode ? colors.darkBackground: colors.lightBackground}]}>
      {sections.map(({ title, key, icon, data }) => (
        <View style={[styles.card,{backgroundColor: isDarkMode ? colors.darkSurface: colors.lightBackground, 
                      borderColor:isDarkMode? colors.dark :colors.lightGray, borderWidth: isDarkMode ? 0.5:1}]} key={key}>
          <View style={styles.cardTitleRow}>
            <Text style={[styles.cardTitle,{color:isDarkMode ? colors.darkTextPrimary:colors.purple}]}>
              <Text>{icon}</Text> {title}
            </Text>
          </View>
          <Animated.View
            style={[styles.cardTextContainer, { maxHeight: getMaxHeight(key) }]}
          >
            {data.map(
              (item, index) =>
                (key === 'overallSummary' ||
                  index === 0 ||
                  expandedSections[key]) && (
                  <View key={`${key}-${index}`} style={styles.subSection}>
                    <Text style={[styles.subTitle,{color:isDarkMode ? colors.darkTextPrimary:colors.black}]}>{item.label}</Text>
                    <Text
                      style={[styles.cardText,{color:isDarkMode ? colors.darkTextSecondary:colors.dark}]}
                      numberOfLines={expandedSections[key] ? 0 : 3}
                    >
                      {item.value || 'Insight not available at this time.'}
                    </Text>
                  </View>
                ),
            )}
          </Animated.View>
          <TouchableOpacity
            style={styles.readMoreButton}
            onPress={() => toggleSection(key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.readMoreText,{color:isDarkMode ? colors.darkAccent:colors.purple}]}>
              {expandedSections[key] ? 'Read Less' : 'Read More'}
            </Text>
          </TouchableOpacity>
        </View>
      ))}

      {isTimeUp && (
        <Modal
          animationType="fade"
          visible={isTimeUp}
          transparent={true}
          onRequestClose={() => setIsTimeUp(false)}
        >
          <View style={styles.centeredView}>
            <View style={[styles.modalView,{backgroundColor :isDarkMode ? colors.darkSurface :colors.white}]}>
              <TouchableOpacity
                style={[styles.closeButton,{backgroundColor :isDarkMode ? colors.dark:colors.white}]}
                onPress={() => setIsTimeUp(false)}
              >
                <Ionicons name="close" size={24} color={isDarkMode ? colors.white: colors.purple} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle,{color:isDarkMode ? colors.darkAccent:colors.purple}]}>Enjoying Our App?</Text>
              <Text style={styles.modalSubtitle}>
                Your feedback means the world to us! Please share your
                experience on the Play Store.
              </Text>
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={styles.actionPrimaryButton}
                  onPress={redirectToStore}
                >
                  <Text style={styles.actionPrimaryButtonText}>
                    Rate on Play Store
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionSecondaryButton,{backgroundColor :isDarkMode ? colors.darkSurface :colors.white}]}
                  onPress={() => setIsTimeUp(false)}
                >
                  <Text style={[styles.actionSecondaryButtonText,{color :isDarkMode ? colors.darkTextPrimary :colors.purple}]}>
                    Maybe Later
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {showLanguageModal && (
        <Modal
          transparent={true}
          visible={showLanguageModal}
          onRequestClose={() => setShowLanguageModal(false)}
        >
          <View style={styles.centeredView}>
            <View style={styles.languageModalView}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowLanguageModal(false)}
              >
                <Ionicons name="close" size={24} color={colors.purple} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Select Language</Text>
              <Text style={styles.modalSubtitle}>
                Select a language to continue
              </Text>
              {isLoading ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color={colors.purple} />
                  <Text style={styles.loaderText}>Translating...</Text>
                </View>
              ) : (
                <View style={styles.languageGrid}>
                  {languages.map((lang, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.languageBox,
                        language === lang.code
                          ? styles.languageBoxSelected
                          : null,
                      ]}
                      onPress={() => handleLanguageChange(lang.code)}
                    >
                      <Text
                        style={[
                          styles.languageText,
                          language === lang.code
                            ? styles.languageTextSelected
                            : null,
                        ]}
                      >
                        {lang.lng}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: '#ffffff',
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.purple,
    letterSpacing: 0.2,
  },
  cardTextContainer: {
    marginTop: 8,
    overflow: 'hidden',
  },
  subSection: {
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.purple,
    marginBottom: 6,
  },
  cardText: {
    color: '#444',
    fontSize: 14,
    lineHeight: 24,
    fontWeight: '400',
    letterSpacing: 0.3,
    textAlign: 'justify',
  },
  readMoreButton: {
    alignSelf: 'flex-end',
  },
  readMoreText: {
    color: colors.purple,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalView: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
  },
  languageModalView: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.purple,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  actionPrimaryButton: {
    backgroundColor: colors.purple,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
    marginRight: 8,
  },
  actionSecondaryButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
    marginLeft: 8,
    justifyContent:'center'
  },
  actionPrimaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionSecondaryButtonText: {
    color: colors.purple,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  languageBox: {
    backgroundColor: '#f8f8f8',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    margin: 8,
    width: '40%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  languageBoxSelected: {
    backgroundColor: colors.purple,
    borderColor: colors.purple,
  },
  languageText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.purple,
  },
  languageTextSelected: {
    color: '#fff',
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.purple,
    fontWeight: '500',
  },
});

export default WithSafeArea(PalmReadingResult);
