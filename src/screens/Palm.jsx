import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Button,
  Dimensions,
  Image,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { useSelector } from 'react-redux';
import { colors } from '../assets/constants/colors';
import WithSafeArea from '../components/HOC/SafeAreaView';
import axiosInstance from '../utils/axiosInstance';
import {useTheme} from '../context/ThemeContext'
import { t } from 'i18next';

const Palm = ({ navigation }) => {
  const [image, setImage] = useState(null);
  const [imageAspectRatio, setImageAspectRatio] = useState(1); // Default aspect ratio
  const [hasPermission, setHasPermission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [flashOn, setFlashOn] = useState(false);
  const loadingStages = ['Uploading...', 'Analyzing...', 'You seem lucky!'];
  const loadingIndex = useRef(0);
  const { user } = useSelector((state) => state.user);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const device = useCameraDevice('back');
  const cameraRef = useRef(null);
  const {isDarkMode}=useTheme();

  // Get image dimensions when an image is selected or captured
  const updateImageDimensions = (uri) => {
    Image.getSize(
      uri,
      (width, height) => {
        setImageAspectRatio(width / height);
      },
      (error) => {
        console.log('Error getting image size:', error);
        setImageAspectRatio(1); // Fallback to square aspect ratio
      },
    );
  };

  useEffect(() => {
    const requestCameraPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs access to your camera to scan your palm.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        setHasPermission(true);
      }
    };

    requestCameraPermission();
  }, []);

  useEffect(() => {
    let interval;
    if (loading) {
      loadingIndex.current = 0;
      setLoadingText(loadingStages[loadingIndex.current]);
      Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      interval = setInterval(() => {
        loadingIndex.current += 1;
        if (loadingIndex.current < loadingStages.length) {
          setLoadingText(loadingStages[loadingIndex.current]);
        }
      }, 2000);
    } else {
      setLoadingText('');
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim).stop();
    }
    return () => clearInterval(interval);
  }, [loading, fadeAnim]);

  const pickImage = async () => {
    try {
      const pickedImage = await ImagePicker.openPicker({
        width: 200,
        height: 400,
      });

      const imageData = {
        uri: pickedImage.path,
        name: 'palm.jpg',
        type: pickedImage.mime,
      };
      setImage(imageData);
      updateImageDimensions(imageData.uri);
    } catch (error) {
      console.log('Image picker error:', error);
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePhoto({
          width: 200,
          height: 400,
        });
        const imageData = {
          uri: `file://${photo.path}`,
          name: 'palm.jpg',
          type: 'image/jpeg',
        };
        setImage(imageData);
        updateImageDimensions(imageData.uri);
        setFlashOn(false);
      } catch (error) {
        console.log('Camera error:', error);
        Alert.alert('Error', 'Failed to capture image.');
      }
    }
  };

  const toggleFlash = () => {
    if (device?.hasTorch) {
      setFlashOn((prev) => !prev);
    } else {
      Alert.alert(
        'No Flash Available',
        'This device does not support a flashlight.',
      );
    }
  };

  const viewHistory = async () => {
    if (user) {
      try {
        console.log('Fetching last three palm readings...');
        const res = await axiosInstance.get('/palm/lastthreereadings');
        if (res.data && res.data.success) {
          navigation.navigate('PalmReadingHistory', { result: res.data.data });
        }
      } catch (err) {
        console.error('Internal error:', err?.response?.data || err.message);
      }
    } else {
      Alert.alert(
        'Login Required',
        'Please login to view your palm reading history.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Login',
            onPress: () => navigation.navigate('Login'),
          },
        ],
      );
    }
  };

  const submit = async () => {
    if (!image) {
      Alert.alert('No image', 'Please capture or pick an image first.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('palmImage', {
      uri: image.uri,
      name: image.name,
      type: image.type,
    });

    try {
      const res = await axiosInstance.post('/palm/read', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data && res.data.success && res.data.fortune) {
        const fortuneObj = JSON.parse(res.data.fortune);
        navigation.navigate('PalmReadingResult', { result: fortuneObj });
      } else {
        Alert.alert('No reading found', 'Please try again.');
      }
    } catch (err) {
      console.error('Upload error:', err?.response?.data || err.message);
      if (err.response && err.response.status === 413) {
        Alert.alert(
          'Image Too Large',
          'The selected image is too large. Please try a smaller image or capture a new one.',
        );
      } else {
        Alert.alert(
          'Upload Failed',
          'Could not process image. Please try again.',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setFlashOn(false);
    setImageAspectRatio(1);
  };

  const headerRight = () => (
    <TouchableOpacity onPress={viewHistory} style={{ marginRight: 24 }}>
      <Ionicons name="list" size={26} color="#fff" />
    </TouchableOpacity>
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('sidebar.palmreading'),
      headerRight: () => (user ? headerRight() : null),
    });
  }, [navigation]);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <View style={{backgroundColor:isDarkMode ? colors.darkBackground : colors.lightBackground}}>
      <Text>{t('sidebar.noAccessToCamera')}</Text>
    </View>;
  }
  if (!device) {
    return <View style={{backgroundColor:isDarkMode ? colors.darkBackground : colors.lightBackground}}>
      <Text>No camera device available</Text>
    </View>;
  }

  return (
    <ScrollView contentContainerStyle={[styles.container,{backgroundColor:isDarkMode ? colors.darkBackground:colors.lightBackground}]}>
      {image ? (
        <View
          style={[
            styles.imageContainer,
            {
              maxWidth: Dimensions.get('window').width - 40, // Account for margins
              aspectRatio: imageAspectRatio, // Default aspect ratio for palm images
              backgroundColor:isDarkMode ? colors.darkBackground:colors.lightBackground,
            },
          ]}
        >
          <Image
            source={{ uri: image.uri }}
            style={styles.image}
            resizeMode="contain"
          />
          <TouchableOpacity style={styles.clearButton} onPress={clearImage}>
            <Ionicons name="close-circle" size={36} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.cameraContainer,{
          backgroundColor:isDarkMode ? colors.darkBackground:colors.lightBackground
          }]}>
          <Camera
            style={styles.camera}
            device={device}
            isActive={true}
            photo={true}
            ref={cameraRef}
            torch={flashOn ? 'on' : 'off'}
            photoQualityBalance="speed"
          />
          <View style={styles.overlay}>
            <View style={styles.centerBox} />
            <Text style={styles.overlayTextTop}>
              Keep your palm flat and steady{' '}
            </Text>
            <Text style={styles.overlayText}>
              Place your palm in the center
            </Text>
            <TouchableOpacity style={styles.flashButton} onPress={toggleFlash}>
              <Ionicons
                name={flashOn ? 'flash' : 'flash-off'}
                size={30}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!loading && !image && (
        <View style={[styles.buttonContainer,{backgroundColor:isDarkMode ? colors.darkBackground:colors.lightBackground}]}>
          <TouchableOpacity onPress={pickImage} style={[styles.galleryButton,{  backgroundColor: '#999'}]}>
            <Ionicons name="images" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={takePicture} style={styles.shutterButton}>
            <Ionicons name="camera" size={40} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.submitButton}>
        <TouchableOpacity
          onPress={submit}
          disabled={loading || !image}
          style={[
            styles.customButton,
            {
              backgroundColor: (loading || !image)
                ? isDarkMode ? colors.dark
                : '#CCCCCC'
                : isDarkMode
                ? colors.darkAccent
                : '#7C00FE',
            },
          ]}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText]}>✨ Submit for Reading</Text>
        </TouchableOpacity>
      </View>


      {loading && (
        <View style={[styles.loadingContainer,{backgroundColor:isDarkMode ? colors.darkBackground:colors.lightBackground}]}>
          <ActivityIndicator size="large" color={isDarkMode ? colors.darkAccent :"#7C00FE"} />
          <Animated.Text style={[styles.loadingText, { opacity: fadeAnim,color:isDarkMode ? colors.darkAccent :"#7C00FE"}
          ]}>
            {loadingText}
          </Animated.Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  cameraContainer: {
    height: 500,
    borderRadius: 12,
    margin: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  camera: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  centerBox: {
    width: 250,
    height: 300,
    borderWidth: 3,
    borderColor: '#fff',
    borderStyle: 'dashed',
    borderRadius: '50%',
  },
  overlayTextTop: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 30,
    position: 'absolute',
    top: 20,
  },
  overlayText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 30,
    position: 'absolute',
    bottom: 20,
  },
  flashButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
    padding: 10,
  },
  imageContainer: {
    margin: 20,
    borderRadius: 25,
    overflow: 'hidden',
    position: 'relative',
    maxHeight: 500,
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  clearButton: {
    position: 'absolute',
    top: 20,
    right: 4,
    borderRadius: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  galleryButton: {
    borderRadius: 50,
    padding: 10,
    marginRight: 20,
    position: 'absolute',
    left: 50,
  },
  shutterButton: {
    backgroundColor: colors.purple,
    borderRadius: 50,
    padding: 20,
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  viewHistoryButton: {
    backgroundColor: '#999',
    borderRadius: 50,
    padding: 10,
    marginLeft: 20,
    position: 'absolute',
    right: 50,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
   submitButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  customButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderRadius: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 14,
    fontSize: 20,
    color: colors.purple,
    fontWeight: '700',
    letterSpacing: 1,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default WithSafeArea(Palm);
