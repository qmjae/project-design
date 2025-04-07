import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Header() {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Image 
            source={require('../../../assets/adlaw-logov2.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: "5%",
  },
  logoContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: -1,
  },
  menuButton:{
    position: 'absolute',
    left: 15,
    zIndex: 1,
  },
  logo: {
    width: 60,
    height: 70,
  },
}); 