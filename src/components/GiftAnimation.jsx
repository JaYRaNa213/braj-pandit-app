import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Easing,
  Dimensions
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const GiftAnimation = ({ gift, onComplete }) => {
  const [visible, setVisible] = useState(true);
  
  // Animation values
  const translateY = useRef(new Animated.Value(-100)).current;
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animation sequence
    Animated.sequence([
      // Slide in and fade in
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.elastic(1)
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.elastic(1)
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true
        })
      ]),
      
      // Bounce effect
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.2,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ]),
      
      // Hold for a moment
      Animated.delay(1500),
      
      // Fade out
      Animated.timing(opacity, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true
      })
    ]).start(() => {
      // Animation complete
      setVisible(false);
      if (onComplete) onComplete();
    });
  }, []);

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [
            { translateY },
            { scale }
          ],
          opacity
        }
      ]}
    >
      <View style={styles.giftContainer}>
        <View style={styles.giftHeader}>
          <Text style={styles.giftTitle}>🎁 GIFT RECEIVED! 🎁</Text>
        </View>
        
        <View style={styles.giftContent}>
          {gift.giftIcon && (
            <Image 
              source={{ uri: gift.giftIcon }} 
              style={styles.giftIcon} 
              resizeMode="contain" 
            />
          )}
          <View style={styles.giftTextContainer}>
            <Text style={styles.userName}>{gift.userName}</Text>
            <Text style={styles.giftName}>sent {gift.giftName}</Text>
            <View style={styles.giftPriceContainer}>
              <Ionicons name="diamond" size={14} color="#FFD700" />
              <Text style={styles.giftPrice}>{gift.giftPrice || gift.price}</Text>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    width: SCREEN_WIDTH * 0.8,
    zIndex: 1000
  },
  giftContainer: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFD700'
  },
  giftHeader: {
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center'
  },
  giftTitle: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 16
  },
  giftContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center'
  },
  giftIcon: {
    width: 60,
    height: 60,
    marginRight: 12
  },
  giftTextContainer: {
    flex: 1
  },
  userName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  giftName: {
    color: 'white',
    fontSize: 14,
    marginTop: 2
  },
  giftPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6
  },
  giftPrice: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 4
  }
});

export default GiftAnimation; 