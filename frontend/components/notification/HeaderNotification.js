import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export function HeaderNotification({ title = 'Notifications' }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.title}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 25,
    paddingVertical: 5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    zIndex: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color:  "#FFD700",
    textAlign: 'center',
    width: '100%',
  },
});