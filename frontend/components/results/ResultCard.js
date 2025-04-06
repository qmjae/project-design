import React, { memo, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { BoundedImage } from './BoundedImage';
import { ModuleInfo } from './ModuleInfo';
import { DetailRow } from './DetailRow';
import { Section } from './Section';
import { useNavigation } from '@react-navigation/native';
import { useGlobalContext } from '../../../backend/context/GlobalProvider';
import { saveDefectResult } from '../../../backend/lib/appwrite';
import Ionicons from '@expo/vector-icons/Ionicons';

export const ResultCard = memo(({ item, width, notificationId }) => {
  const navigation = useNavigation();
  const { user, updateNotificationType } = useGlobalContext();
  const [isResolving, setIsResolving] = useState(false);
  const [isResolved, setIsResolved] = useState(false);
  const [savedDocumentId, setSavedDocumentId] = useState(null);

  const handleResolve = async () => {
    setIsResolving(true);
    try {
      // Log what we're working with
      console.log('Resolving item:', item);
      console.log('Initial notificationId:', notificationId);
      
      // Choose which ID to update based on what's available
      let idToUpdate = notificationId;
      
      // If we don't have a notification ID, create a new document and use its ID
      if (!idToUpdate) {
        console.log('No notification ID provided, saving as new defect result');
        const savedResult = await saveDefectResult(user.$id, item);
        console.log('Saved new defect with ID:', savedResult.$id);
        
        // Use the newly created document's ID
        idToUpdate = savedResult.$id;
        setSavedDocumentId(idToUpdate);
      } else {
        // If we already have a notification ID, just update its status
        console.log('Updating existing notification:', idToUpdate);
      }
      
      // Now update the status with the appropriate ID
      if (idToUpdate) {
        await updateNotificationType(idToUpdate, "Resolved");
        console.log('Status updated successfully');
        setIsResolved(true);
      } else {
        throw new Error('Failed to get a valid document ID for update');
      }
    } catch (error) {
      console.error('Error in handleResolve:', error);
      Alert.alert('Error', 'Failed to resolve defect');
    } finally {
      setIsResolving(false);
    }
  };

  const detection = item.detections && item.detections[0];
  
  return (
    <View style={[styles.resultCard, { width }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <BoundedImage 
          imageUri={item.imageUri} 
          detections={item.detections}
        />
          
        <View style={styles.contentContainer}>
          <ModuleInfo defectName={detection?.class || 'No defect detected'} />

          <View style={styles.detailsContainer}>
            <DetailRow 
              label="Stress factors" 
              value={detection?.stressFactors?.join(', ') || 'N/A'} 
            />
            <DetailRow 
              label="Severity Level" 
              value={detection?.priority || 'N/A'} 
            />
            <DetailRow 
              label="Power Loss" 
              value={detection?.powerLoss || 'N/A'} 
            />
            <DetailRow 
              label="Category" 
              value={detection?.category || 'N/A'} 
            />

            <Section 
              title="Description"
              content={detection?.description || 'No description available'}
            />

            <Section 
              title="Recommendation"
              content={detection?.recommendations?.join('\n') || 'No recommendations available'}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        {isResolved ? (
          <View style={styles.resolvedStatus}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.resolvedStatusText}>Resolved</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.resolvedButton, isResolving && styles.resolvedButtonDisabled]}
            onPress={handleResolve}
            disabled={isResolving}
          >
            <Text style={styles.resolvedButtonText}>
              {isResolving ? 'Resolving...' : 'Resolve'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

// Rest of your styles remain the same...

const styles = StyleSheet.create({
  resultCard: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#F0F0F0',
    borderRadius: 15,
    padding: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    height: "98%",
    width: '100%',
  },
  contentContainer: {
    flexGrow: 1,
  },
  scrollContent: {
    paddingBottom: 30,
    width: '100%',
  },
  detailsContainer: {
    flex: 1,
    marginBottom: 0,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 15,
    right: 12,
    backgroundColor: 'white',
  },
  resolvedButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resolvedButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  resolvedButtonDisabled: {
    backgroundColor: '#CCC',
  },
  resolvedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  resolvedStatusText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
}); 