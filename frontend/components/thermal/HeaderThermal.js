import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet } from 'react-native';

export default HeaderThermal => (
  <SafeAreaView>
    <View style={styles.header}>
    <View style={styles.headerTitleContainer}>
      <Text style={styles.headerTitle}>Thermal Camera</Text>
    </View>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
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