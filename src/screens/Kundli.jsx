import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { colors } from '../assets/constants/colors';
import UserDetailsCard from '../components/UserDetailsCard';
import { useChat } from '../context/ChatContext';
import { useTheme } from '../context/ThemeContext';
import { useGetUserDetailsQuery } from '../redux/api/userApi';
import WithSafeArea from '../components/HOC/SafeAreaView';

const Kundli = ({ navigation }) => {
  const { t } = useTranslation();
  const {
    data,
    isLoading,
    refetch: refetchUserDetails,
  } = useGetUserDetailsQuery('');
  const [filteredUserDetails, setFilteredUserDetails] = useState([]);

  const [refreshing, setRefreshing] = useState(false);
  const { setRefetch, refetch } = useChat();
  const [searchedInput, setSearchedInput] = useState('');
  const { isDarkMode } = useTheme();

  const onRefresh = () => {
    setRefreshing(true);
    setRefetch(!refetch);
    refetchUserDetails();
    setRefreshing(false);
  };

  useEffect(() => {
    setFilteredUserDetails(
      data?.userDetails?.filter((userDetail) =>
        userDetail.name.includes(searchedInput),
      ),
    );
  }, [data?.userDetails, searchedInput]);

  useEffect(() => {
    setFilteredUserDetails(data?.userDetails || []);
  }, [data]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('kundli.screenHead'),
    });
  });

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: isDarkMode ? colors.darkBackground : colors.lightBackground,
        }}
      >
        <ActivityIndicator
          size="large"
          color={isDarkMode ? 'white' : colors.purple}
        />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDarkMode ? colors.darkBackground : colors.lightBackground,
        paddingHorizontal: 12,
      }}
    >
      <View
        style={[
          style.searchBar,
          {
            backgroundColor: isDarkMode ? colors.darkSurface : '#fff',
            borderColor: isDarkMode ? colors.dark : colors.lightGray,
            borderWidth:2
          },
        ]}
      >
        <FontAwesome
          name="search"
          size={18}
          color={isDarkMode ? colors.lightGray : 'gray'}
        />
        <TextInput
          style={[
            style.searchbarInput,
            { color: isDarkMode ? colors.darkTextPrimary : '#000' },
          ]}
          placeholder={t('kundli.searchPlaceholder')}
          placeholderTextColor={isDarkMode ? colors.darkTextSecondary : '#888'}
          value={searchedInput}
          onChangeText={setSearchedInput}
        />
      </View>
      {filteredUserDetails ? (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={isDarkMode ? 'white' : colors.purple}
            />
          }
        >
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              paddingBottom: 100,
            }}
          >
            {filteredUserDetails?.map((userDetail) => (
              <UserDetailsCard userDetail={userDetail} key={userDetail._id} />
            ))}
          </View>
        </ScrollView>
      ) : (
        <View style={{ marginTop: 20 }}>
          <Text
            style={{ textAlign: 'center', color: isDarkMode ? '#aaa' : '#000' }}
          >
            {t('kundli.emptyText')}
          </Text>
        </View>
      )}
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 20,
          alignSelf: 'center',
          backgroundColor: colors.purple,
          padding: 10,
          borderRadius: 20,
          width: '100%',
        }}
        onPress={() => navigation.navigate('KundliInputs')}
      >
        <Text
          style={{
            color: 'white',
            fontWeight: 'bold',
            textAlign: 'center',
            fontSize: 16,
          }}
        >
          {t('kundli.button')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const style = StyleSheet.create({
  searchBar: {
    marginVertical: 12,
    borderWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: 14,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
});

export default WithSafeArea(Kundli);
