import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { COLORS, SPACING, FONTS, globalStyles } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../state/AppContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type CartScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

interface Props {
  navigation: CartScreenNavigationProp;
}

export const CartScreen: React.FC<Props> = ({ navigation }) => {
  const {
    cart,
    cartCategory,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    submitOrder,
    loading,
  } = useApp();

  // Enforce multiplication for order totals
  const subtotal = cart.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const vatAmount = subtotal * 0.15; // 15% Standard VAT
  const grandTotal = subtotal + vatAmount;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const order = await submitOrder();
      // Navigate to order confirmation/receipt simulator screen
      navigation.navigate('OrderPlacement', { order });
    } catch (err: any) {
      alert(`Checkout failed: ${err.message}`);
    }
  };

  const getCustomizationText = (item: any) => {
    const parts = [];
    if (item.servedWith) parts.push(`Sides: ${item.servedWith}`);
    if (item.colour) parts.push(`Color: ${item.colour}`);
    if (item.flavour) parts.push(`Flavour: ${item.flavour}`);
    if (item.type) parts.push(`Type: ${item.type}`);
    return parts.join(' | ');
  };

  if (cart.length === 0) {
    return (
      <View style={[globalStyles.container, styles.emptyContainer]}>
        <Ionicons name="cart-outline" size={80} color={COLORS.borderLight} />
        <Text style={styles.emptyTitle}>Cart is Empty</Text>
        <Text style={styles.emptySubtitle}>Go to the Menu tab to add items to your active order.</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryLabel}>Active Category Order</Text>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{cartCategory}</Text>
        </View>
      </View>

      <FlatList
        data={cart}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item, index }) => (
          <View style={styles.cartCard}>
            <View style={styles.cardInfo}>
              <Text style={styles.itemName}>{item.description}</Text>
              {getCustomizationText(item) ? (
                <Text style={styles.itemCustomization}>{getCustomizationText(item)}</Text>
              ) : null}
              <Text style={styles.itemPriceLabel}>
                R {item.unitPrice.toFixed(2)} each
              </Text>
            </View>

            <View style={styles.quantityAndTrash}>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateCartItemQuantity(index, item.quantity - 1)}
                >
                  <Ionicons name="remove" size={16} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateCartItemQuantity(index, item.quantity + 1)}
                >
                  <Ionicons name="add" size={16} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.deleteBtn} onPress={() => removeFromCart(index)}>
                <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Cart Totals Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>R {subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>VAT (15%)</Text>
          <Text style={styles.summaryValue}>R {vatAmount.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total Bill</Text>
          <Text style={styles.totalValue}>R {grandTotal.toFixed(2)}</Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={[globalStyles.buttonSecondary, styles.clearBtn]} onPress={clearCart}>
            <Text style={[globalStyles.buttonText, { color: COLORS.textSecondary }]}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[globalStyles.button, styles.checkoutBtn]} onPress={handleCheckout} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={COLORS.textPrimary} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.textPrimary} style={{ marginRight: 6 }} />
                <Text style={globalStyles.buttonText}>Submit Bill</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONTS.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  categoryLabel: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  categoryBadge: {
    backgroundColor: COLORS.secondary,
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  categoryBadgeText: {
    color: COLORS.background,
    fontSize: FONTS.xs,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  listContainer: {
    padding: SPACING.md,
  },
  cartCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  itemName: {
    fontSize: FONTS.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  itemCustomization: {
    fontSize: FONTS.xs,
    color: COLORS.secondary,
    marginVertical: 2,
    fontWeight: '500',
  },
  itemPriceLabel: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  quantityAndTrash: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.border,
    borderRadius: 8,
    padding: 2,
    marginRight: SPACING.sm,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: COLORS.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: FONTS.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginHorizontal: SPACING.sm,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryContainer: {
    backgroundColor: COLORS.cardBg,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? 24 : SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: FONTS.sm,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  totalLabel: {
    fontSize: FONTS.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: FONTS.xl,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clearBtn: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  checkoutBtn: {
    flex: 3,
    backgroundColor: COLORS.primary,
  },
});
