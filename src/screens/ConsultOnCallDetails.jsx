import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

const ConsultOnCallDetails = ({ route, navigation }) => {
  const { offering } = route.params;

  // Extract price as a number for calculations
  const price = parseInt(offering.price.replace('₹', ''));

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f6ff' }}>
      {/* Header with colored background and price badge */}
      <View style={styles.header}>
        <Text style={styles.title}>{offering.title}</Text>
        <View style={styles.headerRow}>
          <Text style={styles.subtitle}>{offering.duration}</Text>
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>{offering.price}</Text>
          </View>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 0 }}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>What to expect?</Text>
          <Text style={styles.sectionText}>{offering.description}</Text>
          {offering.title === 'Consult on call' && (
            <>
              <Text style={styles.bullet}>
                💬 Discuss love, career, health, or personal matters
              </Text>
              <Text style={styles.bullet}>
                📊 Get real-time answers based on your birth chart
              </Text>
              <Text style={styles.bullet}>
                🪐 Understand planetary influences affecting you now
              </Text>
              <Text style={styles.bullet}>
                ⚡ Immediate support—no waiting, just clarity when you need it
              </Text>
            </>
          )}
          {offering.title === 'Ask 1 question' && (
            <>
              <Text style={styles.bullet}>
                🔍 Get accurate guidance based on your birth details
              </Text>
              <Text style={styles.bullet}>
                📝 Receive detailed analysis of your specific question
              </Text>
              <Text style={styles.bullet}>
                🌟 Understand the astrological factors affecting your situation
              </Text>
              <Text style={styles.bullet}>
                🚀 Get actionable insights to move forward
              </Text>
            </>
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>How does it work?</Text>
          {offering.title === 'Consult on call' && (
            <>
              <Text style={styles.bullet}>
                📞 You can initiate a call with the professional immediately
                after the purchase
              </Text>
              <Text style={styles.bullet}>
                ⏱️ The line will be active for 5 minutes only
              </Text>
              <Text style={styles.bullet}>
                📶 You can call the professional again if the line gets
                disconnected due to network issues
              </Text>
              <Text style={styles.bullet}>
                📱 You will be charged by your telecom operator as per your plan
              </Text>
            </>
          )}
          {offering.title === 'Ask 1 question' && (
            <>
              <Text style={styles.bullet}>
                ✍️ Submit your question after purchase
              </Text>
              <Text style={styles.bullet}>
                🔎 Our expert will analyze your birth chart and question
              </Text>
              <Text style={styles.bullet}>
                ⏳ Receive a detailed response within 24 hours
              </Text>
              <Text style={styles.bullet}>
                💬 Get follow-up clarification if needed
              </Text>
            </>
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Cancellation policy</Text>
          <Text style={styles.sectionText}>
            💸 Full refund if cancelled before the service begins
          </Text>
          <Text style={styles.sectionText}>
            ⏰ 50% refund if cancelled within 1 hour of purchase
          </Text>
          <Text style={styles.sectionText}>
            ❌ No refund after service has started
          </Text>
        </View>
      </ScrollView>
      <View style={styles.bottomBar}>
        <View style={styles.priceBox}>
          <Text style={styles.bottomPrice}>{offering.price}</Text>
        </View>
        <TouchableOpacity
          style={styles.buyButton}
          onPress={() =>
            navigation.navigate('PaymentInformation', {
              amount: price,
              extra: 0,
              offering: offering,
              onPaymentSuccess: () =>
                navigation.navigate('BookingConfirmation', { offering }),
            })
          }
        >
          <Text style={styles.buyButtonText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#7c3aed',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    padding: 20,
    paddingTop: 5,
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  priceBadge: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  priceText: {
    color: '#7c3aed',
    fontWeight: 'bold',
    fontSize: 18,
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 2, color: '#fff' },
  subtitle: { fontSize: 16, color: '#e0e7ff', marginBottom: 0 },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
    color: '#7c3aed',
  },
  sectionText: { color: '#444', marginBottom: 8 },
  bullet: { color: '#444', marginLeft: 8, marginBottom: 6, fontSize: 15 },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 10,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  priceBox: {
    backgroundColor: '#f3e8ff',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 16,
    marginRight: 8,
    elevation: 1,
  },
  bottomPrice: { fontSize: 20, fontWeight: 'bold', color: '#7c3aed' },
  buyButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 32,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
  },
  buyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});

export default ConsultOnCallDetails;
