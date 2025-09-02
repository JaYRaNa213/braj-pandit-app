import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../assets/constants/colors';
import { useTheme } from '../context/ThemeContext';
import { userExist } from '../redux/reducer/userReducer';
import axiosInstance from '../utils/axiosInstance';
import { sunsignImages } from '../utils/constants';
import WithSafeArea from '../components/HOC/SafeAreaView';
('expo-image-picker');

const UserProfile = () => {
  const { t } = useTranslation();
  const { user, session: currentSession } = useSelector((state) => state.user);
  const { isDarkMode } = useTheme();

  const [image, setImage] = useState('');
  const [name, setName] = useState('');
  // const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [DOB, setDOB] = useState('');
  const [TOB, setTOB] = useState('');
  const [POB, setPOB] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const [loading, setLoading] = useState(false);

  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);

  const [sunsignsImageModalOpen, setSunsignsImageModalOpen] = useState(false);

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const pickImage = async () => {
    try {
      const result = await ImagePicker.openPicker({
        mediaType: 'photo', // Options: 'photo', 'video', or 'any'
        cropping: true, // Enable cropping
        cropperCircleOverlay: false, // Optional: Circular crop
        compressImageQuality: 1, // Image quality (1 = highest)
        width: 300, // Optional: Resize width
        height: 300, // Optional: Resize height
      });

      setImage(result.path); // Get the URI of the selected and cropped image
      setSunsignsImageModalOpen(false);
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('profile.screenHead'),
    });
  }, [navigation, t]);

  const handleSave = async () => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('gender', gender);
      formData.append('TOB', String(TOB));
      formData.append('DOB', String(DOB));
      formData.append('POB', POB);
      // formData.append('phone', phone);
      formData.append('city', city);
      formData.append('state', state);
      formData.append('pincode', pincode);
      formData.append('address', address);

      const images = sunsignImages.map((img) => img.image);

      if (image && image !== user?.pic && !images.includes(image)) {
        const response = await fetch(image);
        const blob = await response.blob();
        formData.append('files', {
          uri: image,
          type: blob.type,
          name: 'profile.jpg',
        });
      } else {
        formData.append('pic', image);
      }

      console.log('formData', formData);

      const res = await axiosInstance.post('/user/update', formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res?.data?.success) {
        ToastAndroid.show('Profile updated successfully', ToastAndroid.SHORT);
        const currentSessionData = res?.data?.user?.sessions?.find(
          (s) => s.token === currentSession.token,
        );
        dispatch(
          userExist({ user: res?.data?.user, session: currentSessionData }),
        );
      } else {
        ToastAndroid.show(
          res?.error?.data?.message || 'Failed to update profile',
          ToastAndroid.SHORT,
        );
      }
    } catch (error) {
      console.error('Error updating profile:', error.message);
      ToastAndroid.show(
        error?.response?.data?.message || 'Failed to update profile',
        ToastAndroid.SHORT,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setName(user?.name || '');
    // setPhone(user?.phone?.toString() || '');
    setGender(user?.gender || '');
    setAddress(user?.address || '');
    setCity(user?.city || '');
    setState(user?.state || '');
    setPincode(user?.pincode || '');
    setDOB(user?.DOB || '');
    setTOB(user?.TOB || '');
    setPOB(user?.POB || '');
    setImage(user?.pic || '');
  }, [navigation, user, dispatch]);

  return (
    <View
      style={{
        backgroundColor: isDarkMode
          ? colors.darkBackground
          : colors.lightBackground,
        gap: 10,
        flex: 1,
      }}
    >
      <ScrollView
        contentContainerStyle={{
          gap: 30,
          paddingVertical: 20,
          paddingHorizontal: 16,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <View
            style={{
              borderRadius: 75,
              padding: 0,
              alignItems: 'center',
              alignSelf: 'center',
            }}
          >
            {image ? (
              <TouchableOpacity onPress={() => setIsImageModalVisible(true)}>
                <Image
                  source={{ uri: image || 'image' }}
                  style={{ width: 150, height: 150, borderRadius: 75 }}
                />
              </TouchableOpacity>
            ) : (
              <Ionicons
                name="person-circle-sharp"
                size={150}
                color={isDarkMode ? 'white' : '#333'}
              />
            )}
          </View>
          <Text
            style={{
              color: isDarkMode ? colors.lightGray : colors.gray,
              alignSelf: 'center',
              marginTop: 20,
            }}
          >
            {user?.phone}
          </Text>
          <TouchableOpacity
            style={{ position: 'absolute', right: 110, bottom: 40 }}
            onPress={() => setSunsignsImageModalOpen(true)}
          >
            <FontAwesome
              name="cloud-upload"
              size={24}
              color={isDarkMode ? 'white' : 'black'}
            />
          </TouchableOpacity>
        </View>

        <InputField
          label={t('profile.name')}
          value={name}
          setValue={setName}
          placeholder={t('profile.placeHolders.name')}
          isDarkMode={isDarkMode}
        />
        {/*<InputField
          label={t('profile.phone')}
          value={phone}
          setValue={setPhone}
          placeholder={t('profile.placeHolders.phone')}
          keyboardType="numeric"
          isDarkMode={isDarkMode}
        />*/}

        {/* Gender Input */}
        <View style={{ gap: 14, flexDirection: 'row' }}>
          <Text
            style={{
              color: isDarkMode ? colors.lightGray : colors.gray,
              fontSize: 18,
            }}
          >
            {t('profile.gender')}
          </Text>
          <View style={{ flexDirection: 'row', gap: 28 }}>
            <TouchableOpacity
              onPress={() => setGender('male')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderWidth: 2,
                  borderRadius: 100,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  borderColor: isDarkMode ? colors.lightGray : colors.gray,
                }}
              >
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 100,
                    backgroundColor:
                      gender === 'male'
                        ? isDarkMode
                          ? colors.lightGray
                          : colors.gray
                        : 'transparent',
                  }}
                />
              </View>
              <Text
                style={{
                  color: isDarkMode ? colors.lightGray : colors.gray,
                  fontSize: 16,
                }}
              >
                {t('profile.genderType.male')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setGender('female')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderWidth: 2,
                  borderRadius: 100,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  borderColor: isDarkMode ? colors.lightGray : colors.gray,
                }}
              >
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 100,
                    backgroundColor:
                      gender === 'female'
                        ? isDarkMode
                          ? colors.lightGray
                          : colors.gray
                        : 'transparent',
                  }}
                />
              </View>
              <Text
                style={{
                  color: isDarkMode ? colors.lightGray : colors.gray,
                  fontSize: 16,
                }}
              >
                {t('profile.genderType.female')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* DOB Input */}
        <View style={{ position: 'relative' }}>
          <Text
            style={{
              fontSize: 18,
              color: isDarkMode ? colors.lightGray : colors.gray,
            }}
          >
            {t('profile.DOB')}
          </Text>
          <FontAwesome
            name="calendar"
            r
            size={20}
            color={isDarkMode ? '#999' : colors.gray}
            style={{ position: 'absolute', top: 40, left: 10 }}
          />
          <TouchableOpacity
            onPress={() => setIsDatePickerVisible(!isDatePickerVisible)}
          >
            <TextInput
              style={{
                width: '100%',
                borderColor: 'gray',
                borderBottomWidth: 2,
                paddingHorizontal: 8,
                paddingVertical: 4,
                color: isDarkMode ? '#fff' : '#000',
                fontSize: 16,
                paddingLeft: 40,
                marginTop: 8,
              }}
              placeholder={t('profile.placeHolders.DOB')}
              placeholderTextColor={isDarkMode ? '#999' : colors.gray}
              value={DOB ? moment(new Date(DOB)).format('DD MMM, YYYY') : ''}
              editable={false}
            />
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={(val) => {
              setDOB(val);
              setIsDatePickerVisible(false);
            }}
            onCancel={() => setIsDatePickerVisible(false)}
          />
        </View>

        {/* TOB Input */}
        <View style={{ position: 'relative' }}>
          <Text
            style={{
              fontSize: 18,
              color: isDarkMode ? colors.lightGray : colors.gray,
            }}
          >
            {t('profile.TOB')}
          </Text>
          <FontAwesome
            name="clock-o"
            size={20}
            color={isDarkMode ? '#999' : colors.gray}
            style={{ position: 'absolute', top: 39, left: 10 }}
          />
          <TouchableOpacity onPress={() => setIsTimePickerVisible(true)}>
            <TextInput
              style={{
                width: '100%',
                borderColor: 'gray',
                borderBottomWidth: 2,
                paddingHorizontal: 8,
                paddingVertical: 4,
                color: isDarkMode ? '#fff' : '#000',
                fontSize: 16,
                paddingLeft: 40,
                marginTop: 8,
              }}
              placeholder={t('profile.placeHolders.TOB')}
              placeholderTextColor={isDarkMode ? '#999' : colors.gray}
              value={TOB ? moment(TOB).format('hh:mm A') : ''}
              editable={false}
            />
          </TouchableOpacity>

          <DateTimePickerModal
            isVisible={isTimePickerVisible}
            mode="time"
            onConfirm={(val) => {
              setTOB(val);
              setIsTimePickerVisible(false);
            }}
            onCancel={() => setIsTimePickerVisible(false)}
          />
        </View>

        <InputField
          label={t('profile.POB')}
          value={POB}
          setValue={setPOB}
          placeholder={t('profile.placeHolders.POB')}
          isDarkMode={isDarkMode}
        />
        <InputField
          label={t('profile.address')}
          value={address}
          setValue={setAddress}
          placeholder={t('profile.placeHolders.address')}
          isDarkMode={isDarkMode}
        />
        <InputField
          label={t('profile.city')}
          value={city}
          setValue={setCity}
          placeholder={t('profile.placeHolders.city')}
          isDarkMode={isDarkMode}
        />
        <InputField
          label={t('profile.state')}
          value={state}
          setValue={setState}
          placeholder={t('profile.placeHolders.state')}
          isDarkMode={isDarkMode}
        />
        <InputField
          label={t('profile.pincode')}
          value={pincode}
          setValue={setPincode}
          placeholder={t('profile.placeHolders.pincode')}
          keyboardType="numeric"
          isDarkMode={isDarkMode}
        />
      </ScrollView>

      <TouchableOpacity
        onPress={handleSave}
        style={{ width: '100%' }}
        disabled={loading}
      >
        <View
          style={{
            backgroundColor: colors.purple,
            padding: 14,
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <Text style={{ color: '#fff', textAlign: 'center', fontSize: 16 }}>
            {t('profile.button')}
          </Text>

          {loading && <ActivityIndicator size={'small'} color={'white'} />}
        </View>
      </TouchableOpacity>

      {/* Modal for Full-Screen Image Display */}
      <Modal
        visible={isImageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsImageModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsImageModalVisible(false)}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
            }}
          >
            <Image
              source={{ uri: image }}
              style={{
                width: Dimensions.get('window').width,
                height: Dimensions.get('window').height,
              }}
              resizeMode="contain"
            />
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <Modal
        visible={sunsignsImageModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSunsignsImageModalOpen(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 26,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
          }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'white',
            }}
          >
            <TouchableOpacity
              onPress={() => setSunsignsImageModalOpen(false)}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                zIndex: 1,
              }}
            >
              <Ionicons name="close" size={26} color="gray" />
            </TouchableOpacity>
            <View
              style={{
                marginTop: 12,
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 16,
                justifyContent: 'center',
              }}
            >
              {sunsignImages.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setImage(img.image);
                    setSunsignsImageModalOpen(false);
                  }}
                  style={{ justifyContent: 'center', alignItems: 'center' }}
                >
                  <Image
                    src={img.image}
                    alt="Sunsign"
                    style={{ width: 62, height: 62, borderRadius: 120 }}
                  />
                  <Text style={{ fontSize: 12, marginTop: 4 }}>{img.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: colors.purple,
                padding: 14,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 20,
                borderRadius: 12,
              }}
              onPress={pickImage}
            >
              <Text
                style={{
                  color: '#fff',
                  textAlign: 'center',
                  fontSize: 16,
                }}
              >
                Select from library
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const InputField = ({
  label,
  value,
  setValue,
  placeholder,
  keyboardType = 'default',
  isDarkMode,
}) => {
  return (
    <View style={{ gap: 8 }}>
      <Text
        style={{
          color: isDarkMode ? colors.lightGray : colors.gray,
          fontSize: 18,
        }}
      >
        {label}
      </Text>
      <TextInput
        style={{
          width: '100%',
          borderColor: 'gray',
          borderBottomWidth: 2,
          paddingHorizontal: 8,
          color: isDarkMode ? '#fff' : '#000',
          fontSize: 16,
        }}
        onChangeText={(text) => setValue(text)}
        value={value}
        placeholder={placeholder}
        placeholderTextColor={isDarkMode ? '#999' : '#666'}
        keyboardType={keyboardType}
      />
    </View>
  );
};

export default WithSafeArea(UserProfile);
