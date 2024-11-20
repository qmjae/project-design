import React, { useState } from 'react';
import {  StyleSheet, View} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HeaderProfile } from '../components/profile/HeaderProfile';
import ImageProfile from '../components/profile/ImageProfile';

export default function ProfileScreen() {
    const navigation = useNavigation();
    return (
        <View style={styles.container}>
        <HeaderProfile onBack={() => navigation.navigate('Home')} />
        <ImageProfile />
        </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  signOutIcon: {
    marginLeft: 15,
    zIndex: 1,
    position: 'absolute',
    right: 0,
  },
}); 