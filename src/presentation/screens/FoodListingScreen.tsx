import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { COLORS, SPACING, FONTS, globalStyles } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type FoodListingScreenRouteProp = RouteProp<RootStackParamList, 'FoodListing'>;
type FoodListingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'FoodListing'>;

interface Props {
  route: FoodListingScreenRouteProp;
  navigation: FoodListingScreenNavigationProp;
}

export const FoodListingScreen: React.FC<Props> = ({ route, navigation }) => {
  const { category } = route.params;

  // Static items seeded based on target specifications
  const menuDatabase = {
    Sprite: [
      { id: 's1', name: 'Sprite Regular', price: 150.0, sizeOrWeight: '300ml', options: ['Cold', 'Warm'] },
      { id: 's2', name: 'Sprite Duo Pack', price: 300.0, sizeOrWeight: '1000ml', options: ['Cold', 'Warm'] },
      { id: 's3', name: 'Sprite Zero', price: 160.0, sizeOrWeight: '300ml', options: ['Cold'] },
    ],
    Coke: [
      { id: 'co1', name: 'Coke Regular', price: 150.0, sizeOrWeight: '330ml', options: ['Regular', 'Diet'] },
      { id: 'co2', name: 'Coke Light', price: 160.0, sizeOrWeight: '330ml', options: ['Diet'] },
      { id: 'co3', name: 'Coke Share Pack', price: 290.0, sizeOrWeight: '1000ml', options: ['Regular', 'Diet'] },
    ],
    Burger: [
      { id: 'b1', name: 'Beef Burger', price: 450.0, sizeOrWeight: '150g', options: ['Chips', 'Salad', 'None'] },
      { id: 'b2', name: 'Chicken Cheeseburger', price: 490.0, sizeOrWeight: '180g', options: ['Chips', 'Salad', 'None'] },
      { id: 'b3', name: 'Double King Burger', price: 650.0, sizeOrWeight: '300g', options: ['Chips', 'Salad'] },
    ],
    Pizza: [
      { id: 'p1', name: 'Regina Pizza', price: 550.0, sizeOrWeight: 'Large', options: ['Thin Crust', 'Thick Crust'] },
      { id: 'p2', name: 'Margherita Pizza', price: 480.0, sizeOrWeight: 'Medium', options: ['Thin Crust', 'Thick Crust'] },
      { id: 'p3', name: 'Pepperoni Passion', price: 620.0, sizeOrWeight: 'Large', options: ['Thin Crust', 'Gluten Free'] },
    ],
    IceCream: [
      { id: 'i1', name: 'Vanilla Soft Serve', price: 120.0, sizeOrWeight: 'Cup', options: ['White', 'Chocolate Dip'] },
      { id: 'i2', name: 'Strawberry Sundae', price: 220.0, sizeOrWeight: 'Glass', options: ['Strawberry Flavour', 'Vanilla Flavour'] },
      { id: 'i3', name: 'Chocolate Feast', price: 250.0, sizeOrWeight: 'Tub', options: ['Chocolate Flavour'] },
    ],
    Chips: [
      { id: 'ch1', name: 'Regular Chips', price: 120.0, sizeOrWeight: 'Small', options: ['Salt & Vinegar', 'Tomato Sauce', 'Plain'] },
      { id: 'ch2', name: 'Large Share Chips', price: 240.0, sizeOrWeight: 'Large', options: ['Salt & Vinegar', 'Tomato Sauce', 'Plain'] },
      { id: 'ch3', name: 'Jumbo Slap Chips', price: 320.0, sizeOrWeight: 'Jumbo', options: ['Salt & Vinegar', 'Tomato Sauce', 'Plain'] },
    ],
  };

  const listItems = menuDatabase[category] || [];

  return (
    <View style={globalStyles.container}>
      <FlatList
        data={listItems}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <Text style={styles.headerText}>Select an item to configure order details.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.foodCard}
            onPress={() => navigation.navigate('FoodDetail', { item, category })}
          >
            <View style={styles.foodDetails}>
              <Text style={styles.foodName}>{item.name}</Text>
              <Text style={styles.foodInfo}>Size/Weight: {item.sizeOrWeight}</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>R {item.price.toFixed(2)}</Text>
              <View style={styles.actionBtn}>
                <Ionicons name="add" size={20} color={COLORS.textPrimary} />
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: SPACING.md,
  },
  headerText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  foodCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadowColor,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  foodDetails: {
    flex: 1,
  },
  foodName: {
    fontSize: FONTS.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  foodInfo: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    fontSize: FONTS.md,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginRight: SPACING.md,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
