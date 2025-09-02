import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../assets/constants/colors';
import { useChat } from '../context/ChatContext';
import { useTheme } from '../context/ThemeContext';
import axiosInstance from '../utils/axiosInstance';
import { t } from 'i18next';
import PersonaItem from './aiAstro/PersonaItem';
import SkeletonCard from './aiAstro/SkeletonCard';
import { useSelector } from 'react-redux';

const { width } = Dimensions.get('window');
const cardWidth = width / 3.5;
const cardMargin = 16;

const AIAstro = () => {
  const gradientColors = ['#F5EBFF', '#E8D4FA', '#DCC2F2', '#F9F0FF'];
  const darkGradientColors = ['#8F43C020', '#8F43C060', '#8F43C020'];
  const flatListRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const { refetch } = useChat();
  const [aiAstros, setAiAstros] = useState([]);
  const [accessMap, setAccessMap] = useState({});
  const [loading, setLoading] = useState(true);

  const { user } = useSelector((state) => state.user);

  const navigation = useNavigation();

  const fetchAiAstros = async () => {
    try {
      const { data } = await axiosInstance.get('/ai-astro');
      setAiAstros(data?.astros || []);
    } catch (error) {
      console.log('Error in fetching ai astros', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccess = async () => {
    if (!user || aiAstros.length === 0) return;
    const accessResults = {};
    for (let astro of aiAstros) {
      try {
        const res = await axiosInstance.get(
          `/ai-astro-access/check-access/${astro._id}`,
        );
        accessResults[astro._id] = res.data.hasAccess;
      } catch {
        accessResults[astro._id] = false;
      }
    }
    setAccessMap(accessResults);
  };
  // ✅ separate effect for access fetching (does not affect loader)
  useEffect(() => {
    fetchAccess();
  }, [aiAstros, user]);

  useEffect(() => {
    fetchAiAstros();
  }, [refetch]);

  const itemWidth = cardWidth + cardMargin;
  const totalWidth = itemWidth * aiAstros.length;

  const handleScroll = (e) => {
    const xOffset = e.nativeEvent.contentOffset.x;
    const containerWidth = e.nativeEvent.layoutMeasurement.width;

    setShowLeftArrow(xOffset > 10);
    setShowRightArrow(xOffset + containerWidth < totalWidth - 10);
  };

  const scrollBy = (direction) => {
    flatListRef.current?.scrollToOffset({
      offset: direction === 'right' ? itemWidth * (aiAstros.length - 1) : 0,
      animated: true,
    });
  };

  const { isDarkMode } = useTheme();
  const skeletonArray = Array(4).fill({ isSkeleton: true });
  return (
    <View style={styles.gradientWrapper}>
      <LinearGradient
        colors={isDarkMode ? darkGradientColors : gradientColors}
        style={styles.container}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginVertical: 16,
            flex: 1,
            marginHorizontal: 16,
          }}
        >
          <Text
            style={[
              styles.heading,
              { color: isDarkMode ? colors.white : colors.dark },
            ]}
          >
            {t('homePage.chatWithOurAIAstrologers')}
          </Text>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => navigation.navigate('AllAIAstros')}
          >
            <Text style={{ color: isDarkMode ? 'white' : 'black' }}>
              {t('extras.seeAll')}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDarkMode ? 'white' : 'black'}
            />
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={
            loading
              ? skeletonArray
              : [
                  ...aiAstros,
                  ...(aiAstros.length > 3 ? [{ isViewAll: true }] : []),
                ]
          }
          horizontal
          onScroll={handleScroll}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
          renderItem={({ item }) =>
            item.isViewAll ? (
              <TouchableOpacity
                style={[
                  styles.card,
                  {
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: isDarkMode ? '#2D2B3A' : '#F3E8FF', // soft purple background
                    borderWidth: 1,
                    borderColor: isDarkMode ? '#555' : '#D1C4E9',
                    borderStyle: 'dashed', // subtle dashed border to make it distinct
                  },
                ]}
                onPress={() => navigation.navigate('AllAIAstros')}
                activeOpacity={0.8}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    fontWeight: '700',
                    fontSize: 16,
                    color: isDarkMode ? colors.white : colors.purple,
                  }}
                >
                  View All
                </Text>
              </TouchableOpacity>
            ) : loading ? (
              <SkeletonCard isDarkMode={isDarkMode} />
            ) : (
              <PersonaItem item={item} hasAccess={accessMap[item._id]} />
            )
          }
          keyExtractor={(item, index) => item._id || index.toString()}
          snapToInterval={itemWidth}
          decelerationRate="fast"
          scrollEventThrottle={16}
        />

        {showRightArrow && !loading && (
          <TouchableOpacity
            onPress={() => scrollBy('right')}
            style={[styles.scrollHintArrow, { right: 8 }]}
          >
            <Ionicons name="chevron-forward" size={28} color="#888" />
          </TouchableOpacity>
        )}
        {showLeftArrow && !loading && (
          <TouchableOpacity
            onPress={() => scrollBy('left')}
            style={[styles.scrollHintArrow, { left: 8 }]}
          >
            <Ionicons name="chevron-back" size={28} color="#888" />
          </TouchableOpacity>
        )}
      </LinearGradient>

      {/* Top & Bottom Fades */}
      <LinearGradient
        colors={[isDarkMode ? '#8F43C010' : '#fff', 'transparent']}
        style={styles.topFade}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['transparent', isDarkMode ? '#8F43C010' : '#fff']}
        style={styles.bottomFade}
        pointerEvents="none"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  gradientWrapper: { position: 'relative' },
  scrollHintArrow: {
    position: 'absolute',
    top: '50%',
    zIndex: 20,
    backgroundColor: colors.purple100,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.7,
    borderRadius: 16,
    padding: 2,
  },
  container: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 0,
  },
  heading: {
    fontWeight: '500',
    fontSize: 18,
  },
  scrollContainer: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingBottom: 14,
    gap: 12,
  },
  card: {
    width: cardWidth,
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    marginRight: 16,
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
    resizeMode: 'cover',
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
  skeletonLine: {
    height: 10,
    width: '80%',
    borderRadius: 5,
    backgroundColor: '#ddd',
  },
  topFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 20,
    zIndex: 10,
  },
  bottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
    zIndex: 10,
  },
});

export default AIAstro;
