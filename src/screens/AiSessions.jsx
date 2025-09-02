/* eslint-disable react/no-unstable-nested-components */
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { colors } from '../assets/constants/colors';
import { useChat } from '../context/ChatContext';
import { useTheme } from '../context/ThemeContext';
import axiosInstance from '../utils/axiosInstance';

const AiSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { setAiChatSessionId } = useChat();

  const { isDarkMode } = useTheme();

  const getSessions = async () => {
    try {
      const response = await axiosInstance.get('/ai-chat/sessions');
      setSessions(response.data.sessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSessions();
  }, []);

  const handleNewChatClick = () => {
    setAiChatSessionId(null);
    navigation.navigate('AIAstroChat', {
      sessionId: null,
      persona: 'personality',
    });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'AI Chat Sessions',
    });
  }, [navigation]);

  const renderSessionCard = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.cardButton,
        { backgroundColor: isDarkMode ? '#333' : '#fff' },
      ]}
      onPress={() =>
        navigation.navigate('AIAstroChat', {
          sessionId: item._id,
          persona: item.persona,
          title: item?.title
            ? `${item.title.slice(0, 24)}${item.title.length > 24 ? '...' : ''}`
            : 'New Chat',
        })
      }
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.summaryTitle,
          { color: isDarkMode ? '#fff' : '#1D3557' },
        ]}
      >
        {item?.title || item?.name || 'New Chat'}{' '}
        {item?.name && `- ${item.name}`}
      </Text>
      <Text
        style={[styles.persona, { color: isDarkMode ? '#fff' : '#1D3557' }]}
      >
        {item.persona} Modal
      </Text>
      <Text
        style={[styles.timestamp, { color: isDarkMode ? '#aaa' : '#6C757D' }]}
      >
        {moment(item.createdAt).format('D MMM YYYY, h:mm A')}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View
        style={[
          styles.center,
          { backgroundColor: isDarkMode ? colors.darkBackground : '#F9FAFB' },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (sessions.length === 0) {
    return (
      <View
        style={[
          styles.center,
          { backgroundColor: isDarkMode ? colors.darkBackground : '#F9FAFB' },
        ]}
      >
        <TouchableOpacity
          onPress={handleNewChatClick}
          style={[styles.newChatBtn]}
        >
          <AntDesign name="plus" size={16} color="white" />
          <Text style={styles.newChatBtnText}>New Chat</Text>
        </TouchableOpacity>
        <Text style={styles.emptyText}>No chat sessions found.</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? colors.darkBackground : '#F9FAFB' },
      ]}
    >
      <TouchableOpacity
        onPress={handleNewChatClick}
        style={styles.newChatBtn}
        activeOpacity={0.8}
      >
        <AntDesign name="plus" size={16} color="white" />
        <Text style={styles.newChatBtnText}>New Chat</Text>
      </TouchableOpacity>

      <FlatList
        data={sessions}
        keyExtractor={(item) => item._id}
        renderItem={renderSessionCard}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

export default AiSessions;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 12,
    paddingBottom: 20,
  },
  headerIconButton: {
    marginRight: 12,
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  newChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 16,
    justifyContent: 'center',
  },
  newChatBtnText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 15,
    textAlign: 'center',
  },
  cardButton: {
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1D3557',
    marginBottom: 6,
  },
  persona: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6A4C93',
    textTransform: 'capitalize',
  },
  timestamp: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
    marginTop: 12,
  },
});
