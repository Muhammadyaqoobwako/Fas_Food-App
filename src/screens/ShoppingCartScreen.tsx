import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, SafeAreaView, TouchableOpacity } from 'react-native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';
import { CartItemRow } from '../components/CartItemRow';
import { Button } from '../components/Button';

interface ShoppingCartScreenProps {
  onNavigate: (screen: string) => void;
}

export const ShoppingCartScreen: React.FC<ShoppingCartScreenProps> = ({ onNavigate }) => {
  const { cartItems, updateQuantity, removeFromCart, totalAmount, clearCart } = useCart();
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Cart is Empty', 'Please add some items to your cart first.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Group items by category to match backend's category validation schema
      const grouped: Record<string, typeof cartItems> = {};
      cartItems.forEach(item => {
        if (!grouped[item.category]) {
          grouped[item.category] = [];
        }
        grouped[item.category].push(item);
      });

      // Place an API order request for each category grouping
      let overallSuccess = true;
      for (const [category, items] of Object.entries(grouped)) {
        const payload = {
          category,
          items: items.map(i => ({
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            servedWith: i.servedWith,
            colour: i.colour,
            flavour: i.flavour,
            type: i.type
          }))
        };

        const success = await apiService.placeOrder(payload, token);
        if (!success) {
          overallSuccess = false;
        }
      }

      if (overallSuccess) {
        Alert.alert('Order Placed', 'Order has been made successfully.');
        clearCart();
        onNavigate('history');
      } else {
        Alert.alert('Ordering Error', 'Some orders failed to process. Please check connection.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to connect to backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onNavigate('listing')} style={styles.backBtn}>
            <Text style={styles.backText}>← Menu</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Shopping Cart</Text>
        </View>

        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CartItemRow
              item={item}
              onIncrease={() => updateQuantity(item.id, 1)}
              onDecrease={() => updateQuantity(item.id, -1)}
              onRemove={() => removeFromCart(item.id)}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🛒</Text>
              <Text style={styles.emptyText}>Your shopping cart is currently empty.</Text>
              <Button
                title="Browse Menu"
                onPress={() => onNavigate('listing')}
                style={styles.browseBtn}
              />
            </View>
          }
        />

        {cartItems.length > 0 ? (
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Grand Total Amount:</Text>
              <Text style={styles.totalVal}>${totalAmount.toFixed(2)}</Text>
            </View>
            <Button
              title="Confirm & Place Order"
              variant="success"
              onPress={handlePlaceOrder}
              loading={isSubmitting}
              style={styles.submitBtn}
            />
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  container: {
    flex: 1,
    padding: 20
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  backBtn: {
    paddingRight: 16
  },
  backText: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: 'bold'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50'
  },
  list: {
    paddingBottom: 20
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16
  },
  emptyText: {
    fontSize: 16,
    color: '#6C757D',
    marginBottom: 20,
    textAlign: 'center'
  },
  browseBtn: {
    width: 200
  },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DEE2E6',
    marginTop: 10
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  totalLabel: {
    fontSize: 16,
    color: '#6C757D',
    fontWeight: '600'
  },
  totalVal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50'
  },
  submitBtn: {
    width: '100%',
    paddingVertical: 14
  }
});
