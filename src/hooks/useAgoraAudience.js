import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createAgoraRtcEngine } from 'react-native-agora';
import { AGORA_CONFIG } from '../config/agoraConfig';
import { baseURL } from '../utils/axiosInstance';

const BACKEND_URL = baseURL;

/**
 * Custom hook for managing Agora audience connections
 * Ensures only one channel is joined at a time and provides centralized stream management
 *
 * @param {string} appId - Agora App ID (optional, defaults to config)
 * @param {string} token - Optional token for authentication
 * @returns {Object} Hook state and methods
 */
export const useAgoraAudience = (appId = AGORA_CONFIG.APP_ID, token = null) => {
  // State management
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [joinState, setJoinState] = useState('idle'); // 'idle', 'joining', 'joined', 'leaving', 'error'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentChannelId, setCurrentChannelId] = useState(null);
  const [currentToken, setCurrentToken] = useState(token);

  // Refs for managing engine and state
  const agoraEngineRef = useRef(null);
  const isInitializedRef = useRef(false);
  const isJoiningRef = useRef(false);

  // Memoized Agora engine creation
  const agoraEngine = useMemo(() => {
    if (!agoraEngineRef.current && appId) {
      agoraEngineRef.current = createAgoraRtcEngine();
    }
    return agoraEngineRef.current;
  }, [appId]);

  // Initialize Agora engine
  useEffect(() => {
    const initializeEngine = async () => {
      if (!agoraEngine || isInitializedRef.current) return;

      try {
        setLoading(true);

        await agoraEngine.initialize({
          appId: appId,
          logConfig: { level: 1 },
        });

        // Register global event handlers
        agoraEngine.registerEventHandler({
          onError: (err, msg) => {
            console.error(`Agora Error ${err}: ${msg}`);
            setError(`Agora Error: ${msg}`);
            setJoinState('error');
          },
          onJoinChannelSuccess: (connection, elapsed) => {
            setJoinState('joined');
            setCurrentChannelId(connection.channelId);
            setError(null);
            setLoading(false);
            isJoiningRef.current = false;
          },
          onLeaveChannel: (connection, stats) => {
            setJoinState('idle');
            setCurrentChannelId(null);
            setRemoteUsers([]);
            setError(null);
            setLoading(false);
            isJoiningRef.current = false;
          },
          onUserJoined: (connection, uid, elapsed) => {
            setRemoteUsers((prevUsers) => {
              const filtered = prevUsers.filter((u) => u.uid !== uid);
              return [...filtered, { uid, connection }];
            });
          },
          onUserOffline: (connection, uid, reason) => {
            setRemoteUsers((prevUsers) =>
              prevUsers.filter((u) => u.uid !== uid),
            );
          },
        });

        // Configure engine for audience mode
        await agoraEngine.setChannelProfile(1); // Live Broadcasting
        await agoraEngine.setClientRole(2); // Audience
        await agoraEngine.enableVideo();

        isInitializedRef.current = true;
      } catch (err) {
        console.error('Failed to initialize Agora engine:', err);
        setError(`Initialization failed: ${err.message}`);
        setJoinState('error');
      } finally {
        setLoading(false);
      }
    };

    initializeEngine();

    // Cleanup on unmount
    return () => {
      if (agoraEngineRef.current && isInitializedRef.current) {
        try {
          agoraEngineRef.current.leaveChannel();
        } catch (e) {
          console.error('Error leaving channel:', e);
        }
        agoraEngineRef.current.removeAllListeners();
        agoraEngineRef.current.release().catch(console.error);
        agoraEngineRef.current = null;
        isInitializedRef.current = false;
      }
    };
  }, [agoraEngine, appId]);

  // Get token for a channel
  const getToken = useCallback(async (channelId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/agora/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channelName: channelId,
          uid: 0,
          role: 'audience',
        }),
      });

      if (!response.ok) {
        throw new Error(`Token request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      console.warn('Failed to get token:', error);
      return null;
    }
  }, []);

  // Join a channel
  const joinChannel = useCallback(
    async (channelId, options = {}) => {
      if (!agoraEngine || !isInitializedRef.current) {
        setError('Agora engine not initialized');
        return false;
      }

      if (isJoiningRef.current) {
        return false;
      }

      if (joinState === 'joined' && currentChannelId === channelId) {
        return true;
      }

      try {
        isJoiningRef.current = true;
        setLoading(true);
        setJoinState('joining');
        setError(null);

        // Leave current channel if joined
        if (joinState === 'joined' && currentChannelId) {
          try {
            agoraEngine.leaveChannel();
          } catch (e) {
            console.error('Error leaving channel:', e);
          }
          agoraEngine.removeAllListeners();
          setRemoteUsers([]);
          // Wait a bit for cleanup
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // Get token for the new channel
        let channelToken = currentToken;
        if (!channelToken || options.forceNewToken) {
          channelToken = await getToken(channelId);
          setCurrentToken(channelToken);
        }

        // Configure channel media options
        const channelMediaOptions = {
          autoSubscribeAudio: options.autoSubscribeAudio !== false,
          autoSubscribeVideo: options.autoSubscribeVideo !== false,
          publishCameraTrack: false,
          publishMicrophoneTrack: false,
          clientRoleType: 2, // Audience
        };

        // Mute audio if specified
        if (options.muteAudio) {
          await agoraEngine.muteAllRemoteAudioStreams(true);
        }

        await agoraEngine.joinChannel(
          channelToken,
          channelId,
          0, // UID (0 for auto-assignment)
          channelMediaOptions,
        );

        return true;
      } catch (err) {
        console.error('Failed to join channel:', err);
        setError(`Failed to join channel: ${err.message}`);
        setJoinState('error');
        setLoading(false);
        isJoiningRef.current = false;
        return false;
      }
    },
    [agoraEngine, joinState, currentChannelId, currentToken, getToken],
  );

  // Leave current channel
  const leaveCurrent = useCallback(async () => {
    if (!agoraEngine || !isInitializedRef.current) {
      return;
    }

    if (joinState !== 'joined') {
      return;
    }

    try {
      setJoinState('leaving');
      setLoading(true);
      try {
        agoraEngine.leaveChannel();
      } catch (e) {
        console.error('Error leaving channel:', e);
      }
      agoraEngine.removeAllListeners();
      setRemoteUsers([]);
      // The onLeaveChannel callback will handle state cleanup
    } catch (err) {
      console.error('Failed to leave channel:', err);
      setError(`Failed to leave channel: ${err.message}`);
      setJoinState('error');
      setLoading(false);
    }
  }, [agoraEngine, joinState, currentChannelId]);

  // Get current connection info
  const getConnectionInfo = useCallback(() => {
    return {
      channelId: currentChannelId,
      isConnected: joinState === 'joined',
      remoteUserCount: remoteUsers.length,
      token: currentToken,
    };
  }, [currentChannelId, joinState, remoteUsers.length, currentToken]);

  // Mute/unmute remote audio
  const muteRemoteAudio = useCallback(
    async (mute = true) => {
      if (!agoraEngine || !isInitializedRef.current) {
        return;
      }

      try {
        await agoraEngine.muteAllRemoteAudioStreams(mute);
      } catch (err) {
        console.error('Failed to mute/unmute remote audio:', err);
      }
    },
    [agoraEngine],
  );

  // Return hook interface
  return {
    // State
    remoteUsers,
    joinState,
    loading,
    error,
    currentChannelId,

    // Actions
    joinChannel,
    leaveCurrent,
    getConnectionInfo,
    muteRemoteAudio,

    // Engine reference (for advanced use cases)
    agoraEngine,

    // Computed properties
    isConnected: joinState === 'joined',
    isJoining: joinState === 'joining',
    isLeaving: joinState === 'leaving',
    hasError: joinState === 'error',
    hasRemoteUsers: remoteUsers.length > 0,
  };
};

export default useAgoraAudience;
