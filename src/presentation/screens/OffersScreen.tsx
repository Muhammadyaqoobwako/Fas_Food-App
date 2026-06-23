import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { COLORS, SPACING, FONTS, globalStyles } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { IOffer } from '../../types';
import { useApp } from '../state/AppContext';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const OFFERS: IOffer[] = [
  {
    id: '1',
    title: 'Buy 1 Get 1 Free',
    description: 'Order any Gourmet Burger and receive a second one absolutely free. Valid on dine-in and takeaway.',
    discount: '50% OFF',
    category: 'Burger',
    emoji: '🍔',
    validUntil: '2026-07-15',
    color: '#FF7043',
  },
  {
    id: '2',
    title: 'Family Pizza Deal',
    description: 'Get 2 Large Pizzas + 1 Large Chips + 2L Coke for only R 899. Perfect for family gatherings.',
    discount: 'R 899',
    category: 'Pizza',
    emoji: '🍕',
    validUntil: '2026-07-31',
    color: '#FFA726',
  },
  {
    id: '3',
    title: 'Happy Hour Drinks',
    description: 'All Sprite and Coke beverages at half price between 3PM - 5PM every weekday.',
    discount: '50% OFF',
    category: 'Drinks',
    emoji: '🥤',
    validUntil: '2026-08-01',
    color: '#66BB6A',
  },
  {
    id: '4',
    title: 'Ice Cream Sundae Special',
    description: 'Triple Scoop Sundae with unlimited toppings for just R 99. Available all weekend!',
    discount: 'R 99',
    category: 'IceCream',
    emoji: '🍦',
    validUntil: '2026-07-20',
    color: '#AB47BC',
  },
  {
    id: '5',
    title: 'Lunch Combo Deal',
    description: 'Any Burger + Regular Chips + Regular Drink for R 399. Available 11AM - 2PM.',
    discount: 'R 399',
    category: 'Combo',
    emoji: '🎁',
    validUntil: '2026-08-15',
    color: '#EF5350',
  },
  {
    id: '6',
    title: 'Free Delivery Weekend',
    description: 'Order R 200 or more this weekend and get FREE delivery to your doorstep!',
    discount: 'FREE',
    category: 'Delivery',
    emoji: '🚚',
    validUntil: '2026-07-06',
    color: '#42A5F5',
  },
];

