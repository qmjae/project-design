import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useGlobalContext } from '../../backend/context/GlobalProvider';

const LoadingScreen = () => {
  const navigation = useNavigation();
  const { loading, isLogged } = useGlobalContext();

  useEffect(() => {
    if (!loading && isLogged) {
      navigation.navigate('Home');
    } else {
      const timer = setTimeout(() => {
        navigation.replace('SignIn');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [loading, isLogged, navigation]);

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/logo-name.png')}
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
    backgroundColor: '#fff',
  },
  logo: {
    width: 150,
    height: 200,
    marginBottom: 20,
  },
});

export default LoadingScreen;
