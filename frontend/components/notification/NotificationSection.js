import React, { useEffect, useState, useMemo } from 'react';
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

// Renamed and updated to handle more types and return label
const getNotificationTypeAndStatus = (type, status) => {
  if (type === 'Resolved' || status === 'resolved') {
    return { colors: ['#ffffff', '#009900'], statusLabel: 'Resolved' };
  } else if (type === 'Unresolved' || status === 'unresolved') {
    return { colors: ['#ffffff', '#FFCC00'], statusLabel: 'Unresolved' };
  } else if (type === 'Detected' || type === 'Defect Detected' || status === 'pending') {
    return { colors: ['#ffffff', '#990000'], statusLabel: 'Detected' };
  } else if (type === 'Info') {
    return { colors: ['#ffffff', '#007AFF'], statusLabel: 'Info' };
  } else if (type === 'Warning') {
    return { colors: ['#ffffff', '#FFA500'], statusLabel: 'Warning' };
  }
  return { colors: ['#ffffff', '#ccc'], statusLabel: type || 'Unknown' };
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function NotificationsSection({ activeFilter }) {
  const navigation = useNavigation();
  const { notifications, removeNotification, dismissHistoryNotification, dismissedHistoryIds, user } = useGlobalContext();
  const [combinedNotifications, setCombinedNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all notifications and history items
  useEffect(() => {
    const fetchAllNotifications = async () => {
      try {
        setLoading(true);
        
        if (user && user.$id) {
          const historyItems = await getDefectHistory(user.$id);
          
          const historyNotifications = historyItems
            .filter(item => !dismissedHistoryIds.includes(item.$id))
            .map(item => {
              const fileObject = {
                fileName: item.fileName,
                imageUrl: item.imageUrl,
                detections: [{
                  class: item.defectClass,
                  priority: item.priority,
                  description: item.description || ''
                }],
                imageClass: item.imageClass,
                message: item.message,
              };
              
              let currentType = 'Detected';
              if (item.status === 'resolved') {
                currentType = 'Resolved';
              } else if (item.status === 'unresolved') {
                currentType = 'Unresolved';
              } else if (item.status === 'pending') {
                currentType = 'Detected';
              }

              return {
                id: item.$id,
                type: currentType,
                name: item.fileName,
                priority: item.priority,
                datetime: formatDate(item.DateTime),
                status: item.status,
                file: [fileObject],
                isFromHistory: true
              };
            });
          
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
  }, [notifications, user, dismissedHistoryIds]);

  const filteredNotifications = useMemo(() => {
    if (!activeFilter) return combinedNotifications.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

    return combinedNotifications.filter(notif => {
      let effectiveStatus = notif.status;
      if (notif.type === 'Detected' || notif.type === 'Defect Detected') effectiveStatus = 'pending';
      if (notif.type === 'Resolved') effectiveStatus = 'resolved';
      if (notif.type === 'Unresolved') effectiveStatus = 'unresolved';
      
      if (activeFilter === 'Detected') {
        return effectiveStatus === 'pending';
      }
      if (activeFilter === 'Unresolved') {
        return effectiveStatus === 'unresolved';
      }
      if (activeFilter === 'Resolved') {
        return effectiveStatus === 'resolved';
      }
      return true;
    }).sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
  }, [combinedNotifications, activeFilter]);

  const handleDeleteNotification = async (notification) => {
    try {
      console.log("Deleting notification with ID:", notification.id);
      
      if (!notification.isFromHistory) {
        removeNotification(notification.id);
      } else {
        dismissHistoryNotification(notification.id);
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
      let isWarningNoSolarPanel = false;

      try {
        if (notification.file) {
          fileDataArray = Array.isArray(notification.file) ?
                         notification.file :
                         (typeof notification.file === 'object' ? [notification.file] : []);
          
          if (notification.message) {
            isWarningNoSolarPanel = notification.message.toLowerCase().includes('no solar panel detected') || 
                                    notification.message.toLowerCase().includes('not-solar');
                                    
            fileDataArray = fileDataArray.map(file => ({
              ...file,
              message: notification.message,
              imageClass: isWarningNoSolarPanel ? 'Not-Solar' : (file.imageClass || 'Unknown'),
              containsSolarPanel: !isWarningNoSolarPanel,
              detections: isWarningNoSolarPanel ? [] : (file.detections || []) 
            }));
          }
        } else if (notification.imageUrl) {
          isWarningNoSolarPanel = notification.message && 
                                  (notification.message.toLowerCase().includes('no solar panel detected') ||
                                   notification.message.toLowerCase().includes('not-solar'));
          fileDataArray = [{
            fileName: notification.name || notification.fileName,
            imageUrl: notification.imageUrl,
            message: notification.message,
            imageClass: isWarningNoSolarPanel ? 'Not-Solar' : (notification.defectClass || 'Unknown'),
            containsSolarPanel: !isWarningNoSolarPanel,
            detections: isWarningNoSolarPanel ? [] : [{
              class: notification.defectClass,
              priority: notification.priority
            }]
          }];
        } else {
          isWarningNoSolarPanel = notification.message && 
                                  (notification.message.toLowerCase().includes('no solar panel detected') ||
                                   notification.message.toLowerCase().includes('not-solar'));
          fileDataArray = [{
            fileName: notification.name || 'Unknown',
            message: notification.message,
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
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyState}>
            <AntDesign name="notification" size={40} color="#ccc" />
            <Text style={styles.emptyStateText}>
              {activeFilter ? `No notifications for "${activeFilter}"` : 'No notifications yet'}
            </Text>
          </View>
        ) : (
          <ScrollView>
            {filteredNotifications.map((notification) => {
              const { colors: gradColors, statusLabel } = getNotificationTypeAndStatus(notification.type, notification.status);
              return (
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
                          stopColor={gradColors[0]}
                          stopOpacity="1"
                        />
                        <Stop
                          offset="75%"
                          stopColor={gradColors[1]}
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
                      {notification.message && (notification.type === 'Info' || notification.type === 'Warning')
                        ? statusLabel 
                        : `Defect ${statusLabel}`}
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
              );
            })}
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