/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import ShadeFinderScreen from './src/screens/ShadeFinderScreen';
import CameraScreen from './src/screens/CameraScreen';
import MatchesScreen from './src/screens/MatchesScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Import components
import TabBarIcon from './src/components/TabBarIcon';

// Import contexts
import { AuthProvider } from './src/contexts/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack navigator for ShadeFinder and Camera
const ShadeFinderStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ShadeFinderMain" component={ShadeFinderScreen} />
    <Stack.Screen name="Camera" component={CameraScreen} />
  </Stack.Navigator>
);

// Main tab navigator
const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => (
        <TabBarIcon route={route} focused={focused} color={color} size={size} />
      ),
      tabBarActiveTintColor: '#FF69B4',
      tabBarInactiveTintColor: '#666',
      tabBarStyle: {
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        paddingBottom: 5,
        paddingTop: 5,
        height: 60,
      },
      headerStyle: {
        backgroundColor: '#FF69B4',
      },
      headerTintColor: 'white',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    })}
  >
    <Tab.Screen 
      name="Home" 
      component={HomeScreen}
      options={{ title: 'MatchMe' }}
    />
    <Tab.Screen 
      name="ShadeFinder" 
      component={ShadeFinderStack}
      options={{ title: 'Find Shade' }}
    />
    <Tab.Screen 
      name="Matches" 
      component={MatchesScreen}
      options={{ title: 'Matches' }}
    />
    <Tab.Screen 
      name="Favorites" 
      component={FavoritesScreen}
      options={{ title: 'Favorites' }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{ title: 'Profile' }}
    />
  </Tab.Navigator>
);

function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor="#FF69B4" />
        <TabNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

export default App;
