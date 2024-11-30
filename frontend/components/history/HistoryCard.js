import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export const HistoryCard = ({ defect, onPress }) => {
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          {defect.imageUrl ? (
            <Image 
              source={{ uri: defect.imageUrl }} 
              style={styles.thumbnail}
              onError={(e) => console.log('Image loading error:', e.nativeEvent.error)}
            />
          ) : (
            <Ionicons name="warning" size={24} color="#FFD700" />
          )}
        </View>
        <View style={styles.contentContainer}>
          <Text style={styles.defectType}>
            {defect.defectClass || 'Unknown Defect'}
          </Text>
          <Text style={styles.date}>
            {formatDate(defect.DateTime)}
          </Text>
          <Text style={styles.severity}>
            Severity: {defect.priority || 'N/A'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#666" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  iconContainer: {
    marginRight: 15,
  },
  contentContainer: {
    flex: 1,
  },
  defectType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  severity: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
});
