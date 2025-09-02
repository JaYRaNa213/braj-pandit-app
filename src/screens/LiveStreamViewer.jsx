import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  Image,
  Dimensions,
  FlatList,
  Animated,
  RefreshControl,
} from 'react-native';
import { createAgoraRtcEngine, RtcSurfaceView } from 'react-native-agora';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../assets/constants/colors';
import { initializeSocket } from '../utils/socketConfig';
import { baseURL } from '../utils/axiosInstance';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { filterActiveRecentStreams } from '../utils/streamFilters';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH / 3 - 10; // Adjusted width for 3 cards per row
const CARD_HEIGHT = 150; // Fixed height for cards
const BACKEND_URL = baseURL;

const LiveStreamCard = ({
  stream,
  isAutoPlaying,
  onJoinPress,
  remoteUsers,
}) => {
  const [viewerCount, setViewerCount] = useState({
    activeViewers: 0,
    totalViews: 0,
  });
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
      ]),
    ).start();

    // Get viewer count from API
    const fetchViewerCount = async () => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/streams/${stream.channelId || stream._id}/viewers`,
        );
        if (response.ok) {
          const data = await response.json();
          setViewerCount({
            activeViewers: data.activeViewers || 0,
            totalViews: data.totalViews || 0,
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
      style={styles.streamCard}
      onPress={() => onJoinPress(stream)}
      activeOpacity={0.7}
    >
      <View style={styles.streamPreview}>
        {isAutoPlaying && remoteUsers.length > 0 ? (
          // Show RTC view if autoplaying and has remote users
          <RtcSurfaceView
            style={styles.videoPreview}
            canvas={{
              uid: remoteUsers[0].uid,
              renderMode: 1, // VideoRenderMode.Fit
              mirrorMode: 0, // No mirror
            }}
          />
        ) : (
          // Show astrologer profile image
          <Image
            source={{
              uri:
                stream?.astrologerId?.profileImage ||
                stream?.astrologerId?.pic ||
                stream?.astrologerId?.image ||
                'https://via.placeholder.com/200',
            }}
            style={styles.videoPreview}
            resizeMode="cover"
          />
        )}

        {/* LIVE badge with pulsing animation */}
        <Animated.View
          style={[styles.liveBadge, { transform: [{ scale: pulseAnim }] }]}
        >
          <Text style={styles.liveBadgeText}>LIVE</Text>
        </Animated.View>

        {/* Viewer count */}
        <View style={styles.viewerBadge}>
          <Ionicons name="eye-outline" size={12} color="white" />
          <Text style={styles.viewerCount}>{viewerCount.activeViewers}</Text>
        </View>

        {/* Auto-playing indicator */}
        {isAutoPlaying && (
          <View style={styles.autoPlayBadge}>
            <Ionicons name="play-circle" size={12} color="white" />
            <Text style={styles.autoPlayText}>Playing</Text>
          </View>
        )}

        {/* Astrologer name with semi-transparent background */}
        <View style={styles.astrologerNameContainer}>
          <Text style={styles.astrologerName} numberOfLines={1}>
            {stream?.astrologerId?.name || 'Vedaz Astrologer'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Component for section headers similar to Swiper.jsx
const SectionHeader = ({
  title,
  count,
  onViewAll,
  isDarkMode,
  showViewAll = false,
}) => (
  <View style={styles.sectionHeader}>
    <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
      {title} {count > 0 && `(${count})`}
    </Text>
    {(showViewAll || count > 3) && (
      <TouchableOpacity onPress={onViewAll} style={styles.viewAllContainer}>
        <Text style={[styles.viewAllText,{color:isDarkMode ? colors.darkAccent : colors.purple}]}>See All</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.purple} />
      </TouchableOpacity>
    )}
  </View>
);

const LiveStreamViewer = ({ navigation, route }) => {
  const appId = '9b8eb3c1d1eb4e35abdb4c9268bd2d16';
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [autoPlayStream, setAutoPlayStream] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]); // Moved to parent component
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();

  // State for different stream categories
  const [astrologerTypes, setAstrologerTypes] = useState([]);
  const [streamsByType, setStreamsByType] = useState({});
  const [trendingStreams, setTrendingStreams] = useState([]);
  const [newAstrologerStreams, setNewAstrologerStreams] = useState([]);
  const [allStreams, setAllStreams] = useState([]);

  // Auto-rotation timer reference
  const autoPlayTimerRef = useRef(null);
  const streamJoinInProgressRef = useRef(false);
  const clientInitializedRef = useRef(false);

  useEffect(() => {
    // Initialize socket connection
    initializeSocket();

    initAgoraEngine();
    fetchAllStreamData();

    // Clean up on unmount
    return () => {
      cleanup();
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
      }
    };
  }, []);

  // Add listener for navigation focus to refresh streams
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Check if we need to refresh when returning from LivePlayer
      const shouldRefresh =
        route.params?.refresh ||
        (route.params?.params && route.params.params.refresh);

      // Check if a specific stream was passed in navigation params
      const streamData =
        route.params?.stream ||
        (route.params?.params && route.params.params.stream);

      if (streamData) {
        console.log('Stream data passed to LiveStreamViewer:', streamData);
        // Join the specific stream directly
        joinStream(streamData);
      } else if (shouldRefresh) {
        console.log('Refreshing streams after stream ended or navigation');
        fetchAllStreamData();

        // Clear the parameter to prevent multiple refreshes
        if (route.params?.refresh) {
          navigation.setParams({ refresh: undefined });
        } else if (route.params?.params?.refresh) {
          navigation.setParams({
            ...route.params,
            params: {
              ...route.params.params,
              refresh: undefined,
            },
          });
        }
      }
    });

    return unsubscribe;
  }, [navigation, route.params]);

  // Effect to handle auto-rotation of streams
  useEffect(() => {
    if (!allStreams.length || !client || !clientInitializedRef.current) return;

    // Start auto-rotation if not already rotating a stream
    if (!autoPlayStream) {
      console.log('Starting auto-play rotation');
      rotateAutoPlayStream();
    }

    return () => {
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
      }
    };
  }, [allStreams, client, clientInitializedRef.current]);

  // Effect to set up auto-playing stream
  useEffect(() => {
    if (!autoPlayStream || !client || !clientInitializedRef.current) return;

    const setupAutoPlayStream = async () => {
      try {
        console.log(
          `Setting up auto-play stream: ${
            autoPlayStream.title || autoPlayStream.channelId
          }`,
        );

        // Clear previous channel if any
        try {
          await client.leaveChannel();
          // Clear remote users when leaving channel
          setRemoteUsers([]);
        } catch (error) {
          console.log(
            'No active channel to leave or error leaving channel:',
            error,
          );
        }

        // Get token for new channel
        let streamToken;
        try {
          streamToken = await getToken(autoPlayStream.channelId);
          setToken(streamToken);
        } catch (error) {
          console.log('Token failed, trying without token');
          streamToken = null;
        }

        // Register event handlers only once per client initialization
        client.registerEventHandler({
          onError: (err, msg) => {
            console.log(`Agora Error ${err}: ${msg}`);
          },
          onJoinChannelSuccess: (connection, elapsed) => {
            console.log(
              '✅ Successfully joined preview channel:',
              connection.channelId,
            );
          },
          onUserJoined: (connection, uid, elapsed) => {
            console.log('🎥 Remote user joined preview with UID:', uid);
            setRemoteUsers((prevUsers) => {
              const filtered = prevUsers.filter((u) => u.uid !== uid);
              return [...filtered, { uid, connection }];
            });
          },
          onUserOffline: (connection, uid, reason) => {
            console.log('❌ Remote user offline from preview:', uid);
            setRemoteUsers((prevUsers) =>
              prevUsers.filter((u) => u.uid !== uid),
            );
          },
        });

        // Set up for preview
        await client.setChannelProfile(1); // Live Broadcasting
        await client.setClientRole(2); // Audience
        await client.enableVideo();
        await client.muteAllRemoteAudioStreams(true); // Mute audio for preview

        // Join channel
        const channelMediaOptions = {
          autoSubscribeAudio: false, // Don't auto-subscribe to audio
          autoSubscribeVideo: true,
          publishCameraTrack: false,
          publishMicrophoneTrack: false,
          clientRoleType: 2, // Audience
        };

        if (streamToken) {
          await client.joinChannel(
            streamToken,
            autoPlayStream.channelId,
            0,
            channelMediaOptions,
          );
        } else {
          await client.joinChannel(
            null,
            autoPlayStream.channelId,
            0,
            channelMediaOptions,
          );
        }

        console.log(
          `Auto-playing stream: ${
            autoPlayStream.title || autoPlayStream.channelId
          }`,
        );

        // Clear any existing timer first
        if (autoPlayTimerRef.current) {
          clearTimeout(autoPlayTimerRef.current);
        }

        // Set timer for next rotation - exactly 10 seconds
        autoPlayTimerRef.current = setTimeout(() => {
          console.log('10 seconds passed, rotating to next stream');
          rotateAutoPlayStream();
        }, 10000); // 10 seconds
      } catch (error) {
        console.error('Error setting up auto-play stream:', error);
        // If there's an error, try another stream after a delay
        if (autoPlayTimerRef.current) {
          clearTimeout(autoPlayTimerRef.current);
        }
        autoPlayTimerRef.current = setTimeout(() => {
          console.log('Error occurred, trying next stream');
          rotateAutoPlayStream();
        }, 3000);
      }
    };

    setupAutoPlayStream();

    return () => {
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
      }
    };
  }, [autoPlayStream]);

  const initAgoraEngine = async () => {
    try {
      console.log('Initializing Agora Engine...');
      const agoraEngine = createAgoraRtcEngine();

      await agoraEngine.initialize({
        appId: appId,
        logConfig: { level: 1 },
      });

      setClient(agoraEngine);
      clientInitializedRef.current = true;
      console.log('Agora engine initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Agora engine:', error);
    }
  };

  const rotateAutoPlayStream = () => {
    // Clear any existing timer
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current);
    }

    if (!allStreams.length) {
      console.log('No streams available for rotation');
      return;
    }

    // If we're in the process of joining a stream, don't rotate
    if (streamJoinInProgressRef.current) {
      console.log('Stream join in progress, skipping rotation');
      return;
    }

    // Choose a random stream that is different from the current one
    let nextStream;
    if (allStreams.length === 1) {
      nextStream = allStreams[0];
    } else {
      const currentId = autoPlayStream?._id || '';
      const availableStreams = allStreams.filter((s) => s._id !== currentId);

      if (availableStreams.length === 0) {
        // If filtering gave us no results, just use all streams
        console.log('No different streams available, reusing current stream');
        nextStream = allStreams[0];
      } else {
        const randomIndex = Math.floor(Math.random() * availableStreams.length);
        nextStream = availableStreams[randomIndex];
      }
    }

    console.log(
      `Rotating to stream: ${nextStream.title || nextStream.channelId}`,
    );
    setAutoPlayStream(nextStream);
  };

  const fetchAllStreamData = async () => {
    setLoading(true);

    try {
      // Fetch all data in parallel
      const [
        typesResponse,
        allStreamsResponse,
        trendingResponse,
        newAstrologersResponse,
      ] = await Promise.all([
        fetch(`${BACKEND_URL}/streams/types`),
        fetch(`${BACKEND_URL}/streams?isLive=true`),
        fetch(`${BACKEND_URL}/streams/trending`),
        fetch(`${BACKEND_URL}/streams/new-astrologers`),
      ]);

      // Parse responses
      const typesData = await typesResponse.json();
      const allStreamsData = await allStreamsResponse.json();
      const trendingData = await trendingResponse.json();
      const newAstrologersData = await newAstrologersResponse.json();

      // Update state
      setAstrologerTypes(typesData.types || []);

      // Filter streams by active status and 4-hour duration limit
      let activeStreams = filterActiveRecentStreams(
        allStreamsData.streams || [],
      );

      // Deduplicate: Only show the latest live stream per astrologer
      const uniqueStreamsMap = {};
      activeStreams.forEach((stream) => {
        const astroId = stream.astrologerId?._id || stream.astrologerId;
        if (
          !uniqueStreamsMap[astroId] ||
          new Date(stream.startedAt) >
            new Date(uniqueStreamsMap[astroId].startedAt)
        ) {
          uniqueStreamsMap[astroId] = stream;
        }
      });
      activeStreams = Object.values(uniqueStreamsMap);

      console.log(
        `Filtered streams: ${activeStreams.length} active streams within 4 hours`,
      );
      setAllStreams(activeStreams);

      // Apply 4-hour filter to trending and new astrologer streams as well
      const filteredTrendingStreams = filterActiveRecentStreams(
        trendingData.streams || [],
      );
      const filteredNewAstrologerStreams = filterActiveRecentStreams(
        newAstrologersData.streams || [],
      );

      setTrendingStreams(filteredTrendingStreams);
      setNewAstrologerStreams(filteredNewAstrologerStreams);

      // Fetch streams for each astrologer type
      const typeStreamsPromises =
        typesData.types?.map(async (typeInfo) => {
          if (!typeInfo.type) return null;

          const response = await fetch(
            `${BACKEND_URL}/streams/by-type/${typeInfo.type}`,
          );
          const data = await response.json();
          return { type: typeInfo.type, streams: data.streams || [] };
        }) || [];

      const typeStreamsResults = await Promise.all(typeStreamsPromises);

      // Create object with type as key and streams as value, applying 4-hour filter
      const streamsByTypeObj = {};
      typeStreamsResults.forEach((result) => {
        if (result && result.type) {
          // Apply 4-hour filter to each type's streams
          const filteredTypeStreams = filterActiveRecentStreams(result.streams);
          streamsByTypeObj[result.type] = filteredTypeStreams;
        }
      });

      setStreamsByType(streamsByTypeObj);

      // Clear auto-play state when refreshing streams
      setAutoPlayStream(null);
      setRemoteUsers([]);

      // If client is ready, we'll start auto-play in the useEffect
    } catch (error) {
      console.error('Error fetching stream data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getToken = async (channelId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/streams/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channelName: channelId,
          role: 'audience',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get token');
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error('Error getting token:', error);
      throw error;
    }
  };

  const joinStream = async (stream) => {
    if (!client) {
      alert('Streaming engine not ready. Please try again.');
      return;
    }

    streamJoinInProgressRef.current = true;
    setConnecting(true);

    try {
      // Check if stream is a full object or just an ID
      const streamObj =
        typeof stream === 'object'
          ? stream
          : allStreams.find((s) => s._id === stream || s.channelId === stream);

      if (!streamObj || !streamObj.channelId) {
        throw new Error('Invalid stream data');
      }

      console.log('Attempting to join stream:', streamObj.channelId);

      // Stop auto-play and leave any current channel
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
      }

      try {
        await client.leaveChannel();
        setRemoteUsers([]); // Clear remote users when leaving
      } catch (e) {
        console.log('No active channel to leave');
      }

      // Get token for this channel
      let streamToken;
      try {
        streamToken = await getToken(streamObj.channelId);
        console.log('Token received successfully');
      } catch (tokenError) {
        console.log('Token failed, trying without token...');
        streamToken = null;
      }

      // Update view count
      if (streamObj._id) {
        try {
          await fetch(`${BACKEND_URL}/streams/${streamObj._id}/view`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          console.log('View count updated');
        } catch (error) {
          console.error('Error updating view count:', error);
        }
      }

      // Log stream details for debugging
      console.log('=== STREAM DEBUG INFO ===');
      console.log('Stream channelId:', streamObj.channelId);
      console.log('Stream _id:', streamObj._id);
      console.log(
        'astrologerId value:',
        streamObj.astrologerId?._id || streamObj.astrologerId,
      );
      console.log(
        'astrologerId type:',
        typeof (streamObj.astrologerId?._id || streamObj.astrologerId),
      );
      console.log('Full astrologerId object:', streamObj.astrologerId);
      console.log('========================');

      // Navigate to LivePlayer with necessary params
      navigation.navigate('LivePlayer', {
        channelId: streamObj.channelId,
        token: streamToken,
        appId: appId,
        liveStream: allStreams,
        currentStreamId: streamObj._id || streamObj.channelId,
        astrologerId: streamObj.astrologerId?._id || streamObj.astrologerId,
      });
    } catch (error) {
      console.error('Error preparing to join stream:', error);
      alert('Failed to join stream. Please try again.');
    } finally {
      setConnecting(false);
      streamJoinInProgressRef.current = false;
    }
  };

  const cleanup = async () => {
    if (client) {
      try {
        await client.leaveChannel();
        client.release();
        setRemoteUsers([]);
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchAllStreamData();
  }, []);

  // Render a stream section with heading and horizontal list
  const renderStreamSection = (title, streams, count, showViewAll = false) => {
    if (!streams || streams.length === 0) return null;

    const handleViewAll = () => {
      if (title === 'New Astrologers Live') {
        navigation.navigate('AllNewAstrologersLive');
      }
    };

    return (
      <View style={styles.section}>
        <SectionHeader
          title={title}
          count={count || streams.length}
          isDarkMode={isDarkMode}
          showViewAll={showViewAll}
          onViewAll={handleViewAll}
        />
        <FlatList
          data={streams}
          renderItem={({ item }) => (
            <LiveStreamCard
              stream={item}
              isAutoPlaying={autoPlayStream && autoPlayStream._id === item._id}
              onJoinPress={joinStream}
              remoteUsers={
                autoPlayStream && autoPlayStream._id === item._id
                  ? remoteUsers
                  : []
              }
            />
          )}
          keyExtractor={(item) => `${item._id || ''}_${item.channelId || ''}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalListContent}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, isDarkMode && styles.darkContainer]}
      >
        <StatusBar backgroundColor={colors.purple} />
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={colors.purple} />
          <Text style={[styles.messageText, isDarkMode && styles.darkText]}>

