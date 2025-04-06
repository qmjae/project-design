import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export const HeaderNotification = ({title = "Notifications"}) => (
        <SafeAreaView>
            <View style={styles.header}>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>{title}</Text>
                </View>
            </View>
        </SafeAreaView>
  );

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