import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';

const ageRanges = [
  { label: '18 - 23', value: '18-23' },
  { label: '22 - 28', value: '22-28' },
  { label: '28 - 35', value: '28-35' },
  { label: '35 - 65', value: '35-65' },
  { label: '50 and above', value: '50+' },
];

export default function AgeSelectionScreen({ navigation }) {
  const [selected, setSelected] = useState(null);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Select your age',
      headerRight: () => (
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: 12,
            gap: 4,
          }}
          onPress={() => navigation.navigate('Footer', { screen: 'Home' })}
        >
          <Text style={{ color: 'white' }}>Skip</Text>
          <AntDesign
            name="right"
            size={12}
            color="white"
            style={{ marginTop: 2 }}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select your age range:</Text>
      {ageRanges.map((range) => (
        <TouchableOpacity
          key={range.value}
          style={[
            styles.option,
            selected === range.value && styles.selectedOption,
          ]}
          onPress={() => setSelected(range.value)}
        >
          <Text style={styles.optionText}>{range.label}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={[styles.continueButton, !selected && styles.disabledButton]}
        disabled={!selected}
        onPress={() =>
          navigation.navigate('ProblemChecklist', { ageRange: selected })
        }
      >
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  option: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#620880',
    marginBottom: 16,
    width: 220,
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#620880',
  },
  optionText: {
    fontSize: 18,
    color: '#1A1A1A',
  },
  continueButton: {
    marginTop: 32,
    backgroundColor: '#620880',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});
