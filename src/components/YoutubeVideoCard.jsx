import React from 'react';
import { Dimensions, Image, Pressable, View } from 'react-native';

const YouTubeVideo = ({ video, setIsYoutubeModalOpen, setPlayingVideoId }) => {
  const handlePlay = () => {
    setPlayingVideoId(video?.videoId);
    setIsYoutubeModalOpen(true);
  };

  return (
    <View style={{ marginTop: 12, alignItems: 'center' }}>
      <Pressable onPress={handlePlay}>
        <Image
          source={{ uri: video?.thumbnail }}
          style={{
            width: Dimensions.get('window').width - 40,
            height: 200,
            borderRadius: 12,
          }}
        />
        <Image
          source={require('../assets/images/ytlogo.png')}
          style={{
            width: 140,
            height: 100,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: [{ translateX: -70 }, { translateY: -50 }],
          }}
        />
      </Pressable>
    </View>
  );
};

export default YouTubeVideo;