{t('liveStream.loadingStreams')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!allStreams || allStreams.length === 0) {
    return (
      <SafeAreaView
        style={[styles.container, isDarkMode && styles.darkContainer]}
      >
        <StatusBar backgroundColor={colors.purple} />
        <View style={styles.centeredContainer}>
          <Ionicons name="videocam-off" size={50} color={colors.purple} />
          <Text style={[styles.messageText, isDarkMode && styles.darkText]}>
{t('liveStream.noActiveStreams')}
          </Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={fetchAllStreamData}
          >
            <Text style={styles.refreshButtonText}>{t('liveStream.refresh')}
</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, isDarkMode && styles.darkContainer]}
    >
      <StatusBar backgroundColor={colors.purple} />

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.purple]}
            tintColor={isDarkMode ? 'white' : colors.purple}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Auto-Playing Stream Information */}

        {/* Trending Section */}
        {/* {renderStreamSection('Trending Astrologers Live', trendingStreams)} */}

        {/* New Astrologers Section */}
        {renderStreamSection(
          'New Astrologers Live',
          newAstrologerStreams,
          newAstrologerStreams.length,
          true,
        )}

        {/* Type-based Sections */}
        {astrologerTypes.map((type) => (
          <View key={type.type}>
            {renderStreamSection(
              `${type.type} Astrologers Live`,
              streamsByType[type.type] || [],
            )}
          </View>
        ))}

        {/* All Streams Section if nothing else is shown */}
        {trendingStreams.length === 0 &&
          newAstrologerStreams.length === 0 &&
          astrologerTypes.length === 0 &&
          renderStreamSection('Live Now', allStreams)}
      </ScrollView>

      {/* Loading overlay for connecting to a stream */}
      {connecting && (
        <View style={styles.connectingOverlay}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.connectingText}>Connecting to stream...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:colors.lightBackground,
  },
  darkContainer: {
    backgroundColor: colors.darkBackground,
  },
  scrollContent: {
    padding: 10,
  },
  autoPlayInfo: {
    backgroundColor: colors.purple,
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  autoPlayText: {
    color: 'white',
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontWeight: '500',
    fontSize: 18,
    color: colors.purple,
    width: '70%',
  },
  viewAllContainer: {
    width: '30%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  viewAllText: {
    color: colors.purple,
  },
  darkText: {
    color: 'white',
  },
  horizontalListContent: {
    paddingHorizontal: 5,
    gap: 14,
  },
  streamCard: {
    width: 150,
    height: CARD_HEIGHT,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  streamPreview: {
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundColor: '#000',
  },
  videoPreview: {
    width: '100%',
    height: '100%',
  },
  liveBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
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
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  autoPlayBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: colors.purple,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  autoPlayText: {
    color: 'white',
    fontSize: 10,
    marginLeft: 2,
  },
  viewerCount: {
    color: 'white',
    fontSize: 10,
    marginLeft: 2,
  },
  astrologerNameContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  astrologerName: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
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
  connectingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
});

export default LiveStreamViewer;
