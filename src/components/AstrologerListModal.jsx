import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
  ActivityIndicator,
  Dimensions,
  Animated,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../assets/constants/colors';
import { baseURL } from '../utils/axiosInstance';
import { useTheme } from '../context/ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.4; // 40% of screen height

const AstrologerListModal = ({ visible, onClose, onAstrologerSelect, onLeave }) => {
  const [astrologers, setAstrologers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useTheme();
  const slideAnim = useState(new Animated.Value(MODAL_HEIGHT))[0];

  useEffect(() => {
    if (visible) {
      fetchAllAstrologers();
      // Animate modal up from bottom
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Animate modal down to bottom
      Animated.timing(slideAnim, {
        toValue: MODAL_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const fetchAllAstrologers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseURL}/streams?isLive=true`);
      const data = await response.json();

      // Extract unique astrologers from live streams
      const uniqueAstrologers = [];
      const astrologerIds = new Set();

      if (data.streams) {
        data.streams.forEach(stream => {
          const astrologer = stream.astrologerId;
          if (astrologer && !astrologerIds.has(astrologer._id)) {
            astrologerIds.add(astrologer._id);
            uniqueAstrologers.push({
              ...astrologer,
              streamData: stream // Include stream data for joining
            });
          }
        });
      }

      setAstrologers(uniqueAstrologers);
    } catch (error) {
      console.error('Error fetching astrologers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAstrologerPress = (astrologer) => {
    onAstrologerSelect(astrologer.streamData);
    onClose();
  };

  const renderAstrologerItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.astrologerItem, isDarkMode && styles.darkAstrologerItem]}
      onPress={() => handleAstrologerPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.astrologerImageContainer}>
        <Image
          source={{
            uri: item.profileImage || item.pic || item.image || 'https://via.placeholder.com/60'
          }}
          style={styles.astrologerImage}
          resizeMode="cover"
        />
        {/* Live indicator */}
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
        </View>
      </View>
      <Text
        style={[styles.astrologerName, isDarkMode && styles.darkText]}
        numberOfLines={2}
      >
        {item.name || 'Vedaz Astrologer'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View
          style={[
            styles.modalContainer,
            isDarkMode && styles.darkModalContainer,
            {
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Modal Header */}
          <View style={[styles.modalHeader, isDarkMode && styles.darkModalHeader]}>
            <View style={styles.dragHandle} />
            <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>
              Live Astrologers
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color={isDarkMode ? 'white' : '#333'} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.modalContent}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.purple} />
                <Text style={[styles.loadingText, isDarkMode && styles.darkText]}>
                  Loading astrologers...
                </Text>
              </View>
            ) : astrologers.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={50} color={colors.purple} />
                <Text style={[styles.emptyText, isDarkMode && styles.darkText]}>
                  No live astrologers available
                </Text>
              </View>
            ) : (
              <FlatList
                data={astrologers}
                renderItem={renderAstrologerItem}
                keyExtractor={item => item._id}
                numColumns={3}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.row}
              />
            )}

            {/* Leave Button */}
            {onLeave && (
              <TouchableOpacity
                style={[styles.leaveButton, isDarkMode && styles.darkLeaveButton]}
                onPress={onLeave}
                activeOpacity={0.8}
              >
                <Ionicons name="exit-outline" size={20} color="white" />
                <Text style={styles.leaveButtonText}>Leave Stream</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    flex: 1,
  },
  modalContainer: {
    height: MODAL_HEIGHT,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  darkModalContainer: {
    backgroundColor: '#2a2a2a',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    position: 'relative',
  },
  darkModalHeader: {
    borderBottomColor: '#444',
  },
  dragHandle: {
    position: 'absolute',
    top: 8,
    left: '50%',
    marginLeft: -20,
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 5,
  },
  modalContent: {
    flex: 1,
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  astrologerItem: {
    alignItems: 'center',
    width: '30%',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  darkAstrologerItem: {
    backgroundColor: '#3a3a3a',
  },
  astrologerImageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  astrologerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ddd',
  },
  liveIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 2,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff4444',
  },
  astrologerName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    lineHeight: 16,
  },
  darkText: {
    color: 'white',
  },
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff4444',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 15,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  darkLeaveButton: {
    backgroundColor: '#cc3333',
  },
  leaveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default AstrologerListModal;