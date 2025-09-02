import React, { createContext, useContext, useRef } from 'react';
import Sound from 'react-native-sound';

// Enable loading sounds from a URL
Sound.setCategory('Playback');

// Create the context
const SoundContext = createContext();

// Create the provider
export const SoundProvider = ({ children }) => {
  const soundRef = useRef(null); // To hold the sound instance

  // Function to play sound
  const playSound = (uri) => {
    try {
      if (soundRef.current) {
        soundRef.current.release(); // Release any existing sound instance
      }

      soundRef.current = new Sound(uri, null, (error) => {
        if (error) {
          console.error('Error loading sound:', error);
          return;
        }
        soundRef.current.play((success) => {
          if (!success) {
            console.error('Error during playback');
          }
          soundRef.current.release(); // Release the instance after playback
          soundRef.current = null; // Clear the reference
        });
      });
    } catch (error) {
      console.error('Error initializing sound:', error);
    }
  };

  // Function to stop sound
  const stopSound = () => {
    if (soundRef.current) {
      try {
        soundRef.current.stop(() => {
          soundRef.current.release(); // Release the instance after stopping
          soundRef.current = null; // Clear the reference
        });
      } catch (error) {
        console.error('Error stopping sound:', error);
      }
    }
  };

  // Function to play notification sound
  const playNotificationSound = () => {
    playSound(
      'https://res.cloudinary.com/doetbfahk/video/upload/v1728999932/message_tone_cjuulo.mp3',
    );
  };

  return (
    <SoundContext.Provider
      value={{ playSound, stopSound, playNotificationSound }}
    >
      {children}
    </SoundContext.Provider>
  );
};

// Custom hook to use the sound context
export const useSound = () => useContext(SoundContext);
