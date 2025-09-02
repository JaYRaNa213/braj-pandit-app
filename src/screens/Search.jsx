import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { REACT_APP_BACKEND_URL } from '../utils/domain';
import { useTranslation } from 'react-i18next';
import { colors } from '../assets/constants/colors';

// Dummy image URL and no result found image
const DUMMY_IMAGE_URL = 'https://via.placeholder.com/150';
const NO_RESULT_FOUND_IMAGE = require('../assets/images/no-result-found.jpg'); // Ensure this image is available in your project

const Search = () => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceTimeoutRef = useRef(null);
  const navigation = useNavigation();

  const handleSearch = async (query) => {
    if (query.trim().length < 3) return;
    const formattedQuery = query.trim().replace(/\s+/g, '-');

    setLoading(true);
    try {
      const response = await axios.get(
        `${REACT_APP_BACKEND_URL}/user/universal-search?searchText=${formattedQuery}`,
      );
      setResults(response.data.data);
    } catch (error) {
      console.error('Failed to fetch search results', error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedHandleSearch = (query) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      handleSearch(query);
    }, 300); // 300ms delay
  };

  useEffect(() => {
    if (searchText) {
      debouncedHandleSearch(searchText);
    } else {
      setResults([]);
    }
  }, [searchText]);

  const handleResultClick = (type, url) => {
    Keyboard.dismiss();
    if (type === 'blog') {
      navigation.navigate('BlogDetails', {
        url: url,
      });
    }
    if (type === 'temple') {
      navigation.navigate('TempleDetails', {
        title: url,
      });
    }
    if (type === 'astrologer') {
      navigation.navigate('AstrologerProfile', {
        id: url,
      });
    }
    if (type === 'page') {
      navigation.navigate(url);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('search.screenHead'),
    });
  });

  return (
    <View style={[isDarkMode ? styles.darkContainer : styles.container]}>
      <TextInput
        style={[
          styles.input,
          {
            color: isDarkMode ? colors.darkTextPrimary : 'black',
            borderColor: isDarkMode ? colors.dark : colors.lightGray,
            backgroundColor: isDarkMode ? colors.darkSurface : 'white',
          },
        ]}
        placeholder={t('search.searchPlaceholder')}
        placeholderTextColor={isDarkMode ? colors.lightGray : colors.gray}
        value={searchText}
        onChangeText={(text) => setSearchText(text)}
        autoFocus={true}
      />

      {loading ? (
        <View style={styles.spinnerContainer}>
          <ActivityIndicator size="large" color="#501873" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.resultContainer}
          keyboardShouldPersistTaps="handled"
        >
          {searchText.trim() === '' || results.length === 0 ? (
            <View style={styles.noResultContainer}>
              <Image
                source={NO_RESULT_FOUND_IMAGE}
                style={styles.noResultImage}
              />
              <Text style={styles.noResultText}>
                {searchText.trim() === ''
                  ? t('search.searchScreen')
                  : searchText.trim().length < 3
                  ? t('search.atleastThreeletter')
                  : t('search.noResult')}
              </Text>
            </View>
          ) : (
            results.map((result, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.resultBox,
                  {
                    backgroundColor: isDarkMode
                      ? colors.darkSurface
                      : colors.white,
                  },
                ]}
                onPress={() => handleResultClick(result.type, result.url)}
              >
                <Image
                  source={{ uri: result.image || DUMMY_IMAGE_URL }}
                  style={styles.resultImage}
                />
                <View style={styles.resultTextContainer}>
                  <Text
                    style={[
                      styles.resultTitle,
                      { color: isDarkMode ? colors.white : colors.black },
                    ]}
                  >
                    {result.title || result.name}
                  </Text>
                  <Text
                    style={[
                      styles.resultType,
                      {
                        color: isDarkMode
                          ? colors.darkTextSecondary
                          : colors.dark,
                      },
                    ]}
                  >
                    {result.type}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.lightBackground,
  },
  darkContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.darkBackground,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#501873',
  },
  input: {
    height: 40,
    borderColor: '#501873',
    borderWidth: 1,
    borderRadius: 10,
    paddingLeft: 15,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  spinnerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultContainer: {
    flexGrow: 1,
  },
  noResultContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  noResultImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  noResultText: {
    fontSize: 16,
    color: 'gray',
  },
  resultBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  resultImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultType: {
    fontSize: 14,
    color: 'gray',
    textTransform: 'capitalize',
  },
});

export default Search;
