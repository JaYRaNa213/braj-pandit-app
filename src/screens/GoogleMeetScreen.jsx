import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Linking,
  TouchableOpacity,
  Clipboard,
  Alert,
} from 'react-native';

const GoogleMeetScreen = ({ route }) => {
  const [meetingLink, setMeetingLink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const createMeeting = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Prepare meeting details
      const meetingDetails = {
        displayName: 'Meeting with Astrologer',
        description: 'Consultation session',
        startTime: '2024-03-20T10:00:00Z',
        endTime: '2024-03-20T11:00:00Z',
      };

      // Call backend API to create Google Meet
      const response = await fetch(
        'http://localhost:5050/api/meet/create-meeting',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(meetingDetails),
        },
      );

      let meetUrl = null;
      if (response.ok) {
        const data = await response.json();
        if (data && data.meetingUri) {
          meetUrl = data.meetingUri;
        }
      }

      // Fallback: If no valid response, generate a random Google Meet link
      if (!meetUrl) {
        const randomId = Math.random().toString(36).substring(2, 12);
        meetUrl = `https://meet.google.com/${randomId}`;
      }

      setMeetingLink(meetUrl);
    } catch (err) {
      console.error('Error creating meeting:', err);
      setError('Failed to create meeting');
      // Fallback: If error, generate a random Google Meet link
       const randomId = 'nbt-wdpj-xcg';
      setMeetingLink(`https://meet.google.com/${randomId}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const joinMeeting = async () => {
    if (meetingLink) {
      try {
        const supported = await Linking.canOpenURL(meetingLink);
        if (supported) {
          await Linking.openURL(meetingLink);
        } else {
          setError('Cannot open Google Meet URL');
        }
      } catch (err) {
        console.error('Error opening meeting:', err);
        setError('Failed to open meeting');
      }
    }
  };

  const copyToClipboard = () => {
    Clipboard.setString(meetingLink);
    setCopied(true);
    Alert.alert('Copied!', 'Meeting link copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    createMeeting();
  }, [createMeeting]);

  return (
    <View style={styles.background}>
      <View style={styles.card}>
        <Text style={styles.emoji}>🎥</Text>
        <Text style={styles.title}>Google Meet Session</Text>
        <Text style={styles.subtitle}>Your meeting is ready!</Text>
        {loading && <Text style={styles.info}>Creating meeting...</Text>}
        {error && <Text style={styles.error}>{error}</Text>}
        {meetingLink && (
          <View style={styles.meetingContainer}>
            <Text style={styles.meetingLabel}>Meeting Link:</Text>
            <TouchableOpacity style={styles.linkRow} onPress={copyToClipboard}>
              <Text
                style={styles.meetingLink}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {meetingLink}
              </Text>
              <Text style={styles.copyIcon}>{copied ? '✅' : '📋'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.joinButton} onPress={joinMeeting}>
              <Text style={styles.joinButtonIcon}>🔗</Text>
              <Text style={styles.joinButtonText}>Join Meeting</Text>
            </TouchableOpacity>
          </View>
        )}
        {!meetingLink && !loading && (
          <TouchableOpacity style={styles.createButton} onPress={createMeeting}>
            <Text style={styles.joinButtonIcon}>➕</Text>
            <Text style={styles.joinButtonText}>Create New Meeting</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 28,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
    fontFamily: 'sans-serif-medium',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 18,
  },
  info: {
    color: '#888',
    marginBottom: 10,
  },
  meetingContainer: {
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  meetingLabel: {
    fontSize: 15,
    color: '#555',
    marginBottom: 4,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f4',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 14,
    width: '100%',
    justifyContent: 'center',
  },
  meetingLink: {
    color: '#4285F4',
    fontSize: 15,
    fontWeight: 'bold',
    maxWidth: '80%',
  },
  copyIcon: {
    fontSize: 18,
    marginLeft: 8,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4285F4',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginTop: 6,
    marginBottom: 2,
    shadowColor: '#4285F4',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34A853',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginTop: 16,
    shadowColor: '#34A853',
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },
  joinButtonIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  error: {
    color: '#d32f2f',
    marginBottom: 10,
    fontWeight: 'bold',
  },
});

export default GoogleMeetScreen;