export const OffersScreen = () => {
  const { addToCart, showToast, cashier, logout } = useApp();
  const navigation = useNavigation<any>();
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getDaysLeft = (validUntil: string) => {
    const diff = new Date(validUntil).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const handleClaimOffer = (offer: IOffer) => {
    const isGuest = cashier?.username?.toLowerCase() === 'guest';
    if (isGuest) {
      Alert.alert(
        'Guest Mode',
        'Guest users can only view products. Please log in to claim offers and place orders.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login / Sign Up', onPress: () => logout() }
        ]
      );
      return;
    }

    let orderCategory: 'Sprite' | 'Coke' | 'Burger' | 'Pizza' | 'IceCream' | 'Chips';
    let itemDescription = offer.title;
    let unitPrice = 0;
    let quantity = 1;

    switch (offer.category) {
      case 'Burger':
        orderCategory = 'Burger';
        unitPrice = 225.0; // BOGO Beef Burger (R 225 each, get 2 for R 450)
        itemDescription = 'Gourmet Beef Burger (BOGO Claimed)';
        quantity = 2;
        break;
      case 'Pizza':
        orderCategory = 'Pizza';
        unitPrice = 899.0;
        itemDescription = 'Family Pizza Deal (2x Large Pizza + Chips + Coke)';
        break;
      case 'Drinks':
        orderCategory = 'Coke';
        unitPrice = 75.0; // Happy Hour Coke (50% of 150)
        itemDescription = 'Happy Hour Coke (50% OFF)';
        break;
      case 'IceCream':
        orderCategory = 'IceCream';
        unitPrice = 99.0;
        itemDescription = 'Ice Cream Sundae Special';
        break;
      case 'Combo':
        orderCategory = 'Burger';
        unitPrice = 399.0;
        itemDescription = 'Lunch Combo Deal (Burger + Chips + Drink)';
        break;
      default:
        orderCategory = 'Burger';
        unitPrice = 150.0;
    }

    if (offer.category === 'Delivery') {
      showToast('Free delivery weekend unlocked! Ready to check out!');
      return;
    }

    const cartItem = {
      description: itemDescription,
      quantity,
      unitPrice,
      servedWith: 'Promo Deal',
    };

    addToCart(cartItem, orderCategory);
  };

  return (
    <ScrollView style={globalStyles.container} contentContainerStyle={styles.content}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        {/* Featured Banner */}
        <View style={styles.featuredBanner}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerEmoji}>🔥</Text>
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>Hot Deals Today</Text>
              <Text style={styles.bannerSubtitle}>
                Exclusive offers just for you. Don't miss out!
              </Text>
            </View>
          </View>
          <View style={styles.bannerBadge}>
            <Text style={styles.bannerBadgeText}>{OFFERS.length} Active</Text>
          </View>
        </View>

        {/* Offers List */}
        {OFFERS.map((offer, index) => {
          const isExpanded = selectedOffer === offer.id;
          const daysLeft = getDaysLeft(offer.validUntil);

          return (
            <TouchableOpacity
              key={offer.id}
              style={styles.offerCard}
              onPress={() => setSelectedOffer(isExpanded ? null : offer.id)}
              activeOpacity={0.85}
            >
              {/* Accent Bar */}
              <View style={[styles.accentBar, { backgroundColor: offer.color }]} />

              <View style={styles.offerContent}>
                <View style={styles.offerHeader}>
                  <View style={styles.emojiContainer}>
                    <Text style={styles.offerEmoji}>{offer.emoji}</Text>
                  </View>
                  <View style={styles.offerInfo}>
                    <Text style={styles.offerTitle}>{offer.title}</Text>
                    <Text style={styles.offerCategory}>{offer.category}</Text>
                  </View>
                  <View style={[styles.discountBadge, { backgroundColor: `${offer.color}20` }]}>
                    <Text style={[styles.discountText, { color: offer.color }]}>
                      {offer.discount}
                    </Text>
                  </View>
                </View>

                {isExpanded && (
                  <View style={styles.expandedContent}>
                    <Text style={styles.offerDescription}>{offer.description}</Text>
                    <View style={styles.offerMeta}>
                      <View style={styles.metaItem}>
                        <Ionicons name="calendar-outline" size={14} color={COLORS.textSecondary} />
                        <Text style={styles.metaText}>
                          Ends {new Date(offer.validUntil).toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={[styles.daysLeftBadge, {
                        backgroundColor: daysLeft <= 7 ? 'rgba(244,67,54,0.15)' : 'rgba(76,175,80,0.15)',
                      }]}>
                        <Text style={[styles.daysLeftText, {
                          color: daysLeft <= 7 ? COLORS.danger : COLORS.success,
                        }]}>
                          {daysLeft} days left
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={[styles.claimBtn, { backgroundColor: offer.color }]}
                      onPress={() => handleClaimOffer(offer)}
                    >
                      <Ionicons name="gift-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
                      <Text style={styles.claimBtnText}>Claim Offer</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {!isExpanded && (
                  <View style={styles.collapsedFooter}>
                    <Text style={styles.tapHint}>Tap for details</Text>
                    <View style={[styles.daysLeftBadge, {
                      backgroundColor: daysLeft <= 7 ? 'rgba(244,67,54,0.15)' : 'rgba(76,175,80,0.15)',
                    }]}>
                      <Text style={[styles.daysLeftText, {
                        color: daysLeft <= 7 ? COLORS.danger : COLORS.success,
                      }]}>
                        {daysLeft}d left
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  featuredBanner: {
    backgroundColor: COLORS.cardBgElevated,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  bannerEmoji: {
    fontSize: 36,
    marginRight: SPACING.md,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: FONTS.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  bannerSubtitle: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  bannerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,90,54,0.15)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  bannerBadgeText: {
    fontSize: FONTS.xs,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  offerCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  accentBar: {
    width: 4,
  },
  offerContent: {
    flex: 1,
    padding: SPACING.md,
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emojiContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  offerEmoji: {
    fontSize: 22,
  },
  offerInfo: {
    flex: 1,
  },
  offerTitle: {
    fontSize: FONTS.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  offerCategory: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  discountBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  discountText: {
    fontSize: FONTS.sm,
    fontWeight: 'bold',
  },
  expandedContent: {
    marginTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  offerDescription: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  offerMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  daysLeftBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  daysLeftText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  claimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  claimBtnText: {
    color: '#FFF',
    fontSize: FONTS.md,
    fontWeight: 'bold',
  },
  collapsedFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  tapHint: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
});
