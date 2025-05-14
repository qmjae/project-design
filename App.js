import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import GlobalProvider from './backend/context/GlobalProvider';
import HomeScreen from './frontend/screens/HomeScreen';
import AnalysisScreen from './frontend/screens/AnalysisScreen';
import ResultsScreen from './frontend/screens/ResultsScreen';
import LoadingScreen from './frontend/screens/LoadingScreen';
import SignInScreen from './frontend/screens/SignInScreen';
import SignUpScreen from './frontend/screens/SignUpScreen';
import ProfileScreen from './frontend/screens/ProfileScreen';
import ThermalScreen from './frontend/screens/ThermalScreen';
import DefectHistoryScreen from './frontend/screens/DefectHistoryScreen';
import NotificationsScreen from './frontend/screens/NotificationsScreen';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotificationsAsync() {
  let token;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Adlaw',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return;
  }

  return token;
}

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    registerForPushNotificationsAsync();

    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log(notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  return (
      <GlobalProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Loading" component={LoadingScreen} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Analysis" component={AnalysisScreen} />
          <Stack.Screen name="Results" component={ResultsScreen} />
          <Stack.Screen name="Camera" component={ThermalScreen} />
          <Stack.Screen name="DefectHistory" component={DefectHistoryScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      </GlobalProvider>
  );
}