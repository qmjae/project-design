import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';

export const HeaderHistory = ({ onBack, title = "History" }) => {
  const navigation = useNavigation();
  const handleBack = onBack || (() => navigation.goBack());

  return (
    <SafeAreaView>
      <View style={styles.header}>
        {/* <TouchableOpacity 
          onPress={onBack}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={40} color="black" />
        </TouchableOpacity> */}
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
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
    fontWeight: 'bold',
    color: '#FFD700',
  },
});
