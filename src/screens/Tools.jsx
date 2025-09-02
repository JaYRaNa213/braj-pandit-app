import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../assets/constants/colors';
import { useTheme } from '../context/ThemeContext';

const appScreens = {
  palmReader: {
    id: '1',
    name: 'palmReader',
    route: 'Palm',
    imageUrl: require('../assets/images/palmistry.jpg'),
  },
  horoscope: {
    id: '2',
    name: 'horoscope',
    route: 'GeneralHoroscope',
    imageUrl: require('../assets/images/horoscope.jpg'),
  },
  kundli: {
    id: '3',
    name: 'kundli',
    route: 'Kundli',
    imageUrl: require('../assets/images/kundli.jpg'),
  },
  community: {
    id: '4',
    name: 'community',
    route: 'Community',
    imageUrl: require('../assets/images/community.jpg'),
  },
  compatibility: {
    id: '5',
    name: 'compatibility',
    route: 'Compatibility',
    imageUrl: require('../assets/images/compatibility1.jpg'),
  },
  loveCalculator: {
    id: '6',
    name: 'loveCalculator',
    route: 'LoveCalculator',
    imageUrl: require('../assets/images/lovecalculator.jpg'),
  },
  temples: {
    id: '7',
    name: 'temples',
    route: 'Temples',
    imageUrl: require('../assets/images/temple.jpg'),
  },
  kundliMatch: {
    id: '8',
    name: 'kundliMatch',
    route: 'KundliMatching',
    imageUrl: require('../assets/images/kundliMatching.jpg'),
  },
  blogs: {
    id: '9',
    name: 'blogs',
    route: 'Blogs',
    imageUrl: require('../assets/images/blogs.jpg'),
  },
};

const { width: screenWidth } = Dimensions.get('screen');
const { height: windowHeight } = Dimensions.get('window');

const hPaddingContainer = 5;
const hMarginItem = 5;

const WIDTH_ITEM_FULL = screenWidth - 2 * hPaddingContainer - 2 * hMarginItem;
const WIDTH_ITEM_HALF =
  (screenWidth - 2 * hPaddingContainer - 4 * hMarginItem) / 2;
const WIDTH_ITEM_THIRD =
  (screenWidth - 2 * hPaddingContainer - 7 * hMarginItem) / 3;

const HEIGHT_ITEM = (windowHeight - 300) / 5;

function AppScreen({ item, itemWidth }) {
  const { isDarkMode } = useTheme();
  const navigation = useNavigation();
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      style={[
        styles.menuItem,
        {
          width: itemWidth,
          borderColor: isDarkMode ? colors.dark : colors.purple,
        },
      ]}
      onPress={() => navigation.navigate(item.route)}
    >
      <Image
        source={item.imageUrl}
        style={[styles.menuItemImage, { width: itemWidth }]}
        resizeMethod="resize"
      />
      <View style={styles.imageOverlay} />
      <Text style={[styles.menuText]}>{t('tools.' + item.name)}</Text>
    </TouchableOpacity>
  );
}
export default function Tools({ route }) {
  const { isDarkMode } = useTheme();
  const navigation = useNavigation();
  const { t } = useTranslation();

  const searchOptions = [
    'search.love',
    'search.careerAdvice',
    'search.finances',
    'search.relationshipTroubles',
    'search.moneyMatters',
    'search.marriage',
    'search.astrologer',
  ];
  const [searchIndex, setSearchIndex] = useState(0);
  const searchIntervalRef = useRef(null);

  useEffect(() => {
    // Start the interval when the component mounts
    searchIntervalRef.current = setInterval(() => {
      setSearchIndex((prevIndex) => (prevIndex + 1) % searchOptions.length);
    }, 3000); // Change suggestion every 3 seconds (adjust as needed)

    // Clear the interval when the component unmounts to prevent memory leaks
    return () => {
      if (searchIntervalRef.current) {
        clearInterval(searchIntervalRef.current);
      }
    };
  }, [searchOptions.length]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('tools.tools'),
    });
  }, [navigation]);

  return (
    <View
      style={{
        backgroundColor: isDarkMode
          ? colors.darkBackground
          : colors.lightBackground,
        flex: 1,
      }}
    >
      {/* SearchBar */}
      <View
        style={{
          paddingHorizontal: 12,
          marginTop: 20,
          width: '100%',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Pressable
          style={{
            width: '100%',
            zIndex: 100,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            position: 'relative',
          }}
          onPress={() => navigation.navigate('Search')}
        >
          <View
            style={{
              borderRadius: 12,
              width: '100%',
              paddingVertical: 8,
              paddingHorizontal: 8,
              borderColor: isDarkMode ? colors.dark : colors.lightGray,
              borderWidth: 1.5,
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
              backgroundColor: isDarkMode ? colors.darkSurface : colors.white,
            }}
          >
            <Ionicons
              name="search"
              size={18}
              style={{
                width: 18,
                marginRight: 12,
                color: isDarkMode ? 'white' : 'black',
              }}
            />
            <Text
              style={{
                color: isDarkMode ? 'white' : 'black',
                fontSize: 16,
                fontWeight: 400,
              }}
            >
              {t(searchOptions[searchIndex])}
            </Text>
          </View>
          <FontAwesome
            name="microphone"
            size={16}
            color={isDarkMode ? 'white' : 'black'}
            style={{ position: 'absolute', right: '3%' }}
          />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <AppScreen item={appScreens.palmReader} itemWidth={WIDTH_ITEM_FULL} />
          <AppScreen item={appScreens.horoscope} itemWidth={WIDTH_ITEM_HALF} />
          <AppScreen item={appScreens.kundli} itemWidth={WIDTH_ITEM_HALF} />
          <AppScreen item={appScreens.community} itemWidth={WIDTH_ITEM_FULL} />
          <AppScreen
            item={appScreens.compatibility}
            itemWidth={WIDTH_ITEM_HALF}
          />
          <AppScreen
            item={appScreens.loveCalculator}
            itemWidth={WIDTH_ITEM_HALF}
          />
          <AppScreen item={appScreens.blogs} itemWidth={WIDTH_ITEM_THIRD} />
          <AppScreen item={appScreens.temples} itemWidth={WIDTH_ITEM_THIRD} />
          <AppScreen
            item={appScreens.kundliMatch}
            itemWidth={WIDTH_ITEM_THIRD}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: hPaddingContainer,
    paddingTop: 20,
  },
  menuItem: {
    borderRadius: 12,
    marginHorizontal: hMarginItem,
    marginVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
    height: HEIGHT_ITEM,
  },
  menuItemImage: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'absolute',
    width: '100%',
    height: HEIGHT_ITEM,
  },
  menuText: {
    fontSize: 20,
    overflow: 'visible',
    fontWeight: 500,
    color: 'white',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)', // Dark semi-transparent overlay
    borderRadius: 12,
  },
});
