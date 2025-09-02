import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { colors } from '../assets/constants/colors';
import axiosInstance from '../utils/axiosInstance';

const DiscountCode = ({ amount, onDiscountApplied }) => {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const { isDarkMode } = useTheme();

  // Reset states when amount changes
  useEffect(() => {
    setError('');
    // Reset discount if amount changes and is less than minimum required
    if (amount < 500 && discountAmount > 0) {
      clearDiscount();
    }
  }, [amount]);

  const validateDiscount = async () => {
    if (!code.trim()) {
      setError(t('Recharge.discount.empty'));
      return;
    }

    // Validate minimum amount
    if (!amount || amount < 500) {
      setError(t('Recharge.discount.minimum'));
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Try to use the calculate-discount endpoint
      const formattedCode = code.trim().toUpperCase();
      const response = await axiosInstance.post('/payment/calculate-discount', {
        amount: amount,
        discountCode: formattedCode,
      });

      if (response.data && response.data.success) {
        const { discountAmount, discount } = response.data;

        setDiscountAmount(discountAmount);
        setSuccess('Discount applied successfully!');

        // Inform parent component about the discount
        onDiscountApplied({
          discountCode: formattedCode,
          discountAmount,
          discountType: discount.type,
          discountValue: discount.value,
        });
      } else {
        setError(response.data?.message || t('Recharge.discount.error'));
        onDiscountApplied(null);
      }
    } catch (err) {
      console.error('Discount validation error:', err);

      if (err.message && err.message.includes('Network Error')) {
        // Network error, provide clear message
        setError('Network error. Please check your internet connection.');
      } else if (err.response) {
        // Server responded with error
        console.error(
          'Server error response:',
          err.response.status,
          err.response.data,
        );

        if (err.response.status === 404) {
          setError('Discount service unavailable. Please try again later.');
        } else if (err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError('Failed to validate discount code. Please try again.');
        }
      } else {
        // Unknown error
        setError(t('Recharge.discount.error'));
      }

      // Reset discount if there was an error
      onDiscountApplied(null);
    } finally {
      setLoading(false);
    }
  };

  const clearDiscount = () => {
    setCode('');
    setError('');
    setSuccess('');
    setDiscountAmount(0);
    onDiscountApplied(null);
  };

  const styles = StyleSheet.create({
    container: {
      padding: 15,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: isDarkMode ? '#333333' : '#E5E7EB',
      backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: isDarkMode ? '#FFFFFF' : '#2C3E50',
      marginBottom: 10,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    input: {
      flex: 1,
      backgroundColor: isDarkMode ? '#333333' : '#F7F8FA',
      color: isDarkMode ? '#FFFFFF' : '#000000',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: isDarkMode ? '#444444' : '#E5E7EB',
      marginRight: 10,
    },
    button: {
      backgroundColor: isDarkMode ? colors.orange : colors.purple,
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 8,
    },
    buttonText: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 14,
    },
    errorText: {
      color: '#DC2626',
      marginTop: 5,
    },
    successText: {
      color: '#059669',
      marginTop: 5,
    },
    discountInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 10,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? '#333333' : '#E5E7EB',
    },
    discountText: {
      fontSize: 14,
      fontWeight: '600',
      color: isDarkMode ? colors.orange : colors.purple,
    },
    clearButton: {
      padding: 5,
    },
    clearButtonText: {
      color: isDarkMode ? '#FFB74D' : '#7C3AED',
      fontSize: 12,
    },
    minimumInfo: {
      marginTop: 5,
      fontStyle: 'italic',
      fontSize: 12,
      color: isDarkMode ? '#BBBBBB' : '#666666',
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('Recharge.discount.title')}</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={code}
          onChangeText={setCode}
          placeholder={t('Recharge.discount.placeholder')}
          placeholderTextColor={isDarkMode ? '#BBBBBB' : '#999999'}
          autoCapitalize="characters"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={validateDiscount}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>
              {t('Recharge.discount.apply')}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.minimumInfo}>
        Discount codes are applicable on recharges of ₹500 or more only
      </Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {success ? <Text style={styles.successText}>{success}</Text> : null}

      {discountAmount > 0 && (
        <View style={styles.discountInfo}>
          <Text style={styles.discountText}>
            {t('Recharge.discount.applied')} ₹{discountAmount}
          </Text>
          <TouchableOpacity style={styles.clearButton} onPress={clearDiscount}>
            <Text style={styles.clearButtonText}>
              {t('Recharge.discount.remove')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default DiscountCode;
