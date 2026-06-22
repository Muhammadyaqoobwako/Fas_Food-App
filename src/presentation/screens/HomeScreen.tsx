import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useApp } from '../state/AppContext';
import { COLORS, SPACING, FONTS, globalStyles } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { cashier, orders, offlineQueue, isOnline, syncOffline } = useApp();

  const categories = [
    { name: 'Pizza', label: 'Pizza & Pies', icon: 'pizza', emoji: '🍕', color: '#FF7043' },
    { name: 'Burger', label: 'Gourmet Burgers', icon: 'hamburger', emoji: '🍔', color: '#FFA726' },
    { name: 'Chips', label: 'Hot Chips', icon: 'nutrition', emoji: '🍟', color: '#FFEE58' },
    { name: 'Sprite', label: 'Sprite Soft Drinks', icon: 'water', emoji: '🥤', color: '#66BB6A' },
    { name: 'Coke', label: 'Coke Cola Beverages', icon: 'beer', emoji: '🥫', color: '#EF5350' },
    { name: 'IceCream', label: 'Ice Cream & Desserts', icon: 'ice-cream', emoji: '🍦', color: '#AB47BC' },
  ] as const;

  // Calculate cashier's session sales count and total revenue
  const sessionOrders = orders.filter(o => o.cashier === cashier?.username);
  const sessionTotal = sessionOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const handleSync = async () => {
    if (offlineQueue.length === 0) return;
    try {
      const count = await syncOffline();
      alert(`Successfully synchronized ${count} offline orders to the cloud!`);
    } catch (err: any) {
      alert(`Sync failed: ${err.message}`);
    }
  };

  return (
    <ScrollView style={globalStyles.container} contentContainerStyle={styles.content}>
      {/* Top Banner / Welcome Cashier */}
      <View style={styles.welcomeBanner}>
        <View>
          <Text style={styles.cashierWelcome}>Welcome back,</Text>
          <Text style={styles.cashierName}>{cashier?.username || 'Cashier'}</Text>
        </View>
        <View style={[styles.networkBadge, { backgroundColor: isOnline ? 'rgba(76,175,80,0.15)' : 'rgba(255,152,0,0.15)' }]}>
          <View style={[styles.dot, { backgroundColor: isOnline ? COLORS.success : COLORS.warning }]} />
          <Text style={[styles.networkText, { color: isOnline ? COLORS.success : COLORS.warning }]}>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </Text>
        </View>
      </View>

      {/* Synchronize Offline Bar if orders exist */}
      {offlineQueue.length > 0 && (
        <TouchableOpacity style={styles.syncBar} onPress={handleSync}>
          <Ionicons name="cloud-upload" size={20} color={COLORS.background} />
          <Text style={styles.syncBarText}>
            {offlineQueue.length} Offline Orders Queue (Tap to Synchronize)
          </Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.background} />
        </TouchableOpacity>
      )}

      {/* Cashier Statistics Panel */}
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Session Activity</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{sessionOrders.length}</Text>
            <Text style={styles.statLabel}>Orders Placed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>R {sessionTotal.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Sales Total</Text>
          </View>
        </View>
      </View>

      {/* Grid of Food Categories */}
      <Text style={styles.sectionHeader}>Categories Menu</Text>
      <View style={styles.gridContainer}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.name}
            style={styles.gridItem}
            onPress={() => navigation.navigate('FoodListing', { category: cat.name })}
          >
            <View style={styles.gridIconContainer}>
              <Text style={styles.emoji}>{cat.emoji}</Text>
            </View>
            <Text style={styles.gridLabel}>{cat.label}</Text>
            <Ionicons name="arrow-forward-circle" size={24} color={COLORS.secondary} style={styles.arrowIcon} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: SPACING.md,
  },
  welcomeBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    marginTop: SPACING.sm,
  },
  cashierWelcome: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  cashierName: {
    fontSize: FONTS.xxl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textTransform: 'capitalize',
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  networkText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  syncBar: {
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  syncBarText: {
    color: COLORS.background,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: FONTS.sm,
  },
  statsCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statsTitle: {
    fontSize: FONTS.sm,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: FONTS.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },
  sectionHeader: {
    fontSize: FONTS.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    position: 'relative',
    height: 140,
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  gridIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 24,
  },
  gridLabel: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    fontSize: FONTS.md,
    marginTop: SPACING.sm,
  },
  arrowIcon: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
  },
});
