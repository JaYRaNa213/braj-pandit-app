import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Modal from 'react-native-modal';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../assets/constants/colors';

const ProfilesModalSheet = ({
  isVisible,
  onClose,
  profiles,
  onEdit,
  onAdd,
}) => {
  return (
    <Modal
      isVisible={isVisible}
      onBackButtonPress={onClose}
      onBackdropPress={onClose}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
    >
      <SafeAreaView style={styles.contentContainer}>
        <View style={styles.handle} />
        <Text style={styles.title}>Kundli Profiles</Text>

        {profiles?.map((profile, index) => (
          <TouchableOpacity
            key={profile._id || index}
            style={styles.profileItem}
            onPress={() => onEdit(profile)}
          >
            <MaterialCommunityIcons
              name="account-circle-outline"
              size={24}
              color={colors.purple}
            />
            <Text style={styles.profileName}>{profile.name}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.profileItem, styles.addButton]}
          onPress={onAdd}
        >
          <MaterialCommunityIcons
            name="plus-circle-outline"
            size={24}
            color={'green'}
          />
          <Text style={[styles.profileName, { color: 'green' }]}>
            Add New Profile
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
    // backgroundColor: 'rgba(255, 0, 0, 0.5)',
  },
  contentContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  handle: {
    width: 50,
    height: 5,
    borderRadius: 4,
    backgroundColor: '#cccccc',
    alignSelf: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileName: {
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
  },
  addButton: {
    borderBottomWidth: 0,
    marginTop: 10,
    marginBottom: 20,
  },
});

export default ProfilesModalSheet;
