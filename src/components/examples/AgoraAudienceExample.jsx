import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { RtcSurfaceView } from 'react-native-agora';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAgoraAudience } from '../../hooks/useAgoraAudience';
import { colors } from '../../assets/constants/colors';

/**
 * Example component demonstrating the useAgoraAudience hook
 * This shows how to use the hook for joining/leaving channels with a clean UI
 */
const AgoraAudienceExample = () => {
  const [channelInput, setChannelInput] = useState('');
  const [audioMuted, setAudioMuted] = useState(false);

  // Use the centralized Agora audience hook
  const {
    remoteUsers,
    joinState,
    loading,
    error,
    currentChannelId,
    joinChannel,
    leaveCurrent,
    muteRemoteAudio,
    getConnectionInfo,
    isConnected,
    isJoining,
    hasRemoteUsers,
    hasError,
  } = useAgoraAudience();

  // Handle joining a channel
  const handleJoinChannel = async () => {
    if (!channelInput.trim()) {
      Alert.alert('Error', 'Please enter a channel ID');
      return;
    }

    const success = await joinChannel(channelInput.trim(), {
      autoSubscribeAudio: true,
      autoSubscribeVideo: true,
      muteAudio: false,
    });

    if (success) {
      console.log('Successfully joined channel:', channelInput);
      setChannelInput('');
    } else {
      Alert.alert('Error', 'Failed to join channel. Please try again.');
    }
  };

  // Handle leaving current channel
  const handleLeaveChannel = async () => {
    await leaveCurrent();
    console.log('Left channel');
  };

  // Toggle audio mute
  const handleToggleAudio = async () => {
    await muteRemoteAudio(!audioMuted);
    setAudioMuted(!audioMuted);
  };

  // Get status color based on join state
  const getStatusColor = () => {
    switch (joinState) {
      case 'joined':
        return '#4CAF50'; // Green
      case 'joining':
      case 'leaving':
        return '#FF9800'; // Orange
      case 'error':
        return '#F44336'; // Red
      default:
        return '#757575'; // Gray
    }
  };

  // Get status icon based on join state
  const getStatusIcon = () => {
    switch (joinState) {
      case 'joined':
        return 'checkmark-circle';
      case 'joining':
        return 'hourglass';
      case 'leaving':
        return 'exit';
      case 'error':
        return 'alert-circle';
      default:
        return 'radio-button-off';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Agora Audience Hook Example</Text>
      
      {/* Status Section */}
      <View style={styles.statusSection}>
        <View style={styles.statusRow}>
          <Ionicons
            name={getStatusIcon()}
            size={20}
            color={getStatusColor()}
          />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            Status: {joinState.toUpperCase()}
          </Text>
        </View>
        
        {currentChannelId && (
          <Text style={styles.channelText}>
            Channel: {currentChannelId}
          </Text>
        )}
        
        {hasRemoteUsers && (
          <Text style={styles.usersText}>
            Remote Users: {remoteUsers.length}
          </Text>
        )}
      </View>

      {/* Error Display */}
      {hasError && (
        <View style={styles.errorSection}>
          <Ionicons name="alert-circle" size={20} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Video Section */}
      <View style={styles.videoSection}>
        {hasRemoteUsers ? (
          <RtcSurfaceView
            style={styles.videoView}
            canvas={{
              uid: remoteUsers[0].uid,
              renderMode: 1, // Fit mode
              mirrorMode: 0, // No mirror
            }}
          />
        ) : (
          <View style={styles.noVideoView}>
            <Ionicons name="videocam-off" size={50} color="#757575" />
            <Text style={styles.noVideoText}>
              {isConnected ? 'Waiting for remote video...' : 'No video stream'}
            </Text>
          </View>
        )}
      </View>

      {/* Controls Section */}
      <View style={styles.controlsSection}>
        {!isConnected ? (
          // Join Controls
          <View style={styles.joinSection}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter Channel ID (e.g., test-channel)"
              value={channelInput}
              onChangeText={setChannelInput}
              editable={!loading}
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            <TouchableOpacity
              style={[
                styles.button,
                styles.joinButton,
                (loading || !channelInput.trim()) && styles.buttonDisabled,
              ]}
              onPress={handleJoinChannel}
              disabled={loading || !channelInput.trim()}
            >
              {isJoining ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="enter" size={20} color="white" />
                  <Text style={styles.buttonText}>Join Channel</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          // Connected Controls
          <View style={styles.connectedSection}>
            <TouchableOpacity
              style={[styles.button, styles.audioButton]}
              onPress={handleToggleAudio}
              disabled={loading}
            >
              <Ionicons
                name={audioMuted ? 'volume-mute' : 'volume-high'}
                size={20}
                color="white"
              />
              <Text style={styles.buttonText}>
                {audioMuted ? 'Unmute' : 'Mute'} Audio
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.leaveButton]}
              onPress={handleLeaveChannel}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="exit" size={20} color="white" />
                  <Text style={styles.buttonText}>Leave Channel</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Connection Info Section */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Connection Info</Text>
        <Text style={styles.infoText}>
          {JSON.stringify(getConnectionInfo(), null, 2)}
        </Text>
      </View>

      {/* Remote Users Section */}
      {remoteUsers.length > 0 && (
        <View style={styles.usersSection}>
          <Text style={styles.usersTitle}>Remote Users</Text>
          {remoteUsers.map((user, index) => (
            <View key={user.uid} style={styles.userItem}>
              <Ionicons name="person-circle" size={24} color={colors.purple} />
              <Text style={styles.userText}>UID: {user.uid}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: colors.purple,
  },
  statusSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  channelText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 28,
  },
  usersText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 28,
  },
  errorSection: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  errorText: {
    color: '#F44336',
    marginLeft: 8,
    flex: 1,
  },
  videoSection: {
    height: 200,
    backgroundColor: 'black',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  videoView: {
    flex: 1,
  },
  noVideoView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noVideoText: {
    color: '#757575',
    marginTop: 8,
    textAlign: 'center',
  },
  controlsSection: {
    marginBottom: 16,
  },
  joinSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  connectedSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  joinButton: {
    backgroundColor: colors.purple,
  },
  audioButton: {
    backgroundColor: '#2196F3',
  },
  leaveButton: {
    backgroundColor: '#F44336',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.purple,
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
    backgroundColor: '#f9f9f9',
    padding: 8,
    borderRadius: 4,
  },
  usersSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  usersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: colors.purple,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userText: {
    fontSize: 14,
    marginLeft: 8,
    color: '#333',
  },
});

export default AgoraAudienceExample;
