import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, globalStyles } from '../styles/theme';
import { INotification } from '../../types';

const INITIAL_NOTIFICATIONS: INotification[] = [
  {
    id: 'n1',
    title: 'Order Completed 🎉',
    message: 'Your order ORD-2840 has been delivered successfully by Driver Ahmed.',
    type: 'order',
    read: false,
    timestamp: '5 min ago',
  },
  {
    id: 'n2',
    title: 'Super Pizza Deal 🍕',
    message: 'Get a large Pepperoni Passion and a 2L Soft Drink for only R 199 this Tuesday!',
    type: 'promo',
    read: false,
    timestamp: '2 hours ago',
  },
  {
    id: 'n3',
    title: 'System Maintenance Complete',
    message: 'Offline synchronization performance has been upgraded.',
    type: 'system',
    read: true,
    timestamp: '1 day ago',
  },
  {
    id: 'n4',
    title: 'Driver Assigned 🛵',
    message: 'Driver Thabo has picked up your order ORD-2845 and is on the way to you.',
    type: 'delivery',
    read: true,
    timestamp: '2 days ago',
  },
  {
    id: 'n5',
    title: 'Flash Burger Friday 🍔',
    message: 'Claim your 50% discount coupon valid on all double beef burgers.',
    type: 'promo',
    read: true,
    timestamp: '3 days ago',
  },
];

const typeConfigs = {
  order: { icon: 'fast-food' as const, color: '#42A5F5' },
  promo: { icon: 'flame' as const, color: '#FF7043' },
  system: { icon: 'cog' as const, color: '#AB47BC' },
  delivery: { icon: 'bicycle' as const, color: '#66BB6A' },
};

export const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState<INotification[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread' | 'promo'>('all');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleToggleRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'promo') return n.type === 'promo';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Animated.View style={[globalStyles.container, { opacity: fadeAnim }]}>
      {/* Header Panel */}
      <View style={styles.topPanel}>
        <View>
          <Text style={styles.titleText}>In-App Notifications</Text>
          <Text style={styles.subText}>{unreadCount} unread message{unreadCount !== 1 ? 's' : ''}</Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markReadBtn} onPress={handleMarkAllRead}>
            <Ionicons name="mail-open-outline" size={16} color={COLORS.primary} style={{ marginRight: 4 }} />
            <Text style={styles.markReadText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        {[
          { key: 'all', label: 'All' },
          { key: 'unread', label: `Unread (${unreadCount})` },
          { key: 'promo', label: 'Promos' },
        ].map(btn => (
          <TouchableOpacity
            key={btn.key}
            style={[styles.filterChip, filter === btn.key && styles.filterChipActive]}
            onPress={() => setFilter(btn.key as any)}
          >
            <Text style={[styles.filterChipText, filter === btn.key && styles.filterChipTextActive]}>
              {btn.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color={COLORS.borderLight} />
            <Text style={styles.emptyText}>All caught up! No notifications.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const config = typeConfigs[item.type] || { icon: 'notifications', color: COLORS.textPrimary };

          return (
            <TouchableOpacity
              style={[styles.notifCard, !item.read && styles.notifCardUnread]}
              onPress={() => handleToggleRead(item.id)}
              activeOpacity={0.8}
            >
              {/* Type Accent Icon */}
              <View style={[styles.iconBox, { backgroundColor: `${config.color}15` }]}>
                <Ionicons name={config.icon} size={20} color={config.color} />
              </View>

              {/* Text Info */}
              <View style={styles.textDetails}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.notifTitle, !item.read && styles.notifTitleUnread]}>
                    {item.title}
                  </Text>
                  <Text style={styles.timestamp}>{item.timestamp}</Text>
                </View>
                <Text style={styles.messageText}>{item.message}</Text>
              </View>

              {/* Action Buttons (Delete) */}
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item.id)}
              >
                <Ionicons name="close-circle-outline" size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  topPanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  titleText: {
    fontSize: FONTS.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  subText: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  markReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: COLORS.cardBgElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  markReadText: {
    fontSize: FONTS.xs,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: COLORS.cardBg,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: FONTS.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: COLORS.textPrimary,
  },
  listContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'flex-start',
  },
  notifCardUnread: {
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.cardBgElevated,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  textDetails: {
    flex: 1,
    marginRight: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: FONTS.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
    flex: 1,
    marginRight: 8,
  },
  notifTitleUnread: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  messageText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  deleteBtn: {
    padding: 2,
    alignSelf: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sm,
    marginTop: SPACING.md,
  },
});
