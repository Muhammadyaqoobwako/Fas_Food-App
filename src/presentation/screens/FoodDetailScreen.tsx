import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { COLORS, SPACING, FONTS, globalStyles } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useApp } from '../state/AppContext';
import { IOrderItem } from '../../types';

type FoodDetailScreenRouteProp = RouteProp<RootStackParamList, 'FoodDetail'>;
type FoodDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'FoodDetail'>;

interface Props {
  route: FoodDetailScreenRouteProp;
  navigation: FoodDetailScreenNavigationProp;
}

export const FoodDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { item, category } = route.params;
  const { addToCart } = useApp();

  const [quantity, setQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState(item.options?.[0] || '');
  
  // Specific states for Ice Cream categories
  const [iceCreamFlavour, setIceCreamFlavour] = useState('Vanilla');
  const [iceCreamColour, setIceCreamColour] = useState('White');

  const incrementQty = () => setQuantity(q => q + 1);
  const decrementQty = () => setQuantity(q => (q > 1 ? q - 1 : 1));

  // Correct billing math (Multiplication, fixes legacy Chips bug)
  const itemPrice = item.price;
  const subtotal = quantity * itemPrice;

  const handleAddToOrder = () => {
    const orderItem: IOrderItem = {
      description: item.name,
      quantity,
      unitPrice: itemPrice,
    };

    // Map customization options based on database schema requirements
    if (category === 'Sprite' || category === 'Coke') {
      orderItem.type = selectedOption; // Cold/Warm or Regular/Diet
    } else if (category === 'Burger' || category === 'Chips') {
      orderItem.servedWith = selectedOption; // Accompaniments
    } else if (category === 'Pizza') {
      orderItem.type = selectedOption; // Thin/Thick Crust
    } else if (category === 'IceCream') {
      orderItem.flavour = iceCreamFlavour;
      orderItem.colour = iceCreamColour;
    }

    addToCart(orderItem, category);
    alert(`${quantity}x ${item.name} added to cart!`);
    navigation.popToTop(); // Return to Home
  };

  const renderCustomizationSection = () => {
    if (category === 'IceCream') {
      const flavours = ['Vanilla', 'Chocolate', 'Strawberry'];
      const colours = ['White', 'Brown', 'Pink'];
      return (
        <View style={styles.customContainer}>
          <Text style={styles.sectionTitle}>Select Flavour</Text>
          <View style={styles.optionRow}>
            {flavours.map(f => (
              <TouchableOpacity
                key={f}
                style={[styles.optionBadge, iceCreamFlavour === f && styles.optionBadgeActive]}
                onPress={() => setIceCreamFlavour(f)}
              >
                <Text style={[styles.optionBadgeText, iceCreamFlavour === f && styles.optionBadgeTextActive]}>
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { marginTop: SPACING.md }]}>Select Color</Text>
          <View style={styles.optionRow}>
            {colours.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.optionBadge, iceCreamColour === c && styles.optionBadgeActive]}
                onPress={() => setIceCreamColour(c)}
              >
                <Text style={[styles.optionBadgeText, iceCreamColour === c && styles.optionBadgeTextActive]}>
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }

    if (item.options && item.options.length > 0) {
      let label = 'Customization Options';
      if (category === 'Sprite' || category === 'Coke') label = 'Drink Type / Temperature';
      if (category === 'Burger' || category === 'Chips') label = 'Served With';
      if (category === 'Pizza') label = 'Crust Selection';

      return (
        <View style={styles.customContainer}>
          <Text style={styles.sectionTitle}>{label}</Text>
          <View style={styles.optionRow}>
            {item.options.map((opt: string) => (
              <TouchableOpacity
                key={opt}
                style={[styles.optionBadge, selectedOption === opt && styles.optionBadgeActive]}
                onPress={() => setSelectedOption(opt)}
              >
                <Text style={[styles.optionBadgeText, selectedOption === opt && styles.optionBadgeTextActive]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <ScrollView style={globalStyles.container} contentContainerStyle={styles.scrollContent}>
      {/* Food Details Header */}
      <View style={styles.headerCard}>
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.foodSize}>Size / Weight: {item.sizeOrWeight}</Text>
        <Text style={styles.priceLabel}>Base Price: <Text style={styles.foodPrice}>R {item.price.toFixed(2)}</Text></Text>
      </View>

      {/* Dynamic Customization Forms */}
      {renderCustomizationSection()}

      {/* Quantity Manager */}
      <View style={styles.quantityCard}>
        <Text style={styles.sectionTitle}>Set Quantity</Text>
        <View style={styles.quantityRow}>
          <TouchableOpacity style={styles.qtyBtn} onPress={decrementQty}>
            <Ionicons name="remove" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{quantity}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={incrementQty}>
            <Ionicons name="add" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Pricing and Submission Block */}
      <View style={styles.orderSummaryCard}>
        <View style={globalStyles.spaceBetween}>
          <View>
            <Text style={styles.mathExplanation}>
              Math: {quantity} x R {itemPrice.toFixed(2)}
            </Text>
            <Text style={styles.totalLabel}>Subtotal Price</Text>
          </View>
          <Text style={styles.totalAmount}>R {subtotal.toFixed(2)}</Text>
        </View>

        <TouchableOpacity style={[globalStyles.button, styles.addBtn]} onPress={handleAddToOrder}>
          <Ionicons name="cart-sharp" size={20} color={COLORS.textPrimary} style={{ marginRight: 8 }} />
          <Text style={globalStyles.buttonText}>Add to Order</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: SPACING.md,
  },
  headerCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  foodName: {
    fontSize: FONTS.xxl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  foodSize: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  priceLabel: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
  },
  foodPrice: {
    fontSize: FONTS.xl,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  customContainer: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionBadge: {
    backgroundColor: COLORS.border,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  optionBadgeActive: {
    backgroundColor: COLORS.secondary,
  },
  optionBadgeText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sm,
    fontWeight: '600',
  },
  optionBadgeTextActive: {
    color: COLORS.background,
    fontWeight: 'bold',
  },
  quantityCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  qtyBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: FONTS.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginHorizontal: SPACING.xl,
  },
  orderSummaryCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadowColor,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  mathExplanation: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  totalLabel: {
    fontSize: FONTS.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  totalAmount: {
    fontSize: FONTS.xxl,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  addBtn: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.primary,
  },
});
