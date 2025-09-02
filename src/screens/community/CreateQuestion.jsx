import { useNavigation } from '@react-navigation/native';
import React, { useLayoutEffect, useState, useEffect } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
  Image,
  Modal,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../assets/constants/colors';
import axiosInstance from '../../utils/axiosInstance';
import { useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';

const CreateQuestion = ({ createQuestionModal, setCreateQuestionModal }) => {
  const navigation = useNavigation();
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const { height: screenHeight } = Dimensions.get('window');
  const buttonScale = new Animated.Value(1);
  const { user } = useSelector((state) => state.user);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setIsKeyboardOpen(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsKeyboardOpen(false);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Handle post submission
  const handleSubmit = async () => {
    if (content.trim() === '') {
      return;
    }

    try {
      await axiosInstance.post('/question/new', {
        question: content,
        isAnonymous,
      });
      ToastAndroid.show('Question posted!', ToastAndroid.SHORT);
      setContent('');
      setIsAnonymous(false);
      navigation.goBack();
    } catch (error) {
      console.error('Error creating question:', error);
      Alert.alert('Error', 'Failed to post question. Please try again.');
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setContent('');
    setIsAnonymous(false);
    setCreateQuestionModal(false);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Post a Question',
    });
  }, [navigation]);

  return (
    <Modal
      visible={createQuestionModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {
        setCreateQuestionModal(false);
        navigation.navigate('Community');
      }}
    >
      <View
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <KeyboardAvoidingView
          style={{ flex: 1, justifyContent: 'center' }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 10}
        >
          <View
            style={{
              width: '95%',
              height: isKeyboardOpen ? '90%' : '50%',
              padding: 20,
              backgroundColor: isDarkMode
                ? colors.darkBackground
                : colors.lightGray,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Main Content */}
            <View
              style={{
                flex: 1,
                backgroundColor: isDarkMode
                  ? colors.darkBackground
                  : colors.lightGray,
                borderRadius: 12,
              }}
            >
              {/*User Details*/}
              <View>
                {user && (
                  <View
                    style={[
                      styles.userCard,
                      {
                        backgroundColor: isDarkMode
                          ? colors.darkBackground
                          : '#FFFFFF',
                        borderColor: isDarkMode ? colors.dark : '#E5E7EB',
                      },
                    ]}
                  >
                    <View style={styles.leftuserCard}>
                      {isAnonymous ? (
                        <Ionicons
                          name="person-circle-outline"
                          size={40}
                          color={isDarkMode ? colors.lightGray : colors.dark}
                        />
                      ) : user?.pic ? (
                        <Image
                          source={{ uri: user?.pic }}
                          style={styles.avatar}
                        />
                      ) : (
                        <Ionicons
                          name="person-circle-outline"
                          size={40}
                          color={'#333'}
                        />
                      )}
                    </View>
                    <View style={styles.rightuserCard}>
                      {isAnonymous ? (
                        <Text
                          style={{
                            fontSize: 20,
                            color: isDarkMode ? colors.darkText : colors.purple,
                          }}
                        >
                          Anonymous
                        </Text>
                      ) : (
                        <Text
                          style={{
                            fontSize: 20,
                            color: isDarkMode ? colors.darkText : colors.purple,
                          }}
                        >
                          {user?.name || 'User'}
                        </Text>
                      )}

                      <View
                        style={{
                          width: '50%',
                          justifyContent: 'center',
                          alignItems: 'center',
                          paddingRight: 10,
                        }}
                      >
                        <View>
                          <Switch
                            value={isAnonymous}
                            onValueChange={setIsAnonymous}
                            trackColor={{
                              false: '#D1D5DB',
                              true: isDarkMode
                                ? colors.darkAccent
                                : colors.purple,
                            }}
                            thumbColor={
                              isAnonymous
                                ? isDarkMode
                                  ? colors.darkAccent
                                  : colors.purple
                                : '#FFFFFF'
                            }
                          />
                        </View>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: 500,
                            color: isDarkMode
                              ? colors.darkTextSecondary
                              : '#1F2937',
                          }}
                        >
                          Stay Anonymous
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>

              {/* Text Input */}
              <View
                style={{
                  flex: 1,
                  minHeight: screenHeight * 0.25,
                  maxHeight: screenHeight * 0.3,
                  borderWidth: 1,
                  borderColor: isDarkMode ? colors.dark : '#E5E7EB',
                  borderRadius: 20,
                  backgroundColor: isDarkMode
                    ? colors.darkBackground
                    : '#FFFFFF',
                  marginBottom: 16,
                  marginTop: 8,
                }}
              >
                <TextInput
                  style={{
                    flex: 1,
                    fontSize: 16,
                    color: '#1F2937',
                    lineHeight: 24,
                    padding: 16,
                    textAlignVertical: 'top',
                  }}
                  placeholder="What's your question?"
                  placeholderTextColor="#9CA3AF"
                  value={content}
                  onChangeText={setContent}
                  multiline
                  autoFocus
                />
              </View>

              {/* Buttons */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  gap: 12,
                }}
              >
                <TouchableOpacity
                  onPress={handleCancel}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 18,
                    borderRadius: 24,
                    borderWidth: 1,
                    backgroundColor: isDarkMode
                      ? colors.darkBackground
                      : colors.white,
                    borderColor: isDarkMode ? colors.darkSurface : '#D1D5DB',
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: isDarkMode ? colors.darkTextPrimary : '#4B5563',
                      fontWeight: '600',
                    }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSubmit}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 18,
                    borderRadius: 24,
                    backgroundColor: colors.purple,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    gap: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                  activeOpacity={0.7}
                >
                  <Animated.View
                    style={{ transform: [{ scale: buttonScale }] }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        color: '#FFFFFF',
                        fontWeight: '600',
                      }}
                    >
                      Post
                    </Text>
                  </Animated.View>
                  <Ionicons name="send" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  userCard: {
    height: 100,
    borderRadius: 15,
    flexDirection: 'row',
    backgroundColor: 'white',
  },
  leftuserCard: {
    width: '20%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightuserCard: {
    width: '80%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});

export default CreateQuestion;
