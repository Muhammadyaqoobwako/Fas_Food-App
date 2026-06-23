import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View, Text, Platform, StyleSheet, Animated } from 'react-native';
import { useApp } from '../state/AppContext';
import { COLORS, SPACING, FONTS } from '../styles/theme';

// Screens
import { LoginScreen } from '../screens/LoginScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { FoodListingScreen } from '../screens/FoodListingScreen';
import { FoodDetailScreen } from '../screens/FoodDetailScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { CartScreen } from '../screens/CartScreen';
import { OrderPlacementScreen } from '../screens/OrderPlacementScreen';
import { OrderHistoryScreen } from '../screens/OrderHistoryScreen';
import { UserProfileScreen } from '../screens/UserProfileScreen';
import { AdminDashboardScreen } from '../screens/AdminDashboardScreen';
import { OffersScreen } from '../screens/OffersScreen';
import { DeliveriesScreen } from '../screens/DeliveriesScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { StoreManagementScreen } from '../screens/StoreManagementScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { RestaurantDetailScreen } from '../screens/RestaurantDetailScreen';

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  MainTabs: undefined;
  FoodListing: { category: 'Sprite' | 'Coke' | 'Burger' | 'Pizza' | 'IceCream' | 'Chips' };
  FoodDetail: { item: any; category: 'Sprite' | 'Coke' | 'Burger' | 'Pizza' | 'IceCream' | 'Chips' };
  OrderPlacement: { order: any };
  Settings: undefined;
  Notifications: undefined;
  Chat: { orderId: string; customerName: string; riderName: string };
  RestaurantDetail: { restaurantName: string };
};

export type TabParamList = {
  HomeTab: undefined;
  SearchTab: undefined;
  CartTab: undefined;
  HistoryTab: undefined;
  AdminTab: undefined;
  ProfileTab: undefined;
  OffersTab: undefined;
  DeliveriesTab: undefined;
  FavoritesTab: undefined;
  ManagementTab: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator = () => {
  const { cashier } = useApp();
  const role = cashier?.role || 'customer';

  const isAdmin = role === 'admin';
  const isManager = role === 'manager';
  const isRider = role === 'driver'; // maps to driver internally
  const isCustomer = role === 'customer';
  const isOwner = role === 'owner';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'restaurant';

          if (route.name === 'HomeTab') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'SearchTab') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'CartTab') {
            iconName = focused ? 'bag-handle' : 'bag-handle-outline';
          } else if (route.name === 'HistoryTab') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'AdminTab') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
          } else if (route.name === 'OffersTab') {
            iconName = focused ? 'gift' : 'gift-outline';
          } else if (route.name === 'DeliveriesTab') {
            iconName = focused ? 'bicycle' : 'bicycle-outline';
          } else if (route.name === 'FavoritesTab') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'ManagementTab') {
            iconName = focused ? 'business' : 'business-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.cardBg,
          borderTopColor: COLORS.border,
          height: Platform.OS === 'ios' ? 88 : 65,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 10,
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
      {/* Dynamic Tabs based on User Role */}
      {isRider ? (
        <>
          <Tab.Screen name="DeliveriesTab" component={DeliveriesScreen} options={{ title: 'Rider Deliveries' }} />
          <Tab.Screen name="ProfileTab" component={UserProfileScreen} options={{ title: 'Rider Profile' }} />
        </>
      ) : (
        <>
          <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Menu' }} />
          {isCustomer && <Tab.Screen name="FavoritesTab" component={FavoritesScreen} options={{ title: 'Favorites' }} />}
          {isCustomer && <Tab.Screen name="OffersTab" component={OffersScreen} options={{ title: 'Hot Offers' }} />}
          
          <Tab.Screen name="SearchTab" component={SearchScreen} options={{ title: 'Search' }} />
          {isCustomer && cashier?.username?.toLowerCase() !== 'guest' && <Tab.Screen name="CartTab" component={CartScreen} options={{ title: 'My Cart' }} />}
          
          {(isOwner || isManager || isAdmin) && <Tab.Screen name="ManagementTab" component={StoreManagementScreen} options={{ title: 'Manage Store' }} />}
          {(isAdmin || isManager || isOwner) && <Tab.Screen name="AdminTab" component={AdminDashboardScreen} options={{ title: 'Analytics' }} />}
          {!isCustomer && <Tab.Screen name="HistoryTab" component={OrderHistoryScreen} options={{ title: 'Order History' }} />}
          
          <Tab.Screen name="ProfileTab" component={UserProfileScreen} options={{ title: 'My Profile' }} />
        </>
      )}
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { isAuthenticated, logout } = useApp();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={({ navigation }) => ({
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
          headerRight: () => isAuthenticated ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
              <TouchableOpacity 
                onPress={() => navigation.navigate('Notifications')} 
                style={{ marginRight: 15, padding: 4 }}
              >
                <Ionicons name="notifications-outline" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={logout} 
                style={{ marginRight: 5, padding: 4 }}
              >
                <Ionicons name="log-out-outline" size={24} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          ) : null,
        })}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SignUp"
              component={SignUpScreen}
              options={{ headerShown: false }}
            />
          </>
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
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ title: 'Settings' }}
            />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{ title: 'Notifications' }}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{ title: 'Delivery Chat' }}
            />
            <Stack.Screen
              name="RestaurantDetail"
              component={RestaurantDetailScreen}
              options={({ route }) => ({ title: route.params.restaurantName })}
            />
          </>
        )}
      </Stack.Navigator>
      <GlobalToast />
    </NavigationContainer>
  );
};

const GlobalToast = () => {
  const { toast, clearToast } = useApp();
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (toast) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          clearToast();
        });
      }, 2800);

      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!toast) return null;

  return (
    <Animated.View style={[toastStyles.toastContainer, { opacity: fadeAnim }]}>
      <Ionicons name="bag-handle" size={20} color="#FFF" style={{ marginRight: 10 }} />
      <Text style={toastStyles.toastText} numberOfLines={2}>{toast}</Text>
    </Animated.View>
  );
};

const toastStyles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    left: 20,
    right: 20,
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 9999,
  },
  toastText: {
    color: '#FFF',
    fontSize: FONTS.sm,
    fontWeight: 'bold',
    flex: 1,
  },
});


