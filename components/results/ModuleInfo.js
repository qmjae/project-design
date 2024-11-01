import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const ModuleInfo = () => (
  <View style={styles.moduleInfo}>
    <Text style={styles.moduleTitle}>Defect Name</Text>
    <Text style={styles.moduleSubtitle}>(crystalline Si)</Text>
  </View>
);

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
    fontSize: 16,
    color: '#666',
    marginTop: 2,
  },
}); 