import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { COLORS, SPACING, FONTS, globalStyles } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type SearchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

interface Props {
  navigation: SearchScreenNavigationProp;
}

export const SearchScreen: React.FC<Props> = ({ navigation }) => {
  const [query, setQuery] = useState('');

  // Complete list of all menu items across all categories
  const allMenuItems = [
    { id: 's1', name: 'Sprite Regular', price: 150.0, sizeOrWeight: '300ml', options: ['Cold', 'Warm'], category: 'Sprite' as const },
    { id: 's2', name: 'Sprite Duo Pack', price: 300.0, sizeOrWeight: '1000ml', options: ['Cold', 'Warm'], category: 'Sprite' as const },
    { id: 's3', name: 'Sprite Zero', price: 160.0, sizeOrWeight: '300ml', options: ['Cold'], category: 'Sprite' as const },
    { id: 'co1', name: 'Coke Regular', price: 150.0, sizeOrWeight: '330ml', options: ['Regular', 'Diet'], category: 'Coke' as const },
    { id: 'co2', name: 'Coke Light', price: 160.0, sizeOrWeight: '330ml', options: ['Diet'], category: 'Coke' as const },
    { id: 'co3', name: 'Coke Share Pack', price: 290.0, sizeOrWeight: '1000ml', options: ['Regular', 'Diet'], category: 'Coke' as const },
    { id: 'b1', name: 'Beef Burger', price: 450.0, sizeOrWeight: '150g', options: ['Chips', 'Salad', 'None'], category: 'Burger' as const },
    { id: 'b2', name: 'Chicken Cheeseburger', price: 490.0, sizeOrWeight: '180g', options: ['Chips', 'Salad', 'None'], category: 'Burger' as const },
    { id: 'b3', name: 'Double King Burger', price: 650.0, sizeOrWeight: '300g', options: ['Chips', 'Salad'], category: 'Burger' as const },
    { id: 'p1', name: 'Regina Pizza', price: 550.0, sizeOrWeight: 'Large', options: ['Thin Crust', 'Thick Crust'], category: 'Pizza' as const },
    { id: 'p2', name: 'Margherita Pizza', price: 480.0, sizeOrWeight: 'Medium', options: ['Thin Crust', 'Thick Crust'], category: 'Pizza' as const },
    { id: 'p3', name: 'Pepperoni Passion', price: 620.0, sizeOrWeight: 'Large', options: ['Thin Crust', 'Gluten Free'], category: 'Pizza' as const },
    { id: 'i1', name: 'Vanilla Soft Serve', price: 120.0, sizeOrWeight: 'Cup', options: ['White', 'Chocolate Dip'], category: 'IceCream' as const },
    { id: 'i2', name: 'Strawberry Sundae', price: 220.0, sizeOrWeight: 'Glass', options: ['Strawberry Flavour', 'Vanilla Flavour'], category: 'IceCream' as const },
    { id: 'i3', name: 'Chocolate Feast', price: 250.0, sizeOrWeight: 'Tub', options: ['Chocolate Flavour'], category: 'IceCream' as const },
    { id: 'ch1', name: 'Regular Chips', price: 120.0, sizeOrWeight: 'Small', options: ['Salt & Vinegar', 'Tomato Sauce', 'Plain'], category: 'Chips' as const },
    { id: 'ch2', name: 'Large Share Chips', price: 240.0, sizeOrWeight: 'Large', options: ['Salt & Vinegar', 'Tomato Sauce', 'Plain'], category: 'Chips' as const },
    { id: 'ch3', name: 'Jumbo Slap Chips', price: 320.0, sizeOrWeight: 'Jumbo', options: ['Salt & Vinegar', 'Tomato Sauce', 'Plain'], category: 'Chips' as const },
  ];

  const filteredItems = allMenuItems.filter(item =>
    item.name.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={globalStyles.container}>
      <View style={styles.searchBarContainer}>
        <Ionicons name="search" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search burgers, pizzas, soft drinks, desserts..."
          placeholderTextColor={COLORS.textSecondary}
          value={query}
          onChangeText={setQuery}
          clearButtonMode="while-editing"
        />
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle" size={48} color={COLORS.borderLight} />
            <Text style={styles.emptyText}>No menu items match your search.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resultCard}
            onPress={() => navigation.navigate('FoodDetail', { item, category: item.category })}
          >
            <View style={styles.detailsColumn}>
              <Text style={styles.itemName}>{item.name}</Text>
              <View style={styles.badgeRow}>
                <View style={[styles.categoryBadge, { backgroundColor: COLORS.border }]}>
                  <Text style={styles.categoryBadgeText}>{item.category}</Text>
                </View>
                <Text style={styles.sizeText}>{item.sizeOrWeight}</Text>
              </View>
            </View>
            <Text style={styles.priceText}>R {item.price.toFixed(2)}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    margin: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: COLORS.textPrimary,
    fontSize: FONTS.md,
  },
  listContainer: {
    padding: SPACING.md,
    paddingTop: 0,
  },
  resultCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  detailsColumn: {
    flex: 1,
  },
  itemName: {
    fontSize: FONTS.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginRight: SPACING.sm,
  },
  categoryBadgeText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  sizeText: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
  },
  priceText: {
    fontSize: FONTS.md,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginLeft: SPACING.md,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sm,
    marginTop: SPACING.sm,
  },
});
