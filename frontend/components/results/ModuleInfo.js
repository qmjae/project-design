import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export const ModuleInfo = ({ defectName, imageClass }) => {
  // Special case: No solar panel detected (Yellow alert)
  if (imageClass === "Not-Solar") {
    return (
      <View style={[styles.moduleInfo, styles.warningContainer]}>
        <View style={styles.warningHeader}>
          <Ionicons name="alert-circle" size={24} color="#FFD000" />
          <Text style={[styles.moduleTitle, styles.warningTitle]}>No solar panel detected</Text>
        </View>
        <Text style={styles.warningMessage}>
          This image does not appear to contain a solar panel. Please upload an image of a solar panel for defect detection.
        </Text>
      </View>
    );
  }

  // Special case: Not a thermal image (Red alert)
  if (imageClass === "Not-Thermal") {
    return (
      <View style={[styles.moduleInfo, styles.errorContainer]}>
        <View style={styles.errorHeader}>
          <Ionicons name="alert-circle" size={24} color="#FF6B6B" />
          <Text style={[styles.moduleTitle, styles.errorTitle]}>Not a thermal image</Text>
        </View>
        <Text style={styles.errorMessage}>
          This is not a thermal image. Please upload a thermal image for defect detection.
        </Text>
      </View>
    );
  }

  // Special case: No defects detected (Green alert)
  if (!defectName || defectName.toLowerCase().includes('no defect')) {
    return (
      <View style={[styles.moduleInfo, styles.infoContainer]}>
        <View style={styles.infoHeader}>
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          <Text style={[styles.moduleTitle, styles.infoTitle]}>No defects detected</Text>
        </View>
        <Text style={styles.infoMessage}>
          This solar panel appears to be functioning normally with no visible defects.
        </Text>
        <Text style={styles.moduleSubtitle}>(crystalline Si)</Text>
      </View>
    );
  }

  // Default: It's a solar panel with a detected defect
  return (
    <View style={styles.moduleInfo}>
      <Text style={styles.moduleTitle}>
        {defectName
          ? defectName.charAt(0).toUpperCase() + defectName.slice(1).replace(/-/g, ' ')
          : 'No defect'}
      </Text>
      <Text style={styles.moduleSubtitle}>(crystalline Si)</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  moduleInfo: {
    marginTop: 15,
    marginBottom: 10,
  },
  moduleTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },
  moduleSubtitle: {
    fontSize: 15,
    color: '#666',
    marginTop: 5,
  },
  warningContainer: {
    backgroundColor: '#FFFCE6',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD000',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  warningTitle: {
    marginLeft: 8,
    color: '#FFD000',
  },
  warningMessage: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  errorContainer: {
    backgroundColor: '#FFF5F5',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  errorTitle: {
    marginLeft: 8,
    color: '#FF6B6B',
  },
  errorMessage: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  infoContainer: {
    backgroundColor: '#F4FBF6',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    marginLeft: 8,
    color: '#4CAF50',
  },
  infoMessage: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 8,
  },
});