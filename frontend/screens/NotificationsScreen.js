import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { HeaderNotification } from '../components/notification/HeaderNotification';
import NotificationSection from '../components/notification/NotificationSection';
import BackgroundWrapper from '../components/common/BackgroundWrapper';
import ActionButtons from '../components/navigation/ActionButtons';
import { globalStyles } from '../styles/globalStyles';

export default function NotificationsScreen({ navigation }) {
  return (
    <BackgroundWrapper>
      <StatusBar style="dark" />
      <SafeAreaView style={globalStyles.safeArea}>
        <View style={globalStyles.container}>
          <HeaderNotification title="Notifications" showBackButton={false} />
          <NotificationSection />
        </View>
        <ActionButtons navigation={navigation} currentScreen="Notifications" />
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = {
  contentContainer: {
    flex: 1,
    padding: 20,
    paddingBottom: 50, // Add padding to avoid overlap with bottom navigation
  }
};