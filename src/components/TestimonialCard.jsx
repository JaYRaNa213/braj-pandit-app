import React, { useEffect, useState, memo } from 'react';
import { Text, View, StyleSheet, Image, Pressable } from 'react-native';
import { colors } from '../assets/constants/colors';
import { useTheme } from '../context/ThemeContext';

function TestimonialCard({ astrologer }) {
  const [selectedReview, setSelectedReview] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [expanded, setExpanded] = useState(false);

  const { isDarkMode } = useTheme();

  useEffect(() => {
    setReviews(astrologer?.reviews);
  }, [astrologer]);

  useEffect(() => {
    if (reviews?.length > 0) setSelectedReview(reviews[0]);
  }, [reviews]);

  return (
    <>
      {selectedReview && (
        <View
          style={[
            style.card,
            { backgroundColor: isDarkMode ? colors.darkSurface : '#F5F3FF' },
          ]}
        >
          <Text
            style={[
              style.title,
              { color: isDarkMode ? '#BB86FC' : colors.purple },
            ]}
          >
            What customers say about {astrologer?.name}:
          </Text>

          <View style={style.contentRow}>
            {/* Review text */}
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text
                style={[
                  style.reviewText,
                  { color: isDarkMode ? '#E0E0E0' : '#333' },
                ]}
                numberOfLines={expanded ? undefined : 3}
              >
                “{selectedReview?.description}”
              </Text>

              {/* Read more / less */}
              {selectedReview?.description?.length > 100 && (
                <Pressable onPress={() => setExpanded(!expanded)}>
                  <Text
                    style={[
                      style.readMore,
                      { color: isDarkMode ? '#BB86FC' : colors.purple },
                    ]}
                  >
                    {expanded ? 'Read less' : 'Read more'}
                  </Text>
                </Pressable>
              )}
            </View>

            {/* Reviewer */}
            <View style={style.reviewerContainer}>
              <Image
                source={{ uri: selectedReview.image }}
                style={style.profilePic}
              />
              <Text
                style={[
                  style.reviewerName,
                  { color: isDarkMode ? '#fff' : '#444' },
                ]}
              >
                {selectedReview.name}
              </Text>
            </View>
          </View>
        </View>
      )}
    </>
  );
}

const style = StyleSheet.create({
  card: {
    width: '100%',
    padding: 16,
    backgroundColor: '#F5F3FF', // soft lavender (premium look)
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  title: {
    color: colors.purple,
    fontSize: 15,
    marginBottom: 10,
    fontWeight: '600',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  reviewText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#333',
    lineHeight: 20,
  },
  readMore: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '500',
    color: colors.purple,
  },
  reviewerContainer: {
    width: 80,
    alignItems: 'center',
  },
  profilePic: {
    width: 55,
    height: 55,
    borderRadius: 28,
    marginBottom: 6,
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
    textAlign: 'center',
  },
});

export default memo(TestimonialCard);
