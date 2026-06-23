import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { COLORS, SPACING, FONTS, globalStyles } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../state/AppContext';
import { IOrder } from '../../types';
import { useNavigation } from '@react-navigation/native';

interface DeliveryOrder {
  id: string;
  orderRef: string;
  customerName: string;
  address: string;
  items: string;
  total: number;
  status: 'ready' | 'picked_up' | 'on_the_way' | 'delivered';
  estimatedTime: string;
  distance: string;
}

const MOCK_DELIVERIES: DeliveryOrder[] = [
  {
    id: 'd1',
    orderRef: 'ORD-2847',
    customerName: 'Sarah Johnson',
    address: '42 Umhlanga Rocks Dr, Durban',
    items: '2x Beef Burger, 1x Large Chips, 1x Coke Regular',
    total: 1070.00,
    status: 'ready',
    estimatedTime: '15 min',
    distance: '3.2 km',
  },
  {
    id: 'd2',
    orderRef: 'ORD-2846',
    customerName: 'Ahmed Patel',
    address: '15 Florida Rd, Morningside',
    items: '1x Pepperoni Passion, 1x Sprite Duo Pack',
    total: 920.00,
    status: 'picked_up',
    estimatedTime: '22 min',
    distance: '5.8 km',
  },
  {
    id: 'd3',
    orderRef: 'ORD-2845',
    customerName: 'Thabo Mkhize',
    address: '88 Windermere Rd, Berea',
    items: '1x Regina Pizza, 2x Vanilla Soft Serve',
    total: 790.00,
    status: 'on_the_way',
    estimatedTime: '8 min',
    distance: '1.5 km',
  },
  {
    id: 'd4',
    orderRef: 'ORD-2840',
    customerName: 'Lisa van der Merwe',
    address: '23 Musgrave Rd, Musgrave',
    items: '3x Chicken Cheeseburger, 2x Large Share Chips',
    total: 1950.00,
    status: 'delivered',
    estimatedTime: 'Done',
    distance: '4.1 km',
  },
  {
    id: 'd5',
    orderRef: 'ORD-2839',
    customerName: 'James Naidoo',
    address: '7 Riverview Close, Westville',
    items: '1x Double King Burger, 1x Strawberry Sundae',
    total: 870.00,
    status: 'delivered',
    estimatedTime: 'Done',
    distance: '7.3 km',
  },
];

const statusConfig = {
  ready: { label: 'Ready for Pickup', color: '#42A5F5', icon: 'checkbox-outline' as const },
  picked_up: { label: 'Picked Up', color: '#FFA726', icon: 'bicycle-outline' as const },
  on_the_way: { label: 'On the Way', color: '#66BB6A', icon: 'navigate-outline' as const },
  delivered: { label: 'Delivered', color: COLORS.textSecondary, icon: 'checkmark-done-outline' as const },
};

