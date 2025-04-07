import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Svg, { Rect, LinearGradient, Defs, Stop } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import { useGlobalContext } from '../../../backend/context/GlobalProvider';
import { getDefectHistory } from '../../../backend/lib/appwrite';
import { responsive } from '../../utils/responsive';

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
  const { notifications, removeNotification, user } = useGlobalContext();
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
          const historyNotifications = historyItems.map(item => {
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
              file: [fileObject]
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
  }, [notifications, user]);


  // Update the handleNotification function

  const handleNotification = (notification) => {
    // Ensure we have a valid file array before navigating
    const fileData = notification.file || [];
    
    console.log("Handling notification click:", {
      id: notification.id,
      type: notification.type,
      fileData: fileData
    });
    
    // Always pass the notification ID (which should be a valid database ID)
    if (notification.type !== 'Resolved') {
      // For each fileData item, attach the notification ID so ResultCard can access it
      const fileDataWithIds = Array.isArray(fileData) ? 
        fileData.map(file => ({
          ...file,
          databaseId: notification.id // Ensure the database ID is passed along
        })) : 
        [{...fileData, databaseId: notification.id}];
      
      navigation.navigate('Results', {
        notificationId: notification.id,
        analysisResults: fileDataWithIds,
      });
    } else {
      navigation.navigate('DefectHistory', {
        notificationId: notification.id,
        fileName: notification.name,
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
                        stopOpacity="0.75"
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
                    Defect {notification.type}
                  </Text>
                  <Text style={styles.notificationDetails}>
                    {notification.file && notification.file[0]?.detections && 
                      notification.file[0]?.detections[0]?.class && (
                      <Text style={styles.defectClassText}>
                        {notification.file[0].detections[0].class}{" "}
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
                  onPress={() => removeNotification(notification.id)}
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
    minHeight: responsive.h(260),
    maxHeight: responsive.h(610),
    marginHorizontal: responsive.w(25),
    marginTop: responsive.h(20),
    backgroundColor: 'transparent',
    padding: responsive.w(10),
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: borderRadius.m,
    marginBottom: responsive.h(12),
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
    padding: responsive.m(15),
    flex: 1,
  },
  notificationTitle: {
    fontSize: responsive.font(18),
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