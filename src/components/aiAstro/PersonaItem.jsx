import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { useChat } from '../../context/ChatContext';
import { colors } from '../../assets/constants/colors';

const { width } = Dimensions.get('window');
const cardWidth = width / 3.6;

const PersonaItem = ({ item, hasAccess }) => {
  const navigation = useNavigation();
  const { user } = useSelector((state) => state.user);
  const { isDarkMode } = useTheme();
  const { setAiChatSessionId, setSelectedAiAstro } = useChat();

  const handleAstroClick = (aiAstro) => {
    setAiChatSessionId(null);
    if (user) {
      setSelectedAiAstro(aiAstro);
      navigation.navigate('AIAstroChat', {});
    } else {
      navigation.navigate('MobileLogin');
    }
  };

  return (
    <TouchableOpacity
      onPress={() => handleAstroClick(item)}
      activeOpacity={0.85}
      style={[
        styles.card,
        { backgroundColor: isDarkMode ? colors.darkSurface : colors.white },
      ]}
    >
      <View
        style={[
          styles.imageContainer,
          isDarkMode && { backgroundColor: colors.darkSurface },
        ]}
      >
        <Image style={styles.image} source={{ uri: item.imageUrl }} />
        <LinearGradient
          colors={[
            'transparent',
            isDarkMode ? colors.darkSurface : colors.white,
          ]}
          style={styles.imageGradient}
        />
      </View>

      <View style={styles.infoContainer}>
        <Text style={[styles.name, isDarkMode && { color: colors.white }]}>
          {item.name}
        </Text>
        <Text
          style={[styles.personaLabel, isDarkMode && { color: colors.white }]}
        >
          {item.personaLabel}
        </Text>

        {/* Only show Active badge if user has access */}
        {hasAccess ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Active</Text>
          </View>
        ) : (
          <Text style={[styles.price, isDarkMode && { color: colors.white }]}>
            ₹{item.charges}/Day
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

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
  },
  imageContainer: {
    width: '100%',
    height: 110,
    position: 'relative',
    marginBottom: 2,
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    resizeMode: 'contain',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  infoContainer: {
    alignItems: 'center',
    padding: 6,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.purple || '#6B2A8C',
    marginBottom: 1,
    textAlign: 'center',
  },
  personaLabel: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 1,
  },
  price: {
    fontSize: 12,
    fontWeight: '500',
    color: 'green',
    textAlign: 'center',
    marginBottom: 4,
  },
  badge: {
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
});

export default PersonaItem;
