import axios from 'axios';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  ToastAndroid,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { colors } from '../assets/constants/colors';
import { REACT_APP_BACKEND_URL } from '../utils/domain';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import WithSafeArea from '../components/HOC/SafeAreaView';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axiosInstance from '../utils/axiosInstance';

const CustomerSupport = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const { user } = useSelector((state) => state.user);
  const [showCustomerSupportPopup, setShowCustomerSupportPopup] =
    useState(false);

  const [tickets, setTickets] = useState([]);
  const [refreshing, setRefreshing] = useState(true);

  const [filteredTickets, setFilteredTickets] = useState([]);
  const [activeTab, setActiveTab] = useState('open');
  const categories = ['all', 'open', 'closed'];

  const colorsTickets = { open: '#ED7014', closed: '#4FC978', all: '#90A4AE' };

  const getTabColor = (category) => {
    switch (category) {
      case 'all': {
        return colorsTickets.all;
      }
      case 'open': {
        return colorsTickets.open;
      }
      case 'closed': {
        return colorsTickets.closed;
      }
    }
  };

  const fetchTickets = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/ticket/all/${user?._id}`);
      if (response.data.success) {
        setTickets(response.data.tickets);
      }
    } catch (error) {
      ToastAndroid.show(
        'Error in fetcing tickets, please try again later',
        ToastAndroid.SHORT,
      );

      console.error('Error fetching tickets:', error);
    }
  }, []);

  function onRefresh() {
    setRefreshing(true);
    fetchTickets();
    setRefreshing(false);
  }

  // Function to delete all tickets
  const handleDeleteAllTickets = async () => {
    try {
      await axios.delete(
        `${REACT_APP_BACKEND_URL}/ticket/delete-all/${user._id}`,
      );
      setShowDeletePopup(false);
      ToastAndroid.show('All tickets deleted', ToastAndroid.SHORT);
      setTickets([]);
    } catch (error) {
      console.error('Error deleting all tickets:', error);
      ToastAndroid.show(
        'Error in deleting tickets, please try again later',
        ToastAndroid.SHORT,
      );
    } finally {
      setShowDeletePopup(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTickets().then(() => {
        setRefreshing(false);
      });
    }, [fetchTickets]),
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('support.screenHead'),
    });
  }, []);

  useEffect(() => {
    switch (activeTab) {
      case 'all': {
        setFilteredTickets(tickets);
        break;
      }
      case 'open': {
        let newtickets = tickets.filter(
          (ticket) => ticket.ticketStatus === 'OPEN',
        );
        setFilteredTickets(newtickets);
        break;
      }
      case 'closed': {
        let newtickets = tickets.filter(
          (ticket) => ticket.ticketStatus === 'CLOSED',
        );
        setFilteredTickets(newtickets);
        break;
      }
      default: {
        setFilteredTickets(tickets);
        break;
      }
    }
  }, [activeTab, tickets]);

  const handleTicketClick = (ticketId) => {
    navigation.navigate('CustomerSupportChatScreen', {
      ticketId: ticketId,
    });
  };

  const handleNewChatClick = () => {
    navigation.navigate('CustomerSupportChatScreen');
  };

  return (
    <View style={{ flex: 1, position: 'relative' }}>
      <Image
        source={
          isDarkMode
            ? require('../assets/images/background_dark.png')
            : require('../assets/images/background.png')
        }
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%', // Use percentage for responsiveness
          height: '100%', // Use percentage for responsiveness
          resizeMode: 'cover',
          opacity: isDarkMode ? 1 : 0.7,
        }}
      />
      <View style={{ flex: 1 }}>
        <View
          style={{
            alignItems: 'center',
            position: 'absolute',
            zIndex: 10,
            bottom: 20,
            width: '100%',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              width: '85%',
            }}
          >
            <TouchableOpacity
              onPress={() => setShowDeletePopup(true)}
              style={{
                height: 50,
                borderRadius: 40,
                backgroundColor: colors.purple,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
                paddingHorizontal: 20,
              }}
            >
              <Ionicons name="trash" size={20} color="#FFFFFF" />
              <Text style={{ color: 'white', marginLeft: 10, fontSize: 16 }}>
                Delete All
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleNewChatClick}
              style={{
                height: 50,
                borderRadius: 40,
                backgroundColor: colors.purple,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
                paddingHorizontal: 20,
              }}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={{ color: 'white', marginLeft: 10, fontSize: 16 }}>
                New Ticket
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: 20,
            paddingBottom: 12,
          }}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setActiveTab(category)}
              style={{
                alignItems: 'center',
                marginLeft: 8,
                backgroundColor: isDarkMode ? colors.dark : 'white',
                borderColor: getTabColor(category),
                borderWidth: activeTab === category ? 5 : 2,
                borderRadius: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: activeTab === category ? 700 : 500,
                  color: getTabColor(category),
                  textAlign: 'center',
                  minWidth: 80,
                  paddingHorizontal: 8,
                  paddingVertical: 5,
                }}
              >
                {category.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={isDarkMode ? 'white' : colors.purple}
            />
          }
        >
          {/* Add Loader */}
          {filteredTickets?.length === 0 && !refreshing && <EmptyChat />}
          {filteredTickets?.length > 0 && (
            <View style={{ margin: 12 }}>
              <View style={{ marginTop: 12, gap: 12 }}>
                {filteredTickets
                  ?.sort((a, b) => {
                    const statusOrder = { OPEN: 1, CLOSED: 2 };

                    const statusA = statusOrder[a.ticketStatus];
                    const statusB = statusOrder[b.ticketStatus];

                    // Compare the statuses
                    if (statusA !== statusB) {
                      return statusA - statusB;
                    }

                    const dateA = new Date(a.createdAt);
                    const dateB = new Date(b.createdAt);

                    return dateB.getTime() - dateA.getTime();
                  })
                  .map((ticket) => (
                    <Pressable
                      style={{
                        padding: 12,
                        backgroundColor: isDarkMode ? colors.dark : 'white',
                        borderRadius: 20,
                        flexDirection: 'row',
                        borderWidth: 1,
                        borderRightWidth: 3,
                        borderBottomWidth: 3,
                        borderColor:
                          ticket.ticketStatus === 'OPEN'
                            ? colorsTickets.open
                            : colorsTickets.closed,
                      }}
                      android_ripple={{
                        color: isDarkMode ? colors.gray : colors.lightGray,
                      }}
                      key={ticket._id}
                      onPress={() => handleTicketClick(ticket._id)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            color: isDarkMode ? 'white' : 'black',
                            fontSize: 16,
                            fontWeight: 500,
                          }}
                        >
                          {ticket.ticketReason}
                        </Text>
                        <Text
                          style={{
                            color: isDarkMode ? '#CCC' : colors.gray,
                            fontSize: 12,
                            marginTop: 4,
                          }}
                        >
                          {moment(ticket.createdAt).format(
                            'hh:ss A,  DD MMM, YYYY',
                          )}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
              </View>
            </View>
          )}
        </ScrollView>
      </View>

      <Modal
        visible={showDeletePopup}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeletePopup(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 300,
              height: 150,
              padding: 20,
              backgroundColor: isDarkMode ? '#555' : 'white',
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 18,
                marginBottom: 10,
                color: isDarkMode ? 'white' : 'black',
              }}
            >
              {t('support.deleteAllBtn')}
            </Text>
            <View style={{ flexDirection: 'row', marginTop: 10, gap: 24 }}>
              <Pressable
                style={{
                  paddingHorizontal: 10,
                  borderRadius: 4,
                  paddingVertical: 4,
                  borderWidth: 1,
                  borderColor: colors.lightGray,
                }}
                onPress={() => setShowDeletePopup(false)}
              >
                <Text style={{ color: isDarkMode ? 'white' : colors.gray }}>
                  {t('support.cancle')}
                </Text>
              </Pressable>
              <Pressable
                style={{
                  paddingHorizontal: 10,
                  borderRadius: 4,
                  paddingVertical: 4,
                  backgroundColor: 'red',
                }}
                onPress={handleDeleteAllTickets}
              >
                <Text style={{ color: 'white' }}>{t('support.comfirm')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const EmptyChat = () => {
  return (
    <View style={[style.emptyContainer]}>
      <Text style={[style.emptyText]}> No Data to show</Text>
    </View>
  );
};

const style = StyleSheet.create({
  emptyContainer: {
    width: '100%',
    flexDirection: 'flex',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyText: { textAlign: 'center', fontSize: 16 },
  supportExecBox: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: 20,
  },
  supportExecBoxText: {
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 20,
  },
});

export default WithSafeArea(CustomerSupport);
