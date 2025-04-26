import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HeaderProfile } from '../components/profile/HeaderProfile';
import ImageProfile from '../components/profile/ImageProfile';
import ServerSettings from '../components/profile/ServerSettings';
import BackgroundWrapper from '../components/common/BackgroundWrapper';

export default function ProfileScreen() {
    const navigation = useNavigation();
    return (
        <BackgroundWrapper>
            <View style={styles.container}>
                <HeaderProfile onBack={() => navigation.navigate('Home')} />
                <ScrollView showsVerticalScrollIndicator={false}>
                    <ImageProfile />
                    <ServerSettings />
                </ScrollView>
            </View>
        </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 20,
  },
  signOutIcon: {
    marginLeft: 15,
    zIndex: 1,
    position: 'absolute',
    right: 0,
  },
});