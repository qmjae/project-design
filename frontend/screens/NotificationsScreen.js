import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import NotificationSection from '../components/notification/NotificationSection';
import BackgroundWrapper from '../components/common/BackgroundWrapper';
import ActionButtons from '../components/navigation/ActionButtons';
import { globalStyles } from '../styles/globalStyles';

export default function NotificationsScreen({ navigation }) {
  return (
    <BackgroundWrapper>
      <StatusBar style="dark" />
      <SafeAreaView style={globalStyles.safeArea} edges={['top']}>
        <View style={globalStyles.container}>
          <NotificationSection />
        </View>
        <ActionButtons navigation={navigation} currentScreen="Notifications" />
      </SafeAreaView>
    </BackgroundWrapper>
  );
}