import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { signOut } from '../../../backend/lib/appwrite';
import { useGlobalContext } from '../../../backend/context/GlobalProvider';
import { useNavigation } from '@react-navigation/native';

export const HeaderProfile = ({ onBack }) => {
  const navigation = useNavigation();
  const { setIsLogged, setUser } = useGlobalContext();

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsLogged(false);
      setUser(null);
      navigation.navigate('SignIn');
    } catch (error) {
      Alert.alert('Error', error.message || 'An unexpected error occurred');
    }
  };

  return (
    <SafeAreaView>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={40} color="black" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutIcon}>
          <Ionicons name="log-out-outline" size={40} color="red" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    fontWeight: '500',
    color: '#FFD700',
  },
  signOutIcon: {
    position: 'absolute',
    right: 0,
  },
});