import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, globalStyles } from '../styles/theme';
import { useApp } from '../state/AppContext';
import { IOrderItem, IMenuItem } from '../../types';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const RESTAURANT_IMAGES: Record<string, string> = {
  'Fas Food Palace': 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&auto=format&fit=crop&q=80',
  'Pizza Hut Hotel': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80',
  'The Burger Bistro': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80',
};

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&auto=format&fit=crop&q=80';

const CATEGORY_EMOJIS: Record<string, string> = {
  'Pizza': '🍕',
  'Burger': '🍔',
  'Chips': '🍟',
  'Sprite': '🥤',
  'Coke': '🥤',
  'IceCream': '🍦',
};

export const FavoritesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const {
    addToCart,
    menuItems,
    feedbacks,
    favoriteFoods,
    favoriteRestaurants,
    toggleFavoriteFood,
    toggleFavoriteRestaurant,
    cashier,
    logout,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'foods' | 'restaurants'>('foods');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Filter menu items matching stored favorite IDs
  const favFoodsData = menuItems.filter(item => item._id && favoriteFoods.includes(item._id));

  const handleAddToCart = (item: IMenuItem) => {
    const isGuest = cashier?.username?.toLowerCase() === 'guest';
    if (isGuest) {
      Alert.alert(
        'Guest Mode',
        'Guest users can only view products. Please log in to place an order.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login / Sign Up', onPress: () => logout() }
        ]
      );
      return;
    }

    const orderItem: IOrderItem = {
      description: item.name,
      quantity: 1,
      unitPrice: item.price,
    };

    if (item.category === 'Sprite' || item.category === 'Coke') {
      orderItem.type = item.options?.[0] || 'Cold';
    } else if (item.category === 'Burger' || item.category === 'Chips') {
      orderItem.servedWith = item.options?.[0] || 'None';
    } else if (item.category === 'Pizza') {
      orderItem.type = item.options?.[0] || 'Thin Crust';
    } else if (item.category === 'IceCream') {
      orderItem.flavour = 'Vanilla';
      orderItem.colour = 'White';
    }

    addToCart(orderItem, item.category);
  };

  const renderFoodItem = ({ item }: { item: IMenuItem }) => {
    const emoji = CATEGORY_EMOJIS[item.category] || '🍔';
    return (
      <View style={styles.favCard}>
        <View style={styles.favHeader}>
          <View style={styles.emojiWrapper}>
            <Text style={styles.favEmoji}>{emoji}</Text>
          </View>
          <View style={styles.favDetails}>
            <Text style={styles.favName}>{item.name}</Text>
            <Text style={styles.favCategory}>
              {item.category} • {item.restaurantName || 'Fas Food Palace'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => toggleFavoriteFood(item._id || '')}
            activeOpacity={0.7}
          >
            <Ionicons name="heart" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.priceText}>R {item.price.toFixed(2)}</Text>
          <TouchableOpacity
            style={styles.addToCartBtn}
            onPress={() => handleAddToCart(item)}
            activeOpacity={0.8}
          >
            <Ionicons name="cart" size={16} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.addToCartText}>Order Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderRestaurantItem = ({ item }: { item: string }) => {
    const coverUrl = RESTAURANT_IMAGES[item] || DEFAULT_COVER;
    const matchingFeedbacks = feedbacks.filter(f => f.restaurantRating > 0);
    const avgRating = matchingFeedbacks.length > 0
      ? (matchingFeedbacks.reduce((sum, f) => sum + f.restaurantRating, 0) / matchingFeedbacks.length).toFixed(1)
      : '4.8';

    return (
      <TouchableOpacity
        style={styles.restaurantCard}
        onPress={() => navigation.navigate('RestaurantDetail', { restaurantName: item })}
        activeOpacity={0.8}
      >
        <Image source={{ uri: coverUrl }} style={styles.restaurantImg} />
        <View style={styles.restaurantInfo}>
          <View style={styles.restaurantTitleRow}>
            <Text style={styles.restaurantName} numberOfLines={1}>{item}</Text>
            <TouchableOpacity
              style={styles.restaurantRemoveBtn}
              onPress={() => toggleFavoriteRestaurant(item)}
              activeOpacity={0.7}
            >
              <Ionicons name="heart" size={22} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.restaurantRatingRow}>
            <Ionicons name="star" size={12} color={COLORS.warning} style={{ marginRight: 4 }} />
            <Text style={styles.restaurantRatingText}>{avgRating}</Text>
            <Text style={styles.restaurantDot}>•</Text>
            <Text style={styles.restaurantCuisine}>Fast Food • Free Delivery over R250</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Animated.View style={[globalStyles.container, { opacity: fadeAnim }]}>
      <FlatList
        data={(activeTab === 'foods' ? favFoodsData : favoriteRestaurants) as any[]}
        keyExtractor={item => (activeTab === 'foods' ? (item as IMenuItem)._id || '' : (item as string))}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Your Saved Favorites</Text>
            <Text style={styles.headerSubtitle}>
              Reorder food or view your favorite restaurants with a single tap
            </Text>

            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'foods' && styles.activeTabButton]}
                onPress={() => setActiveTab('foods')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="fast-food"
                  size={16}
                  color={activeTab === 'foods' ? '#FFF' : COLORS.textSecondary}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.tabButtonText, activeTab === 'foods' && styles.activeTabButtonText]}>
                  Favorite Foods
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'restaurants' && styles.activeTabButton]}
                onPress={() => setActiveTab('restaurants')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="restaurant"
                  size={16}
                  color={activeTab === 'restaurants' ? '#FFF' : COLORS.textSecondary}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.tabButtonText, activeTab === 'restaurants' && styles.activeTabButtonText]}>
                  Restaurants
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-dislike-outline" size={64} color={COLORS.borderLight} />
            <Text style={styles.emptyText}>
              {activeTab === 'foods'
                ? "You haven't saved any favorite foods yet."
                : "You haven't saved any favorite restaurants yet."}
            </Text>
          </View>
        }
        renderItem={activeTab === 'foods' ? (renderFoodItem as any) : (renderRestaurantItem as any)}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  header: {
    marginBottom: SPACING.lg,
    marginTop: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONTS.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 4,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: COLORS.primary,
  },
  tabButtonText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  activeTabButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  favCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  favHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emojiWrapper: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: COLORS.cardBgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  favEmoji: {
    fontSize: 22,
  },
  favDetails: {
    flex: 1,
  },
  favName: {
    fontSize: FONTS.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  favCategory: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  removeBtn: {
    padding: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  priceText: {
    fontSize: FONTS.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  addToCartBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  addToCartText: {
    color: '#FFF',
    fontSize: FONTS.sm,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sm,
    marginTop: SPACING.md,
  },
  restaurantCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  restaurantImg: {
    width: '100%',
    height: 140,
  },
  restaurantInfo: {
    padding: SPACING.md,
  },
  restaurantTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  restaurantName: {
    fontSize: FONTS.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  restaurantRemoveBtn: {
    padding: 2,
  },
  restaurantRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  restaurantRatingText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  restaurantDot: {
    color: COLORS.textSecondary,
    marginHorizontal: 6,
    fontSize: 10,
  },
  restaurantCuisine: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
});
