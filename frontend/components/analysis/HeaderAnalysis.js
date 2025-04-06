import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export const HeaderAnalysis = ({ onBack }) => (
  <SafeAreaView>
    <View style={styles.header}>
    <View style={styles.headerTitleContainer}>
      <Text style={styles.headerTitle}>Analysis</Text>
    </View>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 25,
      position: 'relative',
    },
    backButton: {
      marginRight: 15,
      zIndex: 1,
      position: 'absolute',
      left: 0,
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