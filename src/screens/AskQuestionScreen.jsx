import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import axios from 'axios';
import { API_URL } from '../config/constants';

const AskQuestionScreen = ({ route, navigation }) => {
  const { offering, astrologerId } = route.params;
  const [question, setQuestion] = useState('');

  const handleSendNow = () => {
    if (!question.trim()) {
      Alert.alert('Error', 'Please enter your question before proceeding.');
      return;
    }

    // Extract price as a number for calculations
    const price = parseInt(offering.price.replace('₹', ''));

    // Navigate to payment screen
    navigation.navigate('PaymentInformation', {
      amount: price,
      extra: 0,
      offering: offering,
      onPaymentSuccess: navigation.replace('BookingScreen'),
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f6ff' }}>
      <ScrollView contentContainerStyle={{ padding: 0 }}>
        {/* Header with colored background and avatar */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            {/* <Image
              source={{ uri: 'https://i.imgur.com/0y0y0y0.png' }}
              style={styles.avatar}
            /> */}
            <View>
              {/* <Text style={styles.expertName}>Chetan Dalvi</Text> */}
              <Text style={styles.title}>{offering.title}</Text>
            </View>
          </View>
        </View>

        {/* Card for question input */}
        <View style={styles.card}>
          <TextInput
            style={styles.textInput}
            placeholder="Start typing to ask your questions to me...."
            placeholderTextColor="#888"
            value={question}
            onChangeText={setQuestion}
            multiline
            numberOfLines={5}
          />
        </View>

        {/* Info lines with emoji icons */}
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>⏰</Text>
          <Text style={styles.infoGreen}>Typically responds in 30 mins</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>✅</Text>
          <Text style={styles.infoGreen}>
            No response in 48 hours? Get a full refund!
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>🔄</Text>
          <Text style={styles.infoOrange}>
            You can ask follow-up questions upto 48hrs
          </Text>
        </View>

        {/* What you can ask about section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What you can ask about?</Text>
          <Text style={styles.sectionText}>
            Start your journey with a free enquiry! Get clarity on how I can
            assist you and the right service for your needs.
          </Text>
          <Text style={styles.bullet}>
            • Guidance on Face & Psychic Reading, Tarot, Akashic Records &
            Energy Healing
          </Text>
          <Text style={styles.bullet}>
            • Help in choosing the ideal service
          </Text>
          <Text style={styles.bullet}>• Answers to all kinds of concerns</Text>
        </View>
      </ScrollView>
      {/* Bottom bar with price and button */}
      <View style={styles.bottomBar}>
        <View style={styles.priceBox}>
          <Text style={styles.bottomPrice}>{offering.price}</Text>
          <Text style={styles.strike}>₹299</Text>
        </View>
        <TouchableOpacity style={styles.sendButton} onPress={handleSendNow}>
          <Text style={styles.sendButtonText}>Send Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 36,
    paddingBottom: 18,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 4,
    marginBottom: 8,
    backgroundColor: '#f7e7ff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#eee',
  },
  expertName: {
    color: '#bfa14a',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3b017a',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginHorizontal: 18,
    marginTop: -28,
    marginBottom: 10,
    padding: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  textInput: {
    minHeight: 90,
    fontSize: 16,
    color: '#222',
    textAlignVertical: 'top',
    backgroundColor: '#f8f6ff',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 24,
    marginBottom: 2,
  },
  infoIcon: {
    marginRight: 6,
    fontSize: 16,
  },
  infoGreen: {
    color: '#1ca14a',
    fontSize: 13,
  },
  infoOrange: {
    color: '#1ca14a',
    fontSize: 13,
  },
  section: {
    backgroundColor: '#f3f0f8',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    elevation: 1,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
    color: '#3b017a',
  },
  sectionText: {
    color: '#444',
    marginBottom: 8,
  },
  bullet: {
    color: '#1ca14a',
    marginLeft: 8,
    marginBottom: 2,
    fontSize: 14,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 10,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  priceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7e7ff',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  bottomPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7A4B01',
    marginRight: 6,
  },
  strike: {
    textDecorationLine: 'line-through',
    color: '#aaa',
    fontSize: 16,
    marginLeft: 2,
  },
  sendButton: {
    backgroundColor: '#5100ff',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 36,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#5100ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.5,
  },
});

export default AskQuestionScreen;
