import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Svg, { Rect, LinearGradient, Defs, Stop } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AntDesign } from '@expo/vector-icons';
import { useGlobalContext } from '../../../backend/context/GlobalProvider';

const getNotificationType = (type) => {
  switch (type) {
    case 'Detected':
      return ['#ffffff', '#990000'];
    case 'Resolved':
      return ['#ffffff', '#009900'];
    case 'Unresolved':
      return ['#ffffff', '#FFCC00'];
    default:
      return ['#ffffff', '#ccc'];
  }
};

export default function NotificationsSection({ }) {
  const navigation = useNavigation();
  const { notifications, removeNotification } = useGlobalContext();

  const handleNotification = (notification) => {
    if (notification.type !== 'Resolved') {
      navigation.navigate('Results', {
        notificationId: notification.id,
        analysisResults: notification.file,
      });
    } else {
      navigation.navigate('DefectHistory', {
        notificationId: notification.id,
        fileName: notification.name,
      });
    }
  };

  return (
    <View>
      <View style={styles.notificationBox}>
        <ScrollView>
          {notifications.map((notification) => (
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
                      stopColor={getNotificationType(notification.type)[0]}
                      stopOpacity="0.75"
                    />
                    <Stop
                      offset="75%"
                      stopColor={getNotificationType(notification.type)[1]}
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
                <Text style={styles.notificationTitle}>Defect {notification.type}</Text>
                <Text style={styles.notificationDetails}>
                  Priority Level: <Text
                    style={styles.priorityText}> {notification.priority}
                  </Text>  <Text
                    style={styles.datetimeText}>
                    {notification.datetime}
                  </Text>
                </Text>
              </View>
              <TouchableOpacity
                style={styles.notificationContent}
                onPress={() => removeNotification(notification.id)}
              >
                <AntDesign name="close" size={20} color="black" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  notificationBox: {
    height: 260,
    marginHorizontal: 25,
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
  },
  notificationContent: {
    padding: 15,
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
  priorityText: {
    fontWeight: 'bold',
    color: '#006FFF',
  },
  datetimeText: {
    color: '#151515',
  },
  gradientBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});