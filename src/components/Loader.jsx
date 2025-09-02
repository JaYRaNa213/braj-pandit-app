import React from 'react';
import { View } from 'react-native';
import { colors } from '../assets/constants/colors';

export const SkeletonLoader = () => {
  return (
    <View style={{ gap: 12, marginHorizontal: 16 }}>
      <View
        style={{
          width: '100%',
          height: 130,
          borderRadius: 12,
          backgroundColor: '#DDDDDD',
        }}
      />
      <View
        style={{
          width: '100%',
          height: 130,
          borderRadius: 12,
          backgroundColor: '#DDDDDD',
        }}
      />
      <View
        style={{
          width: '100%',
          height: 130,
          borderRadius: 12,
          backgroundColor: '#DDDDDD',
        }}
      />
      <View
        style={{
          width: '100%',
          height: 130,
          borderRadius: 12,
          backgroundColor: '#DDDDDD',
        }}
      />
      <View
        style={{
          width: '100%',
          height: 130,
          borderRadius: 12,
          backgroundColor: '#DDDDDD',
        }}
      />
    </View>
  );
};

export const SkeletonLoaderChat = () => {
  return (
    <View style={{ gap: 4 }}>
      <View
        style={{ width: '100%', height: 60, backgroundColor: colors.lightGray }}
      />
      <View
        style={{ width: '100%', height: 60, backgroundColor: colors.lightGray }}
      />
      <View
        style={{ width: '100%', height: 60, backgroundColor: colors.lightGray }}
      />
      <View
        style={{ width: '100%', height: 60, backgroundColor: colors.lightGray }}
      />
      <View
        style={{ width: '100%', height: 60, backgroundColor: colors.lightGray }}
      />
      <View
        style={{ width: '100%', height: 60, backgroundColor: colors.lightGray }}
      />
      <View
        style={{ width: '100%', height: 60, backgroundColor: colors.lightGray }}
      />
      <View
        style={{ width: '100%', height: 60, backgroundColor: colors.lightGray }}
      />
      <View
        style={{ width: '100%', height: 60, backgroundColor: colors.lightGray }}
      />
      <View
        style={{ width: '100%', height: 60, backgroundColor: colors.lightGray }}
      />
      <View
        style={{ width: '100%', height: 60, backgroundColor: colors.lightGray }}
      />
      <View
        style={{ width: '100%', height: 60, backgroundColor: colors.lightGray }}
      />
      <View
        style={{ width: '100%', height: 60, backgroundColor: colors.lightGray }}
      />
      <View
        style={{ width: '100%', height: 60, backgroundColor: colors.lightGray }}
      />
      <View
        style={{ width: '100%', height: 60, backgroundColor: colors.lightGray }}
      />
    </View>
  );
};

export const SkeletonLoaderAstrologerCardSmall = () => {
  return (
    <View
      style={{
        padding: 12,
        width: 140,
        height: 180,
        borderRadius: 10,
        backgroundColor: colors.lightGray,
      }}
    />
  );
};
