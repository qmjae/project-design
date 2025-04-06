import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import Header from '../components/home/Header';
import WelcomeSection from '../components/home/WelcomeSection';
import ActionButtons from '../components/navigation/ActionButtons';
import BackgroundWrapper from '../components/common/BackgroundWrapper';
import { globalStyles } from '../styles/globalStyles';

export default function HomeScreen({ navigation }) {
  return (
    <BackgroundWrapper>
      <StatusBar style="dark" />
      <SafeAreaView style={globalStyles.safeArea} edges={['top']}>
        <View style={globalStyles.container}>
          <Header />
          <WelcomeSection />
          {/* Here you would add your dashboard/analytics content */}
          <View style={globalStyles.contentContainer}>
            {/* Dashboard content will go here */}
          </View>
        </View>
        <ActionButtons navigation={navigation} currentScreen="Home" />
      </SafeAreaView>
    </BackgroundWrapper>
  );
}