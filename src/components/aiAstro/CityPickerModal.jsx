import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../assets/constants/colors';
import { useTheme } from '../../context/ThemeContext';

const CityPickerModal = ({
  setIsCityPickerVisible,
  isCityPickerVisible,
  setPOB,
  suggestionPlaces,
}) => {
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();

  const handlePlaceClick = (place) => {
    setPOB(place);
    setIsCityPickerVisible(false);
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isCityPickerVisible}
      onRequestClose={() => setIsCityPickerVisible(false)}
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
            onPress={() => setIsCityPickerVisible(false)}
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
            {t('selectCity')}
          </Text>
          <ScrollView style={{ maxHeight: 300, width: '100%' }}>
            {suggestionPlaces.map((place, index) => (
              <Pressable
                key={index}
                onPress={() => handlePlaceClick(place)}
                style={({ pressed }) => [
                  {
                    padding: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.lightGray,
                  },
                  pressed && { backgroundColor: colors.lightGray },
                  isDarkMode && { borderBottomColor: colors.darkGray },
                ]}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: isDarkMode ? colors.white : colors.black,
                  }}
                >
                  {place}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default CityPickerModal;
