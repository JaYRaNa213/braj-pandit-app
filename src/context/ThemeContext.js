import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../assets/constants/colors';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const textColor = isDarkMode ? 'white' : colors.dark;

  useEffect(() => {
    // Load the dark mode state from AsyncStorage when the app starts
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('darkMode');
        if (savedTheme !== null) {
          setIsDarkMode(JSON.parse(savedTheme));
        }
      } catch (error) {
        console.error('Failed to load theme from AsyncStorage', error);
      }
    };

    loadTheme();
  }, []);

  const toggleTheme = async () => {
    try {
      const newIsDarkMode = !isDarkMode;
      setIsDarkMode(newIsDarkMode);
      await AsyncStorage.setItem('darkMode', JSON.stringify(newIsDarkMode));
    } catch (error) {
      console.error('Failed to save theme to AsyncStorage', error);
    }
  };

  return <ThemeContext.Provider value={{ isDarkMode, toggleTheme, textColor }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
