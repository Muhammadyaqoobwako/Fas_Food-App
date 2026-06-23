import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  Image,
  Animated,
} from 'react-native';
import { COLORS, SPACING, FONTS, globalStyles } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useApp } from '../state/AppContext';

type FoodListingScreenRouteProp = RouteProp<RootStackParamList, 'FoodListing'>;
type FoodListingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'FoodListing'>;

interface Props {
  route: FoodListingScreenRouteProp;
  navigation: FoodListingScreenNavigationProp;
}

export const FoodListingScreen: React.FC<Props> = ({ route, navigation }) => {
  const { category } = route.params;
  const { menuItems } = useApp();
  
  const listItems = menuItems.filter(item => item.category === category);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[globalStyles.container, { opacity: fadeAnim }]}>
      <FlatList
        data={listItems}
        keyExtractor={item => item._id || ''}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <Text style={styles.headerText}>Configure your selection with custom sides and pricing.</Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="fast-food-outline" size={64} color={COLORS.border} />
            <Text style={styles.emptyText}>No items available in this category.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.foodCard}
            onPress={() => navigation.navigate('FoodDetail', { item, category })}
            activeOpacity={0.8}
          >
            {/* Visual Thumbnail */}
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.foodImg} />
            ) : (
              <View style={styles.foodImgPlaceholder}>
                <Ionicons name="fast-food-outline" size={24} color={COLORS.textSecondary} />
              </View>
            )}

            {/* Details Column */}
            <View style={styles.foodDetails}>
              <Text style={styles.foodName}>{item.name}</Text>
              <View style={styles.tagRow}>
                <View style={styles.sizeBadge}>
                  <Text style={styles.sizeBadgeText}>{item.sizeOrWeight}</Text>
                </View>
              </View>
            </View>

            {/* Pricing Column */}
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>R {item.price.toFixed(2)}</Text>
              <View style={styles.actionBtn}>
                <Ionicons name="chevron-forward" size={18} color="#FFF" />
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </Animated.View>
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
    paddingLeft: 2,
  },
  foodCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  foodImg: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  foodImgPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: COLORS.cardBgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodDetails: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'center',
  },
  foodName: {
    fontSize: FONTS.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  tagRow: {
    flexDirection: 'row',
  },
  sizeBadge: {
    backgroundColor: COLORS.cardBgElevated,
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sizeBadgeText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: SPACING.sm,
  },
  priceText: {
    fontSize: FONTS.md,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginRight: SPACING.sm,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
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
});
