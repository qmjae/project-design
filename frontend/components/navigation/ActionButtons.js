import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ActionButtons({ navigation, currentScreen = 'Home' }) {
  return (
    <View style={styles.bottomNavContainer}>
      <TouchableOpacity 
        style={[styles.navItem, currentScreen === 'Home' && styles.activeNavItem]}
        onPress={() => navigation.navigate('Home')}
      >
        <Ionicons 
          name="home" 
          size={24} 
          color={currentScreen === 'Home' ? '#76c0df' : '#666'}
        />
        <Text style={[styles.navText, currentScreen === 'Home' && styles.activeNavText]}>Home</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.navItem, currentScreen === 'Analysis' && styles.activeNavItem]}
        onPress={() => navigation.navigate('Analysis')}
      >
        <Ionicons 
          name="add-circle" 
          size={24} 
          color={currentScreen === 'Analysis' ? '#76c0df' : '#666'}
        />
        <Text style={[styles.navText, currentScreen === 'Analysis' && styles.activeNavText]}>Analysis</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.cameraButton}
        onPress={() => navigation.navigate('ThermalCamera')}
      >
        <Ionicons name="camera" size={28} color="#fff" />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.navItem, currentScreen === 'DefectHistory' && styles.activeNavItem]}
        onPress={() => navigation.navigate('DefectHistory', { notificationId: null, fileName: null })}
      >
        <Ionicons 
          name="archive" 
          size={24} 
          color={currentScreen === 'DefectHistory' ? '#76c0df' : '#666'}
        />
        <Text style={[styles.navText, currentScreen === 'DefectHistory' && styles.activeNavText]}>History</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.navItem, currentScreen === 'Notifications' && styles.activeNavItem]}
        onPress={() => navigation.navigate('Notifications')}
      >
        <Ionicons 
          name="notifications" 
          size={24} 
          color={currentScreen === 'Notifications' ? '#76c0df' : '#666'}
        />
        <Text style={[styles.navText, currentScreen === 'Notifications' && styles.activeNavText]}>Alerts</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    height: 65,
    paddingBottom: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  activeNavItem: {
    borderTopWidth: 3,
    borderTopColor: '#76c0df',
    paddingTop: 3,
  },
  navText: {
    fontSize: 12,
    marginTop: 3,
    color: '#666',
  },
  activeNavText: {
    color: '#76c0df',
    fontWeight: 'bold',
  },
  cameraButton: {
    backgroundColor: '#76c0df',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 3,
    borderColor: '#fff',
  },
});