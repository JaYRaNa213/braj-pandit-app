import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../assets/constants/colors';
import { useTheme } from '../../context/ThemeContext';

const NoAccessModal = ({
  visible,
  onClose,
  available_balance,
  onBuyAccess,
  astro,
  isLoading,
}) => {
  const navigation = useNavigation();
  const requiredAmount = astro?.charges;
  const hasEnoughBalance = available_balance >= requiredAmount;
  const { isDarkMode } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.65)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: isDarkMode ? colors.darkBackground : '#fff',
            borderRadius: 24,
            padding: 28,
            width: '92%',
            maxWidth: 380,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowOffset: { width: 0, height: 8 },
            shadowRadius: 16,
            elevation: 10,
          }}
        >
          {/* Icon */}
          <View
            style={{
              backgroundColor: isDarkMode ? '#333' : '#FEE2E2',
              borderRadius: 50,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <MaterialIcons name="lock-outline" size={36} color="#E63946" />
          </View>

          {/* Title */}
          <Text
            style={{
              fontSize: 22,
              fontWeight: '800',
              color: isDarkMode ? '#fff' : '#1D3557',
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            Unlock Premium Access
          </Text>

          {/* Subtitle */}
          <Text
            style={{
              fontSize: 15,
              color: isDarkMode ? '#ccc' : '#444',
              textAlign: 'center',
              marginBottom: 22,
              lineHeight: 22,
            }}
          >
            Get personalized AI guidance from{' '}
            <Text style={{ fontWeight: '700', color: '#E63946' }}>
              {astro?.name}
            </Text>{' '}
            today.
          </Text>

          {/* Balance Card */}
          <View
            style={{
              backgroundColor: isDarkMode ? '#222' : '#F8F9FA',
              borderRadius: 16,
              paddingVertical: 14,
              paddingHorizontal: 20,
              marginBottom: 26,
              width: '100%',
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: isDarkMode ? '#fff' : '#333',
                textAlign: 'center',
              }}
            >
              Current Balance:{' '}
              <Text
                style={{
                  fontWeight: '700',
                  color: isDarkMode ? '#fff' : '#1D3557',
                }}
              >
                ₹{available_balance}
              </Text>
            </Text>
            {!hasEnoughBalance && (
              <Text
                style={{
                  marginTop: 6,
                  fontSize: 14,
                  color: '#E63946',
                  textAlign: 'center',
                  fontWeight: '600',
                }}
              >
                Add ₹{requiredAmount - available_balance} more to continue
              </Text>
            )}
          </View>

          {/* Action Buttons */}
          {hasEnoughBalance ? (
            <TouchableOpacity
              style={{
                backgroundColor: isLoading ? '#888' : colors.purple,
                borderRadius: 14,
                paddingVertical: 14,
                marginBottom: 14,
                width: '100%',
              }}
              onPress={onBuyAccess}
              disabled={isLoading}
            >
              <Text
                style={{
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: '700',
                  textAlign: 'center',
                }}
              >
                {isLoading
                  ? 'Unlocking...'
                  : `Unlock for ₹${requiredAmount}/day`}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={{
                backgroundColor: '#28A745',
                borderRadius: 14,
                paddingVertical: 14,
                marginBottom: 14,
                width: '100%',
              }}
              onPress={() => {
                onClose();
                navigation.navigate('Recharge');
              }}
            >
              <Text
                style={{
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: '700',
                  textAlign: 'center',
                }}
              >
                Recharge Wallet
              </Text>
            </TouchableOpacity>
          )}

          {/* Secondary Button */}
          <TouchableOpacity
            style={{
              borderRadius: 14,
              paddingVertical: 12,
              borderWidth: 1,
              borderColor: '#ddd',
              width: '100%',
            }}
            onPress={onClose}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: '500',
                color: isDarkMode ? '#aaa' : '#555',
                textAlign: 'center',
              }}
            >
              Maybe Later
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default NoAccessModal;
