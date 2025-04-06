import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import Header from '../components/home/Header';
import WelcomeSection from '../components/home/WelcomeSection';
import ActionButtons from '../components/home/ActionButtons';
import BackgroundWrapper from '../components/common/BackgroundWrapper';
// We'll move the NotificationSection to its own screen

export default function HomeScreen({ navigation }) {
  return (
    <BackgroundWrapper>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.container}>
          <Header />
          <WelcomeSection />
          {/* Here you would add your dashboard/analytics content */}
          <View style={styles.dashboardContainer}>
            {/* Dashboard content will go here */}
          </View>
        </View>
        <ActionButtons navigation={navigation} currentScreen="Home" />
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingBottom: 65, // Add space for bottom navigation
  },
  dashboardContainer: {
    flex: 1,
    padding: 20,
    // Add styling for your dashboard content
  },
});