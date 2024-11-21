import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const FormField = ({ title, value, handleChangeText, otherStyles, keyboardType, secureTextEntry }) => {
  return (
    <View style={[styles.container, otherStyles]}>
      <Text style={styles.label}>{title}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={handleChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
});

export default FormField;
