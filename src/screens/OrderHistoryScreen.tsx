import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, SafeAreaView, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';
import { Button } from '../components/Button';

interface Order {
  _id: string;
  category: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    servedWith?: string;
    colour?: string;
    flavour?: string;
    type?: string;
  }>;
  totalAmount: number;
  cashier: string;
  createdAt: string;
}

interface OrderHistoryScreenProps {
  onNavigate: (screen: string) => void;
}

export const OrderHistoryScreen: React.FC<OrderHistoryScreenProps> = ({ onNavigate }) => {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      const data = await apiService.getOrders(token);
      setOrders(data);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to retrieve order history.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDeleteOrder = (id: string) => {
    Alert.alert(
      'Clear Order',
      'Are you sure you want to clear this order record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await apiService.deleteOrder(id, token);
              if (success) {
                Alert.alert('Cleared', 'The Menu record has been cleared.');
                fetchOrders();
              } else {
                Alert.alert('Error', 'Failed to clear order.');
              }
            } catch (err) {
              console.error(err);
              Alert.alert('Error', 'Failed to communicate with backend.');
            }
          }
        }
      ]
    );
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const dateStr = new Date(item.createdAt).toLocaleString();
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardCategory}>{item.category} Order</Text>
            <Text style={styles.cardDate}>{dateStr}</Text>
          </View>
          <Text style={styles.cardTotal}>${item.totalAmount.toFixed(2)}</Text>
        </View>

        <View style={styles.itemsList}>
          {item.items.map((subItem, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemDesc}>
                • {subItem.description} ({subItem.quantity}x)
              </Text>
              <Text style={styles.itemPrice}>
                ${(subItem.unitPrice * subItem.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.cashierText}>Cashier: {item.cashier}</Text>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDeleteOrder(item._id)}
          >
            <Text style={styles.deleteBtnText}>Clear Record</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onNavigate('home')} style={styles.backBtn}>
            <Text style={styles.backText}>← Dashboard</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Order History</Text>
        </View>

        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#FF6B35" />
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item._id}
            renderItem={renderOrderItem}
            contentContainerStyle={styles.list}
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchOrders();
            }}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No processed orders found.</Text>
                <Button
                  title="Refresh List"
                  onPress={fetchOrders}
                  style={styles.refreshBtn}
                />
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
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
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  list: {
    paddingBottom: 20
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#EFEFEF'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderColor: '#F1F1F1',
    paddingBottom: 10,
    marginBottom: 10
  },
  cardCategory: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50'
  },
  cardDate: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2
  },
  cardTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35'
  },
  itemsList: {
    marginBottom: 12
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  itemDesc: {
    fontSize: 14,
    color: '#555555'
  },
  itemPrice: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500'
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#F1F1F1',
    paddingTop: 10
  },
  cashierText: {
    fontSize: 12,
    color: '#6C757D',
    fontStyle: 'italic',
    textTransform: 'capitalize'
  },
  deleteBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8
  },
  deleteBtnText: {
    color: '#DC3545',
    fontSize: 13,
    fontWeight: '600'
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
  refreshBtn: {
    width: 150
  }
});
