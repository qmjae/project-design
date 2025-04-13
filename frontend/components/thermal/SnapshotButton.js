import React, { useState } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../styles/globalStyles';

const SnapshotButton = ({ onPress }) => {
  const [isCapturing, setIsCapturing] = useState(false);

  const handlePress = async () => {
    if (!isCapturing) {
      setIsCapturing(true);
      await onPress(); // Wait for the snapshot function to execute
      setIsCapturing(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={[styles.button, isCapturing && styles.disabledButton]}
        onPress={handlePress}
        disabled={isCapturing}
      >
        {isCapturing ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Ionicons name="camera" size={24} color="#fff" />
            <Text style={styles.text}>Take Snapshot</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default SnapshotButton;

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  button: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 15,
    ...shadows.light,
  },
  disabledButton: {
    backgroundColor: colors.primary + '99', // Make it slightly transparent when disabled
  },
  text: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});