import React from 'react';
import { Dimensions, Modal, Pressable } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import YoutubePlayer from 'react-native-youtube-iframe';

const YouTubeModal = ({
  isYoutubeModalOpen,
  setIsYoutubeModalOpen,
  playingVideoId,
}) => {
  return (
    <Modal visible={isYoutubeModalOpen} animationType="fade" transparent={true}>
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.4)', // Dark overlay
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPressOut={() => setIsYoutubeModalOpen(false)} // Close only when clicking outside
      >
        <Pressable // Prevent closing when clicking the video
          onPress={() => {}} // Empty onPress to prevent modal closing
        >
          <Pressable
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              zIndex: 1,
            }}
            onPress={() => setIsYoutubeModalOpen(false)}
          >
            <Ionicons name="close" size={24} color="white" />
          </Pressable>
          <YoutubePlayer
            height={260}
            width={Dimensions.get('window').width - 40}
            play={isYoutubeModalOpen}
            videoId={playingVideoId}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default YouTubeModal;
