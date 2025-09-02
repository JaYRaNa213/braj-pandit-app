import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  RefreshControl,
  SafeAreaView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { createAgoraRtcEngine, RtcSurfaceView } from 'react-native-agora';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { colors } from '../assets/constants/colors';
import AstrologerListModal from '../components/AstrologerListModal';
import LiveComments from '../components/LiveComments';
import ShareModal from '../components/ShareModal';
import { baseURL } from '../utils/axiosInstance';
import {
  addCommentListener,
  addStreamEndListener,
  addViewerCountListener,
  sendComment as emitComment,
  joinStream as emitJoinStream,
  leaveStream as emitLeaveStream,
  fetchViewerCount,
  initializeSocket,
} from '../utils/socketConfig';
import GiftModal from './GiftModal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BACKEND_URL = baseURL;

// Create a single stream item component for vertical FlatList
const StreamItem = ({
  stream,
  isActive,
  client,
  token,
  appId,
  user,
  navigation,
  onStreamEnd,
  onActiveViewersChange,
  onTotalViewsChange,
}) => {
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [joinState, setJoinState] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeViewers, setActiveViewers] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [userData, setUserData] = useState(null);
  const [userToken, setUserToken] = useState(null);

  const commentsRef = useRef(null);
  const agoraClientRef = useRef(null);
  const streamIdRef = useRef(stream._id || stream.channelId);
  const channelId = stream.channelId;
  const astrologerId = stream.astrologerId?._id || stream.astrologerId;

  // Update parent component's active viewers count
  useEffect(() => {
    if (isActive && onActiveViewersChange) {
      onActiveViewersChange(activeViewers);
    }
    if (isActive && onTotalViewsChange) {
      onTotalViewsChange(totalViews);
    }
  }, [activeViewers, totalViews, isActive]);

  // Handle what happens when a stream becomes active or inactive
  useEffect(() => {
    if (isActive) {
      initializeStream();

      // Fetch viewer count for this channel
      if (channelId) {
        fetchViewerCount(channelId)
          .then((data) => {
            setActiveViewers(data.activeViewers);
            setTotalViews(data.totalViews);
          })
          .catch((error) => {
            console.error('Error fetching viewer count:', error);
            setActiveViewers(0);
            setTotalViews(0);
          });
      }

      // Add comment listener for this channel
      const removeCommentListener = addCommentListener((data) => {
        if (
          data.channelId === channelId &&
          commentsRef.current &&
          commentsRef.current.addComment
        ) {
          const isFromAstrologer = data.role === 'astrologer';

          commentsRef.current.addComment({
            id: data.id || `socket-comment-${Date.now()}`,
            userId: data.userId || 'guest',
            userName: data.userName || 'Guest User',
            message: data.message || '',
            timestamp: data.timestamp || new Date(),
            type: 'comment',
            role: data.role || 'user',
            isAstrologer: isFromAstrologer,
          });
        }
      });

      // Add viewer count listener for this channel
      const removeViewerCountListener = addViewerCountListener((data) => {
        if (data.channelId === channelId) {
          setActiveViewers(data.activeViewers || 0);
          setTotalViews(data.totalViews || 0);
        }
      });

      return () => {
        // Clean up listeners when not active
        removeCommentListener && removeCommentListener();
        removeViewerCountListener && removeViewerCountListener();

        // Don't destroy the client, just leave the channel
        if (agoraClientRef.current) {
          try {
            agoraClientRef.current.leaveChannel();
          } catch (err) {
            console.error('Error during channel leave:', err);
          }
          agoraClientRef.current.removeAllListeners();
        }

        // Notify socket that we're leaving this stream
        emitLeaveStream(channelId, user?._id || 'guest_user');
      };
    }
  }, [isActive]);

  // Load user data and setup initial state
  useEffect(() => {
    if (user) {
      setUserData(user);

      // Check if user is following this astrologer
      if (user.token && astrologerId && user._id) {
        setUserToken(user.token);
        checkFollowStatus(user._id, astrologerId, user.token);
      }
    } else {
      // Try to get user data from AsyncStorage
      AsyncStorage.getItem('userData')
        .then((data) => {
          if (data) {
            const storedUser = JSON.parse(data);
            setUserData(storedUser);

            if (storedUser.token && astrologerId && storedUser._id) {
              setUserToken(storedUser.token);
              checkFollowStatus(storedUser._id, astrologerId, storedUser.token);
            }
          }
        })
        .catch((err) => console.error('Error getting user data:', err));
    }
  }, [user, astrologerId]);

  // Function to check if user is following the astrologer
  const checkFollowStatus = (userId, astroId, token) => {
    if (user && user.following && Array.isArray(user.following)) {
      const isFollowing = user.following.some((id) => {
        if (typeof id === 'string') return id === astroId;
        if (id && id._id) return id._id === astroId;
        return false;
      });
      setIsFollowing(isFollowing);
    }
  };

  // Initialize Agora client for this stream
  const initializeStream = async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      // Always create a fresh Agora engine for each stream to avoid conflicts
      if (agoraClientRef.current) {
        try {
          console.log(`Leaving previous channel before joining ${channelId}`);
          agoraClientRef.current.leaveChannel();
          // Small delay to ensure clean disconnect
          await new Promise((resolve) => setTimeout(resolve, 200));
        } catch (err) {
          console.log('Previous channel leave error (ignored):', err);
        }
        agoraClientRef.current.removeAllListeners();
        // Don't release here, just clear the reference
        agoraClientRef.current = null;
      }

      const agoraEngine = createAgoraRtcEngine();
      await agoraEngine.initialize({
        appId: appId,
        logConfig: { level: 1 },
      });

      await agoraEngine.setChannelProfile(1); // Live Broadcasting
      await agoraEngine.setClientRole(2); // Audience
      await agoraEngine.enableVideo();

      // Register event handlers
      agoraEngine.registerEventHandler({
        onError: (err, msg) => {
          console.log(`Agora Error ${err}: ${msg}`);

          // Handle specific error codes
          if (err === 110) {
            // Connection timeout - retry with exponential backoff
            console.log('Connection timeout, will retry automatically');
            setTimeout(() => {
              if (agoraClientRef.current === agoraEngine) {
                initializeStream();
              }
            }, 2000);
          } else {
            setErrorMsg(`Connection error: ${msg || 'Failed to connect'}`);
            setLoading(false);
          }
        },

        onJoinChannelSuccess: (connection, elapsed) => {
          console.log(`Successfully joined channel: ${connection.channelId}`);
          setJoinState(true);
          setErrorMsg('');
          setLoading(false);

          // Notify socket that we've joined the stream
          emitJoinStream(
            channelId,
            user?._id || 'guest_user',
            user?.name || 'Guest',
          );
        },

        onUserJoined: (connection, uid, elapsed) => {
          console.log('Remote user joined with UID:', uid);
          setRemoteUsers((prevUsers) => {
            const filtered = prevUsers.filter((u) => u.uid !== uid);
            return [...filtered, { uid, connection }];
          });
        },

        onUserOffline: (connection, uid, reason) => {
          console.log('Remote user offline:', uid, 'Reason:', reason);
          setRemoteUsers((prevUsers) => {
            const updated = prevUsers.filter((u) => u.uid !== uid);

            // If all users have left, this stream has ended
            if (updated.length === 0 && prevUsers.length > 0) {
              console.log('All broadcasters left');
              if (onStreamEnd) {
                setTimeout(() => onStreamEnd(channelId), 500);
              }
            }

            return updated;
          });
        },
      });

      agoraClientRef.current = agoraEngine;

      // Join the channel
      const channelMediaOptions = {
        autoSubscribeAudio: true,
        autoSubscribeVideo: true,
        publishCameraTrack: false,
        publishMicrophoneTrack: false,
        clientRoleType: 2, // Audience
      };

      // Get token for this channel if needed
      let streamToken = token;

      if (!streamToken) {
        try {
          const response = await fetch(`${BACKEND_URL}/streams/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ channelName: channelId, role: 'audience' }),
          });

          if (response.ok) {
            const data = await response.json();
            streamToken = data.token;
          }
        } catch (error) {
          console.log('Token fetch failed, joining without token');
        }
      }

      // Join the channel with or without token
      if (streamToken) {
        await agoraClientRef.current.joinChannel(
          streamToken,
          channelId,
          0,
          channelMediaOptions,
        );
      } else {
        await agoraClientRef.current.joinChannel(
          null,
          channelId,
          0,
          channelMediaOptions,
        );
      }
    } catch (error) {
      console.error('Error initializing stream:', error);
      setErrorMsg(`Failed to join stream: ${error.message}`);
      setLoading(false);
    }
  };

  // Function to generate unique IDs
  const generateUniqueId = (prefix = '') => {
    return `${prefix}-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 15)}`;
  };

  // Handle sending comments
  const handleSendComment = (message) => {
    if (!message?.trim() || !channelId) return;

    const userId = user?._id || 'guest_user';
    const userName = user?.name || 'Guest';

    // Create a unique ID for this comment
    const localId = generateUniqueId('user-comment');

    // Add comment to local state immediately for fast UI update
    if (commentsRef.current && commentsRef.current.addComment) {
      commentsRef.current.addComment({
        id: localId,
        userId: userId,
        userName: userName,
        message: message.trim(),
        timestamp: new Date(),
        type: 'comment',
        role: 'user',
        isLocalOnly: true,
      });
    }

    // Emit comment via socket
    emitComment(channelId, message.trim(), userId, userName);
  };

  // Handle sending gifts
  const handleSendGift = (gift) => {
    if (gift && gift.response && gift.response.success) {
      Toast.show({
        type: 'success',
        text1: 'Gift Sent!',
        text2: `You sent ${gift.name} worth ${gift.price} diamonds`,
        position: 'top',
        visibilityTime: 3000,
      });

      if (commentsRef.current && commentsRef.current.addComment) {
        commentsRef.current.addComment({
          id: generateUniqueId('gift-sent'),
          userId: user?._id || 'guest_user',
          userName: user?.name || 'Guest',
          message: `Sent a ${gift.name} gift`,
          timestamp: new Date(),
          type: 'gift',
          role: 'user',
          giftData: {
            name: gift.name,
            price: gift.price,
            icon: gift.icon || gift.image,
          },
        });
      }
    }
  };

  // Handle sharing the stream
  const handleShare = async () => {
    try {
      const astrologerName = stream.astrologerId?.name || 'an astrologer';

      const result = await Share.share({
        message: `I'm watching ${astrologerName}'s live stream on Vedaz! Join me now!\n\nhttps://vedaz.io/livestream/${streamIdRef.current}`,
        url: `https://vedaz.io/livestream/${streamIdRef.current}`,
        title: 'Vedaz Live Stream',
      });
    } catch (error) {
      console.error('Error sharing stream:', error);
      Alert.alert('Error', 'Failed to share stream');
    }
  };

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    console.log('\n🔥 ===== LIVE PLAYER FOLLOW CLICKED =====');
    console.log('📱 Component: LivePlayer');
    console.log('👤 User from Redux:', user ? 'Available' : 'Not Available');
    console.log(
      '👤 User Data State:',
      userData ? 'Available' : 'Not Available',
    );
    console.log('🆔 User ID:', user?._id || userData?._id);
    console.log('🔮 Astrologer ID:', astrologerId);
    console.log('❤️ Current Follow State:', isFollowing);
    console.log('🔑 User Token:', user?.token ? 'Available' : 'Not Available');
    console.log(
      '🔑 User Token State:',
      userToken ? 'Available' : 'Not Available',
    );

    if (!astrologerId || !user || !user._id) {
      console.log('❌ Authentication check failed');
      console.log('- Astrologer ID:', !!astrologerId);
      console.log('- User exists:', !!user);
      console.log('- User ID exists:', !!user?._id);

      Toast.show({
        type: 'info',
        text1: 'Action Not Available',
        text2: 'Please login to follow astrologers',
        position: 'top',
        visibilityTime: 2000,
      });
      return;
    }

    try {
      console.log('\n🔑 ===== TOKEN SEARCH IN LIVE PLAYER =====');

      // Always try AsyncStorage first since that's where token is actually stored
      let authToken = null;
      try {
        authToken = await AsyncStorage.getItem('token');
        if (authToken) {
          console.log('✅ Found token in AsyncStorage');
          console.log('🔑 Token preview:', authToken.substring(0, 20) + '...');
        } else {
          console.log('❌ No token in AsyncStorage');
        }
      } catch (error) {
        console.error('💥 Error accessing AsyncStorage:', error);
      }

      // Fallback to userToken or user.token if AsyncStorage fails
      if (!authToken) {
        authToken = userToken || user.token;
        console.log(
          '🔍 Fallback token from state:',
          authToken ? 'Found' : 'Not Found',
        );
        if (authToken) {
          console.log(
            '🔑 Fallback token preview:',
            authToken.substring(0, 20) + '...',
          );
        }
      }

      if (!authToken) {
        console.log('💥 ===== NO TOKEN FOUND IN LIVE PLAYER =====');
        Toast.show({
          type: 'error',
          text1: 'Authentication Error',
          text2: 'Please login again to continue',
          position: 'top',
          visibilityTime: 3000,
        });
        return;
      }

      const newFollowStatus = !isFollowing;

      // Update UI immediately
      setIsFollowing(newFollowStatus);

      // Make API call
      const endpoint = isFollowing ? '/user/unfollow' : '/user/follow';

      console.log('\n📡 ===== LIVE PLAYER API CALL =====');
      console.log('Using endpoint:', endpoint);
      console.log('User ID:', user._id);
      console.log('Astrologer ID:', astrologerId);
      console.log('Token available:', !!authToken);
      console.log('==================================');

      fetch(`${baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          astroId: astrologerId,
          userId: user._id, // Temporarily adding userId until backend is updated
        }),
      })
        .then((response) => {
          console.log('\n📡 ===== LIVE PLAYER RESPONSE =====');
          console.log('Status:', response.status);
          console.log('URL:', response.url);

          return response.text().then((text) => {
            console.log('Raw response:', text);

            let jsonData;
            try {
              jsonData = JSON.parse(text);
              console.log('Parsed result:', jsonData);
            } catch (e) {
              console.error('Error parsing response:', e);
              jsonData = { success: false, message: 'Invalid JSON response' };
            }

            if (!response.ok) {
              console.log('❌ Response not OK, checking error cases...');

              if (
                jsonData.message &&
                jsonData.message.includes('already following') &&
                !isFollowing
              ) {
                console.log('✅ Already following case detected, updating UI');
                setIsFollowing(true);
                return { success: true, message: 'Already following' };
              } else if (
                jsonData.message &&
                jsonData.message.includes('not following') &&
                isFollowing
              ) {
                console.log('✅ Not following case detected, updating UI');
                setIsFollowing(false);
                return { success: true, message: 'Not following' };
              } else {
                console.log('❌ Other error case, reverting UI state');
                setIsFollowing(!newFollowStatus);
                throw new Error(
                  `Failed to update follow status: ${
                    jsonData.message || response.status
                  }`,
                );
              }
            }

            console.log('✅ Success response received');
            return jsonData;
          });
        })
        .then((data) => {
          console.log('✅ Follow action completed successfully');
          Toast.show({
            type: 'success',
            text1: newFollowStatus ? 'Following' : 'Unfollowed',
            position: 'top',
            visibilityTime: 2000,
          });
        })
        .catch((error) => {
          console.error('❌ Follow action failed:', error);
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Could not update follow status',
            position: 'top',
            visibilityTime: 2000,
          });
        });
    } catch (error) {
      console.error('❌ Unexpected error in handleFollowToggle:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'An unexpected error occurred',
        position: 'top',
        visibilityTime: 2000,
      });
    }
  };

  return (
    <View style={styles.streamItemContainer}>
      {/* Video Player */}
      <View style={styles.videoSection}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.purple} />
            <Text style={styles.loadingText}>Connecting to stream...</Text>
          </View>
        ) : remoteUsers.length > 0 ? (
          <>
            {remoteUsers.map((user) => (
              <View key={user.uid} style={styles.videoWrapper}>
                <RtcSurfaceView
                  style={styles.video}
                  canvas={{
                    uid: user.uid,
                    renderMode: 1, // VideoRenderMode.Fit
                    mirrorMode: 0, // No mirror
                  }}
                />
              </View>
            ))}
          </>
        ) : joinState ? (
          <View style={styles.waitingContainer}>
            <ActivityIndicator size="large" color={colors.purple} />
            <Text style={styles.waitingText}>Waiting for broadcaster...</Text>
          </View>
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {errorMsg || 'Failed to join stream'}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={initializeStream}
            >
              <Text style={styles.buttonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Viewer count badges */}
      {/* <View style={styles.viewerCountBadge}>
        <Ionicons name="eye" size={16} color="white" />
        <Text style={styles.viewerCountText}>{activeViewers}</Text>
      </View>
      
      <View style={styles.totalViewsBadge}>
        <Ionicons name="bar-chart" size={14} color="white" />
        <Text style={styles.totalViewsText}>{totalViews}</Text>
      </View> */}

      {/* Astrologer info badge */}
      <View style={styles.astrologerBadge}>
        <Text style={styles.astrologerName}>
          {stream.astrologerId?.name || 'Astrologer'}
        </Text>
        <Text style={styles.streamTitle}>{stream.title || 'Live Session'}</Text>
      </View>

      {/* Action buttons */}
      <View style={styles.floatingButtonsContainer}>
        <View style={styles.buttonWithLabel}>
          <TouchableOpacity
            style={styles.circleButton}
            onPress={handleFollowToggle}
          >
            <Ionicons
              name={isFollowing ? 'heart' : 'heart-outline'}
              size={24}
              color="white"
            />
          </TouchableOpacity>
          <Text style={styles.buttonLabel}>Follow</Text>
        </View>

        <View style={styles.buttonWithLabel}>
          <TouchableOpacity
            style={styles.circleButton}
            onPress={() => setShowGiftModal(true)}
          >
            <Ionicons name="gift" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.buttonLabel}>Gift</Text>
        </View>

        <View style={styles.buttonWithLabel}>
          <TouchableOpacity
            style={styles.circleButton}
            onPress={() => setShowShareModal(true)}
          >
            <Ionicons name="share-social" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.buttonLabel}>Share</Text>
        </View>
      </View>

      {/* Live comments */}
      {joinState && (
        <View style={styles.commentsContainer}>
          <LiveComments
            channelId={channelId}
            user={userData}
            sendComment={handleSendComment}
            ref={commentsRef}
          />
        </View>
      )}

      {/* Modals */}
      <GiftModal
        visible={showGiftModal}
        onClose={() => setShowGiftModal(false)}
        onSendGift={handleSendGift}
        streamId={streamIdRef.current}
        channelId={channelId}
      />

      <ShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        streamId={streamIdRef.current}
        astrologerName={stream.astrologerId?.name || 'an astrologer'}
      />
    </View>
  );
};

const LivePlayer = ({ route, navigation }) => {
  // Get the parameters from navigation
  const {
    channelId,
    token,
    appId,
    liveStreams = [],
    currentStreamId,
    astrologerId,
  } = route.params;

  // Get user from Redux
  const { user } = useSelector((state) => state.user);

  // Component state
  const [streams, setStreams] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [client, setClient] = useState(null);
  const [activeViewers, setActiveViewers] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isLoadingNewStream, setIsLoadingNewStream] = useState(false);
  const [showAstrologerModal, setShowAstrologerModal] = useState(false);

  // References
  const flatListRef = useRef(null);

  // Process the streams data
  useEffect(() => {
    if (liveStreams && liveStreams.length > 0) {
      // Only show streams that are live, not ended, and started within last 4 hours
      const currentTime = new Date();
      const fourHoursAgo = new Date(currentTime.getTime() - 4 * 60 * 60 * 1000);
      const filteredStreams = liveStreams.filter((stream) => {
        const isLive = stream.isLive === true;
        const isNotEnded =
          !stream.endedAt || new Date(stream.endedAt) > currentTime;
        const startedWithinFourHours =
          !stream.startedAt || new Date(stream.startedAt) > fourHoursAgo;
        return isLive && isNotEnded && startedWithinFourHours;
      });
      // Find the index of the current stream
      const initialIndex = filteredStreams.findIndex(
        (stream) => (stream._id || stream.channelId) === currentStreamId,
      );
      // Set the streams and currentIndex
      setStreams(filteredStreams);
      setCurrentIndex(initialIndex >= 0 ? initialIndex : 0);
      setLoading(false);
    } else {
      // No streams available, fetch them from API
      fetch(`${BACKEND_URL}/streams?isLive=true`)
        .then((response) => response.json())
        .then((data) => {
          if (data.streams && data.streams.length > 0) {
            // Only show streams that are live, not ended, and started within last 4 hours
            const currentTime = new Date();
            const fourHoursAgo = new Date(
              currentTime.getTime() - 4 * 60 * 60 * 1000,
            );
            const filteredStreams = data.streams.filter((stream) => {
              const isLive = stream.isLive === true;
              const isNotEnded =
                !stream.endedAt || new Date(stream.endedAt) > currentTime;
              const startedWithinFourHours =
                !stream.startedAt || new Date(stream.startedAt) > fourHoursAgo;
              return isLive && isNotEnded && startedWithinFourHours;
            });
            // Find the index if we have a currentStreamId
            const initialIndex = currentStreamId
              ? filteredStreams.findIndex(
                  (stream) =>
                    (stream._id || stream.channelId) === currentStreamId,
                )
              : 0;
            setStreams(filteredStreams);
            setCurrentIndex(initialIndex >= 0 ? initialIndex : 0);
          } else {
            console.error('No live streams available');
            // Navigate back after showing alert
            Alert.alert(
              'No Live Streams',
              'There are no live streams available at this time.',
              [{ text: 'OK', onPress: () => navigation.goBack() }],
            );
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching streams:', error);
          setLoading(false);

          // Navigate back after showing alert
          Alert.alert(
            'Error',
            'Failed to load live streams. Please try again later.',
            [{ text: 'OK', onPress: () => navigation.goBack() }],
          );
        });
    }

    // Initialize socket connection
    const socketInstance = initializeSocket();

    // Add stream end listener for all streams
    const removeStreamEndListener = addStreamEndListener((data) => {
      // Check if this is for any of our streams
      setStreams((prevStreams) => {
        const updatedStreams = prevStreams.filter(
          (stream) => stream.channelId !== data.channelId,
        );

        // If we removed the current stream, show toast
        if (updatedStreams.length !== prevStreams.length) {
          Toast.show({
            type: 'info',
            text1: 'Live Stream Ended',
            text2: 'The astrologer has ended the live stream',
            position: 'top',
            visibilityTime: 3000,
          });

          // If no more streams, go back
          if (updatedStreams.length === 0) {
            navigation.navigate('Footer', {
              screen: 'Live Astrologer',
              params: { refresh: true },
            });
          }
        }

        return updatedStreams;
      });
    });

    // Create client once
    const initAgoraClient = async () => {
      const agoraEngine = createAgoraRtcEngine();
      await agoraEngine.initialize({
        appId: appId,
        logConfig: { level: 1 },
      });
      setClient(agoraEngine);
    };

    initAgoraClient().catch((err) =>
      console.error('Error initializing Agora client:', err),
    );

    return () => {
      // Clean up
      removeStreamEndListener && removeStreamEndListener();

      // Release client
      if (client) {
        client.release();
      }
    };
  }, []);

  // Handle when a stream ends
  const handleStreamEnd = (channelId) => {
    setStreams((prevStreams) => {
      const updatedStreams = prevStreams.filter(
        (stream) => stream.channelId !== channelId,
      );

      // Show toast notification
      Toast.show({
        type: 'info',
        text1: 'Live Stream Ended',
        text2: 'The astrologer has ended the live stream',
        position: 'top',
        visibilityTime: 3000,
      });

      // If no more streams, go back
      if (updatedStreams.length === 0) {
        navigation.navigate('Footer', {
          screen: 'Live Astrologer',
          params: { refresh: true },
        });
      }

      return updatedStreams;
    });
  };

  // Render each stream item
  const renderItem = ({ item, index }) => {
    return (
      <StreamItem
        stream={item}
        isActive={index === currentIndex}
        client={client}
        token={token}
        appId={appId}
        user={user}
        navigation={navigation}
        onStreamEnd={handleStreamEnd}
        onActiveViewersChange={setActiveViewers}
        onTotalViewsChange={setTotalViews}
      />
    );
  };

  // Handle when the scroll ends to update current index
  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }) => {
      if (viewableItems && viewableItems.length > 0) {
        // Get the item that is most visible (50% or more)
        const mostVisibleItem = viewableItems.find(
          (item) => item.isViewable && item.index !== null,
        );

        if (mostVisibleItem) {
          const newIndex = mostVisibleItem.index;
          // Only update if the index actually changed to prevent unnecessary re-renders
          if (
            newIndex !== currentIndex &&
            newIndex !== null &&
            newIndex !== undefined
          ) {
            console.log(
              `Auto-switching to stream index: ${newIndex} (50% visible)`,
            );
            setCurrentIndex(newIndex);
          }
        }
      }
    },
    [currentIndex],
  );

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 200, // Wait 200ms before considering item as viewable
    waitForInteraction: false, // Don't wait for user interaction
  };

  // Function to fetch new live streams
  const fetchNewLiveStreams = async () => {
    try {
      setIsLoadingNewStream(true);

      // Get current stream IDs to exclude them from new results
      const currentStreamIds = streams.map(
        (stream) => stream._id || stream.channelId,
      );

      const response = await fetch(
        `${BACKEND_URL}/streams?isLive=true&limit=5`,
      );
      const data = await response.json();

      if (data.streams && data.streams.length > 0) {
        // Only show streams that are live, not ended, and started within last 4 hours
        const currentTime = new Date();
        const fourHoursAgo = new Date(
          currentTime.getTime() - 4 * 60 * 60 * 1000,
        );
        const filteredStreams = data.streams.filter((stream) => {
          const isLive = stream.isLive === true;
          const isNotEnded =
            !stream.endedAt || new Date(stream.endedAt) > currentTime;
          const startedWithinFourHours =
            !stream.startedAt || new Date(stream.startedAt) > fourHoursAgo;
          return isLive && isNotEnded && startedWithinFourHours;
        });
        // Filter out streams that are already in our current list
        const newStreams = filteredStreams.filter(
          (stream) =>
            !currentStreamIds.includes(stream._id || stream.channelId),
        );

        if (newStreams.length > 0) {
          // Batch state updates to prevent multiple re-renders
          const newIndex = newStreams.length;

          // Update streams and index in a single operation
          setStreams((prevStreams) => {
            const updatedStreams = [...newStreams, ...prevStreams];
            // Update current index synchronously
            setCurrentIndex(newIndex);
            return updatedStreams;
          });

          // Show toast notification
          Toast.show({
            type: 'success',
            text1: 'New Live Streams!',
            text2: `Found ${newStreams.length} new live stream${
              newStreams.length > 1 ? 's' : ''
            }`,
            position: 'top',
            visibilityTime: 2000,
          });

          // Don't automatically scroll to top when new streams are added
          // Let the user stay on their current stream
        } else {
          // No new streams found
          Toast.show({
            type: 'info',
            text1: 'No New Streams',
            text2: 'No new live streams available at the moment',
            position: 'top',
            visibilityTime: 2000,
          });
        }
      } else {
        Toast.show({
          type: 'info',
          text1: 'No New Streams',
          text2: 'No new live streams available at the moment',
          position: 'top',
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      console.error('Error fetching new streams:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch new streams',
        position: 'top',
        visibilityTime: 2000,
      });
    } finally {
      setIsLoadingNewStream(false);
    }
  };

  // Handle leaving the streams
  const confirmLeave = () => {
    setShowAstrologerModal(true);
  };

  // Handle astrologer selection from modal
  const handleAstrologerSelect = (streamData) => {
    // Navigate to the selected astrologer's stream
    navigation.replace('LivePlayer', {
      channelId: streamData.channelId,
      token: token,
      appId: appId,
      liveStreams: streams,
      currentStreamId: streamData._id || streamData.channelId,
      astrologerId: streamData.astrologerId?._id || streamData.astrologerId,
    });
  };

  // Handle leave action
  const handleLeaveStream = () => {
    setShowAstrologerModal(false);
    navigation.navigate('LiveStreamViewer');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="black" barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.purple} />
          <Text style={styles.loadingText}>Loading live streams...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="black" barStyle="light-content" />

        {/* Exit button (absolute positioned) */}
        <TouchableOpacity style={styles.exitButton} onPress={confirmLeave}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>

        {/* Loading indicator for new streams */}
        {isLoadingNewStream && (
          <View style={styles.newStreamLoadingContainer}>
            <ActivityIndicator size="small" color={colors.purple} />
            <Text style={styles.newStreamLoadingText}>
              Finding new streams...
            </Text>
          </View>
        )}

        {/* Vertical FlatList for streams */}
        <FlatList
          ref={flatListRef}
          data={streams}
          renderItem={renderItem}
          keyExtractor={(item) => `${item._id || ''}_${item.channelId || ''}`}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          initialScrollIndex={currentIndex}
          getItemLayout={(data, index) => ({
            length: SCREEN_HEIGHT,
            offset: SCREEN_HEIGHT * index,
            index,
          })}
          snapToInterval={SCREEN_HEIGHT}
          snapToAlignment="start"
          decelerationRate="fast"
          windowSize={3}
          maxToRenderPerBatch={1}
          initialNumToRender={1}
          removeClippedSubviews={true}
          scrollEventThrottle={16}
          bounces={false}
          overScrollMode="never"
          disableIntervalMomentum={true}
          updateCellsBatchingPeriod={50}
          refreshControl={
            <RefreshControl
              refreshing={isLoadingNewStream}
              onRefresh={fetchNewLiveStreams}
              tintColor="white"
              colors={[colors.purple]}
              progressBackgroundColor="rgba(0,0,0,0.5)"
            />
          }
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10,
          }}
        />

        {/* Astrologer List Modal */}
        <AstrologerListModal
          visible={showAstrologerModal}
          onClose={() => setShowAstrologerModal(false)}
          onAstrologerSelect={handleAstrologerSelect}
          onLeave={handleLeaveStream}
        />

        {/* Astrologer List Modal */}
        <AstrologerListModal
          visible={showAstrologerModal}
          onClose={() => setShowAstrologerModal(false)}
          onAstrologerSelect={handleAstrologerSelect}
          onLeave={handleLeaveStream}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  streamItemContainer: {
    height: SCREEN_HEIGHT,
    width: SCREEN_WIDTH,
    backgroundColor: '#000',
    position: 'relative',
  },
  videoSection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
  videoWrapper: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 0, // No border radius for full screen video
  },
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  waitingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waitingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ff3b30',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.purple,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  floatingButtonsContainer: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.4 + 30, // Increased margin above comments section
    right: 20,
    zIndex: 100,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10, // Increased gap between buttons
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Slight background for better visibility
    borderRadius: 30,
    padding: 5,
  },
  circleButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.purple,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 7,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonWithLabel: {
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonLabel: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  commentsContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 34 : 0, // Add padding for iOS devices with home indicator
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.4,
    backgroundColor: 'transparent',
    paddingTop: 10,
    paddingHorizontal: 10,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10, // Extra padding for iOS
    zIndex: 10,
  },
  viewerCountBadge: {
    position: 'absolute',
    top: 30,
    left: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 5,
  },
  viewerCountText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 4,
    fontWeight: 'bold',
  },
  totalViewsBadge: {
    position: 'absolute',
    top: 80,
    left: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 5,
  },
  totalViewsText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 4,
    fontWeight: 'bold',
  },
  astrologerBadge: {
    position: 'absolute',
    bottom: 70,
    left: 15,
    maxWidth: SCREEN_WIDTH - 80,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    zIndex: 5,
  },
  astrologerName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  streamTitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  exitButton: {
    position: 'absolute',
    top: 30,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  newStreamLoadingContainer: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1001,
  },
  newStreamLoadingText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default LivePlayer;
