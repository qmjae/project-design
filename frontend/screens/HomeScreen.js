import React from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import Header from '../components/home/Header';
import WelcomeSection from '../components/home/WelcomeSection';
import DashboardSection from '../components/home/DashboardSection';
import ActionButtons from '../components/navigation/ActionButtons';
import BackgroundWrapper from '../components/common/BackgroundWrapper';
import { globalStyles } from '../styles/globalStyles';

export default function HomeScreen({ navigation }) {
  return (
    <BackgroundWrapper>
      <StatusBar style="dark" />
      <SafeAreaView style={globalStyles.safeArea} edges={['top']}>
        <ScrollView style={globalStyles.container} showsVerticalScrollIndicator={false}>
          <Header />
          <WelcomeSection />
          <DashboardSection />
        </ScrollView>
        <ActionButtons navigation={navigation} currentScreen="Home" />
      </SafeAreaView>
    </BackgroundWrapper>
  );
}