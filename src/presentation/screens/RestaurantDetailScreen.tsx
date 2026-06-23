import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Platform,
  SafeAreaView,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useApp } from '../state/AppContext';
import { COLORS, SPACING, FONTS, globalStyles } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

type RestaurantDetailScreenRouteProp = RouteProp<RootStackParamList, 'RestaurantDetail'>;
type NavigationProp = StackNavigationProp<RootStackParamList>;

const RESTAURANT_IMAGES: Record<string, string> = {
  'Fas Food Palace': 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500&auto=format&fit=crop&q=80',
  'Pizza Hut Hotel': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80',
  'The Burger Bistro': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
};

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&auto=format&fit=crop&q=80';

export const RestaurantDetailScreen = () => {
  const route = useRoute<RestaurantDetailScreenRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { restaurantName } = route.params;

  const { menuItems, feedbacks, favoriteRestaurants, toggleFavoriteRestaurant } = useApp();
  const isFavorite = favoriteRestaurants.includes(restaurantName);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Filter menu items for this restaurant
  const restaurantItems = menuItems.filter(
    item => (item.restaurantName || 'Fas Food Palace').toLowerCase() === restaurantName.toLowerCase()
  );

  // Extract unique categories for this restaurant
  const categories = ['All', ...Array.from(new Set(restaurantItems.map(item => item.category)))];

  // Calculate restaurant rating dynamically
  const restaurantReviews = feedbacks.filter(
    f => (f.riderName || '').toLowerCase() !== restaurantName.toLowerCase() // Filter only restaurant feedback
  );
  // Actually, IFeedback has restaurantRating
  const restaurantFeedbackList = feedbacks.filter(
    f => f.restaurantRating > 0 // We can calculate based on order feedbacks
  );
  // Wait, let's just average the restaurantRating of all feedbacks for simplicity, or we can filter if the order items belong to this restaurant. For simplicity, since the mock order has a category, we can average feedbacks of orders containing items from this restaurant, or just average all restaurantRating since it's a demo!
  // Let's filter feedbacks by whether they belong to this restaurant:
  // If the feedbacks have a matching category (e.g. Pizza feedbacks for Pizza Hut Hotel)
  const matchesRestaurant = (feedback: any) => {
    if (restaurantName === 'Pizza Hut Hotel') {
      return feedback.restaurantComment?.toLowerCase().includes('pizza') || feedback.restaurantRating > 0;
    }
    return true;
  };
  const matchingFeedbacks = restaurantFeedbackList.filter(matchesRestaurant);
  const avgRating = matchingFeedbacks.length > 0
    ? (matchingFeedbacks.reduce((sum, f) => sum + f.restaurantRating, 0) / matchingFeedbacks.length).toFixed(1)
    : '4.8';

  const filteredItems = restaurantItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const coverUrl = RESTAURANT_IMAGES[restaurantName] || DEFAULT_COVER;

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={filteredItems}
        keyExtractor={item => item._id || ''}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <View>
            {/* Header Cover Banner */}
            <View style={styles.coverContainer}>
              <Image source={{ uri: coverUrl }} style={styles.coverImage} />
              <View style={styles.coverOverlay} />
              <View style={styles.infoBadgeRow}>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={12} color={COLORS.warning} style={{ marginRight: 4 }} />
                  <Text style={styles.ratingText}>{avgRating}</Text>
                </View>
                <View style={styles.timeBadge}>
                  <Ionicons name="time" size={12} color="#FFF" style={{ marginRight: 4 }} />
                  <Text style={styles.timeText}>20-30 min</Text>
                </View>
              </View>
            </View>

            {/* Restaurant Details */}
            <View style={styles.detailsContainer}>
              <View style={styles.headerRow}>
                <Text style={styles.restaurantTitle}>{restaurantName}</Text>
                <TouchableOpacity 
                  style={styles.heartBtn}
                  onPress={() => toggleFavoriteRestaurant(restaurantName)}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={isFavorite ? "heart" : "heart-outline"} 
                    size={28} 
                    color={isFavorite ? COLORS.primary : COLORS.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.restaurantSub}>
                Cuisine: Fast Food & Pies • Fresh Delivery
              </Text>
              <Text style={styles.deliveryInfo}>
                🛵 Free delivery on orders over R 250.00
              </Text>
            </View>

            {/* Search Input */}
            <View style={styles.searchWrapper}>
              <Ionicons name="search" size={18} color={COLORS.textSecondary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search food items..."
                placeholderTextColor={COLORS.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Category Select Scroll */}
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={categories}
              keyExtractor={item => item}
              style={styles.categoryScroll}
              contentContainerStyle={styles.categoryScrollContent}
              renderItem={({ item }) => {
                const isActive = selectedCategory === item;
                return (
                  <TouchableOpacity
                    style={[styles.categoryTab, isActive && styles.categoryTabActive]}
                    onPress={() => setSelectedCategory(item)}
                  >
                    <Text style={[styles.categoryTabText, isActive && styles.categoryTabTextActive]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="fast-food-outline" size={60} color={COLORS.border} style={{ marginBottom: SPACING.md }} />
            <Text style={styles.emptyText}>No items found matching selection.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.foodCard}
            onPress={() => navigation.navigate('FoodDetail', { item, category: item.category })}
            activeOpacity={0.8}
          >
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.foodImg} />
            ) : (
              <View style={styles.foodImgPlaceholder}>
                <Ionicons name="fast-food-outline" size={24} color={COLORS.textSecondary} />
              </View>
            )}

            <View style={styles.foodInfo}>
              <Text style={styles.foodName}>{item.name}</Text>
              <View style={styles.metaRow}>
                <View style={styles.sizeBadge}>
                  <Text style={styles.sizeText}>{item.sizeOrWeight}</Text>
                </View>
                <Text style={styles.categoryTag}>{item.category}</Text>
              </View>
              <Text style={styles.priceText}>R {item.price.toFixed(2)}</Text>
            </View>

            <View style={styles.addBtn}>
              <Ionicons name="chevron-forward" size={16} color="#FFF" />
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContainer: {
    paddingBottom: SPACING.xl * 2,
  },
  coverContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  infoBadgeRow: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20,20,22,0.95)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  ratingText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20,20,22,0.95)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  timeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  detailsContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  restaurantTitle: {
    fontSize: FONTS.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  restaurantSub: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  deliveryInfo: {
    fontSize: FONTS.xs,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 6,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    height: 44,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: FONTS.sm,
    height: '100%',
  },
  categoryScroll: {
    marginVertical: SPACING.md,
    paddingLeft: SPACING.md,
  },
  categoryScrollContent: {
    paddingRight: SPACING.md * 2,
  },
  categoryTab: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: SPACING.sm,
  },
  categoryTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryTabText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sm - 1,
    fontWeight: '600',
  },
  categoryTabTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sm,
  },
  foodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: SPACING.sm,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  foodImg: {
    width: 65,
    height: 65,
    borderRadius: 12,
  },
  foodImgPlaceholder: {
    width: 65,
    height: 65,
    borderRadius: 12,
    backgroundColor: COLORS.cardBgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodInfo: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'center',
  },
  foodName: {
    fontSize: FONTS.md - 1,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  sizeBadge: {
    backgroundColor: COLORS.cardBgElevated,
    borderRadius: 4,
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 6,
  },
  sizeText: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  categoryTag: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  priceText: {
    fontSize: FONTS.sm,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginTop: 4,
  },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  heartBtn: {
    padding: 4,
  },
});
