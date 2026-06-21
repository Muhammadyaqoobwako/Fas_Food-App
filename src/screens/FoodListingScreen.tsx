import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { FoodItemCard } from '../components/FoodItemCard';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';

interface FoodItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
}

interface FoodListingScreenProps {
  onNavigate: (screen: string) => void;
  onSelectItem: (item: FoodItem) => void;
}

const CATEGORIES = ['All', 'Sprite', 'Coke', 'Burger', 'Pizza', 'IceCream', 'Chips'];

export const FoodListingScreen: React.FC<FoodListingScreenProps> = ({ onNavigate, onSelectItem }) => {
  const { token } = useAuth();
  const [menuItems, setMenuItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadMenu() {
      try {
        const data = await apiService.getMenuItems(token);
        // Map backend MenuItems to frontend FoodItems
        const mapped: FoodItem[] = data.map((item: any) => ({
          id: item._id,
          name: item.name,
          price: item.price,
          description: `${item.sizeOrWeight} (${item.options.join(', ')})`,
          category: item.category
        }));
        setMenuItems(mapped);
      } catch (err) {
        console.error('Failed to load menu items:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMenu();
  }, [token]);

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onNavigate('home')} style={styles.backBtn}>
            <Text style={styles.backText}>← Dashboard</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Menu Browser</Text>
        </View>

        <TextInput
          style={styles.searchBar}
          placeholder="🔍 Search food items..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999999"
        />

        <View style={styles.categoriesContainer}>
          <ScrollViewHorizontal categories={CATEGORIES} selected={selectedCategory} onSelect={setSelectedCategory} />
        </View>

        {loading ? (
          <View style={styles.empty}>
            <ActivityIndicator size="large" color="#FF6B35" />
            <Text style={[styles.emptyText, { marginTop: 12 }]}>Loading menu items...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <FoodItemCard
                item={item}
                onPress={() => onSelectItem(item)}
              />
            )}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No menu items match your search criteria.</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

// Internal horizontal category slider
const ScrollViewHorizontal: React.FC<{
  categories: string[];
  selected: string;
  onSelect: (cat: string) => void;
}> = ({ categories, selected, onSelect }) => {
  return (
    <FlatList
      horizontal
      data={categories}
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item}
      renderItem={({ item }) => {
        const isSelected = item === selected;
        return (
          <TouchableOpacity
            style={[styles.categoryBtn, isSelected && styles.selectedCategoryBtn]}
            onPress={() => onSelect(item)}
          >
            <Text style={[styles.categoryText, isSelected && styles.selectedCategoryText]}>{item}</Text>
          </TouchableOpacity>
        );
      }}
    />
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
  searchBar: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE2E6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
    marginBottom: 16
  },
  categoriesContainer: {
    marginBottom: 16
  },
  categoryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#EFEFEF',
    marginRight: 10
  },
  selectedCategoryBtn: {
    backgroundColor: '#FF6B35'
  },
  categoryText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '600'
  },
  selectedCategoryText: {
    color: '#FFFFFF'
  },
  list: {
    paddingBottom: 20
  },
  empty: {
    paddingVertical: 40,
    alignItems: 'center'
  },
  emptyText: {
    color: '#6C757D',
    fontSize: 16
  }
});
