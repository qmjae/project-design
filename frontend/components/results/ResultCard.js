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

// Add a mapping object to display user-friendly class names
const classNameMapping = {
  'substring': 'Bypass Diode Failure',
  // Add other mappings as needed
  'short-circuit': 'Short Circuit',
  'open-circuit': 'Open Circuit',
  'single-cell': 'Single Cell'
};

// Function to get user-friendly display name
const getDisplayName = (className) => {
  if (!className) return 'No defect detected';
  return classNameMapping[className.toLowerCase()] || className;
};

export const ResultCard = memo(({ item, width, notificationId }) => {
  const navigation = useNavigation();
  const { user, updateNotificationType, addNotification } = useGlobalContext();
  const [isResolving, setIsResolving] = useState(false);
  const [isResolved, setIsResolved] = useState(false);
  const [savedDocumentId, setSavedDocumentId] = useState(null);

  // Add console logging to help debug
  console.log("ResultCard received:", { item, notificationId });
  
  // Verify that item has expected properties
  const hasValidData = item && 
    (item.detections || item.imageUri || (item.file && item.file.length > 0));
  
  if (!hasValidData) {
    console.error("ResultCard received invalid data:", item);
    return (
      <View style={[styles.resultCard, { width }]}>
        <Text style={styles.errorText}>Invalid defect data</Text>
      </View>
    );
  }

  // Completely redesigned handleResolve function with proper logic
  const handleResolve = async () => {
    setIsResolving(true);
    try {
      console.log('Starting resolve process with data:', { notificationId, itemId: item.$id });
      
      // CASE 1: We already have a notification ID (coming from notifications screen)
      if (notificationId) {
        console.log('Using existing notification ID:', notificationId);
        await updateNotificationType(notificationId, "Resolved");
        setIsResolved(true);
        return;
      }
      
      // CASE 2: No notification ID but item might be from database (has databaseId)
      if (item.databaseId) {
        console.log('Using item.databaseId:', item.databaseId);
        await updateNotificationType(item.databaseId, "Resolved");
        setIsResolved(true);
        return;
      }
      
      // CASE 3: Fresh analysis result that needs to be saved to database first
      console.log('No existing ID found, saving new defect to database');
      
      // Check if user exists before proceeding
      if (!user || !user.$id) {
        console.error('Cannot save defect: User not authenticated');
        Alert.alert('Error', 'You need to be logged in to resolve defects');
        return;
      }
      
      // Save the defect to the database
      const savedDocument = await saveDefectResult(user.$id, item);
      console.log('Saved new defect with ID:', savedDocument.$id);
      
      // Update the status to resolved
      await updateNotificationType(savedDocument.$id, "Resolved");
      
      // Store the document ID for future reference
      setSavedDocumentId(savedDocument.$id);
      
      // Create a notification for this resolved defect
      const newNotification = {
        id: savedDocument.$id,
        type: 'Resolved', // Already resolved
        priority: item.detections[0]?.priority || 'N/A',
        datetime: new Date().toISOString(),
        name: item.fileName || 'Unnamed defect',
        file: [item],
      };
      
      // Add to notifications
      addNotification(newNotification);
      
      setIsResolved(true);
      
    } catch (error) {
      console.error('Error in handleResolve:', error);
      Alert.alert('Error', 'Failed to resolve defect: ' + (error.message || 'Unknown error'));
    } finally {
      setIsResolving(false);
    }
  };

  // Make sure detection is properly handled
  let detection = null;
  
  // Properly handle detections which might not be an array
  if (item.detections) {
    // Handle the case where detections might not be an array but a direct object
    if (Array.isArray(item.detections)) {
      detection = item.detections[0] || null;
    } else {
      // If detections is an object but not an array, use it directly
      detection = item.detections;
      // Also fix the item structure to make detections an array for future operations
      item.detections = [item.detections];
    }
  }
  
  // Check if this item has been classified as containing a solar panel or not
  // Default to true for backward compatibility
  const containsSolarPanel = item.containsSolarPanel !== false;
  
  // Custom message from notification, if present
  const customMessage = item.message || (item.file && item.file[0]?.message);
  
  return (
    <View style={[styles.resultCard, { width }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <BoundedImage 
          imageUri={item.imageUri || (item.imageUrl || '')} 
          detections={item.detections || []}
        />
          
        <View style={styles.contentContainer}>
          <ModuleInfo 
            defectName={getDisplayName(detection?.class)}
            containsSolarPanel={containsSolarPanel}
            message={customMessage}
          />

          {/* Only show details if it's a solar panel */}
          {containsSolarPanel && (
            <View style={styles.detailsContainer}>
              {/* Only show these details if a defect is detected */}
              {detection && detection.class && !detection.class.toLowerCase().includes('no defect') ? (
                <>
                  <DetailRow 
                    label="Stress factors" 
                    value={(detection?.stressFactors && Array.isArray(detection.stressFactors)) ? 
                      detection.stressFactors.join(', ') : 'N/A'} 
                  />
                  
                  <DetailRow 
                    label="Power Loss" 
                    value={detection?.powerLoss || 'N/A'} 
                  />
                  <DetailRow 
                    label="Category" 
                    value={detection?.category || 'N/A'} 
                  />
                  
                  <DetailRow 
                    label="CoA" 
                    value={detection?.CoA || 'N/A'} 
                  />

                  <Section 
                    title="Description"
                    content={detection?.description || 'No description available'}
                  />

                  <Section 
                    title="Recommendation"
                    content={(detection?.recommendations && Array.isArray(detection.recommendations)) ?
                      detection.recommendations.join('\n') : 'No recommendations available'}
                  />
                </>
              ) : null}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Only show resolve button for solar panels with defects */}
      {containsSolarPanel && detection && detection.class && !detection.class.includes('no defect') && (
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
      )}
    </View>
  );
});

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
  errorText: {
    color: 'red',
    padding: 20,
    textAlign: 'center',
    fontSize: 16,
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