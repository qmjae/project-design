import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ActionButtons({ navigation }) {
  return (
    <View style={styles.actionButtonsContainer}>
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => navigation.navigate('Analysis')}
      >
        <View style={styles.actionContent}>
          <Ionicons 
            name="add-circle-outline" 
            size={24} 
            color="#FFD700" 
            style={styles.analysisIcon}
          />
          <Text style={styles.buttonText}>New</Text>
          <Text style={styles.buttonText}>Analysis</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton}>
        <View style={styles.actionContent}>
          <Ionicons 
            name="archive-outline" 
            size={24} 
            color="#FFD700" 
            style={styles.historyIcon}
          />
          <Text style={styles.buttonText}>Defect</Text>
          <Text style={styles.buttonText}>History</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 25,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    paddingHorizontal: 30,
    paddingVertical: 35,
    marginHorizontal: 5,
  },
  buttonText: {
    fontSize: 24,
    color: '#FFD700',
    fontWeight: 'bold',
    alignSelf: 'stretch',
  },
  analysisIcon: {
    fontSize: 50,
    paddingBottom: 10,
    color: '#FFD700',
    fontWeight: 'bold',
    alignSelf: 'stretch',
  },
  historyIcon: {
    fontSize: 50,
    paddingBottom: 10,
    color: '#FFD700',
    fontWeight: 'bold',
    alignSelf: 'stretch',
  },
}); 