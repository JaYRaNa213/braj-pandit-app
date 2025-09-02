import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useLayoutEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useSelector } from 'react-redux';
import { colors } from '../assets/constants/colors';
import axiosInstance from '../utils/axiosInstance';

const problemsByAge = {
  '18-23': [
    'Complicated Relationship',
    'Toxic relationship',
    'Breakup',
    'Exam pressure',
    'Government job preparation',
    'Pressure of competitive exam',
    'Career Advice',
    'Mental Health',
    'Social Anxiety',
    'Parental Pressure',
    'Identity Crisis',
    'Fear of Failure',
    'Money Management',
    'Self-Doubt',
  ],
  '22-28': [
    'Job Stability',
    'Passion vs Profession',
    'Struggles in Love',
    'Marriage Pressure',
    'Money Management',
    'Self-Doubt',
    'Health problem',
    'Work-Life Balance',
    'Relocation decisions',
    'Fear of Missing Out (FOMO)',
  ],
  '28-35': [
    'Marriage Delays',
    'Relationship Struggles',
    'Career Stagnation',
    'Job Shifts',
    'Planning for Children',
    'Parenthood Stress',
    'Balancing Family and Career Responsibilities',
    'Health Concerns',
    'Investments Pressure',
    'Mid-Life crisis',
    'Mental Peace',
    'Property Purchase',
    'Business Challenges',
  ],
  '35-65': [
    'Stability compromise',
    'Emotional Burnout',
    'Workplace Politics',
    'Property and Legal Disputes',
    'Health Issues',
    'Parenting Challenges',
    'Financial Planning',
    'Job Insecurity',
    'Marital Dispute',
    'Family Responsibilities',
  ],
  '50+': [
    'Communication gap',
    'Lack of Purpose',
    'Loss and Grief',
    'Spiritual Growth',
    'Property and legal matters',
    'Relationship Changes',
    "Children's Worries",
    'Loneliness',
    'Retirement Planning',
    'Financial security',
    'Medical Concerns',
  ],
};

export default function ProblemChecklistScreen({ route, navigation }) {
  const { ageRange } = route.params;
  const [selectedProblems, setSelectedProblems] = useState([]);
  const { user } = useSelector((state) => state.user);

  // Set professional navigation header title
  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Select Your Concerns',
      headerRight: () => (
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: 12,
            gap: 4,
          }}
          onPress={() => navigation.navigate('Footer', { screen: 'Home' })}
        >
          <Text style={{ color: 'white' }}>Skip</Text>
          <AntDesign
            name="right"
            size={12}
            color="white"
            style={{ marginTop: 2 }}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const toggleProblem = (problem) => {
    setSelectedProblems((prev) =>
      prev.includes(problem)
        ? prev.filter((p) => p !== problem)
        : [...prev, problem],
    );
  };

  const handleSubmit = async () => {
    try {
      if (!user?._id) {
        ToastAndroid.show(
          'User not found, please try again',
          ToastAndroid.SHORT,
        );
        return;
      }
      console.log(user._id);

      await axiosInstance.put('/user/updateUserProblems', {
        problems: selectedProblems,
      });
      // Show success message
      ToastAndroid.show('Concerns updated successfully', ToastAndroid.SHORT);
      navigation.navigate('Footer', { screen: 'Home' });
    } catch (error) {
      console.error('Error updating problems:', error?.response?.data);
      // Show error message
      ToastAndroid.show(
        'Failed to update concerns, please try again',
        ToastAndroid.SHORT,
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Please select your concerns to connect with an expert astrologer
      </Text>
      <ScrollView style={{ width: '100%' }}>
        {problemsByAge[ageRange]?.map((problem) => (
          <TouchableOpacity
            key={problem}
            style={styles.problemItem}
            onPress={() => toggleProblem(problem)}
          >
            <Text style={styles.checkbox}>
              {selectedProblems.includes(problem) ? '✔' : '⬜'}
            </Text>
            <Text style={styles.problemText}>{problem}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Proceed</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '400',
    color: '#374151',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  problemItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    borderColor: '#E5E7EB',
    borderWidth: 1,
  },
  checkbox: {
    fontSize: 14,
    marginRight: 12,
    color: '#4B5563',
  },
  problemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
  },
  submitButton: {
    marginTop: 28,
    backgroundColor: colors.purple,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 20,
    alignItems: 'center',
  },
  submitText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
