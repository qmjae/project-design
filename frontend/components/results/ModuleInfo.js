import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export const ModuleInfo = ({ defectName, containsSolarPanel = true, message }) => {
  // Check if this is a "no solar panel" message, regardless of how it was passed
  const isNoSolarPanelMessage = 
    containsSolarPanel === false || 
    (message && message.toLowerCase().includes('no solar panel'));
  
  // Special case: No solar panel detected
  if (isNoSolarPanelMessage) {
    return (
      <View style={[styles.moduleInfo, styles.errorContainer]}>
        <View style={styles.errorHeader}>
          <Ionicons name="alert-circle" size={24} color="#FF6B6B" />
          <Text style={[styles.moduleTitle, styles.errorTitle]}>No solar panel detected</Text>
        </View>
        <Text style={styles.errorMessage}>
          This image does not appear to contain a solar panel. Please upload an image of a solar panel for defect detection.
        </Text>
      </View>
    );
  }

    // // Special case: No solar panel detected
    // if (isNoSolarPanelMessage) {
    //   return (
    //     <View style={[styles.moduleInfo, styles.infoContainer]}>
    //       <View style={styles.infoHeader}>
    //         <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
    //         <Text style={[styles.moduleTitle, styles.infoTitle]}>No defects detected</Text>
    //       </View>
    //       <Text style={styles.infoMessage}>
    //       This solar panel appears to be functioning normally with no visible defects.
    //       </Text>
    //     </View>
    //   );
    // }
  
  // If a specific message is provided for other cases, use that
  if (message) {
    return (
      <View style={styles.moduleInfo}>
        <Text style={styles.moduleTitle}>{message}</Text>
        <Text style={styles.moduleSubtitle}>(crystalline Si)</Text>
      </View>
    );
  }
  
  // If it's a solar panel with no defects detected
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
        {defectName.charAt(0).toUpperCase() + defectName.slice(1).replace(/-/g, ' ')}
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