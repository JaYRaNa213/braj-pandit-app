import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../assets/constants/colors';
import { useTheme } from '../../context/ThemeContext';

const GenderPickerModal = ({
  isGenderPickerVisible,
  setIsGenderPickerVisible,
  personGender,
  setPersonGender,
}) => {
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isGenderPickerVisible}
      onRequestClose={() => setIsGenderPickerVisible(false)}
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.6)',
        }}
      >
        <View
          style={{
            backgroundColor: isDarkMode ? colors.darkBackground : colors.white,
            borderRadius: 16,
            padding: 20,
            width: '90%',
            maxHeight: '80%',
            shadowColor: colors.black,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <TouchableOpacity
            style={{ position: 'absolute', top: 12, right: 12 }}
            onPress={() => setIsGenderPickerVisible(false)}
          >
            <Ionicons
              name="close"
              size={24}
              color={isDarkMode ? colors.white : colors.black}
            />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: isDarkMode ? colors.white : colors.black,
              marginBottom: 12,
            }}
          >
            {t('selectGender')}
          </Text>
          {/* Show gender options */}
          <View
            style={{
              flexDirection: 'row',
              gap: 10,
              marginVertical: 10,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 20,
            }}
          >
            {['Male', 'Female'].map((gen) => (
              <TouchableOpacity
                key={gen}
                style={{
                  padding: 10,
                  backgroundColor:
                    personGender.toLowerCase() === gen.toLowerCase()
                      ? colors.primary
                      : colors.lightGray,
                  borderRadius: 20,
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => {
                  setPersonGender(gen);
                  setIsGenderPickerVisible(false);
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '400',
                    textTransform: 'capitalize',
                    color:
                      personGender.toLowerCase() === gen.toLowerCase()
                        ? colors.white
                        : colors.black,
                    textAlign: 'center',
                  }}
                >
                  {gen}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default GenderPickerModal;
