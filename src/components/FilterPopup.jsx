import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axiosInstance from '../utils/axiosInstance';
import { useTheme } from '../context/ThemeContext';
import { colors } from '../assets/constants/colors';

const FilterPopup = ({
  isOpen,
  onClose,
  astrologers,
  onApplyFilters,
  onReset,
  filtersApplied,
}) => {
  const [filters, setFilters] = useState(null);
  const [activeTab, setActiveTab] = useState('skills');

  // State management for unique filter values
  const [uniqueSkills, setUniqueSkills] = useState([]);
  const [uniqueLanguages, setUniqueLanguages] = useState([]);
  const [topAstrologers, setTopAstrologers] = useState([]);
  const [uniqueCities, setUniqueCities] = useState([]);
  const [uniqueStates, setUniqueStates] = useState([]);

  // State management for selected filters
  const [selectedSkills, setSelectedSkills] = useState(new Set());
  const [selectedLanguages, setSelectedLanguages] = useState(new Set());
  const [selectedTopAstrologers, setSelectedTopAstrologers] = useState(
    new Set(),
    1,
  );
  const [selectedCities, setSelectedCities] = useState(new Set());
  const [selectedStates, setSelectedStates] = useState(new Set());
  const {isDarkMode}=useTheme();

  const fetchFilters = async () => {
    try {
      const res = await axiosInstance.get('/astro/filters');
      if (!res || !res.data || !res.data.filters) {
        console.error('Error fetching filters:', res);
        return;
      }
      setFilters(res.data.filters);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  useEffect(() => {
    if (filters) {
      setUniqueSkills(filters.expertise);
      setUniqueLanguages(filters.languages);
      setTopAstrologers(filters.taglines);
      setUniqueCities(filters.cities);
      setUniqueStates(filters.states);
    }
  }, [filters]);

  useEffect(() => {
    fetchFilters();
  }, []);

  const toggleSelection = (item, selected, setSelected) => {
    const updatedSelection = new Set(selected);
    if (updatedSelection.has(item)) {
      updatedSelection.delete(item);
    } else {
      updatedSelection.add(item);
    }
    setSelected(updatedSelection);
  };

  const handleApplyFilters = () => {
    const appliedFilters = JSON.stringify({
      skills: Array.from(selectedSkills),
      language: Array.from(selectedLanguages),
      topAstrologers: Array.from(selectedTopAstrologers),
      cities: Array.from(selectedCities),
      states: Array.from(selectedStates),
    });

    onApplyFilters(appliedFilters);
    filtersApplied(appliedFilters);
    onClose();
  };

  const handleReset = () => {
    setSelectedSkills(new Set());
    setSelectedLanguages(new Set());
    setSelectedTopAstrologers(new Set());
    setSelectedCities(new Set());
    setSelectedStates(new Set());
    filtersApplied({});
    onReset();
    onClose();
  };

  const renderFilterOptions = (data, selected, setSelected) => (
    <FlatList
      data={data}
      keyExtractor={(item) => item}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => toggleSelection(item, selected, setSelected)}
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            padding: 10,
            backgroundColor: selected.has(item) ? '#e5d1f9' : (isDarkMode? colors.darkSurface: colors.white),
            marginVertical: 4,
            borderRadius: 8,
          }}
        >
          <Ionicons
            name={selected.has(item) ? 'checkmark-circle' : 'ellipse-outline'}
            size={20}
            color={selected.has(item) ? '#6b46c1' : '#ccc'}
            style={{ marginRight: 8 }}
          />
          <Text style={{ fontSize: 16, color:selected.has(item) ? colors.purple : (isDarkMode? colors.white: colors.black)}}>{item}</Text>
        </TouchableOpacity>
      )}
      style={{ height: 400 }}
    />
  );

  return (
    <Modal visible={isOpen} animationType="slide" transparent={true}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 10,
            marginHorizontal: 20,
            padding: 20,
            backgroundColor:isDarkMode? colors.darkBackground: colors.lightBackground
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              marginBottom: 10,
              color:isDarkMode? colors.white: colors.black
            }}
          >
            Filters
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
            }}
          >
            <Ionicons name="close" size={24} color={isDarkMode? colors.lightGray: colors.black} />
          </TouchableOpacity>

          <ScrollView
            horizontal
            style={{ flexDirection: 'row', marginBottom: 10 }}
            showsHorizontalScrollIndicator={false}
          >
            {['skills', 'languages', 'top-Astrologers', 'cities', 'states'].map(
              (tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderBottomWidth: 2,
                    borderBottomColor: activeTab === tab ? colors.white : colors.darkBackground,
                    height: 40,
                    marginHorizontal: 12,
                  }}
                >
                  <Text
                    style={{
                      textAlign: 'center',
                      color: activeTab === tab ? colors.white : colors.lightGray,
                      textTransform: 'capitalize',
                    }}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              ),
            )}
          </ScrollView>
          {activeTab === 'skills' &&
            renderFilterOptions(
              uniqueSkills,
              selectedSkills,
              setSelectedSkills,
            )}
          {activeTab === 'languages' &&
            renderFilterOptions(
              uniqueLanguages,
              selectedLanguages,
              setSelectedLanguages,
            )}
          {activeTab === 'top-Astrologers' &&
            renderFilterOptions(
              topAstrologers,
              selectedTopAstrologers,
              setSelectedTopAstrologers,
            )}
          {activeTab === 'cities' &&
            renderFilterOptions(
              uniqueCities,
              selectedCities,
              setSelectedCities,
            )}
          {activeTab === 'states' &&
            renderFilterOptions(
              uniqueStates,
              selectedStates,
              setSelectedStates,
            )}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              marginTop: 20,
              gap:10
            }}
          >
            <TouchableOpacity
              onPress={handleReset}
              style={{
                padding: 10,
                borderWidth: 1,
                borderColor: isDarkMode ? colors.white:'#6b46c1',
                borderRadius: 8,
              }}
            >
              <Text style={{ color: isDarkMode ? colors.white:'#6b46c1' }}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleApplyFilters}
              style={{
                padding: 10,
                backgroundColor: '#6b46c1',
                borderRadius: 8,
              }}
            >
              <Text style={{ color: '#fff' }}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FilterPopup;
