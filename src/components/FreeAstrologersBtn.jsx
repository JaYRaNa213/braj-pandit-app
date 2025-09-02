import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { colors } from '../assets/constants/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axiosInstance from '../utils/axiosInstance';

const FreeAstrologersBtn = ({ marginBottom = 6 }) => {
  const { user } = useSelector((state) => state.user);
  const navigation = useNavigation();
  const [freeMinutes, setFreeMinutes] = useState(3);

  const getFreeMinutes = async () => {
    try {
      const { data } = await axiosInstance.get('/user/free-minutes');
      setFreeMinutes(data.freeMinutes);
    } catch (error) {
      console.error('Error fetching free minutes:', error);
    }
  };

  React.useEffect(() => {
    if (user?.isFreeAvailable) {
      getFreeMinutes();
    }
  }, [user?.isFreeAvailable]);

  return (
    user?.isFreeAvailable && (
      <View style={{ marginHorizontal: 12 }}>
        <Pressable
          style={{
            position: 'absolute',
            bottom: marginBottom,
            borderColor: colors.purple,
            // borderWidth: 1,
            backgroundColor: colors.purple,
            padding: 8,
            borderRadius: 28,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            gap: 6,
          }}
          onPress={() =>
            navigation.navigate('FreeAstrologers', { freeMinutes })
          }
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            Astrologers with {freeMinutes} min free offer
          </Text>
          <Ionicons name="arrow-forward" size={24} color={'white'} />
        </Pressable>
      </View>
    )
  );
};

export default FreeAstrologersBtn;
