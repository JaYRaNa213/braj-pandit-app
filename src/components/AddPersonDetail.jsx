import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../assets/constants/colors';
// MODIFIED: Import the Redux query hook for location search
import moment from 'moment';
import { useLazyGetLocationQuery } from '../redux/api/kundliApi';
import { Alert } from 'react-native';

const AddPersonDetailsModal = ({
  visible,
  onClose,
  onSubmit,
  initialData,
  onClear,
}) => {
  const [name, setName] = useState('');
  const [pob, setPob] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [tob, setTob] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // --- NEW: State and hooks for the place picker ---
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [suggestionPlaces, setSuggestionPlaces] = useState([]);
  const [showSuggestionPlaces, setShowSuggestionPlaces] = useState(false);
  const [getLocation] = useLazyGetLocationQuery();
  // --- END NEW ---

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDob(initialData.dob ? new Date(initialData.dob) : ''); // Convert string to Date
      setTob(initialData.tob ? new Date(`1970-01-01T${initialData.tob}`) : ''); // Create time Date
      setPob(initialData.pob || '');
      setGender(initialData.gender || '');
    } else {
      clearForm();
    }
  }, [initialData]);

  const clearForm = () => {
    setName('');
    setDob('');
    setTob('');
    setPob('');
    setGender('');
    setDate(new Date());
    setTime(new Date());
    setShowSuggestionPlaces(false); // NEW: Hide suggestions when clearing form
  };

  const handleClose = () => {
    onClear();
    onClose();
    setShowSuggestionPlaces(false); // NEW: Hide suggestions on close
  };

  const handleSubmit = async () => {
    if (name && dob && tob && pob && gender) {
      setIsLoading(true);
      const details = {
        name,
        gender,
        dob: moment(dob).format('YYYY-MM-DD'), //  Format date
        tob: moment(tob).format('HH:mm'), //  Format time
        pob,
      };
      await onSubmit(details, initialData?._id);
      handleClose();
      setIsLoading(false);
    } else {
      Alert.alert('Please fill in all fields.');
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
      setDob(selectedDate); // Store as date object for submission
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setTime(selectedTime);
      setTob(selectedTime); // Store as date object for submission
    }
  };

  // --- NEW: Helper functions for the place picker ---
  const handlePlaceSearch = (text) => {
    setPob(text);
    if (debounceTimer) clearTimeout(debounceTimer);
    if (text.length > 2) {
      const timer = setTimeout(() => performCitySearch(text), 500);
      setDebounceTimer(timer);
    } else {
      setShowSuggestionPlaces(false);
    }
  };

  const performCitySearch = async (city) => {
    try {
      const { data } = await getLocation(city);
      setSuggestionPlaces(data || []);
      setShowSuggestionPlaces(true);
    } catch (error) {
      console.error('Error fetching location:', error);
    }
  };

  const handlePlaceSelect = (place) => {
    setPob(place);
    setShowSuggestionPlaces(false);
  };
  // --- END NEW ---

  const isEditMode = !!initialData;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.centeredView} onPress={handleClose}>
        <View style={styles.modalView} onPress={() => {}}>
          <Text style={styles.modalTitle}>
            {isEditMode ? "Edit Person's Details" : "Add Person's Details"}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
          />

          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.pickerButtonText}>
              {dob
                ? new Date(dob).toLocaleDateString()
                : 'Select Date of Birth'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.pickerButtonText}>
              {tob
                ? new Date(tob).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Select Time of Birth'}
            </Text>
          </TouchableOpacity>

          <View style={{ width: '100%' }}>
            <TextInput
              style={styles.input}
              placeholder="Place of Birth (e.g., Delhi, India)"
              placeholderTextColor="#888"
              value={pob}
              onChangeText={handlePlaceSearch}
            />
            {showSuggestionPlaces && suggestionPlaces.length > 0 && (
              <View style={styles.suggestionsContainer}>
                <ScrollView nestedScrollEnabled={true}>
                  {suggestionPlaces.map((place, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionItem}
                      onPress={() => handlePlaceSelect(place)}
                    >
                      <Text style={styles.suggestionText}>{place}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* <Text style={styles.label}>Gender</Text> */}
          <View style={styles.genderContainer}>
            <TouchableOpacity
              onPress={() => setGender('male')}
              style={[
                styles.genderButton,
                gender === 'male' && styles.genderSelected,
              ]}
            >
              <Text
                style={[
                  styles.genderText,
                  gender === 'male' && styles.genderTextSelected,
                ]}
              >
                Male
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setGender('female')}
              style={[
                styles.genderButton,
                gender === 'female' && styles.genderSelected,
              ]}
            >
              <Text
                style={[
                  styles.genderText,
                  gender === 'female' && styles.genderTextSelected,
                ]}
              >
                Female
              </Text>
            </TouchableOpacity>
          </View>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}
          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display="default"
              onChange={onTimeChange}
            />
          )}
          <View style={styles.buttonContainer}>
            {/* Close button */}
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? 'Loading...' : `${isEditMode ? 'Update' : 'Add'}`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalView: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  pickerButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  pickerButtonText: { fontSize: 16, color: '#333' },

  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 20,
  },
  closeButton: {
    backgroundColor: colors.lightGray,
    borderRadius: 20,
    paddingVertical: 12,
    flex: 1,
  },
  closeButtonText: {
    color: '#333',
    fontSize: 14,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: colors.purple,
    borderRadius: 20,
    paddingVertical: 12,
    flex: 1,
  },
  submitButtonText: { color: 'white', fontSize: 14, textAlign: 'center' },

  suggestionsContainer: {
    position: 'absolute',
    top: 65, // Position it right below the input
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    maxHeight: 150, // Limit the height
    elevation: 3,
    zIndex: 1000,
  },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  suggestionText: {
    fontSize: 16,
  },

  genderContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-end',
    gap: 10,
  },
  genderButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  genderSelected: { backgroundColor: '#777' },
  genderText: { fontSize: 16, color: '#999' },
  genderTextSelected: { color: 'white', fontWeight: 'bold' },
});

export default AddPersonDetailsModal;
