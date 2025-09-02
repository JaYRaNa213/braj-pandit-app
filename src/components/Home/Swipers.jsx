import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import axiosInstance, { baseURL } from '../../utils/axiosInstance';
import Swiper from './Swiper';
import LiveStreamSwiper from './LiveStreamSwiper';
import { filterActiveRecentStreams } from '../../utils/streamFilters';
import { t } from 'i18next';

const Swipers = () => {
  const [astrologers, setAstrologers] = useState({});
  const [streamData, setStreamData] = useState({
    allStreams: [],
    trendingStreams: [],
    newAstrologerStreams: [],
    streamsByType: {},
    astrologerTypes: [],
  });
  const [loading, setLoading] = useState(true);
  const [astroLoading, setAstroLoading] = useState(false);

  const fetchAstrologers = async () => {
    setAstroLoading(true);

    const getAstrologersUrl = '/astro/homepage?isCertified=true';

    try {
      const res = await axiosInstance.get(getAstrologersUrl);
      const data = res.data?.data;
      setAstrologers({
        relationshipAstrologers: data?.['Relationship-Career'],
        vastuAstrologers: data?.Vastu,
        numerologyAstrologers: data?.Numerology,
        palmistryAstrologers: data?.Palmistry,
        healingAstrologers: data?.['Healing-Therapy'],
        tarotAstrologers: data?.Tarot,
      });
    } catch (error) {
      console.log('Error fetching astrologers ', error);
    } finally {
      setAstroLoading(false);
    }
  };

  const fetchAllStreamData = async () => {
    setLoading(true);

    try {
      // Fetch all data in parallel
      const [
        typesResponse,
        allStreamsResponse,
        trendingResponse,
        newAstrologersResponse,
      ] = await Promise.all([
        fetch(`${baseURL}/streams/types`),
        fetch(`${baseURL}/streams?isLive=true`),
        fetch(`${baseURL}/streams/trending`),
        fetch(`${baseURL}/streams/new-astrologers`),
      ]);

      // Parse responses
      const typesData = await typesResponse.json();
      const allStreamsData = await allStreamsResponse.json();
      const trendingData = await trendingResponse.json();
      const newAstrologersData = await newAstrologersResponse.json();

      // Filter streams by active status and 4-hour duration limit
      let activeStreams = filterActiveRecentStreams(
        allStreamsData.streams || [],
      );

      // Deduplicate: Only show the latest live stream per astrologer
      const uniqueStreamsMap = {};
      activeStreams.forEach((stream) => {
        const astroId = stream.astrologerId?._id || stream.astrologerId;
        if (
          !uniqueStreamsMap[astroId] ||
          new Date(stream.startedAt) >
            new Date(uniqueStreamsMap[astroId].startedAt)
        ) {
          uniqueStreamsMap[astroId] = stream;
        }
      });
      activeStreams = Object.values(uniqueStreamsMap);
      console.log(
        `Found ${activeStreams.length} active live streams within 4 hours`,
      );

      // Get astrologer types and fetch streams for each type
      const astrologerTypes = typesData.types || [];

      // Fetch streams for each astrologer type
      const typeStreamsPromises = astrologerTypes.map(async (typeInfo) => {
        if (!typeInfo.type) return null;

        const response = await fetch(
          `${baseURL}/streams/by-type/${typeInfo.type}`,
        );
        const data = await response.json();
        return { type: typeInfo.type, streams: data.streams || [] };
      });

      const typeStreamsResults = await Promise.all(typeStreamsPromises);

      // Create object with type as key and streams as value, applying 4-hour filter
      const streamsByType = {};
      typeStreamsResults.forEach((result) => {
        if (result && result.type) {
          // Apply 4-hour filter to each type's streams
          const filteredTypeStreams = filterActiveRecentStreams(result.streams);
          streamsByType[result.type] = filteredTypeStreams;
        }
      });

      // Apply 4-hour filter to trending and new astrologer streams as well
      const filteredTrendingStreams = filterActiveRecentStreams(
        trendingData.streams || [],
      );
      const filteredNewAstrologerStreams = filterActiveRecentStreams(
        newAstrologersData.streams || [],
      );

      // Update state with all stream data
      setStreamData({
        allStreams: activeStreams,
        trendingStreams: filteredTrendingStreams,
        newAstrologerStreams: filteredNewAstrologerStreams,
        streamsByType,
        astrologerTypes,
      });
    } catch (error) {
      console.log('Error fetching stream data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAstrologers();
    fetchAllStreamData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchAllStreamData();
    }, 60000); // Refresh every 60 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={{}}>
      {/* Live Streams Section - Show streams that are within 4 hours */}
      {/* {streamData.allStreams?.length > 0 && (
        <LiveStreamSwiper
          streams={streamData.allStreams}
          heading={'Live Astrologers 🔴'}
        />
      )} */}

      {/* Trending Live Streams */}
      {/* {streamData.trendingStreams?.length > 0 && (
        <LiveStreamSwiper
          streams={streamData.trendingStreams}
          heading={'Trending Live Now 📈'}
        />
      )} */}

      {/* New Astrologers Live */}
      {/* {streamData.newAstrologerStreams?.length > 0 && (
        <LiveStreamSwiper
          streams={streamData.newAstrologerStreams}
          heading={'New Astrologers Live ✨'}
        />
      )} */}

      {/* Astrologer Swipers */}
      {astrologers?.relationshipAstrologers?.length > 2 && (
        <Swiper
          astrologers={astrologers?.relationshipAstrologers}
          heading={`${t('homePage.VedicAstrologers')}❤️ 💼 💰'`}
          expertise={'Relationship-Career'}
          astroLoading={astroLoading}
        />
      )}
      {astrologers?.healingAstrologers?.length > 2 && (
        <Swiper
          astrologers={astrologers?.healingAstrologers}
          heading={`${t('homePage.EnergyHealingMantraTherapy')}`}
          expertise={'Healing-Therapy'}
          astroLoading={astroLoading}
        />
      )}
      {astrologers?.tarotAstrologers?.length > 2 && (
        <Swiper
          astrologers={astrologers?.tarotAstrologers}
          heading={`${t('homePage.TarotReaders')}`}
          expertise={'Tarot'}
          astroLoading={astroLoading}
        />
      )}
      {astrologers?.vastuAstrologers?.length > 2 && (
        <Swiper
          astrologers={astrologers?.vastuAstrologers}
          heading={`${t('homePage.vastuExperts')}`}
          expertise={'Vastu'}
          astroLoading={astroLoading}
        />
      )}
      {astrologers?.numerologyAstrologers?.length > 2 && (
        <Swiper
          astrologers={astrologers?.numerologyAstrologers}
            heading={`${t('homePage.numerologists')}`}
          expertise={'Numerology'}
          astroLoading={astroLoading}
        />
      )}
      {astrologers?.palmistryAstrologers?.length > 2 && (
        <Swiper
          astrologers={astrologers?.palmistryAstrologers}
          heading={`${t('homePage.palmists')}`}
          expertise={'Palmistry'}
          astroLoading={astroLoading}
        />
      )}

      {astroLoading && (
        <View>
          <Swiper
            astrologers={[]}
          heading={`${t('homePage.VedicAstrologers')}❤️ 💼 💰'`}
            expertise={'Relationship-Career'}
            astroLoading={astroLoading}
          />
          <Swiper
            astrologers={[]}
          heading={`${t('homePage.EnergyHealingMantraTherapy')}`}
            expertise={'Healing-Therapy'}
            astroLoading={astroLoading}
          />
          <Swiper
            astrologers={[]}
          heading={`${t('homePage.TarotReaders')}`}
            expertise={'Tarot'}
            astroLoading={astroLoading}
          />
          <Swiper
            astrologers={[]}
            heading={`${t('homePage.vastuExperts')}`}
            expertise={'Vastu'}
            astroLoading={astroLoading}
          />
          <Swiper
            astrologers={[]}
            heading={`${t('homePage.numerologists')}`}
            expertise={'Numerology'}
            astroLoading={astroLoading}
          />
        </View>
      )}
    </View>
  );
};

export default Swipers;
