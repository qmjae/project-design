import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useGlobalContext } from '../../../backend/context/GlobalProvider';

export default function WelcomeSection() {
  const { user } = useGlobalContext();

  return (
    <View style={styles.welcomeSection}>
      <Text style={styles.welcomeText}>Welcome,</Text>
      <Text style={[styles.welcomeText, styles.highlightText]}>
        {user ? user.username : 'User'}
      </Text>
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