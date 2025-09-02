import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import axiosInstance from '../utils/axiosInstance';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { colors } from '../assets/constants/colors';

const AIAstroImages = ({ route }) => {
  const { aiAstroId } = route.params;
  const [images, setImages] = useState([]);
  const [astroName, setAstroName] = useState('');

  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null); // For modal

  const navigation = useNavigation();

  const { isDarkMode } = useTheme();

  useEffect(() => {
    const fetchAstroImages = async () => {
      try {
        const { data } = await axiosInstance.get(`/ai-astro/${aiAstroId}`);
        setAstroName(data?.astro?.name || 'AI Astro');
        setImages(data?.astro?.additionalImages || []);
      } catch (error) {
        console.error('Error fetching AI Astro images:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAstroImages();
  }, [aiAstroId]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `${astroName || 'AI Astro'} Images`,
    });
  }, [navigation, astroName]);

  if (loading) {
    return (
      <View
        style={[
          styles.center,
          { backgroundColor: isDarkMode ? colors.darkSurface : '#fff' },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={isDarkMode ? colors.white : colors.black}
        />
      </View>
    );
  }

  if (images.length === 0) {
    return (
      <View
        style={[
          styles.center,
          { backgroundColor: isDarkMode ? colors.darkSurface : '#fff' },
        ]}
      >
        <Text
          style={{
            color: isDarkMode ? '#fff' : '#000',
            fontSize: 16,
            fontWeight: '500',
          }}
        >
          No additional images available
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? colors.darkSurface : '#fff' },
      ]}
    >
      <FlatList
        data={images}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedImage(item)}
            style={styles.imageWrapper}
          >
            <Image source={{ uri: item }} style={styles.image} />
          </TouchableOpacity>
        )}
        numColumns={2}
      />

      {/* Full Screen Modal */}
      <Modal
        visible={!!selectedImage}
        transparent={true}
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.modalContainer}>
          <Pressable
            style={styles.closeArea}
            onPress={() => setSelectedImage(null)}
          />
          <Image source={{ uri: selectedImage }} style={styles.fullImage} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  imageWrapper: {
    width: '45%',
    height: 200,
    borderRadius: 12,
    margin: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeArea: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
  },
  fullImage: {
    width: '90%',
    height: '70%',
    resizeMode: 'contain',
    borderRadius: 12,
  },
});

export default AIAstroImages;
