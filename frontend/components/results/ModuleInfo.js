import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const ModuleInfo = ({ defectName }) => (
  <View style={styles.moduleInfo}>
    <Text style={styles.moduleTitle}>
      {defectName ? defectName.charAt(0).toUpperCase() + defectName.slice(1).replace(/-/g, ' ') : 'No defect detected'}
    </Text>
    <Text style={styles.moduleSubtitle}>(crystalline Si)</Text>
  </View>
);

const styles = StyleSheet.create({
  moduleInfo: {
    marginTop: 15,
  },
  moduleTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },
  moduleSubtitle: {
    fontSize: 15,
    color: '#666',
  },
}); 