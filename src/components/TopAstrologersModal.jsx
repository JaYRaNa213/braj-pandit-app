import React, { useEffect, useState } from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import axiosInstance from '../utils/axiosInstance';
import { useChat } from '../context/ChatContext';
import AstrologerCard from './AstrologerCard';
import Ionicons from 'react-native-vector-icons/Ionicons';

const TopAstrologersModal = () => {
  const [astrologers, setAstrologers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    isTopAstrologerModalOpen,
    closeTopAstrologerModal,
    topAstrologersConfig = { astroName: 'Astrologer', requestType: 'chat' },
  } = useChat();

  const getTopAstrologers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axiosInstance.get(
        `/astro/top/${topAstrologersConfig?.requestType}`,
      );
      if (response.status === 200) {
        setAstrologers(response.data.data);
      } else {
        setError(`Failed to fetch astrologers: ${response.statusText}`);
      }
    } catch (err) {
      setError('Unable to load top astrologers. Please try again later.');
      console.error('Error fetching top astrologers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isTopAstrologerModalOpen) {
      getTopAstrologers();
    }
  }, [isTopAstrologerModalOpen]);

  return (
    <Modal
      visible={isTopAstrologerModalOpen}
      onRequestClose={closeTopAstrologerModal}
      animationType="slide"
      transparent={true}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: '90%',
            maxWidth: 400,
            height: 500, // Equivalent to h-[28rem]
            backgroundColor: '#fff',
            borderRadius: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5, // For Android shadow
            paddingVertical: 20,
          }}
        >
          {/* Close Button */}
          <TouchableOpacity
            onPress={closeTopAstrologerModal}
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
            }}
          >
            <Ionicons name="close" size={28} color="#1f2937" />
          </TouchableOpacity>
          {/* Header */}
          <View
            style={{
              paddingBottom: 8,
              borderBottomWidth: 1,
              borderBottomColor: '#e5e7eb', // Gray border
              paddingHorizontal: 16,
              paddingTop: 16,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: '#1f2937', // Gray-800
                textAlign: 'center',
              }}
            >
              {topAstrologersConfig?.astroName} is not available right now
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: '#4b5563', // Gray-600
                marginTop: 4,
                textAlign: 'center',
              }}
            >
              You can connect with these top astrologers
            </Text>
          </View>

          {/* Content */}
          <ScrollView
            contentContainerStyle={{
              padding: 16,
            }}
          >
            {isLoading ? (
              <View
                style={{
                  flexGrow: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              ></View>
            ) : error ? (
              <View
                style={{
                  flexGrow: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: '#ef4444', // Red-500
                    textAlign: 'center',
                    fontSize: 16,
                  }}
                >
                  {error}
                </Text>
                <TouchableOpacity onPress={getTopAstrologers}>
                  <Text
                    style={{
                      marginTop: 8,
                      color: '#4f46e5', // Indigo-600
                      fontSize: 14,
                      textDecorationLine: 'underline',
                    }}
                  >
                    Retry
                  </Text>
                </TouchableOpacity>
              </View>
            ) : astrologers.length > 0 ? (
              <View
                style={{
                  gap: 16, // Space between cards
                }}
              >
                {astrologers.map((astro) => (
                  <AstrologerCard key={astro?._id} astrologer={astro} />
                ))}
              </View>
            ) : (
              <Text
                style={{
                  color: '#6b7280', // Gray-500
                  textAlign: 'center',
                  fontSize: 16,
                  paddingVertical: 16,
                }}
              >
                No astrologers available at the moment.
              </Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default TopAstrologersModal;
