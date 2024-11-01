import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import Header from '../components/home/Header';
import WelcomeSection from '../components/home/WelcomeSection';
import ActionButtons from '../components/home/ActionButtons';

export default function HomeScreen({ navigation }) {
  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.container}>
          <Header />
          <WelcomeSection />
          <ActionButtons navigation={navigation} />
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1, // Ensures the SafeAreaView fills the entire screen
    backgroundColor: '#fff', // Sets the background color to white
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, // Adjusts for Android status bar height
    paddingVertical: 25, // Adds vertical padding for content spacing
  },
  container: {
    flex: 1, // Fills the available space in the safe area
  },
});