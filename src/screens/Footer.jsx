import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { colors } from '../assets/constants/colors';
import LanguageSwitcherModal from '../components/LanguageSwitcherModal';
import { useTheme } from '../context/ThemeContext';
import Astrologers from './Astrologers';
import ChatSummary from './ChatSummary';
import Home from './Home';
import LiveStreamViewer from './LiveStreamViewer';
import Tools from './Tools';

function Footer() {
  const BottomTabs = createBottomTabNavigator();
  const { isDarkMode } = useTheme();
  const { user } = useSelector((state) => state.user);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const { t } = useTranslation();
  const [language, setLanguage] = useState('en');
  const navigation = useNavigation();

  const tabBarIcon = ({ focused, color, size, route }) => {
    let iconName;

    // Set icon based on route name
    if (route.name === 'Home') {
      iconName = focused ? 'home' : 'home-outline';
    } else if (route.name === 'Astrologers') {
      iconName = focused ? 'people' : 'people-outline';
    } else if (route.name === 'Chat') {
      iconName = focused
        ? 'chatbubble-ellipses'
        : 'chatbubble-ellipses-outline';
    } else if (route.name === 'Call') {
      iconName = focused ? 'call' : 'call-outline';
    } else if (route.name === 'Tools') {
      iconName = focused ? 'build' : 'build-outline';
    } else if (route.name === 'LiveStreams') {
      iconName = focused ? 'videocam' : 'videocam-outline';
    }
    return (
      <Ionicons
        name={iconName}
        size={size}
        color={isDarkMode ? 'white' : colors.purple}
      />
    );
  };

  const headerRight = () => (
    <View style={{ flexDirection: 'row' }}>
      <TouchableOpacity>
        <Ionicons
          name="language"
          size={24}
          color="white"
          style={{ marginRight: 20 }}
          onPress={() => setShowLanguageModal(true)}
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          navigation.navigate('UserOptions');
        }}
      >
        {user?.pic ? (
          <Image
            source={{ uri: user?.pic }}
            style={{
              width: 24,
              height: 24,
              borderRadius: 75,
              marginRight: 20,
            }}
          />
        ) : (
          <Ionicons
            name="person-circle-sharp"
            size={24}
            color="white"
            style={{ marginRight: 20 }}
          />
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <BottomTabs.Navigator
        initialRouteName="Home"
        backBehavior="history"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            return tabBarIcon({ focused, color, size, route });
          },
          tabBarLabelStyle: {
            color: isDarkMode ? 'white' : 'black',
            fontSize: 11,
            marginBottom: 0, // Remove bottom margin
          },
          tabBarIconStyle: {
            marginTop: 0, // Prevent shifting of icon
          },
          tabBarItemStyle: {
            paddingVertical: 0, // Remove padding
            justifyContent: 'center', // Ensure center alignment
            alignItems: 'center',
          },
          tabBarStyle: {
            height: 54,
            backgroundColor: isDarkMode ? colors.darkBackground : 'white',
            borderTopColor: '#ccc',
            borderTopWidth: 0.5,
            paddingBottom: 0,
            paddingTop: 0,
          },
          headerStyle: {
            backgroundColor: colors.purple,
          },
          headerTintColor: 'white',
          cardStyle: {
            backgroundColor: isDarkMode ? '#121212' : 'white',
          },
          headerRight: () => headerRight(),
        })}
      >
        <BottomTabs.Screen
          name="Home"
          component={Home}
          options={{
            tabBarLabel: t('footer.home'),
          }}
        />
        <BottomTabs.Screen
          name="Astrologers"
          component={Astrologers}
          options={{
            tabBarLabel: t('footer.astrologers'),
          }}
        />
        <BottomTabs.Screen
          name="LiveStreams"
          component={LiveStreamViewer}
          options={{
            headerTitle: t('footer.liveStreams'),
            tabBarLabel: t('footer.live'),
          }}
        />
        <BottomTabs.Screen
          name="Chat"
          component={ChatSummary}
          options={{
            tabBarLabel: t('footer.chats'),

          }}
        />
        {/* <BottomTabs.Screen
          name="Call"
          component={CallSummary}
          options={{
            tabBarLabel: t('footer.calls'),
          }}
        /> */}
        <BottomTabs.Screen
          name="Tools"
          component={Tools}
          options={{
            tabBarLabel: t('footer.tools'),
          }}
        />
      </BottomTabs.Navigator>

      <LanguageSwitcherModal
        isVisible={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        setLanguage={setLanguage}
      />
    </SafeAreaView>
  );
}

export default Footer;
