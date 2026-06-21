import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CartItem } from '../context/CartContext';

interface CartItemRowProps {
  item: CartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  onIncrease,
  onDecrease,
  onRemove
}) => {
  const customSummary = [
    item.type && `Type: ${item.type}`,
    item.servedWith && `With: ${item.servedWith}`,
    item.colour && `Colour: ${item.colour}`,
    item.flavour && `Flavour: ${item.flavour}`
  ]
    .filter(Boolean)
    .join(' | ');

  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.title}>{item.description}</Text>
        <Text style={styles.category}>{item.category}</Text>
        {customSummary ? <Text style={styles.summary}>{customSummary}</Text> : null}
        <Text style={styles.price}>
          ${item.unitPrice.toFixed(2)} x {item.quantity} = ${(item.unitPrice * item.quantity).toFixed(2)}
        </Text>
      </View>
      <View style={styles.actions}>
        <View style={styles.quantityControls}>
          <TouchableOpacity style={styles.qBtn} onPress={onDecrease}>
            <Text style={styles.qText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.qVal}>{item.quantity}</Text>
          <TouchableOpacity style={styles.qBtn} onPress={onIncrease}>
            <Text style={styles.qText}>+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
          <Text style={styles.removeText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFEFEF'
  },
  info: {
    flex: 1,
    paddingRight: 8
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333'
  },
  category: {
    fontSize: 11,
    color: '#FF6B35',
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase'
  },
  summary: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 4
  },
  price: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
    marginTop: 6
  },
  actions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between'
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  qBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFEFEF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  qText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333'
  },
  qVal: {
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 10,
    color: '#333333'
  },
  removeBtn: {
    marginTop: 4
  },
  removeText: {
    color: '#DC3545',
    fontSize: 12,
    fontWeight: '600'
  }
});
