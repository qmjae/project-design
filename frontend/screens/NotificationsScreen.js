import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeaderNotification } from '../components/notification/HeaderNotification';
import NotificationSection from '../components/notification/NotificationSection';
import BackgroundWrapper from '../components/common/BackgroundWrapper';
import ActionButtons from '../components/navigation/ActionButtons';
import { globalStyles } from '../styles/globalStyles';
import Header from '../components/home/Header';

export default function NotificationsScreen({ navigation }) {
  return (
    <BackgroundWrapper>
      <SafeAreaView style={globalStyles.safeArea} edges={['top']}>
        <View style={styles.contentContainer}>
          <HeaderNotification />
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
    padding: 1,
    paddingBottom: 0, // Add padding to avoid overlap with bottom navigation
  }
};