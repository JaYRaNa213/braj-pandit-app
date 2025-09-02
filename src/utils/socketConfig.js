import { io } from 'socket.io-client';
import { socketURL } from './axiosInstance';

// Socket.IO client instance (singleton)
let socket = null;

// Track active streams for reconnection
let activeStreams = {};

/**
 * Initialize and connect to Socket.IO server
 */
export const initializeSocket = () => {
  if (!socket) {
    socket = io(socketURL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 5000,
      forceNew: true,
    });

    socket.on('connect', () => {
      console.log('Socket connected with ID:', socket.id);

      // Auto-rejoin any active streams on reconnection
      if (Object.keys(activeStreams).length > 0) {
        console.log('Attempting to rejoin active streams after reconnection');
        Object.entries(activeStreams).forEach(([channelId, userData]) => {
          console.log(`Rejoining stream ${channelId} as ${userData.userName}`);
          socket.emit('joinStream', {
            channelId,
            userId: userData.userId,
            userName: userData.userName,
          });
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    socket.on('reconnect_attempt', (attempt) => {
      console.log(`Socket reconnect attempt: ${attempt}`);
    });

    socket.on('reconnect', (attempt) => {
      console.log(`Socket reconnected after ${attempt} attempts`);
    });
  }

  return socket;
};

/**
 * Get the socket instance, initializing if necessary
 */
export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

/**
 * Disconnect and cleanup socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    activeStreams = {};
    console.log('Socket disconnected and cleaned up');
  }
};

/**
 * Emit livestream events
 */
export const joinStream = (channelId, userId, userName) => {
  const socketInstance = getSocket();
  if (!socketInstance) {
    console.error('Socket not initialized, cannot join stream');
    return;
  }

  try {
    socketInstance.emit('joinStream', {
      channelId,
      userId: userId || 'guest_viewer',
      userName: userName || 'Guest Viewer',
    });
    console.log(`Socket: Joined stream ${channelId}`);

    // Store stream info for auto-reconnect
    activeStreams[channelId] = {
      userId: userId || 'guest_viewer',
      userName: userName || 'Guest Viewer',
    };
  } catch (error) {
    console.error('Error joining stream via socket:', error);
  }
};

export const leaveStream = (channelId, userId) => {
  const socketInstance = getSocket();
  if (!socketInstance) {
    console.error('Socket not initialized, cannot leave stream');
    return;
  }

  try {
    // Make sure both channelId and userId are defined
    if (!channelId) {
      console.warn('Cannot leave stream: channelId is undefined');
      return;
    }

    socketInstance.emit('leaveStream', {
      channelId,
      userId: userId || 'guest_viewer',
    });
    console.log(`Socket: Left stream ${channelId}`);

    // Remove from active streams
    delete activeStreams[channelId];
  } catch (error) {
    console.error('Error leaving stream via socket:', error);
  }
};

/**
 * Send a comment in the current stream
 */
export const sendComment = (channelId, userId, userName, message) => {
  const socketInstance = getSocket();
  if (!socketInstance) {
    console.error('Socket not initialized, cannot send comment');
    return;
  }

  try {
    if (!channelId || !message) {
      console.warn('Cannot send comment: missing required parameters');
      return;
    }

    socketInstance.emit('streamComment', {
      channelId,
      userId: userId || 'guest_viewer',
      userName: userName || 'Guest',
      message,
    });
    console.log(`Socket: Sent comment to stream ${channelId}`);
  } catch (error) {
    console.error('Error sending comment via socket:', error);
  }
};

/**
 * Add listener for stream end events
 */
export const addStreamEndListener = (callback) => {
  const socketInstance = getSocket();
  if (!socketInstance) {
    console.error('Socket not initialized, cannot add stream end listener');
    return () => {};
  }

  // Remove any existing listeners to avoid duplicates
  socketInstance.off('streamEnded');

  // Add the new listener
  socketInstance.on('streamEnded', (data) => {
    console.log('Socket: Stream ended event received:', data);
    if (callback && typeof callback === 'function') {
      callback(data);
    }
  });

  return () => {
    socketInstance.off('streamEnded');
  };
};

/**
 * Add listener for stream start events
 */
export const addStreamStartListener = (callback) => {
  const socketInstance = getSocket();
  if (!socketInstance) {
    console.error('Socket not initialized, cannot add stream start listener');
    return () => {};
  }

  // Remove any existing listeners to avoid duplicates
  socketInstance.off('streamStarted');

  // Add the new listener
  socketInstance.on('streamStarted', (data) => {
    console.log('Socket: Stream started event received:', data);
    if (callback && typeof callback === 'function') {
      callback(data);
    }
  });

  return () => {
    socketInstance.off('streamStarted');
  };
};

/**
 * Remove stream end listener
 */
export const removeStreamEndListener = () => {
  if (socket) {
    socket.off('streamEnded');
  }
};

/**
 * Add listener for comment events
 */
export const addCommentListener = (callback) => {
  const socketInstance = getSocket();
  if (!socketInstance) {
    console.error('Socket not initialized, cannot add comment listener');
    return () => {};
  }

  // Remove any existing listeners to avoid duplicates
  socketInstance.off('newComment');

  // Add the new listener
  socketInstance.on('newComment', (data) => {
    console.log('Socket: Comment received:', data);
    if (callback && typeof callback === 'function') {
      callback(data);
    }
  });

  return () => {
    socketInstance.off('newComment');
  };
};

/**
 * Add listener for user joined events
 */
export const addUserJoinedListener = (callback) => {
  const socketInstance = getSocket();
  if (!socketInstance) {
    console.error('Socket not initialized, cannot add user joined listener');
    return () => {};
  }

  // Remove any existing listeners to avoid duplicates
  socketInstance.off('userJoined');

  // Add the new listener
  socketInstance.on('userJoined', (data) => {
    console.log('Socket: User joined event received:', data);
    if (callback && typeof callback === 'function') {
      callback(data);
    }
  });

  return () => {
    socketInstance.off('userJoined');
  };
};

/**
 * Add listener for viewer count updates
 */
export const addViewerCountListener = (callback) => {
  const socketInstance = getSocket();
  if (!socketInstance) {
    console.error('Socket not initialized, cannot add viewer count listener');
    return () => {};
  }

  // Remove any existing listeners to avoid duplicates
  socketInstance.off('viewerCount');

  // Add the new listener
  socketInstance.on('viewerCount', (data) => {
    console.log('Socket: Viewer count update received:', data);
    if (callback && typeof callback === 'function') {
      callback(data);
    }
  });

  return () => {
    socketInstance.off('viewerCount');
  };
};

/**
 * Fetch current viewer count for a stream
 * @param {string} channelId - The channel ID to fetch viewer count for
 * @returns {Promise} - Promise that resolves with viewer count data
 */
export const fetchViewerCount = (channelId) => {
  return new Promise((resolve, reject) => {
    const socketInstance = getSocket();

    if (!socketInstance) {
      console.error('Socket not initialized, cannot fetch viewer count');
      resolve({
        activeViewers: 0,
        totalViews: 0,
      });
      return;
    }

    try {
      console.log(`Socket: Requesting viewer count for channel ${channelId}`);

      // Request viewer count via socket
      socketInstance.emit('getViewerCount', { channelId });

      // Set up a one-time listener for the response
      socketInstance.once('viewerCount', (data) => {
        console.log('Socket: Received viewer count:', data);
        resolve({
          activeViewers: data.activeViewers || 0,
          totalViews: data.totalViews || 0,
        });
      });

      // Set timeout in case we don't get a response
      setTimeout(() => {
        console.warn('Viewer count request timed out, returning defaults');
        resolve({
          activeViewers: 0,
          totalViews: 0,
        });
      }, 5000);
    } catch (error) {
      console.error('Error fetching viewer count:', error);
      resolve({
        activeViewers: 0,
        totalViews: 0,
      });
    }
  });
};
