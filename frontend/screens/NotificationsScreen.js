import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import NotificationSection from '../components/home/NotificationSection';
import BackgroundWrapper from '../components/common/BackgroundWrapper';
import ActionButtons from '../components/home/ActionButtons';

export default function NotificationsScreen({ navigation }) {
  return (
    <BackgroundWrapper>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.container}>
          <NotificationSection />
        </View>
        <ActionButtons navigation={navigation} currentScreen="Notifications" />
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',

  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingBottom: 65, // Add space for bottom navigation
    paddingTop: 20,
  },
});