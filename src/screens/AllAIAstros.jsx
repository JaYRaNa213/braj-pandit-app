import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../assets/constants/colors';
import PersonaItem from '../components/aiAstro/PersonaItem';
import SkeletonCard from '../components/aiAstro/SkeletonCard';
import axiosInstance from '../utils/axiosInstance';
import { useTheme } from '../context/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';

const AllAIAstros = () => {
  const [aiAstros, setAiAstros] = useState([]);
  const [loading, setLoading] = useState(true); // only for astro list
  const [accessMap, setAccessMap] = useState({});
  const { isDarkMode } = useTheme();
  const { user } = useSelector((state) => state.user);
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchAstros = async () => {
      try {
        const { data } = await axiosInstance.get('/ai-astro?limit=30');
        setAiAstros(data?.astros || []);
      } catch (error) {
        console.log('Error fetching AI Astros:', error);
      } finally {
        setLoading(false); // ✅ stop loader once astros are fetched
      }
    };

    fetchAstros();
  }, []);
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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'All AI Astrologers',
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => (
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: 12,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            width: 36,
            height: 36,
            justifyContent: 'center',
            borderRadius: 72,
          }}
          onPress={() => navigation.navigate('AIAstroSessionsHistory')}
        >
          {/* show history icon */}
          <Ionicons
            name="list"
            size={20}
            color="white"
            style={{ marginTop: 2 }}
          />
        </TouchableOpacity>
      ),
    });
  }, [isDarkMode]);

  if (!loading && aiAstros.length === 0) {
    return (
      <LinearGradient
        colors={isDarkMode ? ['#1a1a1a', '#2c2c2c'] : ['#f7f7f7', '#ffffff']}
        style={styles.emptyContainer}
      >
        <Ionicons
          name="planet-outline"
          size={50}
          color={isDarkMode ? '#aaa' : '#999'}
        />
        <Text
          style={[styles.emptyText, { color: isDarkMode ? '#aaa' : '#666' }]}
        >
          No AI Astrologers available.
        </Text>
      </LinearGradient>
    );
  }

  const onRefresh = () => {
    setRefreshing(true);
    fetchAccess();
    setRefreshing(false);
  };

  return (
    <LinearGradient
      colors={
        isDarkMode
          ? [colors.dark, colors.darkBackground]
          : ['#faf5ff', '#ffffff']
      }
      style={styles.container}
    >
      <FlatList
        data={loading ? Array(12).fill({}) : aiAstros}
        numColumns={3}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDarkMode ? 'white' : colors.purple}
          />
        }
        keyExtractor={(item, index) => item._id || index.toString()}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) =>
          loading ? (
            <SkeletonCard isDarkMode={isDarkMode} />
          ) : (
            <PersonaItem item={item} hasAccess={accessMap[item._id]} />
          )
        }
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 8,
    paddingTop: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingBottom: 20,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
    justifyContent: 'space-around',
    marginBottom: 14,
    width: '100%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 10,
  },
});

export default AllAIAstros;
