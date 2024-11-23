import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { 
  FadeInDown 
} from 'react-native-reanimated';
import { useGlobalContext } from '../../../backend/context/GlobalProvider';

export default function WelcomeSection() {
  const { user } = useGlobalContext();

  const AnimatedText = Animated.Text;

  return (
    <View style={styles.welcomeSection}>
      <AnimatedText 
        entering={FadeInDown.delay(200).springify()}
        style={styles.welcomeText}
      >
        Welcome,
      </AnimatedText>
      <AnimatedText 
        entering={FadeInDown.delay(400).springify()}
        style={[styles.welcomeText, styles.highlightText]}
      >
        {user ? user.username : 'User'}
      </AnimatedText>
    </View>
  );
}

const styles = StyleSheet.create({
  welcomeSection: {
    padding: 24,
    paddingTop: 50,
  },
  welcomeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#757575',
    lineHeight: 52,
  },
  highlightText: {
    color: '#FFD700',
  },
}); 