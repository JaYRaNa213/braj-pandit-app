import React from 'react';
import {
  Dimensions,
  Image,
  Modal,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

const ImageModal = ({
  isImageModalVisible,
  setIsImageModalVisible,
  imageUrl,
}) => {
  return (
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
            source={{ uri: imageUrl }}
            style={{
              width: Dimensions.get('window').width,
              height: Dimensions.get('window').height,
            }}
            resizeMode="contain"
          />
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ImageModal;
