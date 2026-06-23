import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
  Image,
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
  const { cashier, orders, offlineQueue, isOnline, syncOffline, updateOrderStatus, addFeedback, feedbacks, menuItems } = useApp();

  const [restaurantRating, setRestaurantRating] = useState(5);
  const [restaurantComment, setRestaurantComment] = useState('');
  const [riderRating, setRiderRating] = useState(5);
  const [riderComment, setRiderComment] = useState('');

  const categories = [
    { name: 'Pizza', label: 'Pizza & Pies', icon: 'pizza-outline', color: '#FF7043' },
    { name: 'Burger', label: 'Gourmet Burgers', icon: 'fast-food-outline', color: '#FFA726' },
    { name: 'Chips', label: 'Hot Chips', icon: 'restaurant-outline', color: '#FFEE58' },
    { name: 'Sprite', label: 'Sprite Softs', icon: 'beer-outline', color: '#66BB6A' },
    { name: 'Coke', label: 'Coke Softs', icon: 'cafe-outline', color: '#EF5350' },
    { name: 'IceCream', label: 'Ice Cream & Desserts', icon: 'ice-cream-outline', color: '#AB47BC' },
  ] as const;

  const isCustomer = cashier?.role === 'customer';
  const isOwner = cashier?.role === 'owner';

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

  // Find active customer order for Food Panda style tracker
  const activeOrder = isCustomer 
    ? orders.find(o => o.customerName === cashier?.username && o.status !== 'completed')
    : undefined;

  const getStepProgress = (status?: string) => {
    switch (status) {
      case 'pending': return 1;
      case 'preparing': return 2;
      case 'ready': return 3;
      case 'picked_up': return 4;
      case 'on_the_way': return 4;
      case 'delivered': return 5;
      default: return 0;
    }
  };

  const getStatusText = (order: any) => {
    switch (order.status) {
      case 'pending':
        return 'Order placed! Waiting for kitchen approval.';
      case 'preparing':
        return 'Kitchen is preparing your fresh meal.';
      case 'ready':
        return order.assignedDriver
          ? `Ready! Assigned to ${order.assignedDriver}.`
          : 'Ready! Searching for a rider...';
      case 'picked_up':
        return `${order.assignedDriver || 'Rider'} has picked up your order!`;
      case 'on_the_way':
        return `${order.assignedDriver || 'Rider'} is out for delivery. Near you!`;
      case 'delivered':
        return 'Arrived! Please collect your food.';
      default:
        return 'Processing your order...';
    }
  };

  const activeStep = activeOrder ? getStepProgress(activeOrder.status) : 0;

  return (
    <ScrollView style={globalStyles.container} contentContainerStyle={styles.content}>
      {/* Top Banner / Welcome Cashier */}
      <View style={styles.welcomeBanner}>
        <View>
          <Text style={styles.cashierWelcome}>
            {isOwner ? (cashier?.restaurantName || 'My Hotel / Restaurant') : isCustomer ? 'Hello, ' : 'Welcome back,'}
          </Text>
          <Text style={styles.cashierName}>{cashier?.username || 'Guest User'}</Text>
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

      {/* Featured Restaurants & Hotels for Customers */}
      {isCustomer && (
        <View style={styles.restaurantsSection}>
          <Text style={styles.sectionHeader}>Explore Restaurants & Hotels</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.restaurantsScroll}>
            {Array.from(new Set(menuItems.map(item => item.restaurantName || 'Fas Food Palace'))).map((rName, idx) => {
              // Calculate average rating
              const matchingFeedbacks = feedbacks.filter(f => f.restaurantRating > 0);
              const avgRating = matchingFeedbacks.length > 0
                ? (matchingFeedbacks.reduce((sum, f) => sum + f.restaurantRating, 0) / matchingFeedbacks.length).toFixed(1)
                : '4.8';

              const coverPresets = [
                'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=300&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=60'
              ];
              const coverUrl = coverPresets[idx % coverPresets.length];

              return (
                <TouchableOpacity
                  key={rName}
                  style={styles.restaurantCard}
                  onPress={() => navigation.navigate('RestaurantDetail', { restaurantName: rName })}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: coverUrl }} style={styles.restaurantImg} />
                  <View style={styles.restaurantInfo}>
                    <Text style={styles.restaurantName} numberOfLines={1}>{rName}</Text>
                    <View style={styles.restaurantRatingRow}>
                      <Ionicons name="star" size={12} color={COLORS.warning} style={{ marginRight: 4 }} />
                      <Text style={styles.restaurantRatingText}>{avgRating}</Text>
                      <Text style={styles.restaurantDot}>•</Text>
                      <Text style={styles.restaurantCuisine}>Fast Food</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Live Order Tracker for Customers */}
      {isCustomer && activeOrder && (
        <View style={styles.trackerCard}>
          <View style={styles.trackerHeader}>
            <View style={styles.liveIndicator}>
              <View style={styles.pulseDot} />
              <Text style={styles.liveText}>LIVE TRACKER</Text>
            </View>
            <Text style={styles.orderRefText}>Ref: {activeOrder._id?.substring(0, 10) || 'ORD-9843'}</Text>
          </View>

          <Text style={styles.statusDescription}>{getStatusText(activeOrder)}</Text>

          {/* Stepper Indicators */}
          <View style={styles.stepperContainer}>
            {[
              { num: 1, label: 'Placed' },
              { num: 2, label: 'Prep' },
              { num: 3, label: 'Ready' },
              { num: 4, label: 'Ship' },
              { num: 5, label: 'Arrived' }
            ].map((step, idx) => {
              const isDone = activeStep >= step.num;
              const isCurrent = activeStep === step.num;
              return (
                <React.Fragment key={step.num}>
                  {idx > 0 && (
                    <View style={[
                      styles.stepConnector,
                      activeStep >= step.num && styles.stepConnectorDone
                    ]} />
                  )}
                  <View style={styles.stepBox}>
                    <View style={[
                      styles.stepCircle,
                      isDone && styles.stepCircleDone,
                      isCurrent && styles.stepCircleCurrent
                    ]}>
                      {isDone ? (
                        <Ionicons name="checkmark" size={12} color="#FFF" />
                      ) : (
                        <Text style={styles.stepNumText}>{step.num}</Text>
                      )}
                    </View>
                    <Text style={[styles.stepLabel, isDone && styles.stepLabelDone]}>{step.label}</Text>
                  </View>
                </React.Fragment>
              );
            })}
          </View>

          {/* Chat with Rider Button */}
          {activeOrder.assignedDriver && activeOrder.status !== 'completed' && activeOrder.status !== 'delivered' && (
            <TouchableOpacity
              style={styles.chatRiderBtn}
              onPress={() => navigation.navigate('Chat', {
                orderId: activeOrder._id || '',
                customerName: cashier?.username || 'Customer',
                riderName: activeOrder.assignedDriver || 'Rider',
              })}
            >
              <Ionicons name="chatbubbles-outline" size={16} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.chatRiderBtnText}>Chat with Rider ({activeOrder.assignedDriver})</Text>
            </TouchableOpacity>
          )}

          {/* Confirm Arrival & Feedback Form */}
          {activeOrder.status === 'delivered' && (
            <View style={styles.feedbackForm}>
              <View style={styles.feedbackDivider} />
              
              <Text style={styles.feedbackFormTitle}>Rate Your Experience</Text>

              {/* Restaurant Rating */}
              <View style={styles.ratingSection}>
                <View style={globalStyles.spaceBetween}>
                  <Text style={styles.ratingSectionLabel}>Restaurant & Food</Text>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => setRestaurantRating(star)}
                        style={styles.starTouch}
                      >
                        <Ionicons
                          name={star <= restaurantRating ? 'star' : 'star-outline'}
                          size={20}
                          color={star <= restaurantRating ? COLORS.warning : COLORS.textSecondary}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <TextInput
                  style={styles.feedbackInput}
                  placeholder="Tell us about the food quality..."
                  placeholderTextColor={COLORS.textSecondary}
                  value={restaurantComment}
                  onChangeText={setRestaurantComment}
                  multiline
                />
              </View>

              {/* Rider Rating */}
              <View style={styles.ratingSection}>
                <View style={globalStyles.spaceBetween}>
                  <Text style={styles.ratingSectionLabel}>
                    Rider ({activeOrder.assignedDriver || 'Rider'})
                  </Text>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => setRiderRating(star)}
                        style={styles.starTouch}
                      >
                        <Ionicons
                          name={star <= riderRating ? 'star' : 'star-outline'}
                          size={20}
                          color={star <= riderRating ? COLORS.warning : COLORS.textSecondary}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <TextInput
                  style={styles.feedbackInput}
                  placeholder={`Tell us about ${activeOrder.assignedDriver || 'the rider'}...`}
                  placeholderTextColor={COLORS.textSecondary}
                  value={riderComment}
                  onChangeText={setRiderComment}
                  multiline
                />
              </View>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={async () => {
                  await addFeedback({
                    orderId: activeOrder._id || '',
                    customerName: cashier?.username || 'Customer',
                    restaurantRating,
                    restaurantComment,
                    riderName: activeOrder.assignedDriver || 'Rider',
                    riderRating,
                    riderComment,
                  });
                  await updateOrderStatus(activeOrder._id || '', 'completed');
                  // Reset states
                  setRestaurantRating(5);
                  setRestaurantComment('');
                  setRiderRating(5);
                  setRiderComment('');
                }}
              >
                <Ionicons name="checkmark-done-circle" size={18} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.confirmBtnText}>Submit Feedback & Complete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Loyalty & Rewards Tracker for Customers */}
      {isCustomer && (
        <View style={styles.loyaltyCard}>
          <View style={styles.loyaltyHeader}>
            <View style={styles.loyaltyBadge}>
              <Ionicons name="sparkles" size={16} color={COLORS.secondary} />
              <Text style={styles.loyaltyBadgeText}>GOLD MEMBER</Text>
            </View>
            <Text style={styles.loyaltyPoints}>380 Pts</Text>
          </View>
          <Text style={styles.loyaltyTitle}>Fas Rewards Tier</Text>
          <Text style={styles.loyaltySub}>Earn 20 more points to unlock a free Ice Cream Sundae!</Text>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: '85%' }]} />
          </View>
        </View>
      )}

      {/* Promo banner for Customers */}
      {isCustomer && (
        <TouchableOpacity 
          style={styles.promoBanner} 
          onPress={() => navigation.navigate('OffersTab' as any)}
          activeOpacity={0.8}
        >
          <Text style={styles.promoEmoji}>🔥</Text>
          <View style={styles.promoTextContainer}>
            <Text style={styles.promoTitle}>Active Promotions</Text>
            <Text style={styles.promoSubtitle}>Buy 1 Get 1 Free Gourmet Burgers & family meal discounts.</Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color={COLORS.primary} />
        </TouchableOpacity>
      )}

      {/* Cashier Statistics Panel (Only for Staff/Admin) */}
      {!isCustomer && !isOwner && (
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
      )}

      {/* Owner Statistics Panel (Only for Owner) */}
      {isOwner && (
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Restaurant Insights</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{orders.length}</Text>
              <Text style={styles.statLabel}>Total Sales Count</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: COLORS.success }]}>
                R {orders.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(0)}
              </Text>
              <Text style={styles.statLabel}>Total Revenue</Text>
            </View>
          </View>
        </View>
      )}

      {/* Grid of Food Categories */}
      <Text style={styles.sectionHeader}>Categories Menu</Text>
      <View style={styles.gridContainer}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.name}
            style={styles.gridItem}
            onPress={() => navigation.navigate('FoodListing', { category: cat.name })}
          >
            <View style={[styles.gridIconContainer, { backgroundColor: `${cat.color}15`, borderRadius: 12 }]}>
              <Ionicons name={cat.icon} size={28} color={cat.color} />
            </View>
            <Text style={styles.gridLabel}>{cat.label}</Text>
            <Ionicons name="arrow-forward-circle" size={24} color={COLORS.primary} style={styles.arrowIcon} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl * 2,
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
  loyaltyCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  loyaltyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  loyaltyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,142,117,0.15)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  loyaltyBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginLeft: 4,
  },
  loyaltyPoints: {
    fontSize: FONTS.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  loyaltyTitle: {
    fontSize: FONTS.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  loyaltySub: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  progressContainer: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    marginTop: SPACING.md,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.secondary,
    borderRadius: 3,
  },
  promoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  promoEmoji: {
    fontSize: 28,
    marginRight: SPACING.md,
  },
  promoTextContainer: {
    flex: 1,
  },
  promoTitle: {
    fontSize: FONTS.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  promoSubtitle: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
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
  trackerCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  trackerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 6,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76,175,80,0.15)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
    marginRight: 6,
  },
  liveText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.success,
    letterSpacing: 0.5,
  },
  orderRefText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  statusDescription: {
    fontSize: FONTS.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginVertical: 4,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  stepBox: {
    alignItems: 'center',
    zIndex: 2,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.borderLight,
  },
  stepCircleDone: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  stepCircleCurrent: {
    borderColor: COLORS.secondary,
    borderWidth: 2,
  },
  stepNumText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  stepLabel: {
    fontSize: 8,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: 4,
  },
  stepLabelDone: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  stepConnector: {
    flex: 1,
    height: 3,
    backgroundColor: COLORS.border,
    marginHorizontal: -8,
    marginTop: -12,
    zIndex: 1,
  },
  stepConnectorDone: {
    backgroundColor: COLORS.primary,
  },
  confirmBtn: {
    backgroundColor: COLORS.success,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: SPACING.md,
  },
  confirmBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: FONTS.sm,
  },
  feedbackForm: {
    marginTop: SPACING.sm,
  },
  feedbackDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  feedbackFormTitle: {
    fontSize: FONTS.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  ratingSection: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.cardBgElevated,
    borderRadius: 10,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ratingSectionLabel: {
    fontSize: FONTS.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  starsRow: {
    flexDirection: 'row',
  },
  starTouch: {
    paddingHorizontal: 3,
  },
  feedbackInput: {
    backgroundColor: '#111113',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    fontSize: FONTS.sm,
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
    minHeight: 44,
    textAlignVertical: 'top',
  },
  chatRiderBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: SPACING.md,
  },
  chatRiderBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: FONTS.sm,
  },
  restaurantsSection: {
    marginBottom: SPACING.md,
  },
  restaurantsScroll: {
    flexDirection: 'row',
    paddingLeft: 4,
  },
  restaurantCard: {
    width: 200,
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.md,
    overflow: 'hidden',
  },
  restaurantImg: {
    width: '100%',
    height: 100,
  },
  restaurantInfo: {
    padding: SPACING.sm,
  },
  restaurantName: {
    fontSize: FONTS.sm + 1,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  restaurantRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  restaurantRatingText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  restaurantDot: {
    color: COLORS.textSecondary,
    marginHorizontal: 4,
    fontSize: 8,
  },
  restaurantCuisine: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
});
