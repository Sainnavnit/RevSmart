import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { PaperProvider } from 'react-native-paper';
import { ThemeProvider } from './app/context/ThemeContext';
import DashboardScreen from './app/screens/DashboardScreen';
import AddConceptScreen from './app/screens/AddConceptScreen';
import WelcomeScreen from './app/screens/WelcomeScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export default function App() {
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserName = async () => {
      try {
        const storedUserName = await AsyncStorage.getItem('userName');
        setUserName(storedUserName);
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking user name:', error);
        setIsLoading(false);
      }
    };

    checkUserName();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ThemeProvider>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator>
            {userName ? (
              <Stack.Screen name="Main">
                {() => (
                  <Tab.Navigator
                    screenOptions={({ route }) => ({
                      tabBarIcon: ({ focused, color, size }) => {
                        let iconName: any;

                        if (route.name === 'Dashboard') {
                          iconName = focused ? 'ios-home' : 'ios-home-outline';
                        } else if (route.name === 'Add Concept') {
                          iconName = focused ? 'ios-add-circle' : 'ios-add-circle-outline';
                        }

                        return <Ionicons name={iconName} size={size} color={color} />;
                      },
                      tabBarActiveTintColor: 'tomato',
                      tabBarInactiveTintColor: 'gray',
                    })}
                  >
                    <Tab.Screen name="Dashboard" component={DashboardScreen} />
                    <Tab.Screen name="Add Concept" component={AddConceptScreen} />
                  </Tab.Navigator>
                )}
              </Stack.Screen>
            ) : (
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </ThemeProvider>
  );
}
