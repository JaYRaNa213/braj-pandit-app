import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import i18n from '../../i18n';
import { colors } from '../assets/constants/colors';
import AIAstro from '../components/AIAstro';
import ChatAndCallButtons from '../components/ChatAndCallButtons';
import FreeAstrologersBtn from '../components/FreeAstrologersBtn';
import Swipers from '../components/Home/Swipers';
import HomePageBlogItem from '../components/HomePageBlogItem';
import HomePageIcon from '../components/HomePageIcon';
import YouTubeModal from '../components/HomePageYtVideoModal';
import LanguageSwitcherModal from '../components/LanguageSwitcherModal';
import YouTubeVideo from '../components/YoutubeVideoCard';
import { useChat } from '../context/ChatContext';
import { useTheme } from '../context/ThemeContext';
import axiosInstance from '../utils/axiosInstance';
import { REACT_APP_BACKEND_URL } from '../utils/domain';

const icons = [
  {
    title: 'dailyHoroscope',
    imgSrc:
      'https://res.cloudinary.com/doetbfahk/image/upload/v1718028355/Vedaz_App/horoscope_anronr.jpg',
    navigate: 'GeneralHoroscope',
  },
  {
    title: 'freeKundli',
    imgSrc:
      'https://res.cloudinary.com/doetbfahk/image/upload/v1718028354/Vedaz_App/kundli_ghmwrz.jpg',
    navigate: 'Kundli',
  },
  {
    title: 'kundliMatching',
    imgSrc:
      'https://res.cloudinary.com/doetbfahk/image/upload/v1718028501/Vedaz_App/kundli-matching_f6gald.jpg',
    navigate: 'KundliMatching',
  },
  {
    title: 'astrologyBlogs',
    imgSrc:
      'https://res.cloudinary.com/doetbfahk/image/upload/v1718083684/Vedaz_App/astrologer_j7bueb.jpg',
    navigate: 'Blogs',
  },
];

function Home() {
  const { t } = useTranslation();
  const lang = i18n.language;
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  const [blogs, setBlogs] = useState([]);

  const { user } = useSelector((state) => state.user);
  const [isYoutubeModalOpen, setIsYoutubeModalOpen] = useState(false);
  const [playingVideoId, setPlayingVideoId] = useState('');

  const { setRefetch, refetch } = useChat();
  const [videos, setVideos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [language, setLanguage] = useState('en');

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

  const onRefresh = () => {
    setRefreshing(true);
    setRefetch(!refetch);
    fetchAllBlogs();
    setRefreshing(false);
  };

  const fetchAllBlogs = async () => {
    try {
      const res = await axiosInstance.get(
        `/blog/all?page=1&lang=${lang || 'en'}`,
      );

      setBlogs(res.data.data.blogs);
    } catch (error) {
      console.log('Error fetching all blogs ', error);
    }
  };

  const fetchVideos = async () => {
    try {
      const { data } = await axios.get(`${REACT_APP_BACKEND_URL}/video/get`);
      setVideos(data?.videos);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAllBlogs();
    fetchVideos();
  }, []);

  const headerRight = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {user && (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('ReferAndEarn');
          }}
          style={{
            width: 100,
            height: 40,
            marginRight: 20,
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color: 'white',
              fontSize: 14,
              paddingHorizontal: 1,
              paddingVertical: 2,
              fontWeight: 500,
              textAlign: 'center',
              borderWidth: 1,
              borderColor: 'gold',
              borderRadius: 12,
            }}
          >
            Refer & Earn
          </Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={() => navigation.navigate('Recharge')}>
        <Ionicons
          name="wallet-outline"
          size={24}
          color="white"
          style={{ marginRight: 20 }}
        />
      </TouchableOpacity>

      <TouchableOpacity>
        <Ionicons
          name="language"
          size={24}
          color="white"
          style={{ marginRight: 20 }}
          onPress={() => {
            setShowLanguageModal(true);
          }}
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

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Vedaz',
      headerRight: () => headerRight(),
    });
  }, [navigation, user, language]);

  return (
    <>
      <ChatAndCallButtons />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          backgroundColor: isDarkMode ? colors.darkBackground : colors.lightBackground,
          paddingBottom: 50,
          width: '100%',
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDarkMode ? 'white' : colors.purple}
          />
        }
      >
        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            marginBottom: 34,
            width: '100%',
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
                  borderColor: isDarkMode? colors.dark: colors.lightGray,
                  borderWidth: 1.5,
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  backgroundColor:isDarkMode ? colors.darkSurface : colors.white
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
                    fontWeight: 400
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

          <AIAstro />

          {/* Astrologers */}
          <Swipers />
          <View
            style={{
              marginTop: 16,
              flexDirection: 'row',
              gap: 18,
              justifyContent: 'center',
              marginHorizontal: 12,
            }}
          >
            {icons?.map((i) => (
              <HomePageIcon
                title={t(`homePage.${i.title}`)}
                imageSrc={i.imgSrc}
                navigate={i.navigate}
                key={i.title}
              />
            ))}
          </View>

          {/* Blogs */}
          <View style={{ marginHorizontal: 12, marginTop: 20, width: '100%' }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 16,
                flex: 1,
              }}
            >
              <Text
                style={{
                  fontWeight: '500',
                  fontSize: 18,
                  color: isDarkMode ? 'white' : colors.purple,
                  width: '70%',
                }}
              >
                {t('homePage.sectionHead2')}
              </Text>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '30%',
                }}
                onPress={() => navigation.navigate('Blogs')}
              >
                <Text style={{ color: isDarkMode ? 'white' : 'black' }}>
                  {t('extras.seeAll')}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={isDarkMode ? 'white' : 'black'}
                />
              </TouchableOpacity>
            </View>
            <ScrollView horizontal>
              {blogs?.slice(0, 4)?.map((blog) => (
                <HomePageBlogItem key={blog._id} blog={blog} />
              ))}
            </ScrollView>
          </View>
          {/* Youtube videos */}
          <View style={{ paddingHorizontal: 12, marginTop: 20, width: '100%' }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 1,
                flex: 1,
              }}
            >
              <Text
                numberOfLines={2}
                style={{
                  fontWeight: '500',
                  fontSize: 18,
                  width: '70%',
                  color: isDarkMode ? 'white' : colors.purple,
                }}
              >
                {t('homePage.sectionHead3')}
              </Text>
              <TouchableOpacity
                style={{
                  width: 'auto',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 2,
                }}
                onPress={() => navigation.navigate('YoutubeVideos')}
              >
                <Text style={{ color: isDarkMode ? 'white' : 'black' }}>
                  {t('extras.seeAll')}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={isDarkMode ? 'white' : 'black'}
                />
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              contentContainerStyle={{ gap: 20 }}
              style={{
                overflow: 'hidden',
                marginBottom: 0,
                borderRadius: 5,
              }}
            >
              {videos?.map((video) => (
                <YouTubeVideo
                  key={video?._id}
                  video={video}
                  setIsYoutubeModalOpen={setIsYoutubeModalOpen}
                  setPlayingVideoId={setPlayingVideoId}
                />
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>
      <FreeAstrologersBtn marginBottom={64} />
      <YouTubeModal
        isYoutubeModalOpen={isYoutubeModalOpen}
        playingVideoId={playingVideoId}
        setIsYoutubeModalOpen={setIsYoutubeModalOpen}
      />
      <LanguageSwitcherModal
        isVisible={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        setLanguage={setLanguage}
      />
    </>
  );
}

export default Home;