export const DeliveriesScreen = () => {
  const { cashier, orders, updateOrderStatus } = useApp();
  const navigation = useNavigation<any>();
  const [mockDeliveries, setMockDeliveries] = useState(MOCK_DELIVERIES);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Filter orders assigned to the logged-in rider (case insensitive check)
  const riderOrders = orders.filter(
    o => o.assignedDriver?.toLowerCase() === cashier?.username?.toLowerCase()
  );

  // Map to delivery structure
  const dynamicDeliveries = riderOrders.map(o => ({
    id: o._id || '',
    orderRef: o._id ? `ORD-${o._id.substring(0, 6).toUpperCase()}` : 'ORD-XXXX',
    customerName: o.customerName || 'Anonymous',
    address: o.deliveryAddress || 'Address not provided',
    items: o.items.map(i => `${i.quantity}x ${i.description}`).join(', '),
    total: o.totalAmount,
    status: (o.status === 'completed' ? 'delivered' : o.status) as any,
    estimatedTime: o.status === 'ready' ? '15 min' : o.status === 'picked_up' ? '10 min' : o.status === 'on_the_way' ? '5 min' : 'Done',
    distance: '3.5 km',
  }));

  // Switch to dynamic deliveries if any are assigned, otherwise show the mock list
  const deliveries = dynamicDeliveries.length > 0 ? dynamicDeliveries : mockDeliveries;

  const filteredDeliveries = deliveries.filter(d => {
    if (filter === 'active') return d.status !== 'delivered';
    if (filter === 'completed') return d.status === 'delivered';
    return true;
  });

  const activeCount = deliveries.filter(d => d.status !== 'delivered').length;
  const completedCount = deliveries.filter(d => d.status === 'delivered').length;
  const totalEarnings = deliveries
    .filter(d => d.status === 'delivered')
    .reduce((sum, d) => sum + d.total * 0.08, 0); // 8% commission

  const advanceStatus = async (id: string, currentStatus: string) => {
    if (id.startsWith('d')) {
      // Mock list
      setMockDeliveries(prev => prev.map(d => {
        if (d.id !== id) return d;
        const flow: Record<string, DeliveryOrder['status']> = {
          ready: 'picked_up',
          picked_up: 'on_the_way',
          on_the_way: 'delivered',
        };
        return { ...d, status: flow[d.status] || d.status };
      }));
      return;
    }

    // Dynamic list
    const flow: Record<string, IOrder['status']> = {
      ready: 'picked_up',
      picked_up: 'on_the_way',
      on_the_way: 'delivered',
    };
    const nextStatus = flow[currentStatus];
    if (nextStatus) {
      await updateOrderStatus(id, nextStatus);
    }
  };

  return (
    <Animated.View style={[globalStyles.container, { opacity: fadeAnim }]}>
      {/* Driver Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{activeCount}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{completedCount}</Text>
          <Text style={styles.statLabel}>Delivered</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: COLORS.success }]}>R {totalEarnings.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Earnings</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['all', 'active', 'completed'] as const).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
              {f === 'all' ? 'All' : f === 'active' ? 'Active' : 'Completed'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredDeliveries}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="car-outline" size={64} color={COLORS.borderLight} />
            <Text style={styles.emptyText}>No deliveries in this filter.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const config = statusConfig[item.status as keyof typeof statusConfig] || statusConfig.ready;
          const isActive = item.status !== 'delivered';

          return (
            <View style={[styles.deliveryCard, !isActive && styles.deliveryCardCompleted]}>
              {/* Status Header */}
              <View style={styles.cardHeader}>
                <View style={[styles.statusBadge, { backgroundColor: `${config.color}20` }]}>
                  <Ionicons name={config.icon} size={14} color={config.color} style={{ marginRight: 4 }} />
                  <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
                </View>
                <Text style={styles.orderRef}>{item.orderRef}</Text>
              </View>

              {/* Customer Info */}
              <View style={styles.customerRow}>
                <View style={styles.customerAvatar}>
                  <Text style={styles.customerAvatarText}>
                    {item.customerName.charAt(0)}
                  </Text>
                </View>
                <View style={styles.customerInfo}>
                  <Text style={styles.customerName}>{item.customerName}</Text>
                  <View style={styles.addressRow}>
                    <Ionicons name="location-outline" size={12} color={COLORS.textSecondary} />
                    <Text style={styles.addressText} numberOfLines={1}>{item.address}</Text>
                  </View>
                </View>
              </View>

              {/* Order Details */}
              <View style={styles.orderDetails}>
                <Text style={styles.itemsText} numberOfLines={2}>{item.items}</Text>
              </View>

              {/* Footer */}
              <View style={styles.cardFooter}>
                <View style={styles.metaRow}>
                  <View style={styles.metaChip}>
                    <Ionicons name="time-outline" size={12} color={COLORS.textSecondary} />
                    <Text style={styles.metaChipText}>{item.estimatedTime}</Text>
                  </View>
                  <View style={styles.metaChip}>
                    <Ionicons name="map-outline" size={12} color={COLORS.textSecondary} />
                    <Text style={styles.metaChipText}>{item.distance}</Text>
                  </View>
                  <Text style={styles.totalText}>R {item.total.toFixed(2)}</Text>
                </View>

                {isActive && (
                  <View style={styles.riderActionsRow}>
                    <TouchableOpacity
                      style={styles.riderChatBtn}
                      onPress={() => navigation.navigate('Chat', {
                        orderId: item.id,
                        customerName: item.customerName,
                        riderName: cashier?.username || 'Rider',
                      })}
                    >
                      <Ionicons name="chatbubbles-outline" size={16} color={COLORS.primary} style={{ marginRight: 4 }} />
                      <Text style={styles.riderChatBtnText}>Chat</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: config.color, flex: 1 }]}
                      onPress={() => advanceStatus(item.id, item.status)}
                    >
                      <Text style={styles.actionBtnText}>
                        {item.status === 'ready' ? 'Pick Up' :
                         item.status === 'picked_up' ? 'Start Delivery' : 'Mark Delivered'}
                      </Text>
                      <Ionicons name="arrow-forward" size={16} color="#FFF" style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          );
        }}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  statsBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONTS.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.border,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: FONTS.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterTabTextActive: {
    color: COLORS.textPrimary,
  },
  listContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  deliveryCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  deliveryCardCompleted: {
    opacity: 0.65,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  orderRef: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  customerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  customerAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: FONTS.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  addressText: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    marginLeft: 4,
    flex: 1,
  },
  orderDetails: {
    backgroundColor: COLORS.cardBgElevated,
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  itemsText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBgElevated,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  metaChipText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  totalText: {
    fontSize: FONTS.md,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginLeft: 'auto',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: FONTS.sm,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sm,
    marginTop: SPACING.md,
  },
  riderActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riderChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  riderChatBtnText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: FONTS.sm,
  },
});
