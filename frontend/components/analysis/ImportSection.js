import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, { 
  useSharedValue,
  useAnimatedStyle, 
  withSequence,
  withTiming,
  withRepeat
} from 'react-native-reanimated';

export const ImportSection = ({ onPress }) => {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1000 }),
        withTiming(0, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }]
  }));

  return (
    <TouchableOpacity onPress={onPress}>
      <Animated.View style={[styles.importSection, animatedStyle]}>
        <Ionicons name="cloud-upload-outline" size={50} color="#FFD700" />
        <Text style={styles.importText}>Import your image</Text>
        <Text style={styles.clickText}>Click to upload</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  importSection: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#FFD700',
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    padding: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  importText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#FFD700',
  },
  clickText: {
    color: '#B2B2B8',
    marginTop: 5,
    fontSize: 20,
  },
}); 