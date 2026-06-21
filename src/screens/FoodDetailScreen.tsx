import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useCart } from '../context/CartContext';
import { Button } from '../components/Button';

interface FoodItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
}

interface FoodDetailScreenProps {
  item: FoodItem;
  onNavigate: (screen: string) => void;
}

export const FoodDetailScreen: React.FC<FoodDetailScreenProps> = ({ item, onNavigate }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedType, setSelectedType] = useState('');
  const [selectedQuantityMl, setSelectedQuantityMl] = useState('');
  const [servedWith, setServedWith] = useState('');
  const [colour, setColour] = useState('');
  const [flavour, setFlavour] = useState('');
  const [unitPrice, setUnitPrice] = useState(item.price);

  // Set default configurations based on category
  useEffect(() => {
    if (item.category === 'Sprite' || item.category === 'Coke') {
      setSelectedType('Can');
      setSelectedQuantityMl('300ml');
    } else if (item.category === 'Burger') {
      setSelectedType('Regular');
      setServedWith('None');
    } else if (item.category === 'Pizza') {
      setSelectedType('Medium');
      setServedWith('None');
    } else if (item.category === 'IceCream') {
      setColour('White');
      setFlavour('Vanilla');
    } else if (item.category === 'Chips') {
      setServedWith('Salt');
    }
  }, [item]);

  // Adjust unit price dynamically based on size / volume customizations (simulating legacy database price rules)
  useEffect(() => {
    let basePrice = item.price;

    if (item.category === 'Sprite' || item.category === 'Coke') {
      // Mimic Sprite/Coke ML pricing logic from legacy code
      switch (selectedQuantityMl) {
        case '100ml': basePrice = 2.50; break;
        case '200ml': basePrice = 3.00; break;
        case '300ml': basePrice = 3.20; break;
        case '400ml': basePrice = 3.50; break;
        case '500ml': basePrice = 3.80; break;
        case '600ml': basePrice = 4.00; break;
        case '700ml': basePrice = 4.50; break;
        case '800ml': basePrice = 4.70; break;
        case '900ml': basePrice = 5.00; break;
        case '1000ml': basePrice = 5.50; break;
      }
    } else if (item.category === 'Pizza') {
      if (selectedType === 'Small') basePrice = item.price - 2.00;
      else if (selectedType === 'Large') basePrice = item.price + 3.00;
    } else if (item.category === 'Burger') {
      if (selectedType === 'Double') basePrice = item.price + 2.50;
    }

    setUnitPrice(basePrice);
  }, [selectedQuantityMl, selectedType, item]);

  const handleAddToCart = () => {
    addToCart({
      category: item.category,
      description: item.name,
      quantity,
      unitPrice,
      servedWith: servedWith || undefined,
      colour: colour || undefined,
      flavour: flavour || undefined,
      type: selectedType || selectedQuantityMl || undefined
    });

    Alert.alert('Item Added', `${item.name} has been added to your shopping cart.`);
    onNavigate('listing');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => onNavigate('listing')} style={styles.backBtn}>
          <Text style={styles.backText}>← Back to Menu</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.desc}>{item.description}</Text>
          <Text style={styles.price}>${unitPrice.toFixed(2)} each</Text>
        </View>

        {/* CUSTOMIZATION OPTIONS */}
        <Text style={styles.sectionTitle}>Customize Order</Text>

        {/* Drink Types */}
        {(item.category === 'Sprite' || item.category === 'Coke') ? (
          <View style={styles.optionGroup}>
            <Text style={styles.optionLabel}>Container Type</Text>
            <View style={styles.btnRow}>
              {['Can', 'Bottle', 'Cup'].map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.optionBtn, selectedType === t && styles.activeOptionBtn]}
                  onPress={() => setSelectedType(t)}
                >
                  <Text style={[styles.optionBtnText, selectedType === t && styles.activeOptionBtnText]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}

        {/* Drink Volume */}
        {(item.category === 'Sprite' || item.category === 'Coke') ? (
          <View style={styles.optionGroup}>
            <Text style={styles.optionLabel}>Volume in MLs</Text>
            <View style={styles.btnRowWrap}>
              {['100ml', '200ml', '300ml', '400ml', '500ml', '600ml', '1000ml'].map(vol => (
                <TouchableOpacity
                  key={vol}
                  style={[styles.smallOptionBtn, selectedQuantityMl === vol && styles.activeOptionBtn]}
                  onPress={() => setSelectedQuantityMl(vol)}
                >
                  <Text style={[styles.optionBtnText, selectedQuantityMl === vol && styles.activeOptionBtnText]}>{vol}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}

        {/* Burger / Pizza sizes */}
        {(item.category === 'Burger' || item.category === 'Pizza') ? (
          <View style={styles.optionGroup}>
            <Text style={styles.optionLabel}>Size / Type</Text>
            <View style={styles.btnRow}>
              {(item.category === 'Pizza' ? ['Small', 'Medium', 'Large'] : ['Regular', 'Double']).map(sz => (
                <TouchableOpacity
                  key={sz}
                  style={[styles.optionBtn, selectedType === sz && styles.activeOptionBtn]}
                  onPress={() => setSelectedType(sz)}
                >
                  <Text style={[styles.optionBtnText, selectedType === sz && styles.activeOptionBtnText]}>{sz}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}

        {/* Sides / Accompaniments */}
        {(item.category === 'Burger' || item.category === 'Pizza' || item.category === 'Chips') ? (
          <View style={styles.optionGroup}>
            <Text style={styles.optionLabel}>Accompaniment / Sides</Text>
            <View style={styles.btnRowWrap}>
              {(item.category === 'Burger' ? ['Tomato Sauce', 'Chilli Sauce', 'Mustard', 'None'] :
                item.category === 'Pizza' ? ['Extra Cheese', 'Mushrooms', 'Garlic', 'None'] :
                ['Salt', 'Vinegar', 'Chili Powder', 'None']).map(side => (
                  <TouchableOpacity
                    key={side}
                    style={[styles.smallOptionBtn, servedWith === side && styles.activeOptionBtn]}
                    onPress={() => setServedWith(side)}
                  >
                    <Text style={[styles.optionBtnText, servedWith === side && styles.activeOptionBtnText]}>{side}</Text>
                  </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}

        {/* Ice Cream Flavor */}
        {item.category === 'IceCream' ? (
          <View style={styles.optionGroup}>
            <Text style={styles.optionLabel}>Flavour</Text>
            <View style={styles.btnRow}>
              {['Vanilla', 'Chocolate', 'Strawberry', 'Mint'].map(flav => (
                <TouchableOpacity
                  key={flav}
                  style={[styles.optionBtn, flavour === flav && styles.activeOptionBtn]}
                  onPress={() => setFlavour(flav)}
                >
                  <Text style={[styles.optionBtnText, flavour === flav && styles.activeOptionBtnText]}>{flav}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}

        {/* Ice Cream Color */}
        {item.category === 'IceCream' ? (
          <View style={styles.optionGroup}>
            <Text style={styles.optionLabel}>Colour Choice</Text>
            <View style={styles.btnRow}>
              {['White', 'Brown', 'Pink', 'Green'].map(col => (
                <TouchableOpacity
                  key={col}
                  style={[styles.optionBtn, colour === col && styles.activeOptionBtn]}
                  onPress={() => setColour(col)}
                >
                  <Text style={[styles.optionBtnText, colour === col && styles.activeOptionBtnText]}>{col}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}

        {/* Quantity Selection */}
        <View style={styles.quantityContainer}>
          <Text style={styles.optionLabel}>Quantity</Text>
          <View style={styles.quantityRow}>
            <TouchableOpacity style={styles.qBtn} onPress={() => setQuantity(q => Math.max(1, q - 1))}>
              <Text style={styles.qText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.qVal}>{quantity}</Text>
            <TouchableOpacity style={styles.qBtn} onPress={() => setQuantity(q => q + 1)}>
              <Text style={styles.qText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.footer}>
          <Text style={styles.totalText}>Total: ${(unitPrice * quantity).toFixed(2)}</Text>
          <Button
            title="Add to Shopping Cart"
            onPress={handleAddToCart}
            style={styles.addBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  container: {
    padding: 20
  },
  backBtn: {
    marginBottom: 20
  },
  backText: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: 'bold'
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4
  },
  category: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 12
  },
  desc: {
    fontSize: 16,
    color: '#6C757D',
    lineHeight: 22,
    marginBottom: 16
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16
  },
  optionGroup: {
    marginBottom: 20
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  btnRowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  optionBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE2E6',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 4
  },
  smallOptionBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE2E6',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center'
  },
  activeOptionBtn: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35'
  },
  optionBtnText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '600'
  },
  activeOptionBtnText: {
    color: '#FFFFFF'
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DEE2E6'
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  qBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFEFEF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  qText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333'
  },
  qVal: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    color: '#333333'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    borderTopWidth: 1,
    borderColor: '#DEE2E6',
    paddingTop: 16
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50'
  },
  addBtn: {
    flex: 1,
    marginLeft: 16
  }
});
