import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  FlatList,
  Image,
  Dimensions,
  Animated,
  RefreshControl,
  TextInput,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../assets/constants/colors';
import { baseURL } from '../utils/axiosInstance';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { filterActiveRecentStreams } from '../utils/streamFilters';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH / 2) - 20; // 2 cards per row with margins
const CARD_HEIGHT = 200;
const BACKEND_URL = baseURL;

const NewAstrologerCard = ({ stream, onJoinPress }) => {
  const [viewerCount, setViewerCount] = useState({ activeViewers: 0, totalViews: 0 });
  const { isDarkMode } = useTheme();
  
  // Animation for the "LIVE" badge
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start pulsing animation for LIVE badge
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    // Get viewer count from API
    const fetchViewerCount = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/streams/${stream.channelId || stream._id}/viewers`);
        if (response.ok) {
          const data = await response.json();
          setViewerCount({
            activeViewers: data.activeViewers || 0,
            totalViews: data.totalViews || 0
          });
        }
      } catch (error) {
        console.log('Error fetching viewer count:', error);
      }
    };
    
    fetchViewerCount();
    
    // Refresh viewer count every 30 seconds
    const interval = setInterval(fetchViewerCount, 30000);
    
    return () => {
      clearInterval(interval);
    };
  }, [stream]);

  return (
    <TouchableOpacity 
      style={[styles.streamCard, isDarkMode && styles.darkStreamCard]}
      onPress={() => onJoinPress(stream)}
      activeOpacity={0.7}
    >
      <View style={styles.streamPreview}>
        <Image
          source={{ 
            uri: stream?.astrologerId?.profileImage ||
                 stream?.astrologerId?.pic ||
                 stream?.astrologerId?.image ||
                 'https://via.placeholder.com/200'
          }}
          style={styles.videoPreview}
          resizeMode="cover"
        />
        
        {/* LIVE badge with pulsing animation */}
        <Animated.View style={[styles.liveBadge, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.liveBadgeText}>LIVE</Text>
        </Animated.View>
        
        {/* Viewer count */}
        <View style={styles.viewerBadge}>
          <Ionicons name="eye-outline" size={12} color="white" />
          <Text style={styles.viewerCount}>
            {viewerCount.activeViewers}
          </Text>
        </View>
      </View>
      
      {/* Astrologer info */}
      <View style={styles.cardInfo}>
        <Text 
          style={[styles.astrologerName, isDarkMode && styles.darkText]} 
          numberOfLines={1}
        >
          {stream?.astrologerId?.name || 'Vedaz Astrologer'}
        </Text>
        <Text 
          style={[styles.streamTitle, isDarkMode && styles.darkSubText]} 
          numberOfLines={2}
        >
          {stream?.title || 'Live Astrology Session'}
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="eye" size={12} color={colors.purple} />
            <Text style={[styles.statText, isDarkMode && styles.darkSubText]}>
              {viewerCount.totalViews}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="time" size={12} color={colors.purple} />
            <Text style={[styles.statText, isDarkMode && styles.darkSubText]}>
              {getStreamDuration(stream.startedAt)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Helper function to calculate stream duration
const getStreamDuration = (startedAt) => {
  if (!startedAt) return '0m';
  
  const now = new Date();
  const start = new Date(startedAt);
  const diffMs = now - start;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 60) {
    return `${diffMins}m`;
  } else {
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  }
};

const AllNewAstrologersLive = ({ navigation, route }) => {
  const [streams, setStreams] = useState([]);
  const [filteredStreams, setFilteredStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, viewers, duration
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    fetchNewAstrologerStreams();
  }, []);

  useEffect(() => {
    // Filter and sort streams based on search query and sort option
    let filtered = streams.filter(stream => {
      const astrologerName = stream?.astrologerId?.name?.toLowerCase() || '';
      const streamTitle = stream?.title?.toLowerCase() || '';
      const query = searchQuery.toLowerCase();
      
      return astrologerName.includes(query) || streamTitle.includes(query);
    });

    // Sort streams
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'viewers':
          return (b.activeViewers || 0) - (a.activeViewers || 0);
        case 'duration':
          const aDuration = a.startedAt ? new Date() - new Date(a.startedAt) : 0;
          const bDuration = b.startedAt ? new Date() - new Date(b.startedAt) : 0;
          return bDuration - aDuration;
        case 'newest':
        default:
          return new Date(b.startedAt || 0) - new Date(a.startedAt || 0);
      }
    });

    setFilteredStreams(filtered);
  }, [streams, searchQuery, sortBy]);

  const fetchNewAstrologerStreams = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/streams/new-astrologers`);
      const data = await response.json();
      
      // Filter streams by active status and 4-hour duration limit
      const activeStreams = filterActiveRecentStreams(data.streams || []);
      
      // Deduplicate: Only show the latest live stream per astrologer
      const uniqueStreamsMap = {};
      activeStreams.forEach(stream => {
        const astroId = stream.astrologerId?._id || stream.astrologerId;
        if (!uniqueStreamsMap[astroId] || new Date(stream.startedAt) > new Date(uniqueStreamsMap[astroId].startedAt)) {
          uniqueStreamsMap[astroId] = stream;
        }
      });
      
      const uniqueStreams = Object.values(uniqueStreamsMap);
      console.log(`Fetched ${uniqueStreams.length} new astrologer streams`);
      
      setStreams(uniqueStreams);
    } catch (error) {
      console.error('Error fetching new astrologer streams:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const joinStream = async (stream) => {
    try {
      console.log('Joining stream from AllNewAstrologersLive:', stream.channelId);
      
      // Navigate to LivePlayer with necessary params
      navigation.navigate('LivePlayer', {
        channelId: stream.channelId,
        token: null, // Will be fetched in LivePlayer
        appId: '9b8eb3c1d1eb4e35abdb4c9268bd2d16',
        liveStreams: streams,
        currentStreamId: stream._id || stream.channelId,
        astrologerId: stream.astrologerId?._id || stream.astrologerId
      });
    } catch (error) {
      console.error('Error joining stream:', error);
      alert('Failed to join stream. Please try again.');
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchNewAstrologerStreams();
  }, []);

  const renderSortButton = (value, label) => (
    <TouchableOpacity
      style={[
        styles.sortButton,
        sortBy === value && styles.activeSortButton,
        isDarkMode && styles.darkSortButton,
        sortBy === value && isDarkMode && styles.darkActiveSortButton
      ]}
      onPress={() => setSortBy(value)}
    >
      <Text style={[
        styles.sortButtonText,
        sortBy === value && styles.activeSortButtonText,
        isDarkMode && styles.darkText,
        sortBy === value && isDarkMode && styles.darkActiveSortButtonText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderStreamItem = ({ item, index }) => (
    <View style={[
      styles.cardContainer,
      index % 2 === 0 ? styles.leftCard : styles.rightCard
    ]}>
      <NewAstrologerCard 
        stream={item}
        onJoinPress={joinStream}
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
        <StatusBar backgroundColor={colors.purple} />
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? 'white' : '#333'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>
            New Astrologers Live
          </Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={colors.purple} />
          <Text style={[styles.messageText, isDarkMode && styles.darkText]}>Loading streams...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <StatusBar backgroundColor={colors.purple} />
      
      {/* Header */}
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? 'white' : '#333'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>
          New Astrologers Live
        </Text>
        {/* <TouchableOpacity 
          style={styles.leaveButton}
          onPress={() => navigation.navigate('Footer', { screen: 'Live Astrologer' })}
        >
          <Text style={styles.leaveButtonText}>Leave</Text>
        </TouchableOpacity> */}
      </View>

      {/* Search and Filter Section */}
     

      {/* Streams List */}
      {filteredStreams.length === 0 ? (
        <View style={styles.centeredContainer}>
          <Ionicons name="videocam-off" size={50} color={colors.purple} />
          <Text style={[styles.messageText, isDarkMode && styles.darkText]}>
            {searchQuery ? 'No streams match your search' : 'No new astrologer streams available'}
          </Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={fetchNewAstrologerStreams}
          >
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredStreams}
          renderItem={renderStreamItem}
          keyExtractor={item => `${item._id || ''}_${item.channelId || ''}`}
          numColumns={2}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.purple]}
              tintColor={isDarkMode ? 'white' : colors.purple}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  darkContainer: {
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  darkHeader: {
    backgroundColor: '#2a2a2a',
    borderBottomColor: '#444',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  leaveButton: {
    backgroundColor: colors.purple,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  leaveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  placeholder: {
    width: 40,
  },
  filterSection: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  darkFilterSection: {
    backgroundColor: '#2a2a2a',
    borderBottomColor: '#444',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginBottom: 10,
  },
  darkSearchContainer: {
    backgroundColor: '#3a3a3a',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  darkSearchInput: {
    color: 'white',
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  darkSortButton: {
    backgroundColor: '#3a3a3a',
  },
  activeSortButton: {
    backgroundColor: colors.purple,
  },
  darkActiveSortButton: {
    backgroundColor: colors.purple,
  },
  sortButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeSortButtonText: {
    color: 'white',
  },
  darkActiveSortButtonText: {
    color: 'white',
  },
  listContent: {
    padding: 10,
  },
  cardContainer: {
    width: '50%',
    paddingVertical: 5,
  },
  leftCard: {
    paddingRight: 5,
  },
  rightCard: {
    paddingLeft: 5,
  },
  streamCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  darkStreamCard: {
    backgroundColor: '#2a2a2a',
  },
  streamPreview: {
    width: '100%',
    height: 120,
    position: 'relative',
    backgroundColor: '#000',
  },
  videoPreview: {
    width: '100%',
    height: '100%',
  },
  liveBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'red',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  viewerBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewerCount: {
    color: 'white',
    fontSize: 10,
    marginLeft: 2,
  },
  cardInfo: {
    padding: 12,
  },
  astrologerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  streamTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    lineHeight: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  darkText: {
    color: 'white',
  },
  darkSubText: {
    color: '#ccc',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messageText: {
    marginTop: 10,
    color: '#666',
    textAlign: 'center',
    fontSize: 16,
  },
  refreshButton: {
    marginTop: 20,
    backgroundColor: colors.purple,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AllNewAstrologersLive;