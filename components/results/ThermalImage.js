import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

export const ThermalImage = ({ imageUri }) => (
  <View style={styles.imageContainer}>
    <Image 
      source={{ uri: imageUri }} 
      style={styles.thermalImage}
      resizeMode="contain"
    />
  </View>
);

const styles = StyleSheet.create({
  imageContainer: {
    height: 200,
    backgroundColor: '#F6F6F6',
    borderRadius: 10,
    overflow: 'hidden',
  },
  thermalImage: {
    width: '100%',
    height: '100%',
  },
}); 