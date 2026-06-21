import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface FoodItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  category: string;
}

interface FoodItemCardProps {
  item: FoodItem;
  onPress: () => void;
}

export const FoodItemCard: React.FC<FoodItemCardProps> = ({ item, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.content}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.category}>{item.category}</Text>
        {item.description ? (
          <Text style={styles.desc} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
        <View style={styles.footer}>
          <Text style={styles.price}>${item.price.toFixed(2)}</Text>
          <View style={styles.addButton}>
            <Text style={styles.addText}>Configure</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    overflow: 'hidden'
  },
  content: {
    padding: 16
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4
  },
  category: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8
  },
  desc: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 12
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50'
  },
  addButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20
  },
  addText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold'
  }
});
