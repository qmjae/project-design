import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';

export const HeaderHistory = ({ onBack, title = "Defect History", showBackButton = true }) => {
  const navigation = useNavigation();
  const handleBack = onBack || (() => navigation.goBack());

  return (
    <View style={styles.header}>
      {showBackButton && (
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      )}
      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    position: 'relative',
  },
  backButton: {
    marginRight: 15,
    zIndex: 1,
    position: 'absolute',
    left: 0,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 29,
    fontWeight: 'bold',
    color: '#FFD700',
  },
});
