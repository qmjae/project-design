import React from 'react';
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

const Stack = createStackNavigator();

export default function App() {

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