import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { colors } from '../assets/constants/colors';
import UserDetailsCard from '../components/UserDetailsCard';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import BoyDetailsForm from '../components/kundli/BoyDetailsForm';
import GirlDetailsForm from '../components/kundli/GirlDetailsForm';
import { KundliState } from '../context/KundliProvider';
import { useTheme } from '../context/ThemeContext';
import { useGetUserDetailsQuery } from '../redux/api/userApi';
import WithSafeArea from '../components/HOC/SafeAreaView';

const KundliMatching = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.user);
  const [suggestionPlacesBoy, setSuggestionPlacesBoy] = useState([]);
  const [suggestionPlacesGirl, setSuggestionPlacesGirl] = useState([]);
  const [searchedInput, setSearchedInput] = useState('');
  const [filteredUserDetails, setFilteredUserDetails] = useState([]);
  const [newKundli, setNewKundli] = useState(true);

  const { isDarkMode } = useTheme();
  const {
    boyName,
    boyBirthDate,
    boyBirthTime,
    boyBirthPlace,
    setBoyName,
    setBoyBirthDate,
    setBoyBirthTime,
    setBoyBirthPlace,
    girlName,
    girlBirthDate,
    girlBirthTime,
    girlBirthPlace,
    setGirlName,
    setGirlBirthDate,
    setGirlBirthTime,
    setGirlBirthPlace,
  } = KundliState();

  const { data } = useGetUserDetailsQuery(user?._id);
  const navigation = useNavigation();

  const handleMatch = () => {
    if (
      !boyName ||
      !boyBirthDate ||
      !boyBirthTime ||
      !boyBirthPlace ||
      !girlName ||
      !girlBirthPlace ||
      !girlBirthTime ||
      !girlBirthDate
    ) {
      return ToastAndroid.show(
        t('Match Kundli.newMatch.error.allDetailes'),
        ToastAndroid.SHORT,
      );
    }
    if (
      !suggestionPlacesBoy.includes(boyBirthPlace) ||
      !suggestionPlacesGirl.includes(girlBirthPlace)
    ) {
      alert(t('Match Kundli.newMatch.error.selectCity'));
      return;
    }

    navigation.navigate('KundliMatchingDetails');
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

  useFocusEffect(
    React.useCallback(() => {
      setSuggestionPlacesBoy([]);
      setSuggestionPlacesGirl([]);
      setSearchedInput('');
      setFilteredUserDetails([]);
      setBoyName('');
      setBoyBirthDate('');
      setBoyBirthTime('');
      setBoyBirthPlace('');
      setGirlName('');
      setGirlBirthDate('');
      setGirlBirthTime('');
      setGirlBirthPlace('');
      setNewKundli(true);
    }, [
      setBoyBirthDate,
      setBoyBirthPlace,
      setBoyBirthTime,
      setBoyName,
      setGirlBirthDate,
      setGirlBirthPlace,
      setGirlBirthTime,
      setGirlName,
    ]),
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('Match Kundli.screenHead'),
    });
  }, [navigation, t]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1,backgroundColor: isDarkMode ? colors.darkBackground : colors.lightBackground, }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 80}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{backgroundColor: isDarkMode ? colors.darkBackground : colors.lightBackground}}>
        <View
          style={{
            flex: 1,
            paddingHorizontal: 12,
            backgroundColor: isDarkMode ? colors.darkBackground : colors.lightBackground,
          }}
        >
          {/* Switch buttons */}
          <View
            style={{
              marginVertical: 8,
              flexDirection: 'row',
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: newKundli
                  ? isDarkMode
                    ? colors.darkBackground
                    : 'white'
                  : colors.purple,
                paddingVertical: 10,
                width: '50%',
                borderRadius: newKundli ? 0 : 12,
              }}
              onPress={() => setNewKundli(false)}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '500',
                  textAlign: 'center',
                  color: newKundli
                    ? isDarkMode
                      ? 'white'
                      : colors.purple
                    : 'white',
                }}
              >
                {t('Match Kundli.btn1')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: newKundli
                  ? colors.purple
                  : isDarkMode
                  ? colors.darkBackground
                  : 'white',
                paddingVertical: 10,
                width: '50%',
                borderRadius: newKundli ? 12 : 0,
              }}
              onPress={() => setNewKundli(true)}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '500',
                  color: newKundli
                    ? 'white'
                    : isDarkMode
                    ? 'white'
                    : colors.purple,
                  textAlign: 'center',
                }}
              >
                {t('Match Kundli.btn2')}
              </Text>
            </TouchableOpacity>
          </View>

          {newKundli ? (
            <View style={{flex:1, position:'relative'}}>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 150 }}
              >
                <GirlDetailsForm
                  girlBirthDate={girlBirthDate}
                  girlName={girlName}
                  girlBirthTime={girlBirthTime}
                  girlBirthPlace={girlBirthPlace}
                  setGirlName={setGirlName}
                  setGirlBirthDate={setGirlBirthDate}
                  setGirlBirthPlace={setGirlBirthPlace}
                  setGirlBirthTime={setGirlBirthTime}
                  suggestionPlaces={suggestionPlacesGirl}
                  setSuggestionPlaces={setSuggestionPlacesGirl}
                />
                <BoyDetailsForm
                  boyBirthDate={boyBirthDate}
                  boyName={boyName}
                  boyBirthPlace={boyBirthPlace}
                  boyBirthTime={boyBirthTime}
                  setBoyName={setBoyName}
                  setBoyBirthDate={setBoyBirthDate}
                  setBoyBirthPlace={setBoyBirthPlace}
                  setBoyBirthTime={setBoyBirthTime}
                  suggestionPlaces={suggestionPlacesBoy}
                  setSuggestionPlaces={setSuggestionPlacesBoy}
                />
              </ScrollView>

              <TouchableOpacity
                style={{
                  position: 'absolute',
                  bottom: 10,
                  alignSelf: 'center',
                  backgroundColor: colors.purple,
                  padding: 10,
                  borderRadius: 12,
                  width: '100%',
                }}
                onPress={handleMatch}
              >
                <Text
                  style={{
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    fontSize: 16,
                  }}
                >
                  {t('Match Kundli.newMatch.btn')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : filteredUserDetails ? (
            <View style={{flex:1}}>
              <View style={style.searchbar}>
                <FontAwesome
                  name="search"
                  size={18}
                  color={isDarkMode ? colors.lightGray : colors.gray}
                />
                <TextInput
                  style={{
                    width: '90%',
                    color: isDarkMode ? colors.lightGray : colors.gray,
                  }}
                  value={searchedInput}
                  onChangeText={setSearchedInput}
                  placeholder={t('Match Kundli.openKundli.inputPlaceholder')}
                  placeholderTextColor={
                    isDarkMode ? colors.lightGray : colors.gray
                  }
                />
              </View>
              <Text
                style={{
                  marginBottom: 12,
                  fontSize: 16,
                  fontWeight: '500',
                  color: isDarkMode ? colors.lightGray : 'black',
                }}
              >
                {t('Match Kundli.openKundli.recent')}
              </Text>
              <ScrollView>
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingBottom: 100,
                  }}
                >
                  {filteredUserDetails?.map((userDetail) => (
                    <UserDetailsCard
                      userDetail={userDetail}
                      key={userDetail._id}
                    />
                  ))}
                </View>
              </ScrollView>
            </View>
          ) : (
            <View style={{ marginTop: 20 }}>
              <Text
                style={{
                  textAlign: 'center',
                  color: isDarkMode ? colors.lightGray : 'black',
                }}
              >
                {t('Match Kundli.openKundli.emptyText')}
              </Text>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const style = StyleSheet.create({
  searchbar: {
    marginVertical: 12,
    borderWidth: 1,
    borderColor: 'gray',
    paddingHorizontal: 14,
    paddingVertical: 2,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 4,
    width: '100%',
  },
});

export default WithSafeArea(KundliMatching);
