import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const HeaderResults = ({ onBack }) => (
  <SafeAreaView>
  <View style={styles.header}>
    <TouchableOpacity 
      onPress={onBack}
      style={styles.backButton}
    >
      <Ionicons name="arrow-back" size={40} color="black" />
    </TouchableOpacity>
    <View style={styles.headerTitleContainer}>
      <Text style={styles.headerTitle}>Results</Text>
    </View>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 25,
    position: 'relative',
  },
  backButton: {
    marginRight: 15,
    zIndex: 1,
    position: 'absolute',
    left: 20,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 29,
    fontWeight: 'bold',
    color: '#FFD700',
  },
}); 