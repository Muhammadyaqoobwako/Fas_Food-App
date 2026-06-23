import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { COLORS, SPACING, FONTS, globalStyles } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useApp } from '../state/AppContext';

type SearchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

interface Props {
  navigation: SearchScreenNavigationProp;
}

export const SearchScreen: React.FC<Props> = ({ navigation }) => {
  const { menuItems } = useApp();
  const [query, setQuery] = useState('');

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={globalStyles.container}>
      {/* Search Input Bar */}
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

      {/* Results List */}
      <FlatList
        data={filteredItems}
        keyExtractor={item => item._id || ''}
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
            activeOpacity={0.8}
          >
            {/* Visual Thumbnail */}
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.resultImg} />
            ) : (
              <View style={styles.resultImgPlaceholder}>
                <Ionicons name="fast-food-outline" size={20} color={COLORS.textSecondary} />
              </View>
            )}

            {/* Details */}
            <View style={styles.detailsColumn}>
              <Text style={styles.itemName}>{item.name}</Text>
              <View style={styles.badgeRow}>
                <View style={[styles.categoryBadge, { backgroundColor: COLORS.cardBgElevated }]}>
                  <Text style={styles.categoryBadgeText}>{item.category}</Text>
                </View>
                <Text style={styles.sizeText}>{item.sizeOrWeight}</Text>
              </View>
            </View>

            {/* Price */}
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
    paddingBottom: SPACING.xl * 2,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
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
  resultImg: {
    width: 55,
    height: 55,
    borderRadius: 10,
  },
  resultImgPlaceholder: {
    width: 55,
    height: 55,
    borderRadius: 10,
    backgroundColor: COLORS.cardBgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsColumn: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'center',
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
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryBadgeText: {
    color: COLORS.textSecondary,
    fontSize: 9,
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
    marginRight: 4,
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
