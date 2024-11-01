import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const Section = ({ title, content }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}:</Text>
    <Text style={styles.sectionText}>{content}</Text>
  </View>
);

const styles = StyleSheet.create({
  section: {
    marginTop: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  sectionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
}); 