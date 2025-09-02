import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../assets/constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { SkeletonLoaderAstrologerCardSmall } from '../Loader';
import { createAgoraRtcEngine, RtcSurfaceView } from 'react-native-agora';
import { baseURL } from '../../utils/axiosInstance';
import {
  initializeSocket,
  joinStream,
  leaveStream,
  fetchViewerCount,
} from '../../utils/socketConfig';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH / 3 - 10; // Adjusted to match LiveStreamViewer
const CARD_HEIGHT = (SCREEN_HEIGHT - 90) / 4; // Adjusted to match LiveStreamViewer

const LiveStreamCard = ({ stream, onPress }) => {
  const [showLiveStream, setShowLiveStream] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewerCount, setViewerCount] = useState({
    activeViewers: 0,
    totalViews: 0,
  });
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [token, setToken] = useState(null);
  const [isMuted, setIsMuted] = useState(true); // Start muted by default
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  const appId = '9b8eb3c1d1eb4e35abdb4c9268bd2d16';
  const [client, setClient] = useState(null);

  // Animation for the "LIVE" badge
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Get token for channel
  const getToken = async (channelId) => {
    try {
      const response = await fetch(`${baseURL}/streams/token`, {
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
      console.log('Token request failed, trying without token');
      return null;
    }
  };

  // Initialize and join channel
  const initializeAndJoin = async () => {
    if (!client || !stream?.channelId) return;

    try {
      // Set channel profile and client role
      await client.setChannelProfile(1); // Live Broadcasting
      await client.setClientRole(2); // Audience
      await client.enableVideo();

      // Start with audio muted
      if (isMuted) {
        await client.muteAllRemoteAudioStreams(true);
      }

      // Register event handlers
      client.registerEventHandler({
        onError: (err, msg) => {
          console.log(`Agora Error ${err}: ${msg}`);
          setLoading(false);
        },

        onJoinChannelSuccess: (connection, elapsed) => {
          console.log(
            '✅ Successfully joined preview channel:',
            connection.channelId,
          );
          setLoading(false);
        },

        onUserJoined: (connection, uid, elapsed) => {
          console.log('🎥 Remote user joined preview with UID:', uid);
          setRemoteUsers((prevUsers) => {
            const filtered = prevUsers.filter((u) => u.uid !== uid);
            return [...filtered, { uid, connection }];
          });
        },

        onUserOffline: (connection, uid, reason) => {
          setRemoteUsers((prevUsers) => prevUsers.filter((u) => u.uid !== uid));
        },
      });

      // Get token if needed
      let streamToken = token;
      if (!streamToken) {
        streamToken = await getToken(stream.channelId);
        setToken(streamToken);
      }

      // Join the channel
      const channelMediaOptions = {
        autoSubscribeAudio: true,
        autoSubscribeVideo: true,
        publishCameraTrack: false,
        publishMicrophoneTrack: false,
        clientRoleType: 2, // Audience
      };

      if (streamToken) {
        await client.joinChannel(
          streamToken,
          stream.channelId,
          0,
          channelMediaOptions,
        );
      } else {
        await client.joinChannel(
          null,
          stream.channelId,
          0,
          channelMediaOptions,
        );
      }
    } catch (error) {
      console.error('Error initializing preview channel:', error);
      setLoading(false);
    }
  };

  // Toggle mute/unmute
  const toggleMute = async (e) => {
    e.stopPropagation(); // Prevent card click from triggering
    if (!client) return;

    try {
      const newMuteState = !isMuted;
      await client.muteAllRemoteAudioStreams(newMuteState);
      setIsMuted(newMuteState);
    } catch (error) {
      console.error('Error toggling mute state:', error);
    }
  };

  useEffect(() => {
    // Start pulsing animation
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

    // Initialize Agora engine
    const initAgoraEngine = async () => {
      try {
        const agoraEngine = createAgoraRtcEngine();
        await agoraEngine.initialize({
          appId: appId,
          logConfig: { level: 1 },
        });
        setClient(agoraEngine);
      } catch (error) {
        console.error('Failed to initialize Agora engine:', error);
      }
    };

    initAgoraEngine();

    // Set timer to switch to live stream after 1 second
    const timer = setTimeout(() => {
      setShowLiveStream(true);
    }, 1000);

    // Initialize socket
    initializeSocket();

    // Fetch viewer count
    const getViewerCount = async () => {
      if (stream?.channelId) {
        const count = await fetchViewerCount(stream.channelId);
        setViewerCount(count);
      }
    };

    getViewerCount();

    // Set interval to refresh viewer count
    const intervalId = setInterval(getViewerCount, 30000);

    return () => {
      clearTimeout(timer);
      clearInterval(intervalId);
      // Clean up
      if (client) {
        try {
          if (stream?.channelId) {
            client.leaveChannel();
            leaveStream(stream.channelId);
          }
          client.release();
        } catch (error) {
          console.error('Error during cleanup:', error);
        }
      }
    };
  }, []);

  // Join the stream when showLiveStream becomes true
  useEffect(() => {
    if (showLiveStream && client && stream?.channelId) {
      joinStream(stream.channelId);
      initializeAndJoin();
    }
  }, [showLiveStream, client, stream]);

  const handleJoinStream = () => {
    navigation.navigate('LiveStreamViewer', {
      refresh: true,
      stream: {
        channelId: stream.channelId,
        _id: stream._id,
        title: stream.title,
        astrologerId: stream.astrologerId,
      },
    });
  };

  return (
    <TouchableOpacity
      style={{
        width: CARD_WIDTH,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: isDarkMode ? '#333' : '#f5f5f5',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }}
      onPress={() => onPress(stream)}
      activeOpacity={0.7}
    >
      <View
        style={{ height: CARD_HEIGHT, width: CARD_WIDTH, position: 'relative' }}
      >
        {showLiveStream ? (
          loading ? (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#000',
              }}
            >
              <ActivityIndicator color={colors.purple} size="large" />
            </View>
          ) : (
            <View style={{ flex: 1, backgroundColor: '#000' }}>
              {remoteUsers.length > 0 ? (
                <>
                  <RtcSurfaceView
                    style={{ width: '100%', height: '100%' }}
                    canvas={{
                      uid: remoteUsers[0].uid,
                      renderMode: 1, // VideoRenderMode.Fit
                      mirrorMode: 0, // No mirror
                    }}
                  />
                  {/* Audio control button */}
                  <TouchableOpacity
                    onPress={toggleMute}
                    style={{
                      position: 'absolute',
                      bottom: 5,
                      left: 5,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons
                      name={isMuted ? 'volume-mute' : 'volume-high'}
                      size={16}
                      color="white"
                    />
                  </TouchableOpacity>
                </>
              ) : (
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>
                    LIVE
                  </Text>
                </View>
              )}
            </View>
          )
        ) : (
          <Image
            source={{
              uri:
                stream?.astrologerId?.profileImage ||
                stream?.astrologerId?.pic ||
                stream?.astrologerId?.image ||
                'https://via.placeholder.com/200',
            }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        )}

        {/* LIVE badge with pulsing animation */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 5,
            left: 5,
            backgroundColor: 'red',
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 4,
            transform: [{ scale: pulseAnim }],
          }}
        >
          <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
            LIVE
          </Text>
        </Animated.View>

        {/* Viewer count */}
        <View
          style={{
            position: 'absolute',
            bottom: 5,
            right: 5,
            backgroundColor: 'rgba(0,0,0,0.7)',
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 4,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Ionicons name="eye-outline" size={12} color="white" />
          <Text style={{ color: 'white', fontSize: 10, marginLeft: 2 }}>
            {viewerCount.activeViewers}
          </Text>
        </View>

        {/* Astrologer name with semi-transparent background */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            paddingVertical: 4,
            paddingHorizontal: 6,
          }}
        >
          <Text
            style={{
              color: 'white',
              fontSize: 12,
              fontWeight: 'bold',
              textAlign: 'center',
            }}
            numberOfLines={1}
          >
            {stream?.astrologerId?.name || 'Vedaz Astrologer'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const LiveStreamSwiper = ({ streams, heading, autoPlay = false }) => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const navigation = useNavigation();

  if (!streams || streams.length === 0) {
    return null;
  }

  const handleStreamPress = (stream) => {
    navigation.navigate('LiveStreamViewer', { stream });
  };

  return (
    <View style={{ marginHorizontal: 12, marginTop: 20, width: '100%' }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 16,
          flex: 1,
        }}
      >
        <Text
          style={{
            fontWeight: '500',
            fontSize: 18,
            width: '70%',
            color: isDarkMode ? 'white' : colors.purple,
          }}
        >
          {heading}
        </Text>
        {streams.length > 3 && (
          <TouchableOpacity
            style={{
              width: '30%',
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}
            onPress={() => navigation.navigate('LiveStreamViewer')}
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
        )}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 14 }}
      >
        {streams
          ? streams.map((stream) => (
              <LiveStreamCard
                stream={stream}
                key={`${stream._id || ''}_${stream.channelId || ''}`}
                onPress={handleStreamPress}
              />
            ))
          : Array.from({ length: 3 }).map((_, index) => (
              <SkeletonLoaderAstrologerCardSmall key={index} />
            ))}
      </ScrollView>
    </View>
  );
};

export default LiveStreamSwiper;
