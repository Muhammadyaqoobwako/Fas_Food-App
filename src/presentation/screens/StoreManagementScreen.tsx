import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Animated,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../state/AppContext';
import { COLORS, SPACING, FONTS, globalStyles } from '../styles/theme';
import { IMenuItem } from '../../types';

const IMAGE_PRESETS = [
  { name: 'Burger Cover', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=60', emoji: '🍔' },
  { name: 'Pizza Cover', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=60', emoji: '🍕' },
  { name: 'Chips/Fries Cover', url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&auto=format&fit=crop&q=60', emoji: '🍟' },
  { name: 'Cold Drink Cover', url: 'https://images.unsplash.com/photo-1625772290748-160b61601687?w=400&auto=format&fit=crop&q=60', emoji: '🥤' },
  { name: 'Ice Cream Cover', url: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&auto=format&fit=crop&q=60', emoji: '🍦' },
];

export const StoreManagementScreen = () => {
  const { 
    cashier, 
    menuItems, 
    addMenuItem, 
    deleteMenuItem, 
    orders, 
    assignRiderToOrder, 
    updateOrderStatus, 
    riders,
    feedbacks
  } = useApp();
  const [activeTab, setActiveTab] = useState<'catalog' | 'assignments' | 'reviews'>('catalog');
  const [selectedRiders, setSelectedRiders] = useState<Record<string, string>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<'Sprite' | 'Coke' | 'Burger' | 'Pizza' | 'IceCream' | 'Chips'>('Burger');
  const [size, setSize] = useState('');
  const [optionsText, setOptionsText] = useState('');
  const [imageUrl, setImageUrl] = useState(IMAGE_PRESETS[0].url);
  const [loading, setLoading] = useState(false);

  const myRestaurant = cashier?.restaurantName || 'Fas Food Palace';
  const myMenuItems = menuItems.filter(
    item => (item.restaurantName || 'Fas Food Palace').toLowerCase() === myRestaurant.toLowerCase()
  );

  const formHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(formHeight, {
      toValue: showAddForm ? 1 : 0,
      tension: 50,
      friction: 8,
      useNativeDriver: false, // height cannot use native driver
    }).start();
  }, [showAddForm]);

  const handleAddProduct = async () => {
    if (!name || !price || !size) {
      Alert.alert('Missing Fields', 'Please fill in Name, Price, and Size.');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Invalid Price', 'Price must be a valid positive number.');
      return;
    }

    setLoading(true);
    try {
      const parsedOptions = optionsText
        ? optionsText.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      await addMenuItem({
        name,
        price: priceNum,
        category,
        sizeOrWeight: size,
        options: parsedOptions.length > 0 ? parsedOptions : ['Standard'],
        isAvailable: true,
        imageUrl,
      });

      // Clear Form
      setName('');
      setPrice('');
      setSize('');
      setOptionsText('');
      setShowAddForm(false);
      Alert.alert('Product Added', `${name} has been added to the online menu successfully!`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add product.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = (id: string, productName: string) => {
    Alert.alert(
      'Remove Product',
      `Are you sure you want to delete ${productName} from the store menu?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => deleteMenuItem(id), style: 'destructive' }
      ]
    );
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'pending': return COLORS.warning;
      case 'preparing': return '#FFA726';
      case 'ready': return '#42A5F5';
      case 'picked_up': return '#7E57C2';
      case 'on_the_way': return '#66BB6A';
      case 'delivered': return COLORS.success;
      default: return COLORS.textSecondary;
    }
  };

  const deliveryOrders = orders.filter(o => o.customerName && o.status !== 'completed');

  const renderOrderList = () => (
    <FlatList
      data={deliveryOrders}
      keyExtractor={item => item._id || ''}
      contentContainerStyle={styles.listContainer}
      ListHeaderComponent={<Text style={styles.sectionTitle}>Active Delivery Orders</Text>}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Ionicons name="bicycle" size={64} color={COLORS.border} />
          <Text style={styles.emptyText}>No active customer delivery orders found.</Text>
        </View>
      }
      renderItem={({ item }) => {
        const orderId = item._id || '';
        const currentRider = selectedRiders[orderId] || (riders[0]?.username || '');
        const orderDate = item.createdAt ? new Date(item.createdAt).toLocaleTimeString() : new Date().toLocaleTimeString();

        return (
          <View style={styles.mngOrderCard}>
            <View style={styles.mngOrderHeader}>
              <Text style={styles.mngOrderRef}>ID: {orderId.substring(0, 10)}</Text>
              <Text style={styles.mngOrderTime}>{orderDate}</Text>
            </View>

            <View style={styles.mngInfoRow}>
              <Ionicons name="person-outline" size={14} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
              <Text style={styles.mngInfoText}>Customer: {item.customerName}</Text>
            </View>
            <View style={styles.mngInfoRow}>
              <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
              <Text style={styles.mngInfoText}>Address: {item.deliveryAddress || 'No Address'}</Text>
            </View>
            <View style={styles.mngInfoRow}>
              <Ionicons name="restaurant-outline" size={14} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
              <Text style={styles.mngInfoText}>Category: {item.category}</Text>
            </View>

            {/* Item summaries */}
            <View style={styles.mngSummaryBox}>
              {item.items.map((i, idx) => (
                <Text key={idx} style={styles.mngSummaryText}>
                  • {i.quantity}x {i.description} (R {i.unitPrice})
                </Text>
              ))}
            </View>

            <View style={styles.mngDivider} />

            <View style={styles.mngFooterRow}>
              <Text style={styles.mngTotalText}>Total: R {item.totalAmount.toFixed(2)}</Text>
              
              <View style={[styles.mngStatusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                <Text style={[styles.mngStatusText, { color: getStatusColor(item.status) }]}>
                  {item.status?.toUpperCase() || 'PENDING'}
                </Text>
              </View>
            </View>

            {/* Actions Panel based on Status */}
            {item.status === 'pending' && (
              <TouchableOpacity
                style={styles.mngActionBtn}
                onPress={() => updateOrderStatus(orderId, 'preparing')}
              >
                <Text style={styles.mngActionBtnText}>Start Preparing Order</Text>
                <Ionicons name="play" size={14} color="#FFF" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            )}

            {item.status === 'preparing' && (
              <View style={styles.mngAssignPanel}>
                <Text style={styles.mngAssignLabel}>Select Rider for Dispatch:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.riderScroll} contentContainerStyle={{ paddingVertical: 4 }}>
                  {riders.map(r => (
                    <TouchableOpacity
                      key={r.username}
                      style={[
                        styles.mngRiderChip,
                        currentRider === r.username && styles.mngRiderChipActive
                      ]}
                      onPress={() => setSelectedRiders(prev => ({ ...prev, [orderId]: r.username }))}
                    >
                      <Text style={[
                        styles.mngRiderChipText,
                        currentRider === r.username && styles.mngRiderChipTextActive
                      ]}>
                        {r.username}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  style={[styles.mngActionBtn, { backgroundColor: COLORS.secondary }]}
                  onPress={() => assignRiderToOrder(orderId, currentRider)}
                >
                  <Text style={styles.mngActionBtnText}>Assign {currentRider} & Ship</Text>
                  <Ionicons name="bicycle" size={16} color="#FFF" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
              </View>
            )}

            {item.status !== 'pending' && item.status !== 'preparing' && (
              <View style={styles.mngAssignedContainer}>
                <Text style={styles.mngAssignedText}>
                  🛵 Assigned Rider: <Text style={styles.mngBoldText}>{item.assignedDriver}</Text>
                </Text>
                {item.status === 'delivered' && (
                  <TouchableOpacity
                    style={[styles.mngActionBtn, { backgroundColor: COLORS.success, marginTop: 10 }]}
                    onPress={() => updateOrderStatus(orderId, 'completed')}
                  >
                    <Text style={styles.mngActionBtnText}>Complete & Archive Order</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        );
      }}
    />
  );

  const renderReviewsList = () => (
    <FlatList
      data={feedbacks}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.listContainer}
      ListHeaderComponent={<Text style={styles.sectionTitle}>Customer Feedback & Ratings</Text>}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Ionicons name="star-half" size={64} color={COLORS.border} />
          <Text style={styles.emptyText}>No customer reviews received yet.</Text>
        </View>
      }
      renderItem={({ item }) => {
        const reviewDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '';
        return (
          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.reviewCustomerName}>{item.customerName}</Text>
                <Text style={styles.reviewOrderId}>Order Ref: {item.orderId.substring(0, 10)}</Text>
              </View>
              <Text style={styles.reviewDate}>{reviewDate}</Text>
            </View>

            <View style={styles.reviewRow}>
              {/* Restaurant Rating */}
              <View style={styles.reviewColumn}>
                <Text style={styles.reviewLabel}>Restaurant & Food</Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= item.restaurantRating ? 'star' : 'star-outline'}
                      size={14}
                      color={star <= item.restaurantRating ? COLORS.warning : COLORS.textSecondary}
                      style={{ marginRight: 2 }}
                    />
                  ))}
                </View>
                <Text style={styles.reviewComment}>
                  {item.restaurantComment || 'No comment left.'}
                </Text>
              </View>

              <View style={styles.reviewColDivider} />

              {/* Rider Rating */}
              <View style={styles.reviewColumn}>
                <Text style={styles.reviewLabel}>Rider ({item.riderName})</Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= item.riderRating ? 'star' : 'star-outline'}
                      size={14}
                      color={star <= item.riderRating ? COLORS.warning : COLORS.textSecondary}
                      style={{ marginRight: 2 }}
                    />
                  ))}
                </View>
                <Text style={styles.reviewComment}>
                  {item.riderComment || 'No comment left.'}
                </Text>
              </View>
            </View>
          </View>
        );
      }}
    />
  );

  return (
    <View style={globalStyles.container}>
      {/* Header Info Panel */}
      <View style={styles.storeHeader}>
        <View>
          <Text style={styles.storeTitle}>
            {cashier?.restaurantName || cashier?.username || 'Fas Food Palace'}
          </Text>
          <Text style={styles.storeSubtitle}>
            Role: {cashier?.role === 'owner' ? 'Store Owner' : 'Store Manager'} • Dynamic Controls
          </Text>
        </View>
        {activeTab === 'catalog' && (
          <TouchableOpacity
            style={[styles.addToggleBtn, showAddForm && styles.addToggleBtnCancel]}
            onPress={() => setShowAddForm(!showAddForm)}
          >
            <Ionicons name={showAddForm ? 'close' : 'add'} size={24} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Segmented Control Tab Row */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'catalog' && styles.tabBtnActive]}
          onPress={() => setActiveTab('catalog')}
        >
          <Ionicons name="fast-food-outline" size={16} color={activeTab === 'catalog' ? '#FFF' : COLORS.textSecondary} />
          <Text style={[styles.tabBtnText, activeTab === 'catalog' && styles.tabBtnTextActive]}>Menu Catalog</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'assignments' && styles.tabBtnActive]}
          onPress={() => setActiveTab('assignments')}
        >
          <Ionicons name="bicycle-outline" size={16} color={activeTab === 'assignments' ? '#FFF' : COLORS.textSecondary} />
          <Text style={[styles.tabBtnText, activeTab === 'assignments' && styles.tabBtnTextActive]}>Rider Assignments</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'reviews' && styles.tabBtnActive]}
          onPress={() => setActiveTab('reviews')}
        >
          <Ionicons name="star-outline" size={16} color={activeTab === 'reviews' ? '#FFF' : COLORS.textSecondary} />
          <Text style={[styles.tabBtnText, activeTab === 'reviews' && styles.tabBtnTextActive]}>Reviews</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'catalog' ? (
        <>
          {/* Slide-down Form Container */}
          {showAddForm && (
            <Animated.View style={[styles.formContainer, {
              maxHeight: formHeight.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 480],
              }),
              opacity: formHeight,
            }]}>
              <ScrollView contentContainerStyle={styles.formScroll} keyboardShouldPersistTaps="handled">
                <Text style={styles.formSectionTitle}>Add New Menu Item</Text>

                {/* Input Name */}
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Product Name (e.g. Gourmet Veggie Pizza)"
                    placeholderTextColor={COLORS.textSecondary}
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                {/* Row: Price & Size */}
                <View style={styles.rowInputs}>
                  <View style={[styles.inputWrapper, { flex: 1, marginRight: 8 }]}>
                    <TextInput
                      style={styles.input}
                      placeholder="Price (R)"
                      placeholderTextColor={COLORS.textSecondary}
                      value={price}
                      onChangeText={setPrice}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[styles.inputWrapper, { flex: 1 }]}>
                    <TextInput
                      style={styles.input}
                      placeholder="Size (e.g. Large, 350g)"
                      placeholderTextColor={COLORS.textSecondary}
                      value={size}
                      onChangeText={setSize}
                    />
                  </View>
                </View>

                {/* Category Select */}
                <Text style={styles.label}>Select Category</Text>
                <View style={styles.categoryPickerRow}>
                  {(['Burger', 'Pizza', 'Chips', 'Sprite', 'Coke', 'IceCream'] as const).map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.catPickerBtn, category === cat && styles.catPickerBtnActive]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text style={[styles.catPickerText, category === cat && styles.catPickerTextActive]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Options Input */}
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Customizations (comma separated: Extra Cheese, Thin Crust)"
                    placeholderTextColor={COLORS.textSecondary}
                    value={optionsText}
                    onChangeText={setOptionsText}
                  />
                </View>

                {/* Image Presets Selector */}
                <Text style={styles.label}>Select Professional Image Preset</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsScroll}>
                  {IMAGE_PRESETS.map(preset => {
                    const isSelected = imageUrl === preset.url;
                    return (
                      <TouchableOpacity
                        key={preset.name}
                        style={[styles.presetCard, isSelected && styles.presetCardSelected]}
                        onPress={() => setImageUrl(preset.url)}
                      >
                        <Image source={{ uri: preset.url }} style={styles.presetImg} />
                        <View style={styles.presetOverlay}>
                          <Text style={styles.presetEmoji}>{preset.emoji}</Text>
                          <Text style={styles.presetName} numberOfLines={1}>{preset.name}</Text>
                        </View>
                        {isSelected && (
                          <View style={styles.selectedTick}>
                            <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Submit Button */}
                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleAddProduct}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <>
                      <Text style={styles.submitBtnText}>Add Product to Menu</Text>
                      <Ionicons name="cloud-upload-outline" size={20} color="#FFF" style={{ marginLeft: 8 }} />
                    </>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </Animated.View>
          )}

          {/* Menu List */}
          <FlatList
            data={myMenuItems}
            keyExtractor={item => item._id || ''}
            contentContainerStyle={styles.listContainer}
            ListHeaderComponent={<Text style={styles.sectionTitle}>Current Products Catalog</Text>}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="list" size={64} color={COLORS.border} />
                <Text style={styles.emptyText}>No products added yet. Tap '+' to add your first product.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.productCard}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.productImg} />
                ) : (
                  <View style={styles.productImgPlaceholder}>
                    <Ionicons name="fast-food-outline" size={24} color={COLORS.textSecondary} />
                  </View>
                )}
                
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <View style={styles.productMeta}>
                    <View style={styles.catBadge}>
                      <Text style={styles.catBadgeText}>{item.category}</Text>
                    </View>
                    <Text style={styles.productSize}>{item.sizeOrWeight}</Text>
                  </View>
                  <Text style={styles.productPrice}>R {item.price.toFixed(2)}</Text>
                </View>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteProduct(item._id || '', item.name)}
                >
                  <Ionicons name="trash-outline" size={22} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            )}
          />
        </>
      ) : activeTab === 'assignments' ? (
        renderOrderList()
      ) : (
        renderReviewsList()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  storeHeader: {
    backgroundColor: COLORS.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storeTitle: {
    fontSize: FONTS.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  storeSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  addToggleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToggleBtnCancel: {
    backgroundColor: COLORS.danger,
  },
  formContainer: {
    backgroundColor: COLORS.cardBgElevated,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    overflow: 'hidden',
  },
  formScroll: {
    padding: SPACING.md,
  },
  formSectionTitle: {
    fontSize: FONTS.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  inputWrapper: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  input: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sm,
    height: '100%',
  },
  rowInputs: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: SPACING.sm,
    marginBottom: 8,
    paddingLeft: 2,
  },
  categoryPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.sm,
  },
  catPickerBtn: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  catPickerBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  catPickerText: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  catPickerTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  presetsScroll: {
    marginBottom: SPACING.md,
  },
  presetCard: {
    width: 90,
    height: 75,
    borderRadius: 8,
    marginRight: 8,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  presetCardSelected: {
    borderColor: COLORS.primary,
  },
  presetImg: {
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  presetOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  presetEmoji: {
    fontSize: 18,
  },
  presetName: {
    fontSize: 9,
    color: '#FFF',
    fontWeight: '600',
    marginTop: 2,
  },
  selectedTick: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(20,20,22,0.8)',
    borderRadius: 8,
    padding: 1,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  submitBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: FONTS.md,
  },
  listContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  sectionTitle: {
    fontSize: FONTS.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  productImg: {
    width: 65,
    height: 65,
    borderRadius: 10,
  },
  productImgPlaceholder: {
    width: 65,
    height: 65,
    borderRadius: 10,
    backgroundColor: COLORS.cardBgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'center',
  },
  productName: {
    fontSize: FONTS.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  catBadge: {
    backgroundColor: COLORS.cardBgElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    paddingVertical: 1,
    paddingHorizontal: 6,
    marginRight: 8,
  },
  catBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  productSize: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
  },
  productPrice: {
    fontSize: FONTS.sm,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginTop: 4,
  },
  deleteBtn: {
    padding: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sm,
    textAlign: 'center',
    marginTop: SPACING.md,
    marginHorizontal: SPACING.xl,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: 'transparent',
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
  },
  tabBtnText: {
    fontSize: FONTS.sm,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  tabBtnTextActive: {
    color: '#FFF',
  },
  mngOrderCard: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  mngOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 6,
  },
  mngOrderRef: {
    fontSize: FONTS.sm,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  mngOrderTime: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  mngInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  mngInfoText: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
  },
  mngSummaryBox: {
    backgroundColor: COLORS.cardBgElevated,
    borderRadius: 8,
    padding: SPACING.sm,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  mngSummaryText: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  mngDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  mngFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  mngTotalText: {
    fontSize: FONTS.md,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  mngStatusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  mngStatusText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  mngActionBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 6,
  },
  mngActionBtnText: {
    color: '#FFF',
    fontSize: FONTS.sm,
    fontWeight: 'bold',
  },
  mngAssignPanel: {
    marginTop: 4,
  },
  mngAssignLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  riderScroll: {
    marginBottom: 8,
  },
  mngRiderChip: {
    backgroundColor: COLORS.cardBgElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginRight: 6,
  },
  mngRiderChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  mngRiderChipText: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
  },
  mngRiderChipTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  mngAssignedContainer: {
    backgroundColor: COLORS.cardBgElevated,
    borderRadius: 8,
    padding: SPACING.sm,
    marginTop: 4,
  },
  mngAssignedText: {
    fontSize: FONTS.xs,
    color: COLORS.textPrimary,
  },
  mngBoldText: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  reviewCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  reviewCustomerName: {
    fontSize: FONTS.sm,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textTransform: 'capitalize',
  },
  reviewOrderId: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  reviewDate: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  reviewColumn: {
    flex: 1,
  },
  reviewColDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.sm,
  },
  reviewLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reviewComment: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    marginTop: 6,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  starsRow: {
    flexDirection: 'row',
  },
});
