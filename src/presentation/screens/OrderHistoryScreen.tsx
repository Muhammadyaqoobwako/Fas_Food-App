import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { COLORS, SPACING, FONTS, globalStyles } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../state/AppContext';

export const OrderHistoryScreen = () => {
  const { orders, offlineQueue, isOnline, syncOffline, refreshOrders } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const handleSync = async () => {
    if (offlineQueue.length === 0) return;
    try {
      const count = await syncOffline();
      alert(`Successfully synchronized ${count} offline orders to the cloud!`);
    } catch (err: any) {
      alert(`Sync failed: ${err.message}`);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshOrders();
    setRefreshing(false);
  };

  // Compute total sales metrics for the screen header
  const totalCompleted = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  const renderOrderItemDesc = (items: any[]) => {
    return items.map((item, index) => {
      const desc = `${item.quantity}x ${item.description}`;
      const config = [item.servedWith, item.type, item.flavour].filter(Boolean).join('/');
      return config ? `${desc} (${config})` : desc;
    }).join(', ');
  };

  return (
    <View style={globalStyles.container}>
      {/* Header Metric Cards */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Total Orders</Text>
          <Text style={styles.metricValue}>{totalCompleted}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Total Sales</Text>
          <Text style={styles.metricValue}>R {totalRevenue.toFixed(2)}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Queued</Text>
          <Text style={[styles.metricValue, { color: offlineQueue.length > 0 ? COLORS.warning : COLORS.textPrimary }]}>
            {offlineQueue.length}
          </Text>
        </View>
      </View>

      {/* Sync bar */}
      {offlineQueue.length > 0 && (
        <View style={styles.syncContainer}>
          <Text style={styles.syncText}>You have unsynced cashier orders</Text>
          <TouchableOpacity
            style={[styles.syncBtn, { backgroundColor: isOnline ? COLORS.secondary : COLORS.borderLight }]}
            onPress={handleSync}
            disabled={!isOnline}
          >
            <Ionicons name="sync" size={14} color={COLORS.background} style={{ marginRight: 4 }} />
            <Text style={styles.syncBtnText}>Sync Now</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* History FlatList */}
      <FlatList
        data={orders}
        keyExtractor={(item, index) => item._id || `order-${index}`}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color={COLORS.borderLight} />
            <Text style={styles.emptyText}>No sales recorded yet.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isOffline = !!item.offlineCreatedAt;
          const orderDate = item.createdAt 
            ? new Date(item.createdAt).toLocaleString() 
            : new Date(item.offlineCreatedAt!).toLocaleString();

          return (
            <View style={styles.historyCard}>
              <View style={globalStyles.spaceBetween}>
                <View>
                  <Text style={styles.orderIdText}>Ref: {item._id || 'Offline Ref'}</Text>
                  <Text style={styles.orderDateText}>{orderDate}</Text>
                </View>
                <View style={[styles.statusBadge, isOffline ? styles.statusOffline : styles.statusOnline]}>
                  <Text style={[styles.statusText, { color: isOffline ? COLORS.warning : COLORS.success }]}>
                    {isOffline ? 'Queued' : 'Synced'}
                  </Text>
                </View>
              </View>

              <View style={styles.cardDivider} />

              <Text style={styles.itemsText} numberOfLines={2}>
                <Text style={styles.categoryLabel}>[{item.category}]</Text> {renderOrderItemDesc(item.items)}
              </Text>

              <View style={globalStyles.spaceBetween}>
                <Text style={styles.cashierText}>Cashier: {item.cashier}</Text>
                <Text style={styles.amountText}>R {item.totalAmount.toFixed(2)}</Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: FONTS.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  syncContainer: {
    backgroundColor: '#3E2723', // Warm dark brown
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  syncText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '500',
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  syncBtnText: {
    color: COLORS.background,
    fontSize: 10,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: SPACING.md,
  },
  historyCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  orderIdText: {
    fontSize: FONTS.sm,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  orderDateText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusOffline: {
    backgroundColor: 'rgba(255,152,0,0.12)',
  },
  statusOnline: {
    backgroundColor: 'rgba(76,175,80,0.12)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  itemsText: {
    fontSize: FONTS.sm,
    color: COLORS.textPrimary,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  categoryLabel: {
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  cashierText: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  amountText: {
    fontSize: FONTS.md,
    fontWeight: 'bold',
    color: COLORS.secondary,
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
});
