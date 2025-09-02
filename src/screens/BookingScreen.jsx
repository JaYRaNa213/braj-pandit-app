import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axiosInstance from '../utils/axiosInstance';
import moment from 'moment';

const dates = [
  { label: 'Today', date: '8th, May' },
  { label: 'Tomorrow', date: '9th, May' },
  { label: 'Saturday', date: '10th, May' },
  { label: 'Sunday', date: '11th, May' },
  { label: 'Monday', date: '12th, May' },
];

const slots = {
  '8th, May': [
    '02:45 PM',
    '03:00 PM',
    '03:15 PM',
    '04:00 PM',
    '04:15 PM',
    '04:30 PM',
    '04:45 PM',
    '05:00 PM',
    '05:15 PM',
    '05:30 PM',
    '05:45 PM',
    '06:30 PM',
    '06:45 PM',
    '07:00 PM',
    '07:15 PM',
    '07:30 PM',
    '07:45 PM',
    '08:00 PM',
    '08:15 PM',
  ],
  '9th, May': [
    '02:45 PM',
    '03:00 PM',
    '03:15 PM',
    '04:00 PM',
    '04:15 PM',
    '04:30 PM',
    '04:45 PM',
    '05:00 PM',
    '05:15 PM',
    '05:30 PM',
    '05:45 PM',
    '06:30 PM',
    '06:45 PM',
    '07:00 PM',
    '07:15 PM',
    '07:30 PM',
    '07:45 PM',
    '08:00 PM',
    '08:15 PM',
  ],
  '10th, May': [
    '02:45 PM',
    '03:00 PM',
    '03:15 PM',
    '04:00 PM',
    '04:15 PM',
    '04:30 PM',
    '04:45 PM',
    '05:00 PM',
    '05:15 PM',
    '05:30 PM',
    '05:45 PM',
    '06:30 PM',
    '06:45 PM',
    '07:00 PM',
    '07:15 PM',
    '07:30 PM',
    '07:45 PM',
    '08:00 PM',
    '08:15 PM',
  ],
  '11th, May': [
    '02:45 PM',
    '03:00 PM',
    '03:15 PM',
    '04:00 PM',
    '04:15 PM',
    '04:30 PM',
    '04:45 PM',
    '05:00 PM',
    '05:15 PM',
    '05:30 PM',
    '05:45 PM',
    '06:30 PM',
    '06:45 PM',
    '07:00 PM',
    '07:15 PM',
    '07:30 PM',
    '07:45 PM',
    '08:00 PM',
    '08:15 PM',
  ],
  '12th, May': [
    '02:45 PM',
    '03:00 PM',
    '03:15 PM',
    '04:00 PM',
    '04:15 PM',
    '04:30 PM',
    '04:45 PM',
    '05:00 PM',
    '05:15 PM',
    '05:30 PM',
    '05:45 PM',
    '06:30 PM',
    '06:45 PM',
    '07:00 PM',
    '07:15 PM',
    '07:30 PM',
    '07:45 PM',
    '08:00 PM',
    '08:15 PM',
  ],
};

const BookingScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { offering } = route.params || {};
  const [selectedDateIdx, setSelectedDateIdx] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [note, setNote] = useState('');
  const [showExpect, setShowExpect] = useState(true);
  const [showCancel, setShowCancel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const selectedDate = dates[selectedDateIdx].date;
  const slotList = slots[selectedDate] || [];

  // const createGoogleMeet = async (startTime) => {
  //   try {
  //     // Parse duration from offering (assuming format like "30 min" or "1 hour")
  //     const durationMatch = offering?.duration?.match(/(\d+)\s*(min|hour)/i);
  //     if (!durationMatch) {
  //       throw new Error('Invalid duration format');
  //     }

  //     const duration = parseInt(durationMatch[1]);
  //     const unit = durationMatch[2].toLowerCase();

  //     // Convert duration to minutes
  //     const durationInMinutes = unit === 'hour' ? duration * 60 : duration;

  //     // Calculate end time
  //     const endTime = moment(startTime)
  //       .add(durationInMinutes, 'minutes')
  //       .toISOString();

  //     // const response = await axiosInstance.post('/api/meet/create-meeting', {
  //     //   displayName: 'Meeting with Astrologer',
  //     //   description: offering.title,
  //     //   startTime: startTime,
  //     //   endTime: endTime,
  //     // });

  //     return response.data;
  //   } catch (error) {
  //     console.error('Error creating Google Meet:', error);
  //     throw error;
  //   }
  // };

  const handleBooking = () => {
    if (!selectedSlot) {
      Alert.alert('Error', 'Please select a time slot');
      return;
    }

    const price = parseInt(offering?.price?.replace('₹', '') || '0');
    navigation.navigate('PaymentInformation', {
      amount: price,
      extra: 0,
      offering: offering,
      bookingDetails: {
        date: selectedDate,
        time: selectedSlot,
        note: note,
      },
      onPaymentSuccess: () => {
        navigation.navigate('GoogleMeet', {
          date: selectedDate,
          time: selectedSlot,
          offering: offering,
          note: note,
        });
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{offering?.title || 'Book Session'}</Text>
        <Text style={styles.subtitle}>{offering?.duration || ''}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.dateTabs}
        >
          {dates.map((d, idx) => (
            <TouchableOpacity
              key={d.date}
              style={[
                styles.dateTab,
                idx === selectedDateIdx && styles.dateTabActive,
              ]}
              onPress={() => {
                setSelectedDateIdx(idx);
                setSelectedSlot(null);
              }}
            >
              <Text
                style={[
                  styles.dateTabText,
                  idx === selectedDateIdx && styles.dateTabTextActive,
                ]}
              >
                {d.label}
              </Text>
              <Text
                style={[
                  styles.dateTabDate,
                  idx === selectedDateIdx && styles.dateTabTextActive,
                ]}
              >
                {d.date}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={styles.sectionTitle}>Today, {selectedDate}</Text>
        <Text style={styles.sectionSubTitle}>Afternoon</Text>
        <View style={styles.slotGrid}>
          {slotList.slice(0, 7).map((slot) => (
            <TouchableOpacity
              key={slot}
              style={[
                styles.slot,
                selectedSlot === slot && styles.slotSelected,
              ]}
              onPress={() => setSelectedSlot(slot)}
            >
              <Text
                style={[
                  styles.slotText,
                  selectedSlot === slot && styles.slotTextSelected,
                ]}
              >
                {slot}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.sectionSubTitle}>Evening</Text>
        <View style={styles.slotGrid}>
          {slotList.slice(7).map((slot) => (
            <TouchableOpacity
              key={slot}
              style={[
                styles.slot,
                selectedSlot === slot && styles.slotSelected,
              ]}
              onPress={() => setSelectedSlot(slot)}
            >
              <Text
                style={[
                  styles.slotText,
                  selectedSlot === slot && styles.slotTextSelected,
                ]}
              >
                {slot}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.noteContainer}>
          <Text style={styles.noteLabel}>Add a note</Text>
          <View style={styles.noteInputRow}>
            <TextInput
              style={styles.noteInput}
              placeholder="Add a note..."
              value={note}
              onChangeText={setNote}
            />
            <TouchableOpacity style={styles.noteButton}>
              <Text style={styles.noteButtonText}>{'>'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* What to expect section */}
        <TouchableOpacity
          style={styles.collapseHeader}
          onPress={() => setShowExpect((v) => !v)}
        >
          <Text style={styles.collapseTitle}>What to expect?</Text>
          <Text style={styles.arrow}>{showExpect ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        {showExpect && (
          <View style={styles.collapseBody}>
            <Text style={{ marginBottom: 6 }}>
              Gain clarity on your life's journey with a personalized Kundli
              analysis session.
            </Text>
            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>
              What you'll discover:
            </Text>
            <View style={styles.expectRow}>
              <Text style={styles.greenCheck}>✅</Text>
              <Text style={styles.expectText}>
                Planetary influence on career, relationships & growth
              </Text>
            </View>
            <View style={styles.expectRow}>
              <Text style={styles.greenCheck}>✅</Text>
              <Text style={styles.expectText}>
                Guidance to overcome challenges & seize opportunities
              </Text>
            </View>
            <View style={styles.expectRow}>
              <Text style={styles.greenCheck}>✅</Text>
              <Text style={styles.expectText}>
                Remedies for a balanced, fulfilling future
              </Text>
            </View>
            <Text style={{ marginTop: 4 }}>Book now at ₹13/min!</Text>
          </View>
        )}

        {/* Cancellation policy section */}
        <TouchableOpacity
          style={styles.collapseHeader}
          onPress={() => setShowCancel((v) => !v)}
        >
          <Text style={styles.collapseTitle}>Cancellation policy</Text>
          <Text style={styles.arrow}>{showCancel ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        {showCancel && (
          <View style={styles.collapseBody}>
            <View style={styles.cancelRow}>
              <Text style={styles.redDot}>●</Text>
              <Text style={styles.cancelText}>
                Free cancellation of the meeting available up to one hour before
                the reserved slot
              </Text>
            </View>
            <View style={styles.cancelRow}>
              <Text style={styles.redDot}>●</Text>
              <Text style={styles.cancelText}>
                A full refund will be initiated if the professional declines the
                meeting due to unavoidable reasons.
              </Text>
            </View>
            <View style={styles.cancelRow}>
              <Text style={styles.redDot}>●</Text>
              <Text style={styles.cancelText}>
                In case of any concerns after booking the meeting you can reach
                out to our customer support team
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
      <View style={styles.bottomBar}>
        <Text style={styles.price}>{offering?.price || '₹0'}</Text>
        <TouchableOpacity
          style={[styles.bookBtn, isLoading && styles.bookBtnDisabled]}
          onPress={handleBooking}
          disabled={isLoading}
        >
          <Text style={styles.bookBtnText}>
            {isLoading ? 'Creating...' : 'Book Now'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    paddingTop: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  subtitle: {
    color: '#888',
    marginBottom: 12,
  },
  dateTabs: {
    flexGrow: 0,
    marginBottom: 10,
  },
  dateTab: {
    backgroundColor: '#F3F1F8',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    alignItems: 'center',
  },
  dateTabActive: {
    backgroundColor: '#E2D6F9',
  },
  dateTabText: {
    color: '#888',
    fontWeight: 'bold',
  },
  dateTabTextActive: {
    color: '#7A4B01',
  },
  dateTabDate: {
    fontSize: 12,
    color: '#888',
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 10,
    marginBottom: 2,
    color: '#222',
  },
  sectionSubTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 2,
    color: '#7A4B01',
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  slot: {
    backgroundColor: '#F3F1F8',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  slotSelected: {
    backgroundColor: '#7A4B01',
  },
  slotText: {
    color: '#222',
    fontWeight: 'bold',
  },
  slotTextSelected: {
    color: '#fff',
  },
  noteContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  noteLabel: {
    fontWeight: 'bold',
    color: '#7A4B01',
    marginBottom: 4,
  },
  noteInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F1F8',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  noteInput: {
    flex: 1,
    height: 40,
    color: '#222',
  },
  noteButton: {
    backgroundColor: '#E2D6F9',
    borderRadius: 16,
    padding: 8,
    marginLeft: 6,
  },
  noteButtonText: {
    color: '#7A4B01',
    fontWeight: 'bold',
    fontSize: 18,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7A4B01',
  },
  bookBtn: {
    backgroundColor: '#7A4B01',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 32,
  },
  bookBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  collapseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F7FA',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    marginBottom: 0,
    elevation: 1,
  },
  collapseTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  collapseBody: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    marginTop: 0,
    elevation: 1,
  },
  expectRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  greenCheck: {
    color: '#2ecc40',
    fontSize: 18,
    marginRight: 6,
    marginTop: 1,
  },
  expectText: {
    color: '#222',
    fontSize: 14,
    flex: 1,
  },
  cancelRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  redDot: {
    color: '#e74c3c',
    fontSize: 18,
    marginRight: 6,
    marginTop: 2,
  },
  cancelText: {
    color: '#222',
    fontSize: 14,
    flex: 1,
  },
  arrow: {
    fontSize: 18,
    color: '#222',
    marginLeft: 8,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  bookBtnDisabled: {
    backgroundColor: '#ccc',
  },
});

export default BookingScreen;
