import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import Header from '../components/Header';
import WelcomeSection from '../components/WelcomeSection';
import ActionButtons from '../components/ActionButtons';

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
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingVertical: 25,
  },
  container: {
    flex: 1,
  },
}); 