import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const LoadingScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('SignIn');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/logo-name.png')} // Update the path to your logo
        style={styles.logo}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // Change to your preferred background color
  },
  logo: {
    width: 150, // Adjust the width as needed
    height: 200, // Adjust the height as needed
    marginBottom: 20,
  },
  appName: {
    fontSize: 24, // Adjust the font size as needed
    fontWeight: 'bold',
  },
});

export default LoadingScreen;
