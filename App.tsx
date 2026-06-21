import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, Platform, Alert } from 'react-native';

if (Platform.OS === 'web') {
  Alert.alert = (title, message) => {
    const msg = message ? `${title}\n${message}` : title;
    window.alert(msg);
  };
}

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { FoodListingScreen } from './src/screens/FoodListingScreen';
import { FoodDetailScreen } from './src/screens/FoodDetailScreen';
import { ShoppingCartScreen } from './src/screens/ShoppingCartScreen';
import { OrderHistoryScreen } from './src/screens/OrderHistoryScreen';
import { UserProfileScreen } from './src/screens/UserProfileScreen';
import { AdminDashboardScreen } from './src/screens/AdminDashboardScreen';
import { AdminMenuScreen } from './src/screens/AdminMenuScreen';

interface FoodItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
}

const AppNavigator: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<string>('home');
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);

  const navigateTo = (screen: string) => {
    setCurrentScreen(screen);
  };

  const handleSelectItem = (item: FoodItem) => {
    setSelectedItem(item);
    navigateTo('detail');
  };

  if (!isLoggedIn) {
    return <LoginScreen onLoginSuccess={() => navigateTo('home')} />;
  }

  return (
    <View style={styles.appContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      {currentScreen === 'home' && (
        <HomeScreen onNavigate={navigateTo} />
      )}
      {currentScreen === 'listing' && (
        <FoodListingScreen
          onNavigate={navigateTo}
          onSelectItem={handleSelectItem}
        />
      )}
      {currentScreen === 'detail' && selectedItem && (
        <FoodDetailScreen
          item={selectedItem}
          onNavigate={navigateTo}
        />
      )}
      {currentScreen === 'cart' && (
        <ShoppingCartScreen onNavigate={navigateTo} />
      )}
      {currentScreen === 'history' && (
        <OrderHistoryScreen onNavigate={navigateTo} />
      )}
      {currentScreen === 'profile' && (
        <UserProfileScreen onNavigate={navigateTo} />
      )}
      {currentScreen === 'admin' && (
        <AdminDashboardScreen onNavigate={navigateTo} />
      )}
      {currentScreen === 'admin-menu' && (
        <AdminMenuScreen onNavigate={navigateTo} />
      )}
    </View>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <SafeAreaView style={styles.mainSafeArea}>
          <AppNavigator />
        </SafeAreaView>
      </CartProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  mainSafeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  appContainer: {
    flex: 1
  }
});
