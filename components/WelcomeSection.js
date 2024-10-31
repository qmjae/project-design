import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

export default function WelcomeSection() {
  return (
    <View style={styles.welcomeSection}>
      <Text style={styles.welcomeText}>Welcome,</Text>
      <Text style={[styles.welcomeText, styles.highlightText]}>User</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  welcomeSection: {
    padding: 24,
    paddingTop: 50,
  },
  welcomeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#757575',
    lineHeight: 52,
  },
  highlightText: {
    color: '#FFD700',
  },
}); 