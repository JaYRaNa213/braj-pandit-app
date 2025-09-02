import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';

import { useState, useLayoutEffect, useEffect, React } from 'react';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../assets/constants/colors';
import WithSafeArea from '../components/HOC/SafeAreaView';
import { useTheme } from '../context/ThemeContext';

const PalmReadingHistory = ({ route }) => {
  const { result = [] } = route.params;
  const navigation = useNavigation();
  const [readings, setReadings] = useState([]);
  const {isDarkMode}=useTheme();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Your Palm Reading History',
    });
  }, [navigation]);

  useEffect(() => {
    if (Array.isArray(result) && result !== readings) {
      setReadings(result);
    }
  }, []);

  const formatDateForDisplay = (dateString) => {
    if (!dateString) {
      return 'N/A';
    }
    try {
      const date = new Date(dateString);

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
      const year = date.getFullYear();

      return `${day}.${month}.${year}`;
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Invalid Date';
    }
  };

  const formatTimeForDisplay = (dateString) => {
    if (!dateString) {
      return 'N/A';
    }
    try {
      const date = new Date(dateString);

      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'pm' : 'am';

      hours = hours % 12;
      hours = hours ? hours : 12; // The hour '0' should be '12'
      hours = String(hours).padStart(2, '0'); // Pad for 12-hour format if needed

      return `${hours}:${minutes} ${ampm}`;
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Invalid Date';
    }
  };

  const navigateToReading = (index) => {
    const fortuneObj = JSON.parse(readings[index].fortune) || {};
    navigation.navigate('PalmReadingResult', { result: fortuneObj });
  };

  return (
    <ScrollView contentContainerStyle={[styles.container,{backgroundColor:isDarkMode? colors.darkBackground:colors.lightBackground}]}>
      {readings && readings.length > 0 ? (
        readings.map((reading, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.card,{
              backgroundColor:isDarkMode? colors.darkSurface:colors.lightBackground,
              borderColor: isDarkMode? colors.dark : colors.lightGray,
            borderWidth: isDarkMode ? 0.5 : 1
          }]}
            onPress={() => navigateToReading(index)} // Use TouchableOpacity for click
            activeOpacity={0.7} // Add a subtle press effect
          >
            <Image
              source={{ uri: reading.imageUrl || '' }} // Fallback image
              style={styles.cardThumbnail}
              resizeMode="cover" // Ensure image covers the area
            />
            <View style={styles.cardContent}>
              <Text style={[styles.cardDateText,{color:isDarkMode ? colors.darkTextSecondary:'#555'}]}>
                Date: {formatDateForDisplay(reading.createdAt)}
              </Text>
              <Text style={[styles.cardTimeText,{color:isDarkMode ? colors.darkTextSecondary:'#555'}]}>
                Time: {formatTimeForDisplay(reading.createdAt)}
              </Text>
              <View style={styles.buttonContainer}>
                <View style={styles.goToReadingButton}>
                  <Text style={styles.goToReadingButtonText}>
                    GO TO READING
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={[styles.noReadingsContainer,{backgroundColor:isDarkMode? colors.darkBackground:colors.lightBackground}]}>
          <Text style={styles.noReadingsText}>No readings available yet.</Text>
          <Text style={styles.noReadingsSubText}>
            Perform a reading to see your history here!
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, // Allows content to grow and be scrollable
    backgroundColor: colors.background, // Use a consistent background color
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  card: {
    height: 120, 
    width: '100%',
    backgroundColor: colors.gray100, 
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row', 
    alignItems: 'center', 
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4, 
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8, 
  },
  cardThumbnail: {
    height: 90, 
    width: 90, 
    borderRadius: 8, 
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardContent: {
    flex: 1, 
    justifyContent: 'space-between', 
    height: '100%'
  },
  cardDateText: {
    color: '#555',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    marginLeft: 5,
  },
  cardTimeText: {
    color: '#555',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8, 
    marginLeft: 5, 
  },
  buttonContainer: {
    alignItems: 'flex-start', 
  },
  goToReadingButton: {
    backgroundColor: colors.purple,
    borderRadius: 20, 
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignSelf: 'flex-start', 
  },
  goToReadingButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700', 
    textTransform: 'uppercase', 
    letterSpacing: 0.8,
  },
  noReadingsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: colors.background,
    marginTop: 50, 
  },
  noReadingsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.darkGray,
    marginBottom: 10,
    textAlign: 'center',
  },
  noReadingsSubText: {
    fontSize: 15,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default WithSafeArea(PalmReadingHistory);
