# useAgoraAudience Hook Documentation

## Overview

The `useAgoraAudience` hook provides a centralized way to manage Agora RTC connections for audience members. It ensures that only one channel is joined at a time, handles token management, and provides a clean API for stream join/leave operations.

## Features

- **Single Channel Guarantee**: Automatically leaves current channel when joining a new one
- **Memoized Engine**: Creates and reuses a single Agora engine instance
- **Token Management**: Automatically fetches tokens when needed
- **Error Handling**: Comprehensive error states and recovery
- **State Management**: Clear state tracking for connection status
- **Event Handling**: Automatic handling of user join/leave events
- **Cleanup**: Proper resource cleanup on unmount

## Usage

### Basic Usage

```javascript
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { RtcSurfaceView } from 'react-native-agora';
import { useAgoraAudience } from '../hooks/useAgoraAudience';

const StreamViewer = () => {
  const {
    remoteUsers,
    joinState,
    loading,
    error,
    joinChannel,
    leaveCurrent,
    isConnected,
    hasRemoteUsers,
  } = useAgoraAudience();

  const handleJoinStream = async (channelId) => {
    const success = await joinChannel(channelId);
  };

  const handleLeaveStream = async () => {
    await leaveCurrent();
  };

  return (
    <View style={{ flex: 1 }}>
      {hasRemoteUsers && (
        <RtcSurfaceView
          style={{ flex: 1 }}
          canvas={{
            uid: remoteUsers[0].uid,
            renderMode: 1,
            mirrorMode: 0,
          }}
        />
      )}

      <View style={{ padding: 20 }}>
        <Text>Status: {joinState}</Text>
        {error && <Text style={{ color: 'red' }}>Error: {error}</Text>}

        <TouchableOpacity onPress={() => handleJoinStream('test-channel')}>
          <Text>Join Stream</Text>
        </TouchableOpacity>

        {isConnected && (
          <TouchableOpacity onPress={handleLeaveStream}>
            <Text>Leave Stream</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
```

### Advanced Usage with Options

```javascript
import React, { useState } from 'react';
import { useAgoraAudience } from '../hooks/useAgoraAudience';

const AdvancedStreamViewer = () => {
  const [selectedChannel, setSelectedChannel] = useState(null);

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
  } = useAgoraAudience();

  const joinWithOptions = async (channelId) => {
    const success = await joinChannel(channelId, {
      autoSubscribeAudio: true,
      autoSubscribeVideo: true,
      muteAudio: false,
      forceNewToken: true,
    });

    if (success) {
      setSelectedChannel(channelId);
    }
  };

  const toggleAudio = () => {
    const connectionInfo = getConnectionInfo();
    if (connectionInfo.isConnected) {
      muteRemoteAudio(!audioMuted);
      setAudioMuted(!audioMuted);
    }
  };

  return <View style={{ flex: 1 }}>{/* Your UI implementation */}</View>;
};
```

### Stream Carousel with Auto-preview

```javascript
import React, { useEffect, useRef } from 'react';
import { useAgoraAudience } from '../hooks/useAgoraAudience';

const StreamCarousel = ({ streams }) => {
  const autoRotateRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { remoteUsers, joinState, joinChannel, leaveCurrent, isConnected } =
    useAgoraAudience();

  // Auto-rotate preview every 10 seconds
  useEffect(() => {
    if (!streams.length) return;

    const rotatePreview = () => {
      const nextIndex = (currentIndex + 1) % streams.length;
      const nextStream = streams[nextIndex];

      joinChannel(nextStream.channelId, {
        autoSubscribeAudio: false, // No audio for preview
        autoSubscribeVideo: true,
        muteAudio: true,
      });

      setCurrentIndex(nextIndex);
    };

    // Start with first stream
    if (currentIndex === 0 && streams[0]) {
      joinChannel(streams[0].channelId, { muteAudio: true });
    }

    // Set up rotation timer
    autoRotateRef.current = setInterval(rotatePreview, 10000);

    return () => {
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current);
      }
    };
  }, [streams, currentIndex, joinChannel]);

  const handleStreamSelect = async (stream) => {
    // Stop auto-rotation
    if (autoRotateRef.current) {
      clearInterval(autoRotateRef.current);
    }

    // Join stream with audio
    await joinChannel(stream.channelId, {
      autoSubscribeAudio: true,
      autoSubscribeVideo: true,
      muteAudio: false,
    });

    // Navigate to full player
    navigation.navigate('StreamPlayer', { channelId: stream.channelId });
  };

  return (
    <View>
      {/* Render stream cards with preview */}
      {streams.map((stream, index) => (
        <StreamCard
          key={stream.id}
          stream={stream}
          isActive={index === currentIndex && isConnected}
          remoteUsers={index === currentIndex ? remoteUsers : []}
          onPress={() => handleStreamSelect(stream)}
        />
      ))}
    </View>
  );
};
```

