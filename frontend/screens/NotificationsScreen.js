import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { HeaderNotification } from '../components/notification/HeaderNotification';
import NotificationSection from '../components/notification/NotificationSection';
import BackgroundWrapper from '../components/common/BackgroundWrapper';
import ActionButtons from '../components/navigation/ActionButtons';
import { globalStyles, colors } from '../styles/globalStyles';

export default function NotificationsScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('Detected'); // Default filter

  return (
    <BackgroundWrapper>
      <StatusBar style="dark" />
      <SafeAreaView style={globalStyles.safeArea}>
        <View style={globalStyles.container}>
          <HeaderNotification title="Notifications" showBackButton={false} />
          
          {/* Filter Buttons */} 
          <View style={styles.filterContainer}>
            <TouchableOpacity 
              style={[styles.filterButton, activeFilter === 'Detected' && styles.activeFilterButton]}
              onPress={() => setActiveFilter('Detected')}
            >
              <Text style={[styles.filterButtonText, activeFilter === 'Detected' && styles.activeFilterButtonText]}>Detected</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterButton, activeFilter === 'Unresolved' && styles.activeFilterButton]}
              onPress={() => setActiveFilter('Unresolved')}
            >
              <Text style={[styles.filterButtonText, activeFilter === 'Unresolved' && styles.activeFilterButtonText]}>Unresolved</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterButton, activeFilter === 'Resolved' && styles.activeFilterButton]}
              onPress={() => setActiveFilter('Resolved')}
            >
              <Text style={[styles.filterButtonText, activeFilter === 'Resolved' && styles.activeFilterButtonText]}>Resolved</Text>
            </TouchableOpacity>
          </View>

          <NotificationSection activeFilter={activeFilter} />
        </View>
        <ActionButtons navigation={navigation} currentScreen="Notifications" />
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 20,
    paddingBottom: 50, 
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    marginHorizontal: 15, // Align with global container padding
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: colors.background.dark,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    color: colors.text.light,
    fontWeight: 'bold',
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
  },
});