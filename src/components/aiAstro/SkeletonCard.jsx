import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { colors } from '../../assets/constants/colors';

const { width } = Dimensions.get('window');
const cardWidth = width / 3.5;

const SkeletonCard = ({ isDarkMode }) => (
  <View
    style={[
      styles.card,
      { backgroundColor: isDarkMode ? colors.darkBackground : '#f2f2f2' },
    ]}
  >
    <View
      style={[
        styles.imageContainer,
        { backgroundColor: isDarkMode ? colors.darkGray : '#e0e0e0' },
      ]}
    />
    <View style={{ padding: 8, width: '100%', alignItems: 'center' }}>
      <View style={styles.skeletonLine} />
      <View style={[styles.skeletonLine, { width: '60%', marginTop: 6 }]} />
      <View style={[styles.skeletonLine, { width: '50%', marginTop: 6 }]} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    overflow: 'hidden',
    height: 180,
  },
  imageContainer: {
    width: '100%',
    height: 110,
    position: 'relative',
    marginBottom: 2,
    backgroundColor: '#f5f5f5',
  },
  infoContainer: {
    alignItems: 'center',
    padding: 6,
  },

  skeletonLine: {
    height: 10,
    width: '80%',
    borderRadius: 5,
    backgroundColor: '#ddd',
  },
});

export default SkeletonCard;
