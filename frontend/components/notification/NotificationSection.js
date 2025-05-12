import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Svg, { Rect, LinearGradient, Defs, Stop } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import { useGlobalContext } from '../../../backend/context/GlobalProvider';
import { getDefectHistory } from '../../../backend/lib/appwrite';

// Add class name mapping
const classNameMapping = {
  'substring': 'Bypass Diode Failure',
  'short-circuit': 'Short Circuit',
  'open-circuit': 'Open Circuit',
  'single-cell': 'Single Cell'
};

// Function to get display name
const getDisplayName = (className) => {
  if (!className) return 'Unknown Defect';
  return classNameMapping[className.toLowerCase()] || className;
};

const getNotificationType = (type, status) => {
  // Check both type and status since data can come from different sources
  if (type === 'Resolved' || status === 'resolved') {
    return ['#ffffff', '#009900'];
  } else if (type === 'Detected' || status === 'pending') {
    return ['#ffffff', '#990000'];
  } else if (type === 'Unresolved') {
    return ['#ffffff', '#FFCC00'];
  } else {
    return ['#ffffff', '#ccc'];
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function NotificationsSection() {
  const navigation = useNavigation();
  const { notifications, removeNotification, dismissHistoryNotification, dismissedHistoryIds, user } = useGlobalContext();
  const [combinedNotifications, setCombinedNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all notifications and history items
  useEffect(() => {
    const fetchAllNotifications = async () => {
      try {
        setLoading(true);
        
        // Only attempt to fetch if we have a user
        if (user && user.$id) {
          // Get defect history from database
          const historyItems = await getDefectHistory(user.$id);
          
          // Process history items to match notification format
          const historyNotifications = historyItems
            // Filter out history items that have been dismissed
            .filter(item => !dismissedHistoryIds.includes(item.$id))
            .map(item => {
              // Create a valid file array with proper structure
              const fileObject = {
                fileName: item.fileName,
                imageUrl: item.imageUrl,
                detections: [{
                  class: item.defectClass,
                  priority: item.priority,
                  // Add other fields that might be expected
                  description: item.description || ''
                }]
              };
              
              return {
                id: item.$id,
                type: item.status === 'resolved' ? 'Resolved' : 'Detected',
                name: item.fileName,
                priority: item.priority,
                datetime: formatDate(item.DateTime),
                status: item.status,
                // Always make file an array, even if it's just one item
                file: [fileObject],
                // Important flag to know if it's from history
                isFromHistory: true
              };
            });
          
          // Combine with local notifications, filtering out duplicates
          const localNotifIds = new Set(notifications.map(n => n.id));
          const uniqueHistoryItems = historyNotifications.filter(item => !localNotifIds.has(item.id));
          
          const combined = [...notifications, ...uniqueHistoryItems];
          setCombinedNotifications(combined);
        } else {
          setCombinedNotifications(notifications);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setCombinedNotifications(notifications);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllNotifications();
  }, [notifications, user, dismissedHistoryIds]); // Add dismissedHistoryIds as a dependency

  // Updated handleDeleteNotification to handle both local and history notifications
  const handleDeleteNotification = async (notification) => {
    try {
      console.log("Deleting notification with ID:", notification.id);
      
      // If it's a local notification, use the existing removeNotification function
      if (!notification.isFromHistory) {
        removeNotification(notification.id);
      } else {
        // For history items, we mark them as dismissed
        dismissHistoryNotification(notification.id);
        
        // Also update our local state for immediate UI feedback
        setCombinedNotifications(prev => 
          prev.filter(item => item.id !== notification.id)
        );
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleNotification = (notification) => {
    if (!notification || !notification.id) {
      console.error("Invalid notification: missing ID", notification);
      return;
    }

    console.log("Handling notification click:", {
      id: notification.id,
      type: notification.type,
      message: notification.message,
      fileData: notification.file
    });

    if (notification.type !== 'Resolved') {
      let fileDataArray = [];
      let isWarningNoSolarPanel = false; // Flag for this specific case

      try {
        if (notification.file) {
          fileDataArray = Array.isArray(notification.file) ?
                         notification.file :
                         (typeof notification.file === 'object' ? [notification.file] : []);
          
          if (notification.message) {
            // Check if the message indicates "No solar panel detected" or "Not-Solar"
            isWarningNoSolarPanel = notification.message.toLowerCase().includes('no solar panel detected') || 
                                    notification.message.toLowerCase().includes('not-solar');
                                    
            fileDataArray = fileDataArray.map(file => ({
              ...file,
              message: notification.message, // Preserve the original message
              // Explicitly set imageClass or a similar property if it's a "no solar panel" warning
              imageClass: isWarningNoSolarPanel ? 'Not-Solar' : (file.imageClass || 'Unknown'),
              containsSolarPanel: !isWarningNoSolarPanel,
              // Ensure detections is explicitly empty for this warning type
              detections: isWarningNoSolarPanel ? [] : (file.detections || []) 
            }));
          }
        } else if (notification.imageUrl) { // Historical data
          isWarningNoSolarPanel = notification.message && 
                                  (notification.message.toLowerCase().includes('no solar panel detected') ||
                                   notification.message.toLowerCase().includes('not-solar'));
          fileDataArray = [{
            fileName: notification.name || notification.fileName,
            imageUrl: notification.imageUrl,
            message: notification.message, // Preserve the original message
            imageClass: isWarningNoSolarPanel ? 'Not-Solar' : (notification.defectClass || 'Unknown'),
            containsSolarPanel: !isWarningNoSolarPanel,
            detections: isWarningNoSolarPanel ? [] : [{
              class: notification.defectClass,
              priority: notification.priority
            }]
          }];
        } else { // Fallback
          isWarningNoSolarPanel = notification.message && 
                                  (notification.message.toLowerCase().includes('no solar panel detected') ||
                                   notification.message.toLowerCase().includes('not-solar'));
          fileDataArray = [{
            fileName: notification.name || 'Unknown',
            message: notification.message, // Preserve the original message
            imageClass: isWarningNoSolarPanel ? 'Not-Solar' : 'Unknown',
            containsSolarPanel: !isWarningNoSolarPanel,
            detections: isWarningNoSolarPanel ? [] : [{
              class: 'Unknown',
              priority: notification.priority || 'Medium'
            }]
          }];
        }
        
        const fileDataWithIds = fileDataArray.map(file => ({
          ...file,
          databaseId: notification.id,
          // This flag helps ResultsScreen differentiate
          isNoSolarPanelWarning: isWarningNoSolarPanel 
        }));
        
        navigation.navigate('Results', {
          analysisResults: fileDataWithIds,
          fromNotification: true,
          notificationId: notification.id,
        });

      } catch (error) {
        console.error("Error preparing data for Results screen:", error);
      }
    } else {
      navigation.navigate('DefectHistory', {
        notificationId: notification.id,
        fileName: notification.name || notification.fileName,
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.notificationBox}>
        {combinedNotifications.length === 0 ? (
          <View style={styles.emptyState}>
            <AntDesign name="notification" size={40} color="#ccc" />
            <Text style={styles.emptyStateText}>No notifications yet</Text>
          </View>
        ) : (
          <ScrollView>
            {combinedNotifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={styles.notificationItem}
                onPress={() => handleNotification(notification)}
              >
                <Svg
                  height="100%"
                  width="100%"
                  style={styles.gradientBackground}
                >
                  <Defs>
                    <LinearGradient
                      id={`grad-${notification.id}`}
                      x1="0%" y1="0%" x2="75%" y2="0%"
                    >
                      <Stop
                        offset="0%"
                        stopColor={getNotificationType(notification.type, notification.status)[0]}
                        stopOpacity="1"
                      />
                      <Stop
                        offset="75%"
                        stopColor={getNotificationType(notification.type, notification.status)[1]}
                        stopOpacity="1"
                      />
                    </LinearGradient>
                  </Defs>
                  <Rect
                    width="100%"
                    height="100%"
                    fill={`url(#grad-${notification.id})`}
                    rx="10"
                  />
                </Svg>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>
                    {notification.message && notification.type === 'Info' 
                      ? 'Panel Info' 
                      : notification.message && notification.type === 'Warning'
                        ? 'Warning'
                        : `Defect ${notification.type}`}
                  </Text>
                  <Text style={styles.notificationDetails}>
                    {notification.message ? (
                      <Text style={styles.defectClassText}>{notification.message}{" "}</Text>
                    ) : notification.file && notification.file[0]?.detections && 
                      notification.file[0]?.detections[0]?.class && (
                      <Text style={styles.defectClassText}>
                        {getDisplayName(notification.file[0].detections[0].class)}{" "}
                      </Text>
                    )}
                    {notification.priority && (
                      <Text>
                        Priority: <Text style={styles.priorityText}>{notification.priority}{" "}</Text>
                      </Text>
                    )}
                    <Text style={styles.datetimeText}>
                      {notification.datetime || formatDate(new Date())}
                    </Text>
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteNotification(notification)}
                >
                  <AntDesign name="close" size={20} color="black" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  notificationBox: {
    minHeight: 260,
    maxHeight: 610,
    marginHorizontal: 25,
    marginTop: 20,
    backgroundColor: 'transparent',
    padding: 10,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  notificationContent: {
    padding: 15,
    flex: 1,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  notificationDetails: {
    fontSize: 14,
    color: 'black',
  },
  defectClassText: {
    fontWeight: 'bold',
    color: '#333',
  },
  priorityText: {
    fontWeight: 'bold',
    color: '#006FFF',
  },
  datetimeText: {
    color: '#151515',
    fontSize: 12,
  },
  gradientBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  deleteButton: {
    padding: 15,
  },
  loadingContainer: {
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  emptyState: {
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  }
});