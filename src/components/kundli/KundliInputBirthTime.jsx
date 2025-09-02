import FontAwesome from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from "@mohalla-tech/react-native-date-time-picker";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";
import { colors } from '../../assets/constants/colors';

const KundliInputBirthTime = ({ birthTime, setBirthTime }) => {
  const { t } = useTranslation();
  const [isExactBirthTime, setIsExactBirthTime] = useState(true);
  const { isDarkMode } = useTheme();
  const time = new Date(birthTime);

  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View
          style={{
            width: 25,
            height: 25,
            borderRadius: 1000,
            backgroundColor: colors.purple,
          }}
        ></View>
        <View
          style={{
            width: 25,
            height: 25,
            borderRadius: 1000,
            backgroundColor: colors.purple,
          }}
        ></View>

        <View
          style={{
            width: 25,
            height: 25,
            borderRadius: 1000,
            backgroundColor: colors.purple,
          }}
        ></View>
        <View
          style={{
            backgroundColor: colors.purple,
            borderRadius: 1000,
            width: 36,
            height: 36,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <FontAwesome name="clock-o" size={22} color="white" />
        </View>
        <View
          style={{
            width: 25,
            height: 25,
            borderRadius: 1000,
            backgroundColor: colors.lightGray,
          }}
        ></View>
      </View>
      <View
        style={{
          marginTop: 28,
        }}
      >
        <Text
          style={{
            fontSize: 28,
            color: isDarkMode ? "white" : colors.gray,
            fontWeight: "bold",
          }}
        >
          {t("kundli.screen4.head1")}
        </Text>
      </View>
      <View style={{ marginHorizontal: 20, marginTop: 28 }}>
        <DateTimePicker
          mode="time"
          is24Hour={false}
          initialValue={time}
          onChange={(selectedTime) => setBirthTime(selectedTime)}
          separatorColor={isDarkMode ? "white" : "black"}
          listItemStyle={{ color: isDarkMode ? "white" : "black" }}
        />
      </View>
      <View style={{ marginTop: 20, marginHorizontal: 12 }}>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
          onPress={() => setIsExactBirthTime(!isExactBirthTime)}
        >
          {isExactBirthTime ? (
            <FontAwesome
              name="square-o"
              size={20}
              color={isDarkMode ? "white" : "black"}
            />
          ) : (
            <FontAwesome
              name="check-square"
              size={20}
              color={isDarkMode ? "white" : "black"}
            />
          )}
          <Text
            style={{
              fontWeight: "600",
              fontSize: 14,
              color: isDarkMode ? "white" : "black",
            }}
          >
            {t("kundli.screen4.checkbox")}
          </Text>
        </TouchableOpacity>
        <View style={{ marginTop: 14 }}>
          <Text style={{ color: isDarkMode ? colors.lightGray : colors.gray }}>
            {t("kundli.screen4.note")}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default KundliInputBirthTime;
