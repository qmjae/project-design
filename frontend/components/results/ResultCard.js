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

const classNameMapping = {
  'substring': 'Bypass Diode Failure',
  'short-circuit': 'Short Circuit',
  'open-circuit': 'Open Circuit',
  'single-cell': 'Single Cell'
};

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

  const hasValidData = item && (item.detections || item.imageUri || (item.file && item.file.length > 0));
  if (!hasValidData) {
    return (
      <View style={[styles.resultCard, { width }]}>
        <Text style={styles.errorText}>Invalid defect data</Text>
      </View>
    );
  }

  const handleResolve = async () => {
    setIsResolving(true);
    try {
      if (notificationId) {
        await updateNotificationType(notificationId, "Resolved");
        setIsResolved(true);
        return;
      }

      if (item.databaseId) {
        await updateNotificationType(item.databaseId, "Resolved");
        setIsResolved(true);
        return;
      }

      if (!user || !user.$id) {
        Alert.alert('Error', 'You need to be logged in to resolve defects');
        return;
      }

      const savedDocument = await saveDefectResult(user.$id, item);
      await updateNotificationType(savedDocument.$id, "Resolved");
      setSavedDocumentId(savedDocument.$id);

      const newNotification = {
        id: savedDocument.$id,
        type: 'Resolved',
        priority: item.detections?.[0]?.priority || 'N/A',
        datetime: new Date().toISOString(),
        name: item.fileName || 'Unnamed defect',
        file: [item],
      };

      addNotification(newNotification);
      setIsResolved(true);

    } catch (error) {
      Alert.alert('Error', 'Failed to resolve defect: ' + (error.message || 'Unknown error'));
    } finally {
      setIsResolving(false);
    }
  };

  let detection = null;
  if (item.detections) {
    if (Array.isArray(item.detections)) {
      detection = item.detections[0] || null;
    } else {
      detection = item.detections;
      item.detections = [item.detections];
    }
  }

  const imageClass = item.imageClass || "Unknown";
  const isThermalSolar = !["Not-Solar", "Not-Thermal"].includes(imageClass);
  const customMessage = item.message || (item.file?.[0]?.message);

  return (
    <View style={[styles.resultCard, { width }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <BoundedImage
          imageUri={item.imageUri || item.imageUrl || ''}
          detections={item.detections || []}
        />

        <View style={styles.contentContainer}>
          <ModuleInfo
            defectName={getDisplayName(detection?.class)}
            imageClass={imageClass}
            message={customMessage}
          />

          {isThermalSolar && (
            <View style={styles.detailsContainer}>
              {detection?.class && !detection.class.toLowerCase().includes('no defect') && (
                <>
                  <DetailRow
                    label="Stress factors"
                    value={Array.isArray(detection.stressFactors)
                      ? detection.stressFactors.join(', ')
                      : 'N/A'}
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
                    content={Array.isArray(detection.recommendations)
                      ? detection.recommendations.join('\n')
                      : 'No recommendations available'}
                  />
                </>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {isThermalSolar && detection?.class && !detection.class.toLowerCase().includes('no defect') && (
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