import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Button } from '../components/Button';

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const { cashier, logout } = useAuth();
  const { cartItems } = useCart();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>Welcome back,</Text>
            <Text style={styles.username}>{cashier?.username || 'Cashier'}</Text>
          </View>
          <TouchableOpacity
            style={styles.cartBadge}
            onPress={() => onNavigate('cart')}
          >
            <Text style={styles.cartIcon}>🛒</Text>
            {cartItems.length > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartItems.reduce((acc, i) => acc + i.quantity, 0)}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>

        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Hot Pizza & Fast-Food</Text>
          <Text style={styles.bannerSubtitle}>Modernization System Portal</Text>
        </View>

        <Text style={styles.sectionTitle}>Main Options</Text>
        <View style={styles.grid}>
          <TouchableOpacity style={styles.gridItem} onPress={() => onNavigate('listing')}>
            <Text style={styles.gridEmoji}>🍕</Text>
            <Text style={styles.gridText}>Browse & Order</Text>
            <Text style={styles.gridSub}>Place fresh orders</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridItem} onPress={() => onNavigate('history')}>
            <Text style={styles.gridEmoji}>📋</Text>
            <Text style={styles.gridText}>Order History</Text>
            <Text style={styles.gridSub}>View past transactions</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridItem} onPress={() => onNavigate('admin')}>
            <Text style={styles.gridEmoji}>📊</Text>
            <Text style={styles.gridText}>Admin Board</Text>
            <Text style={styles.gridSub}>Sales metrics summary</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridItem} onPress={() => onNavigate('profile')}>
            <Text style={styles.gridEmoji}>👤</Text>
            <Text style={styles.gridText}>Cashier Profile</Text>
            <Text style={styles.gridSub}>Session management</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.exitContainer}>
          <Button
            title="LOGOUT / EXIT"
            variant="danger"
            onPress={logout}
            style={styles.logoutBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  container: {
    padding: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  welcome: {
    fontSize: 14,
    color: '#6C757D'
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    textTransform: 'capitalize'
  },
  cartBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DEE2E6',
    position: 'relative'
  },
  cartIcon: {
    fontSize: 20
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF6B35',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold'
  },
  banner: {
    backgroundColor: '#2C3E50',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center'
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#FF6B35',
    marginTop: 4,
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  gridItem: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    alignItems: 'center'
  },
  gridEmoji: {
    fontSize: 32,
    marginBottom: 12
  },
  gridText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center'
  },
  gridSub: {
    fontSize: 11,
    color: '#6C757D',
    marginTop: 4,
    textAlign: 'center'
  },
  exitContainer: {
    marginTop: 16,
    alignItems: 'center'
  },
  logoutBtn: {
    width: '100%',
    paddingVertical: 14
  }
});
