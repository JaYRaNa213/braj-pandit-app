import React from 'react';
import { ActivityIndicator, Modal, View } from 'react-native';

const FullScreenLoader = ({ isRefreshing }) => {
  return (
    <Modal visible={isRefreshing} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#000" />
      </View>
    </Modal>
  );
};

export default FullScreenLoader;
