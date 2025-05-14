import React, { useState } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../styles/globalStyles';

const SnapshotButton = ({ onPress, isAnalyzing }) => {
  const [isCapturing, setIsCapturing] = useState(false);

  const handlePress = async () => {
    if (!isCapturing && !isAnalyzing) {
      setIsCapturing(true);
      try {
        await onPress();
      } finally {
        setIsCapturing(false);
      }
    }
  };

  const isDisabled = isCapturing || isAnalyzing;

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={[styles.button, isDisabled && styles.disabledButton]}
        onPress={handlePress}
        disabled={isDisabled}
      >
        {isAnalyzing ? (
          <>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.text}>Analyzing...</Text>
          </>
        ) : isCapturing ? (
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
    backgroundColor: colors.text.medium,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    elevation: 0,
  },
  text: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});