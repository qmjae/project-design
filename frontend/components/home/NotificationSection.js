import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function NotificationsSection() {
  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Ionicons name="notifications" size={40} color="#76c0df" />
        <Text style={styles.sectionTitle}>Notifications</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#FFD700',
  },
});