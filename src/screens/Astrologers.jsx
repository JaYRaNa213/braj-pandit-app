/* eslint-disable react/no-unstable-nested-components */
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { colors } from '../assets/constants/colors';
import AstrologerCard from '../components/AstrologerCard';
import ChatsPopUp from '../components/ChatsPopUp';
import FilterPopup from '../components/FilterPopup';
import FreeAstrologersBtn from '../components/FreeAstrologersBtn';
import { useChat } from '../context/ChatContext';
import { useTheme } from '../context/ThemeContext';
import { useGetAllAstrologersQuery } from '../redux/api/astrologerApi';
import axiosInstance from '../utils/axiosInstance';
import { REACT_APP_BACKEND_URL } from '../utils/domain';

const Astrologers = () => {
  const { t } = useTranslation();
  const filters = [
    {
      name: 'All',
      tag: 'all',
      icon: 'view-grid',
    },
    {
      name: 'Love',
      tag: 'Relationship',
      icon: 'heart',
    },
    {
      name: 'Career',
      tag: 'Career',
      icon: 'briefcase',
    },
    {
      name: 'Education',
      tag: 'Education',
      icon: 'book-open',
    },
    {
      name: 'Marriage',
      tag: 'Relationship',
      icon: 'ring',
    },
    {
      name: 'Health',
      tag: 'Health',
      icon: 'stethoscope',
    },
    {
      name: 'Wealth',
      tag: 'Wealth',
      icon: 'currency-usd',
    },
    {
      name: 'Finance',
      tag: 'Finance',
      icon: 'bank',
    },
    {
      name: 'Business',
      tag: 'Business',
      icon: 'chart-line',
    },
    {
      name: 'Legal',
      tag: 'Legal',
      icon: 'scale-balance',
    },
    {
      name: 'Kids',
      tag: 'Parenting',
      icon: 'baby',
    },
    {
      name: 'Property',
      tag: 'Vastu',
      icon: 'home',
    },
    {
      name: 'Healing',
      tag: 'Healing',
      icon: 'hand-heart',
    },
    {
      name: 'Numerology',
      tag: 'Numerology',
      icon: 'numeric',
    },
    {
      name: 'Palmistry',
      tag: 'Palmistry',
      icon: 'hand-back-left',
    },
    {
      name: 'Akashic',
      tag: 'Akashic',
      icon: 'book-variant',
    },
    {
      name: 'Ramal',
      tag: 'Ramal',
      icon: 'dice-5',
    },
    {
      name: 'Philanthropy',
      tag: 'Philanthropy',
      icon: 'handshake',
    },
  ];

  const { user } = useSelector((state) => state.user);

  const [selectedExpertiseName, setSelectedExpertiseName] = useState('all');
  const {
    setRefetch,
    refetch,
    setPendingRequests,
    setActiveChat,
    pendingRequests,
    activeChat,
  } = useChat();
  const [expertise, setExpertise] = useState('all');
  const [fetching, setFetching] = useState(false);
  const [filterBy, setFilterBy] = useState('');

  const [page, setPage] = useState(1);
  const {
    data,
    isLoading,
    refetch: refetchAstro,
  } = useGetAllAstrologersQuery({
    page,
    limit: 10,
    isCertified: false,
    expertise,
    filterBy,
  });

  const [astrologers, setAstrologers] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const { isDarkMode } = useTheme();
  const [filtersApplied, setFiltersApplied] = useState(null);
  const navigation = useNavigation();
  const [showSortModal, setShowSortModal] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setRefetch(!refetch);
    checkPendingRequests();
    checkActiveChat();
    refetchAstro();
    setRefreshing(false);
  };

  const applyFilters = (appliedFilters) => {
    setFilterBy(appliedFilters);
  };

  const resetFilters = () => {
    setAstrologers([]);
    setPage(1);
    setFilterBy('');
    refetchAstro();
    setFiltersApplied(false);
  };

  useEffect(() => {
    if (data && data.data) {
      setAstrologers((prev) => {
        if (page === 1) {
          return data.data;
        }

        const newIds = new Set(prev.map((a) => a._id));
        const uniqueNew = data.data.filter((a) => !newIds.has(a._id));
        return [...prev, ...uniqueNew];
      });
      setHasMore(data.data.length > 0);
      setLoadingMore(false);
    }
  }, [data]);

  useEffect(() => {
    setPage(1);
    refetchAstro();
  }, [expertise, filterBy]);

  useEffect(() => {
    navigation.setOptions({
      title: t('astrologers.screenHead'),
      headerRight: () => (
        <View
          style={{
            flexDirection: 'row',
            marginRight: 14,
            gap: 14,
            alignItems: 'center',
          }}
        >
          <TouchableOpacity onPress={() => navigation.navigate('Search')}>
            <MaterialCommunityIcons name="magnify" size={20} color="white" />
          </TouchableOpacity>
          {user ? (
            <Pressable
              style={{
                borderWidth: 1,
                borderColor: 'white',
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 12,
              }}
              onPress={() => navigation.navigate('Recharge')}
            >
              <Text style={{ color: 'white', fontSize: 12 }}>
                ₹ {user?.available_balance?.toFixed(2)}
              </Text>
            </Pressable>
          ) : (
            <TouchableOpacity onPress={() => navigation.navigate('Recharge')}>
              <Ionicons name="wallet-outline" size={20} color="white" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => setShowFilterModal(true)}>
            <MaterialCommunityIcons
              name="filter-outline"
              size={20}
              color="white"
            />
            {filtersApplied && (
              <View
                style={{
                  height: 4,
                  width: 4,
                  backgroundColor: 'white',
                  position: 'absolute',
                  top: 8,
                  right: 0,
                }}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowSortModal(true)}>
            <MaterialCommunityIcons name="sort" size={20} color="white" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, user, t]);

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const loadMoreData = debounce(() => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      setPage((prevPage) => prevPage + 1);
    }
  }, 100);

  const checkActiveChat = async () => {
    if (!user) {
      return;
    }
    try {
      const response = await axiosInstance.get('/chat-request/active-chat');
      const activeChatRes = response.data;
      console.log({ activeChatRes });

      if (activeChatRes) {
        setActiveChat(activeChatRes);
      } else {
        setActiveChat(null);
      }
    } catch (err) {
      console.error('Failed to fetch active chat:', err.response);
    }
  };

  const checkPendingRequests = async () => {
    if (!user) {
      return;
    }
    try {
      const response = await axiosInstance.get(
        `/chat-request/pending-chat-requests/${user?._id}`,
      );
      const requests = response.data;

      if (requests) {
        setPendingRequests(requests);
      } else {
        setPendingRequests([]);
      }
    } catch (err) {
      console.error('Failed to fetch pending chat requests:', err);
    }
  };

  const handleFilterByExpertise = useCallback(
    (tag, name) => {
      setFetching(true);
      setExpertise(tag);
      setSelectedExpertiseName(name);
      refetchAstro().finally(() => setFetching(false));
    },
    [refetchAstro],
  );

  const colorsArray = [
    '#E57373', // Red
    '#F06292', // Pink
    '#BA68C8', // Purple
    '#64B5F6', // Blue
    '#4DB6AC', // Teal
    '#81C784', // Green
    '#FFD54F', // Yellow
    '#FFB74D', // Orange
    '#A1887F', // Brown
    '#90A4AE', // Gray
  ];

  const renderFilterItem = ({ item, index }) => {
    const itemColor = colorsArray[index % colorsArray.length]; // Cycle through colors
    const isSelected = selectedExpertiseName === item.name;

    return (
      <TouchableOpacity
        style={{
          borderRadius: 16,
          paddingHorizontal: 12,
          paddingVertical: 6,
          flexDirection: 'row',
          borderWidth: 1,
          borderColor: itemColor,
          marginRight: 16,
          marginBottom: 8,
          alignItems: 'center',
          gap: 6,
          height: 32,
          backgroundColor: isSelected
            ? isDarkMode
              ? 'white'
              : itemColor
            : 'transparent',
        }}
        onPress={() => handleFilterByExpertise(item.tag, item.name)}
      >
        <MaterialCommunityIcons
          name={item.icon}
          size={14}
          color={
            isSelected ? (isDarkMode ? colors.purple : '#ffffff') : itemColor
          }
        />
        <Text
          style={{
            color: isSelected
              ? isDarkMode
                ? colors.purple
                : '#ffffff'
              : isDarkMode
              ? 'white'
              : itemColor,
            textTransform: '',
            fontSize: 13,
            fontWeight: 'bold',
          }}
        >
          {t(`filter.${item.name}`)}
        </Text>
      </TouchableOpacity>
    );
  };

  const handleSort = (value) => {
    let sortedData = [...astrologers];

    switch (value) {
      case 'pop':
        sortedData.sort((a, b) => b.orders - a.orders);
        break;
      case 'phl':
        sortedData.sort(
          (a, b) => b.chargeAfterDiscount - a.chargeAfterDiscount,
        );
        break;
      case 'plh':
        sortedData.sort(
          (a, b) => a.chargeAfterDiscount - b.chargeAfterDiscount,
        );
        break;
      case 'ehl':
        sortedData.sort((a, b) => b.experience - a.experience);
        break;
      case 'elh':
        sortedData.sort((a, b) => a.experience - b.experience);
        break;
      case 'tohl':
        sortedData.sort((a, b) => b.orders - a.orders);
        break;
      case 'tolh':
        sortedData.sort((a, b) => a.orders - b.orders);
        break;
      case 'rhl':
        sortedData.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
        break;
      default:
        sortedData.sort((a, b) => a._id.localeCompare(b._id));
        break;
    }
    setAstrologers(sortedData);
    setShowSortModal(false);
  };

  useFocusEffect(
    useCallback(() => {
      if (user) {
        checkPendingRequests();
        checkActiveChat();
      }
    }, [user, activeChat]), // dependencies go here
  );
  if (isLoading) {
    return (
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          backgroundColor: isDarkMode ? '#222' : 'white',
          flex: 1,
        }}
      >
        <ActivityIndicator
          size={'large'}
          color={isDarkMode ? 'white' : colors.purple}
        />
      </View>
    );
  }

  return (
    <>
      <FilterPopup
        onClose={() => setShowFilterModal(false)}
        isOpen={showFilterModal}
        astrologers={astrologers}
        onApplyFilters={applyFilters}
        onReset={resetFilters}
        filtersApplied={(appliedFilters) =>
          setFiltersApplied(
            Object.keys(appliedFilters).some(
              (key) => appliedFilters[key].length > 0,
            ),
          )
        }
      />

      <View
        style={{
          flex: 1,
          paddingTop: 12,
          paddingHorizontal: 12,
          backgroundColor: isDarkMode
            ? colors.darkBackground
            : colors.lightBackground,
        }}
      >
        {/* Horizontal Filters */}
        <FlatList
          data={filters}
          keyExtractor={(item) => item.name}
          renderItem={renderFilterItem}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
        {/* Data */}
        {fetching ? (
          <View style={{ flex: 1 }}>
            <ActivityIndicator
              size="large"
              color={isDarkMode ? 'white' : '#501873'}
            />
          </View>
        ) : (
          <FlatList
            data={astrologers}
            keyExtractor={(item) => item?._id}
            renderItem={({ item, index }) => (
              <AstrologerCard astrologer={item} isFree={true} index={index} />
            )}
            numColumns={1}
            onEndReached={loadMoreData}
            onEndReachedThreshold={0.9}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={21}
            ListFooterComponent={() => {
              if (loadingMore || isLoading) {
                return (
                  <ActivityIndicator
                    size="large"
                    color={isDarkMode ? 'white' : 'black'}
                  />
                );
              }
              return null;
            }}
            style={{ marginTop: 12 }}
            contentContainerStyle={{
              justifyContent: 'flex-center',
              alignItems: 'flex-center',
              gap: 12,
              width: '100%',
              flexGrow: 1,
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={isDarkMode ? 'white' : colors.purple}
              />
            }
          />
        )}

        <Modal
          animationType="slide"
          transparent={true}
          visible={showSortModal}
          onRequestClose={() => setShowSortModal(false)}
        >
          <View
            style={{
              flex: 1,
              justifyContent: 'flex-end',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
          >
            <View
              style={{
                backgroundColor: isDarkMode ? colors.darkSurface : '#fff',
                width: '100%',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                padding: 20,
              }}
            >
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <Text
                  style={{
                    alignSelf: 'flex-end',
                    color: 'blue',
                    marginBottom: 10,
                  }}
                >
                  <MaterialCommunityIcons
                    name="close"
                    color={isDarkMode ? 'white' : 'black'}
                    size={24}
                  />
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setAstrologers(data.data);
                  setShowSortModal(false);
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    color: isDarkMode ? 'white' : 'black',
                    marginBottom: 10,
                  }}
                >
                  Reset
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleSort('phl')}>
                <Text
                  style={{
                    fontSize: 18,
                    color: isDarkMode ? 'white' : 'black',
                    marginBottom: 10,
                  }}
                >
                  Price : High to Low
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleSort('plh')}>
                <Text
                  style={{
                    fontSize: 18,
                    color: isDarkMode ? 'white' : 'black',
                    marginBottom: 10,
                  }}
                >
                  Price : Low to High
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleSort('ehl')}>
                <Text
                  style={{
                    fontSize: 18,
                    color: isDarkMode ? 'white' : 'black',
                    marginBottom: 10,
                  }}
                >
                  Experience : High to Low
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleSort('elh')}>
                <Text
                  style={{
                    fontSize: 18,
                    color: isDarkMode ? 'white' : 'black',
                    marginBottom: 10,
                  }}
                >
                  Experience : Low to High
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleSort('rhl')}>
                <Text
                  style={{
                    fontSize: 18,
                    color: isDarkMode ? 'white' : 'black',
                    marginBottom: 10,
                  }}
                >
                  Rating : High to Low
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleSort('rlh')}>
                <Text
                  style={{
                    fontSize: 18,
                    color: isDarkMode ? 'white' : 'black',
                    marginBottom: 10,
                  }}
                >
                  Rating : Low to High
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleSort('phl')}>
                <Text
                  style={{
                    fontSize: 18,
                    color: isDarkMode ? 'white' : 'black',
                    marginBottom: 10,
                  }}
                >
                  Popularity : High to Low
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleSort('plh')}>
                <Text
                  style={{
                    fontSize: 18,
                    color: isDarkMode ? 'white' : 'black',
                    marginBottom: 10,
                  }}
                >
                  Popularity : Low to High
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
      <FreeAstrologersBtn />
      {(pendingRequests?.length > 0 || activeChat) && <ChatsPopUp />}
    </>
  );
};

export default Astrologers;
