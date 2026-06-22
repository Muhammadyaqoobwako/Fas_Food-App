import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../state/AppContext';
import { COLORS } from '../styles/theme';

// Screens
import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { FoodListingScreen } from '../screens/FoodListingScreen';
import { FoodDetailScreen } from '../screens/FoodDetailScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { CartScreen } from '../screens/CartScreen';
import { OrderPlacementScreen } from '../screens/OrderPlacementScreen';
import { OrderHistoryScreen } from '../screens/OrderHistoryScreen';
import { UserProfileScreen } from '../screens/UserProfileScreen';
import { AdminDashboardScreen } from '../screens/AdminDashboardScreen';

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  FoodListing: { category: 'Sprite' | 'Coke' | 'Burger' | 'Pizza' | 'IceCream' | 'Chips' };
  FoodDetail: { item: any; category: 'Sprite' | 'Coke' | 'Burger' | 'Pizza' | 'IceCream' | 'Chips' };
  OrderPlacement: { order: any };
};

export type TabParamList = {
  HomeTab: undefined;
  SearchTab: undefined;
  CartTab: undefined;
  HistoryTab: undefined;
  AdminTab: undefined;
  ProfileTab: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'SearchTab') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'CartTab') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'HistoryTab') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'AdminTab') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.secondary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.cardBg,
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: COLORS.cardBg,
          borderBottomColor: COLORS.border,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: COLORS.textPrimary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Menu' }} />
      <Tab.Screen name="SearchTab" component={SearchScreen} options={{ title: 'Search' }} />
      <Tab.Screen name="CartTab" component={CartScreen} options={{ title: 'Cart' }} />
      <Tab.Screen name="HistoryTab" component={OrderHistoryScreen} options={{ title: 'History' }} />
      <Tab.Screen name="AdminTab" component={AdminDashboardScreen} options={{ title: 'Analytics' }} />
      <Tab.Screen name="ProfileTab" component={UserProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { isAuthenticated } = useApp();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.cardBg,
            borderBottomColor: COLORS.border,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: COLORS.textPrimary,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          cardStyle: {
            backgroundColor: COLORS.background,
          },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="MainTabs"
              component={TabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="FoodListing"
              component={FoodListingScreen}
              options={({ route }) => ({ title: route.params.category })}
            />
            <Stack.Screen
              name="FoodDetail"
              component={FoodDetailScreen}
              options={{ title: 'Customize Item' }}
            />
            <Stack.Screen
              name="OrderPlacement"
              component={OrderPlacementScreen}
              options={{ title: 'Receipt Confirmation', headerLeft: () => null }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
