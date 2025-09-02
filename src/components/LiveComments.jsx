import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../assets/constants/colors';
import { baseURL } from '../utils/axiosInstance';

// Socket functions - import from the correct location
import {
  addCommentListener,
  addStreamEndListener,
  addUserJoinedListener,
  addViewerCountListener,
  sendComment as emitComment,
  fetchViewerCount,
  getSocket,
  initializeSocket,
} from '../utils/socketConfig';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Define BACKEND_URL constant
const BACKEND_URL = baseURL;

const CommentItem = ({ comment }) => {
  const translateY = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate comment entry
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate comment fading out after a delay for system messages
    if (
      comment.type === 'system' ||
      comment.type === 'join' ||
      comment.type === 'gift' ||
      comment.isSystemMessage
    ) {
      const fadeOutTimeout = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      }, 5000);

      return () => clearTimeout(fadeOutTimeout);
    }
  }, []);

  // Style differently based on message type
  let messageStyle = styles.message;
  let nameStyle = styles.userName;

  if (comment.type === 'system' || comment.isSystemMessage) {
    messageStyle = styles.systemMessage;
    nameStyle = styles.systemUserName;
  } else if (comment.type === 'join') {
    messageStyle = styles.joinMessage;
    nameStyle = styles.joinUserName;
  } else if (comment.type === 'gift') {
    messageStyle = styles.giftMessage;
    nameStyle = styles.giftUserName;
  }

  // Enhanced styling based on who sent the comment
  const commentContainerStyle = [
    styles.commentItem,
    comment.isUser === true ? styles.userComment : styles.astrologerComment,
    comment.type === 'gift' && styles.giftCommentContainer,
    { transform: [{ translateY }], opacity },
  ];

  // Handle system messages
  if (comment.type === 'join' || comment.isSystemMessage) {
    return (
      <Animated.View style={[commentContainerStyle, styles.systemComment]}>
        <Text style={messageStyle}>
          {comment.type === 'join' ? (
            <>
              <Text style={nameStyle}>{comment.userName}</Text> joined
            </>
          ) : (
            comment.message
          )}
        </Text>
      </Animated.View>
    );
  }

  // Handle gift messages
  if (comment.type === 'gift') {
    return (
      <Animated.View style={[commentContainerStyle, styles.giftComment]}>
        <View style={styles.commentContent}>
          <Text style={styles.giftUserName}>
            <Ionicons name="gift" size={16} color="#FF8CD9" />{' '}
            {comment.userName}
          </Text>
          <Text style={styles.giftMessage}>
            {comment.message}
            {comment.giftData?.price && (
              <Text style={styles.giftPrice}>
                {' '}
                ({comment.giftData.price} diamonds)
              </Text>
            )}
          </Text>
        </View>
      </Animated.View>
    );
  }

  // Regular comment display
  return (
    <Animated.View style={commentContainerStyle}>
      <View style={styles.commentContent}>
        <Text style={nameStyle}>{comment.userName}</Text>
        <Text style={messageStyle}>{comment.message}</Text>
        <Text style={styles.commentTime}>
          {new Date(comment.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </Animated.View>
  );
};

// Convert to forwardRef to properly handle refs
const LiveComments = forwardRef(
  (
    {
      channelId,
      streamId, // Add streamId prop for socket integration
      user,
      userId,
      userName = 'Guest',
      sendComment,
    },
    ref,
  ) => {
    const [comments, setComments] = useState([]);
    const [message, setMessage] = useState('');
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [unreadComments, setUnreadComments] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const [viewerCount, setViewerCount] = useState(0);
    const [totalViews, setTotalViews] = useState(0);
    const [recentJoins, setRecentJoins] = useState([]);

    const listRef = useRef(null);
    const modalListRef = useRef(null);

    // Use streamId or channelId for socket operations
    const activeStreamId = streamId || channelId;
    const activeUserId = userId || user?._id || 'guest_user';
    const activeUserName = userName || user?.name || 'Guest';

    // Expose addComment function to parent component through the ref
    useImperativeHandle(ref, () => ({
      addComment: (data) => {
        addComment(data);
      },
    }));

    // Initialize socket connection
    useEffect(() => {
      if (!activeStreamId) return;

      initializeSocket();
      const socketInstance = getSocket();

      if (socketInstance) {
        setIsConnected(socketInstance.connected);

        const onConnect = () => {
          setIsConnected(true);
        };

        const onDisconnect = () => {
          setIsConnected(false);
        };

        socketInstance.on('connect', onConnect);
        socketInstance.on('disconnect', onDisconnect);

        if (socketInstance.connected) {
          setIsConnected(true);
        }

        return () => {
          socketInstance.off('connect', onConnect);
          socketInstance.off('disconnect', onDisconnect);
        };
      }
    }, [activeStreamId]);

    // Function to generate a truly unique ID that won't cause key conflicts
    const generateUniqueId = (prefix = '') => {
      return `${prefix}-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}`;
    };

    // Setup stream-specific event listeners and join stream
    useEffect(() => {
      if (!activeStreamId || !isConnected) return;

      const socketInstance = getSocket();
      socketInstance.emit('joinStream', {
        channelId: activeStreamId,
        userId: activeUserId,
        userName: activeUserName,
      });

      // Add listener for viewer count updates
      const removeViewerCountListener = addViewerCountListener((data) => {
        if (data.channelId === activeStreamId) {
          setViewerCount(data.activeViewers || 0);
          setTotalViews(data.totalViews || 0);
        }
      });

      // Fetch initial viewer count
      fetchViewerCount(activeStreamId)
        .then((data) => {
          setViewerCount(data.activeViewers || 0);
          setTotalViews(data.totalViews || 0);
        })
        .catch((error) => {
          console.error('Error fetching initial viewer count:', error);
        });

      // Add listener for comments from socket
      const removeCommentListener = addCommentListener((comment) => {
        addComment({
          ...comment,
          id: comment.id || generateUniqueId('comment'),
          userName: comment.userName || 'User',
          message: comment.message,
          timestamp: comment.timestamp || new Date(),
          type: 'comment',
        });
      });

      // Add listener for user joined events
      const removeUserJoinedListener = addUserJoinedListener((data) => {
        const joinId = generateUniqueId('join');

        addComment({
          id: joinId,
          isSystemMessage: true,
          type: 'join',
          userName: data.userName || 'Someone',
          message: `${data.userName || 'Someone'} joined`,
          timestamp: data.timestamp || new Date(),
        });

        // Add to recent joins with unique ID and store reference to timeout
        const recentJoinId = generateUniqueId('recent-join');
        const newJoin = {
          name: data.userName || 'Someone',
          id: recentJoinId,
          userId: data.userId,
        };

        setRecentJoins((prev) => [...prev, newJoin]);

        // Use the unique ID to remove this specific join notification after timeout
        setTimeout(() => {
          setRecentJoins((prev) =>
            prev.filter((join) => join.id !== recentJoinId),
          );
        }, 5000);
      });

      // Add listener for stream end events
      const removeStreamEndListener = addStreamEndListener((data) => {
        addComment({
          id: generateUniqueId('end'),
          isSystemMessage: true,
          type: 'system',
          message: 'Live stream has ended',
          timestamp: new Date(),
        });
      });

      // Fetch existing comments
      const fetchComments = async () => {
        try {
          const response = await fetch(
            `${BACKEND_URL}/streams/${activeStreamId}/comments`,
          );

          if (response.ok) {
            const data = await response.json();

            if (
              data.comments &&
              Array.isArray(data.comments) &&
              data.comments.length > 0
            ) {
              const formattedComments = data.comments.map((comment) => ({
                id:
                  comment.id ||
                  generateUniqueId(`api-comment-${comment.userId || 'guest'}`),
                userId: comment.userId || 'guest',
                userName: comment.userName || 'User',
                message: comment.message || comment.content,
                timestamp: comment.timestamp || comment.createdAt || new Date(),
                type: 'comment',
                isUser: comment.userId === activeUserId,
              }));
              setComments(formattedComments);
            }
          }
        } catch (error) {
          console.error('Error fetching comments:', error);
        }
      };

      fetchComments();

      // Cleanup function
      return () => {
        socketInstance.emit('leaveStream', {
          channelId: activeStreamId,
          userId: activeUserId,
        });

        removeViewerCountListener();
        removeCommentListener();
        removeUserJoinedListener();
        removeStreamEndListener();
      };
    }, [activeStreamId, activeUserId, activeUserName, isConnected]);

    // Add new comment to the list
    const addComment = (data) => {
      if (!data || !data.message) return;

      const isFromAstrologer = data.role === 'astrologer';
      const isFromCurrentUser =
        data.userId === activeUserId || data.role === 'user';
      const isLocalOnly = data.isLocalOnly === true;

      const newComment = {
        id: data.id || generateUniqueId('comment'),
        userId: data.userId || 'guest',
        userName: data.userName || 'Guest User',
        message: data.message || '',
        timestamp: data.timestamp || new Date(),
        type: data.type || 'comment',
        isUser: isFromCurrentUser,
        isAstrologer: isFromAstrologer,
        isSystemMessage: data.isSystemMessage || false,
        isLocalOnly: isLocalOnly,
      };

      setComments((prevComments) => {
        // Check for duplicates - either by ID or by very similar content within 3 seconds
        const isDuplicate = prevComments.some((c) => {
          // Check by ID
          if (data.id && c.id === data.id) {
            return true;
          }

          // Check by similar content and timestamp (within 3 seconds)
          const timeDiff = Math.abs(
            new Date(c.timestamp).getTime() -
              new Date(newComment.timestamp).getTime(),
          );

          if (
            c.message === newComment.message &&
            c.userId === newComment.userId &&
            timeDiff < 3000
          ) {
            return true;
          }

          return false;
        });

        if (isDuplicate) {
          return prevComments;
        }

        // Increment unread count if not from user and modal not open
        if (!newComment.isUser && !modalVisible) {
          setUnreadComments((prev) => prev + 1);
        }

        return [...prevComments, newComment];
      });
    };

    // Expose addComment function to parent component
    useEffect(() => {
      if (!sendComment) return;

      sendComment.addComment = addComment;

      return () => {
        if (sendComment) {
          delete sendComment.addComment;
        }
      };
    }, [sendComment, activeUserId, modalVisible]);

    // Auto-scroll to latest comment
    useEffect(() => {
      if (comments.length > 0) {
        if (listRef.current) {
          setTimeout(() => {
            listRef.current.scrollToEnd({ animated: true });
          }, 100);
        }
        if (modalVisible && modalListRef.current) {
          setTimeout(() => {
            modalListRef.current.scrollToEnd({ animated: true });
          }, 100);
        }
      }
    }, [comments, modalVisible]);

    const handleSendComment = () => {
      if (!message.trim()) {
        Alert.alert('Error', 'Please enter a message');
        return;
      }

      if (!isConnected) {
        Alert.alert('Connection Error', 'Not connected to chat server');
        return;
      }

      if (!activeStreamId) {
        Alert.alert('Error', 'No active stream');
        return;
      }
      // Check if we have the socket emit function
      if (emitComment) {
        // Use socket method directly and don't call the parent sendComment
        emitComment(
          activeStreamId,
          activeUserId,
          activeUserName,
          message.trim(),
        );
      } else if (sendComment && typeof sendComment === 'function') {
        // Only use the parent sendComment as fallback if socket method is not available
        sendComment(message.trim());
      }

      setMessage('');
      Keyboard.dismiss();
    };

    // Open modal and reset unread count
    const handleOpenModal = () => {
      setModalVisible(true);
      setUnreadComments(0);
    };

    // Modified comments preview to avoid nested VirtualizedLists
    return (
      <View style={styles.container}>
        {/* Floating chat bubble with viewer count */}
        <TouchableOpacity
          style={styles.commentBubble}
          onPress={handleOpenModal}
        >
          <Ionicons name="chatbubble-ellipses" size={26} color="#fff" />
          {unreadComments > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{unreadComments}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Viewer count display */}
        {viewerCount > 0 && (
          <View style={styles.viewerStats}>
            <View style={styles.liveIndicator} />
            <Text style={styles.viewerText}>{viewerCount} watching</Text>
            {totalViews > 0 && (
              <Text style={styles.totalViewsText}>{totalViews} total</Text>
            )}
          </View>
        )}

        {/* Recent joins notifications */}
        {recentJoins.length > 0 && (
          <View style={styles.recentJoins}>
            {recentJoins.map((join) => (
              <View key={join.id} style={styles.joinNotification}>
                <Text style={styles.joinText}>{join.name} joined</Text>
              </View>
            ))}
          </View>
        )}

        {/* Comments preview overlay - Replace FlatList with regular View */}
        <View style={styles.commentsPreview}>
          {comments.length > 0 ? (
            <View style={styles.commentsList}>
              {comments.slice(-3).map((comment) => (
                <CommentItem key={`preview-${comment.id}`} comment={comment} />
              ))}
            </View>
          ) : (
            <Text style={styles.emptyCommentsText}>
              {isConnected ? 'No comments yet' : 'Connecting...'}
            </Text>
          )}
        </View>

        {/* Full comments modal - Keep FlatList here as it's a top-level component */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleContainer}>
                  <Text style={styles.modalTitle}>Comments</Text>
                  {viewerCount > 0 && (
                    <View style={styles.modalViewerInfo}>
                      <View style={styles.modalLiveIndicator} />
                      <Text style={styles.modalViewerText}>
                        {viewerCount} watching
                      </Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <FlatList
                ref={modalListRef}
                data={comments}
                renderItem={({ item }) => <CommentItem comment={item} />}
                keyExtractor={(item) => `modal-${item.id}`}
                style={styles.modalCommentsList}
                contentContainerStyle={styles.modalCommentsContent}
                showsVerticalScrollIndicator={true}
                initialNumToRender={20}
              />

              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              >
                <View style={styles.modalInputContainer}>
                  <TextInput
                    style={styles.modalInput}
                    placeholder={
                      isConnected ? 'Type a message...' : 'Connecting...'
                    }
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    value={message}
                    onChangeText={setMessage}
                    multiline={false}
                    maxLength={200}
                    returnKeyType="send"
                    onSubmitEditing={handleSendComment}
                    editable={isConnected}
                  />
                  <TouchableOpacity
                    style={[
                      styles.modalSendButton,
                      (!message.trim() || !isConnected) &&
                        styles.sendButtonDisabled,
                    ]}
                    onPress={handleSendComment}
                    disabled={!message.trim() || !isConnected}
                  >
                    <Ionicons
                      name="send"
                      size={20}
                      color={
                        message.trim() && isConnected
                          ? colors.purple
                          : 'rgba(255,255,255,0.4)'
                      }
                    />
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            </View>
          </SafeAreaView>
        </Modal>

        {/* Bottom input area */}
        <KeyboardAvoidingView
          style={styles.keyboardAvoidContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View
            style={[
              styles.inputContainer,
              isInputFocused && styles.inputContainerFocused,
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder={isConnected ? 'Type a message...' : 'Connecting...'}
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={message}
              onChangeText={setMessage}
              multiline={false}
              maxLength={200}
              returnKeyType="send"
              onSubmitEditing={handleSendComment}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              editable={isConnected}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!message.trim() || !isConnected) && styles.sendButtonDisabled,
              ]}
              onPress={handleSendComment}
              disabled={!message.trim() || !isConnected}
            >
              <Ionicons
                name="send"
                size={20}
                color={
                  message.trim() && isConnected
                    ? colors.purple
                    : 'rgba(255,255,255,0.4)'
                }
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  commentBubble: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 23,
    width: 46,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 101,
    borderWidth: 2,
    borderColor: colors.purple,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  unreadBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  viewerStats: {
    position: 'absolute',
    top: 75,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    zIndex: 100,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'red',
    marginRight: 5,
  },
  viewerText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  totalViewsText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    marginLeft: 8,
  },
  recentJoins: {
    position: 'absolute',
    top: 105,
    right: 20,
    zIndex: 99,
  },
  joinNotification: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 5,
  },
  joinText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  commentsPreview: {
    position: 'absolute',
    top: 140,
    right: 10,
    width: width * 0.75,
    maxHeight: 160,
    backgroundColor: 'transparent',
    zIndex: 99,
  },
  commentsList: {
    paddingHorizontal: 10,
    width: '100%',
  },
  commentItem: {
    borderRadius: 8,
    marginVertical: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  userComment: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(94, 92, 230, 0.85)',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 2,
    marginLeft: '20%',
  },
  astrologerComment: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderColor: colors.orange,
    borderWidth: 1,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 2,
    marginRight: '20%',
  },
  systemComment: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginHorizontal: '10%',
  },
  commentContent: {
    flexDirection: 'column',
  },
  userName: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 13,
    marginBottom: 2,
  },
  message: {
    color: '#fff',
    fontSize: 14,
  },
  commentTime: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    marginTop: 2,
    alignSelf: 'flex-end',
  },
  systemMessage: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  systemUserName: {
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.8)',
  },
  joinMessage: {
    color: 'rgba(144, 238, 144, 0.9)',
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  joinUserName: {
    fontWeight: 'bold',
    color: 'rgba(144, 238, 144, 0.9)',
  },
  keyboardAvoidContainer: {
    width: '100%',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Platform.OS === 'ios' ? 34 : 0, // Add padding for iOS devices with home indicator
    zIndex: 102,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 12 : 8, // Extra padding for iOS
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Darker background for better visibility
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)', // More visible border
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 10 : 0, // Extra margin for iOS devices
  },
  inputContainerFocused: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    color: 'white',
    fontSize: 15,
  },
  sendButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginLeft: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  emptyCommentsText: {
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    padding: 10,
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: 'rgba(30, 30, 45, 0.95)',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: colors.purple,
  },
  modalTitleContainer: {
    flexDirection: 'column',
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalViewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  modalLiveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'red',
    marginRight: 5,
  },
  modalViewerText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  closeButton: {
    padding: 5,
  },
  modalCommentsList: {
    flex: 1,
  },
  modalCommentsContent: {
    paddingHorizontal: 10,
    paddingBottom: 15,
    paddingTop: 5,
  },
  modalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'rgba(20, 20, 35, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: 'white',
    fontSize: 15,
  },
  modalSendButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginLeft: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  giftMessage: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  giftUserName: {
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.8)',
  },
  giftPrice: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    marginLeft: 8,
  },
  giftCommentContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 12,
    marginHorizontal: '10%',
  },
  giftComment: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginHorizontal: '10%',
  },
});

export default LiveComments;
