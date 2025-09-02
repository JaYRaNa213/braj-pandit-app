import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../assets/constants/colors';
import { useTheme } from '../context/ThemeContext';

const HomePageIcon = ({ icon, title, navigate, imageSrc }) => {
  const navigation = useNavigation();

  const { textColor } = useTheme();

  return (
    <TouchableOpacity
      style={{ alignItems: 'center' }}
      onPress={() => navigation.navigate(navigate)}
    >
      <View
        style={{
          backgroundColor: colors.purple,
          alignItems: 'center',
          justifyContent: 'center',
          borderColor: 'white',
          borderWidth: 1,
          borderRadius: 4,
        }}
      >
        <Image source={{ uri: imageSrc }} style={{ width: 70, height: 70 }} />
      </View>
      <View style={{ marginTop: 4, alignItems: 'center' }}>
        <Text style={{ color: textColor, fontSize: 12 }}>
          {title.split(' ')[0]}
        </Text>
        <Text style={{ color: textColor, fontSize: 12 }}>
          {title.split(' ')[1]}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default HomePageIcon;
