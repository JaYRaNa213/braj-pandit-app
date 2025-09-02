import React from 'react';
import { View, TextInput } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { colors } from '../../assets/constants/colors';

const SearchBar = () => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.lightGray,
        borderRadius: 8,
        padding: 8,
        marginBottom: 12,
      }}
    >
      <FontAwesome name="search" size={20} color="gray" />
      <TextInput style={{ marginLeft: 8, flex: 1 }} placeholder="Search" />
    </View>
  );
};

export default SearchBar;