## API Reference

### Parameters

- `appId` (string, optional): Agora App ID. Defaults to `AGORA_CONFIG.APP_ID`
- `token` (string, optional): Initial token for authentication

### Return Value

The hook returns an object with the following properties:

#### State Properties

- `remoteUsers` (Array): Array of remote users with `{ uid, connection }` objects
- `joinState` (string): Current connection state - `'idle'`, `'joining'`, `'joined'`, `'leaving'`, `'error'`
- `loading` (boolean): Whether a connection operation is in progress
- `error` (string|null): Current error message, if any
- `currentChannelId` (string|null): ID of currently joined channel

#### Action Methods

- `joinChannel(channelId, options)`: Join a channel

  - `channelId` (string): Channel to join
  - `options` (object, optional):
    - `autoSubscribeAudio` (boolean): Auto-subscribe to audio (default: true)
    - `autoSubscribeVideo` (boolean): Auto-subscribe to video (default: true)
    - `muteAudio` (boolean): Mute audio on join (default: false)
    - `forceNewToken` (boolean): Force fetch new token (default: false)
  - Returns: Promise<boolean> - Success status

- `leaveCurrent()`: Leave the current channel

  - Returns: Promise<void>

- `getConnectionInfo()`: Get current connection information

  - Returns: Object with `{ channelId, isConnected, remoteUserCount, token }`

- `muteRemoteAudio(mute)`: Mute/unmute remote audio
  - `mute` (boolean): Whether to mute (default: true)
  - Returns: Promise<void>

#### Computed Properties

- `isConnected` (boolean): Whether currently connected to a channel
- `isJoining` (boolean): Whether currently joining a channel
- `isLeaving` (boolean): Whether currently leaving a channel
- `hasError` (boolean): Whether there's an error
- `hasRemoteUsers` (boolean): Whether there are remote users in the channel

#### Advanced Properties

- `agoraEngine`: Direct access to the Agora engine instance (for advanced use cases)

## State Flow

```
idle → joining → joined
  ↑      ↓         ↓
  ←─── leaving ←───┘
       ↓
     error
```

## Error Handling

The hook handles errors gracefully and provides error information through the `error` state. Common error scenarios:

1. **Initialization Failure**: Engine fails to initialize
2. **Join Failure**: Cannot join channel (network, token, etc.)
3. **Leave Failure**: Cannot leave channel
4. **Token Failure**: Token fetch fails (hook will try without token)

## Best Practices

1. **Single Instance**: Use only one instance of this hook per component tree
2. **Cleanup**: The hook automatically cleans up on unmount
3. **Error Handling**: Always check the `error` state and handle appropriately
4. **Loading States**: Use the `loading` state to show appropriate UI feedback
5. **Token Management**: Let the hook handle token fetching automatically
6. **Channel Switching**: Use `joinChannel` directly - it handles leaving current channel

## Migration from Direct Agora Usage

If you're migrating from direct Agora engine usage:

### Before

```javascript
const [client, setClient] = useState(null);
const [remoteUsers, setRemoteUsers] = useState([]);

const initEngine = async () => {
  const engine = createAgoraRtcEngine();
  await engine.initialize({ appId });
  // ... setup event handlers
  setClient(engine);
};

const joinChannel = async (channelId) => {
  if (client) {
    await client.leaveChannel(); // Manual cleanup
    await client.joinChannel(token, channelId, 0, options);
  }
};
```

### After

```javascript
const { remoteUsers, joinChannel, leaveCurrent, isConnected } =
  useAgoraAudience();

// That's it! The hook handles everything
```

## Troubleshooting

### Common Issues

1. **"Agora engine not initialized"**: Wait for initialization or check if `appId` is valid
2. **Token errors**: Ensure your backend token endpoint is working
3. **Multiple channels**: The hook automatically handles this - don't manually manage channels
4. **Memory leaks**: The hook cleans up automatically - don't manually release the engine

### Debug Logging

The hook includes comprehensive console logging. Check the console for:

- Engine initialization status
- Channel join/leave events
- Remote user events
- Error messages

## Examples in Codebase

See these files for real-world usage examples:

- `LiveStreamViewer.jsx` - Before migration (current implementation)
- `StreamCarousel.jsx` - Stream preview carousel
- `LivePlayer.jsx` - Full stream player
