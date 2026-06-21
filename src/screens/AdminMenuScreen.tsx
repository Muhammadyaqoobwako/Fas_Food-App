import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, Switch } from 'react-native';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';
import { Button } from '../components/Button';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  sizeOrWeight: string;
  category: string;
  options: string[];
  isAvailable: boolean;
}

interface AdminMenuScreenProps {
  onNavigate: (screen: string) => void;
}

const CATEGORIES = ['Sprite', 'Coke', 'Burger', 'Pizza', 'IceCream', 'Chips'];

export const AdminMenuScreen: React.FC<AdminMenuScreenProps> = ({ onNavigate }) => {
  const { token } = useAuth();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [editId, setEditId] = useState<string | null>(null);
  const [category, setCategory] = useState('Sprite');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [sizeOrWeight, setSizeOrWeight] = useState('');
  const [optionsStr, setOptionsStr] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await apiService.getMenuItems(token);
      setItems(data);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to retrieve menu items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [token]);

  const handleEdit = (item: MenuItem) => {
    setEditId(item._id);
    setCategory(item.category);
    setName(item.name);
    setPrice(item.price.toString());
    setSizeOrWeight(item.sizeOrWeight);
    setOptionsStr(item.options.join(', '));
    setIsAvailable(item.isAvailable);
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setEditId(null);
    setCategory('Sprite');
    setName('');
    setPrice('');
    setSizeOrWeight('');
    setOptionsStr('');
    setIsAvailable(true);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditId(null);
  };

  const handleDelete = async (id: string) => {
    // For Web, confirm using window.confirm or react-native Alert
    const confirmed = typeof window !== 'undefined' 
      ? window.confirm('Are you sure you want to delete this menu item?')
      : true;

    if (!confirmed) return;

    try {
      const success = await apiService.deleteMenuItem(id, token);
      if (success) {
        setItems(items.filter(i => i._id !== id));
        Alert.alert('Success', 'Menu item deleted successfully.');
      } else {
        Alert.alert('Error', 'Failed to delete menu item.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'An error occurred while deleting.');
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !price.trim() || !sizeOrWeight.trim()) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      Alert.alert('Error', 'Please enter a valid price.');
      return;
    }

    const options = optionsStr
      .split(',')
      .map(o => o.trim())
      .filter(o => o.length > 0);

    const payload = {
      category,
      name: name.trim(),
      price: priceNum,
      sizeOrWeight: sizeOrWeight.trim(),
      options,
      isAvailable
    };

    try {
      if (editId) {
        const res = await apiService.updateMenuItem(editId, payload, token);
        if (res.success) {
          Alert.alert('Success', 'Menu item updated successfully.');
          setIsEditing(false);
          setEditId(null);
          fetchItems();
        } else {
          Alert.alert('Error', res.message || 'Failed to update menu item.');
        }
      } else {
        const res = await apiService.createMenuItem(payload, token);
        if (res.success) {
          Alert.alert('Success', 'Menu item created successfully.');
          setIsEditing(false);
          fetchItems();
        } else {
          Alert.alert('Error', res.message || 'Failed to create menu item.');
        }
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'An error occurred during submission.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onNavigate('admin')} style={styles.backBtn}>
            <Text style={styles.backText}>← Admin Board</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Menu Item Manager</Text>
        </View>

        {isEditing ? (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>{editId ? 'Edit Menu Item' : 'Add New Menu Item'}</Text>
            
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryRow}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catBadge, category === cat && styles.catBadgeSelected]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.catBadgeText, category === cat && styles.catBadgeTextSelected]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Item Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Sprite Double Blast"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#999"
            />

            <View style={styles.row}>
              <View style={[styles.col, { marginRight: 12 }]}>
                <Text style={styles.label}>Price ($) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 4.50"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Size / Weight *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 300ml, 150g"
                  value={sizeOrWeight}
                  onChangeText={setSizeOrWeight}
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <Text style={styles.label}>Options / Accompaniements (Comma-separated)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Cold, Diet, Extra Cheese"
              value={optionsStr}
              onChangeText={setOptionsStr}
              placeholderTextColor="#999"
            />

            <View style={styles.switchRow}>
              <Text style={styles.label}>Is Available for Sale</Text>
              <Switch
                value={isAvailable}
                onValueChange={setIsAvailable}
                trackColor={{ false: '#767577', true: '#FF6B35' }}
                thumbColor={isAvailable ? '#f4f3f4' : '#f4f3f4'}
              />
            </View>

            <View style={styles.formActions}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={handleCancel}
                style={[styles.formBtn, { marginRight: 12 }]}
              />
              <Button
                title="Save Item"
                onPress={handleSubmit}
                style={styles.formBtn}
              />
            </View>
          </View>
        ) : (
          <View>
            <View style={styles.actionsBar}>
              <Button
                title="Add New Menu Item ➕"
                onPress={handleAddNew}
                style={styles.addBtn}
              />
            </View>

            {loading ? (
              <View style={styles.loader}>
                <ActivityIndicator size="large" color="#FF6B35" />
              </View>
            ) : items.length > 0 ? (
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeadCell, { flex: 2 }]}>Item</Text>
                  <Text style={styles.tableHeadCell}>Cat</Text>
                  <Text style={styles.tableHeadCell}>Price</Text>
                  <Text style={[styles.tableHeadCell, { flex: 1.5 }]}>Specs & Options</Text>
                  <Text style={[styles.tableHeadCell, { textAlign: 'right' }]}>Actions</Text>
                </View>

                {items.map(item => (
                  <View key={item._id} style={[styles.tableRow, !item.isAvailable && styles.rowUnavailable]}>
                    <View style={{ flex: 2 }}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      {!item.isAvailable && <Text style={styles.unavailableLabel}>Out of Stock</Text>}
                    </View>
                    <Text style={styles.tableCell}>{item.category}</Text>
                    <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>${item.price.toFixed(2)}</Text>
                    <View style={{ flex: 1.5 }}>
                      <Text style={styles.specText}>{item.sizeOrWeight}</Text>
                      {item.options.length > 0 && (
                        <Text style={styles.optionsText}>{item.options.join(', ')}</Text>
                      )}
                    </View>
                    <View style={styles.rowActions}>
                      <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editAction}>
                        <Text style={styles.editText}>✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.deleteAction}>
                        <Text style={styles.deleteText}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No menu items found.</Text>
                <Button title="Refresh" onPress={fetchItems} />
              </View>
            )}
          </View>
        )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24
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
  actionsBar: {
    marginBottom: 16,
    alignItems: 'flex-end'
  },
  addBtn: {
    paddingHorizontal: 20,
    backgroundColor: '#2C3E50'
  },
  loader: {
    paddingVertical: 80,
    alignItems: 'center'
  },
  table: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2C3E50',
    padding: 14
  },
  tableHeadCell: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderColor: '#F8F9FA'
  },
  rowUnavailable: {
    backgroundColor: '#FFF2F2'
  },
  unavailableLabel: {
    fontSize: 10,
    color: '#DC3545',
    fontWeight: 'bold',
    marginTop: 2
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50'
  },
  tableCell: {
    fontSize: 14,
    color: '#333333',
    flex: 1
  },
  specText: {
    fontSize: 13,
    color: '#495057'
  },
  optionsText: {
    fontSize: 11,
    color: '#6C757D',
    marginTop: 2
  },
  rowActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flex: 1
  },
  editAction: {
    padding: 6,
    marginRight: 8
  },
  editText: {
    fontSize: 16
  },
  deleteAction: {
    padding: 6
  },
  deleteText: {
    fontSize: 16
  },
  empty: {
    paddingVertical: 80,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 16,
    color: '#6C757D',
    marginBottom: 16
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B35',
    paddingBottom: 8
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#DEE2E6',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333333',
    marginBottom: 16
  },
  row: {
    flexDirection: 'row'
  },
  col: {
    flex: 1
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16
  },
  catBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EFEFEF',
    borderRadius: 14,
    marginRight: 8,
    marginBottom: 8
  },
  catBadgeSelected: {
    backgroundColor: '#FF6B35'
  },
  catBadgeText: {
    fontSize: 12,
    color: '#495057',
    fontWeight: '600'
  },
  catBadgeTextSelected: {
    color: '#FFFFFF'
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1'
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  formBtn: {
    flex: 1,
    paddingVertical: 12
  }
});
