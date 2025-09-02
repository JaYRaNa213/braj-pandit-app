import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

const offerings = [
  {
    id: 1,
    title: 'Consult on call',
    description:
      'Connect with me instantly on a call to get astrological guidance tailored to your current questions and life situation. Discuss love, career, health, or personal ...',
    price: '₹99',
    duration: 'For 5 Minutes',
    // image: require('../assets/consult_call.png'), // Replace with your image path
    buttonText: 'Call',
    buttonIcon: 'phone',
    onPress: (navigation, item) =>
      navigation.navigate('ConsultOnCallDetails', { offering: item }),
  },
  {
    id: 2,
    title: 'Ask 1 question',
    description:
      'Get clear answers to your most pressing question with astrology & numerology insights. What youll get: Accurate guidance based on your birth details ...',
    price: '₹199',
    duration: 'Responds in 24 Hours',
    // image: require('../assets/ask_1_question.png'), // Replace with your image path
    buttonText: 'Ask',
    buttonIcon: 'question-circle',
    onPress: (navigation, item) =>
      navigation.navigate('AskQuestionScreen', { offering: item }),
  },
  {
    id: 3,
    title: 'Google Meet',
    description:
      'Connect with me on Google Meet for a personalized consultation. Get detailed insights and guidance on your questions through a face-to-face video session.',
    price: '₹199',
    duration: 'G-Meet • For 15 Minutes',
    // image: require('../assets/google_meet.png'),
    buttonText: 'Book',
    buttonIcon: 'calendar',
    onPress: (navigation, item) =>
      navigation.navigate('BookingScreen', { offering: item }),
  },
  {
    id: 4,
    title: 'Kundli analysis',
    description:
      'Gain clarity on your lifes journey with a personalized Kundli analysis session. What youll discover: ✅ Planetary influence on career, relationships & ...',
    price: '₹249',
    duration: 'G-Meet • For 15 Minutes',
    // image: require('../assets/kundli_analysis.png'),
    buttonText: 'Book',
    buttonIcon: 'calendar',
    onPress: (navigation, item) =>
      navigation.navigate('BookingScreen', { offering: item }),
  },
  {
    id: 5,
    title: 'Tarot reading session',
    description:
      'Gain clarity and direction with a personalized Tarot reading. Uncover hidden insights and receive empowering guidance to navigate life',
    price: '₹299',
    duration: 'G-Meet • For 15 Minutes',
    // image: require('../assets/tarot_reading.png'),
    buttonText: 'Book',
    buttonIcon: 'calendar',
    onPress: (navigation, item) =>
      navigation.navigate('BookingScreen', { offering: item }),
  },
  {
    id: 6,
    title: 'Pendulum dowsing',
    description:
      'Gain clarity on your questions with a guided pendulum dowsing session. Get precise answers and energy insights to make informed decisions. What youll get: ...',
    price: '₹249',
    duration: 'G-Meet • For 15 Minutes',
    // image: require('../assets/pendulum_dowsing.png'),
    buttonText: 'Book',
    buttonIcon: 'calendar',
    onPress: (navigation, item) =>
      navigation.navigate('BookingScreen', { offering: item }),
  },
];

const BookingOfferings = ({ navigation }) => (
  <View style={styles.container}>
    <Text style={styles.heading}>My Offerings</Text>
    {offerings.map((item) => (
      <View key={item.id} style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.desc}>{item.description}</Text>
          <Text style={styles.price}>
            {item.price} <Text style={styles.duration}>• {item.duration}</Text>
          </Text>
        </View>
        <View style={styles.rightSection}>
          {item.image && <Image source={item.image} style={styles.image} />}
          <TouchableOpacity
            style={styles.button}
            onPress={() => item.onPress(navigation, item)}
          >
            <Text style={styles.buttonText}>{item.buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 2,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b017a',
    marginBottom: 8,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#F9F6F2',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
    marginBottom: 2,
  },
  desc: {
    color: '#555',
    fontSize: 13,
    marginBottom: 4,
  },
  price: {
    color: '#7A4B01',
    fontWeight: 'bold',
    fontSize: 15,
  },
  duration: {
    color: '#888',
    fontWeight: 'normal',
    fontSize: 13,
  },
  rightSection: {
    alignItems: 'center',
    marginLeft: 10,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#5100ff',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 18,
    alignItems: 'center',
    marginTop: 2,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default BookingOfferings;
