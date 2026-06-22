import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { COLORS, SPACING, FONTS, globalStyles } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type OrderPlacementScreenRouteProp = RouteProp<RootStackParamList, 'OrderPlacement'>;
type OrderPlacementScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OrderPlacement'>;

interface Props {
  route: OrderPlacementScreenRouteProp;
  navigation: OrderPlacementScreenNavigationProp;
}

export const OrderPlacementScreen: React.FC<Props> = ({ route, navigation }) => {
  const { order } = route.params;

  const handlePrintAndHome = () => {
    // Navigate back to the home/tabs launcher
    navigation.popToTop();
  };

  const formattedDate = order.createdAt 
    ? new Date(order.createdAt).toLocaleString() 
    : new Date().toLocaleString();

  const isOfflineOrder = !!order.offlineCreatedAt;

  return (
    <View style={globalStyles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Success Status Alert Banner */}
        <View style={[styles.statusBanner, { backgroundColor: isOfflineOrder ? COLORS.warning : COLORS.success }]}>
          <Ionicons name={isOfflineOrder ? 'cloud-offline-sharp' : 'cloud-done-sharp'} size={24} color={COLORS.background} />
          <Text style={styles.statusBannerText}>
            {isOfflineOrder 
              ? 'Saved Offline (Awaiting Connection Sync)' 
              : 'Processed Successfully (Persisted to Cloud DB)'}
          </Text>
        </View>

        {/* Receipt Container */}
        <View style={styles.receiptContainer}>
          <View style={styles.thermalReceipt}>
            <Text style={styles.receiptHeader}>FAS FOOD</Text>
            <Text style={styles.receiptSub}>Premium Food & Beverages</Text>
            <Text style={styles.receiptAddress}>12 Main Street, Durban</Text>
            
            <View style={styles.dividerDotted} />

            {/* Meta */}
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Order Ref:</Text>
              <Text style={styles.metaValue}>{order._id || 'OFFLINE_TEMP'}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Date/Time:</Text>
              <Text style={styles.metaValue}>{formattedDate}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Cashier:</Text>
              <Text style={styles.metaValue}>{order.cashier}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Category:</Text>
              <Text style={styles.metaValue}>{order.category}</Text>
            </View>

            <View style={styles.dividerDotted} />

            {/* Table Header */}
            <View style={styles.itemRowHeader}>
              <Text style={[styles.itemText, styles.textBold]}>Item Desc</Text>
              <Text style={[styles.qtyCol, styles.textBold]}>Qty</Text>
              <Text style={[styles.priceCol, styles.textBold]}>Subtotal</Text>
            </View>

            {/* Items */}
            {order.items.map((item: any, i: number) => (
              <View key={i} style={styles.itemRow}>
                <View style={styles.itemDescCol}>
                  <Text style={styles.itemText}>{item.description}</Text>
                  {item.servedWith || item.colour || item.flavour || item.type ? (
                    <Text style={styles.itemSubText}>
                      {[item.servedWith, item.colour, item.flavour, item.type].filter(Boolean).join(' / ')}
                    </Text>
                  ) : null}
                </View>
                <Text style={styles.qtyCol}>{item.quantity}</Text>
                <Text style={styles.priceCol}>
                  R {(item.quantity * item.unitPrice).toFixed(2)}
                </Text>
              </View>
            ))}

            <View style={styles.dividerDotted} />

            {/* Total Row */}
            <View style={styles.totalRow}>
              <Text style={styles.receiptTotalLabel}>Grand Total</Text>
              <Text style={styles.receiptTotalAmount}>R {order.totalAmount.toFixed(2)}</Text>
            </View>

            <View style={styles.dividerDotted} />

            {/* Footer */}
            <Text style={styles.receiptFooter}>THANK YOU FOR YOUR PATRONAGE</Text>
            <Text style={styles.receiptFooterSub}>Powering Fast-Food Modernization</Text>
          </View>
        </View>

        {/* Actions Button */}
        <TouchableOpacity style={[globalStyles.button, styles.actionBtn]} onPress={handlePrintAndHome}>
          <Ionicons name="print-outline" size={20} color={COLORS.textPrimary} style={{ marginRight: 8 }} />
          <Text style={globalStyles.buttonText}>Print Receipt & New Order</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: SPACING.md,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.lg,
  },
  statusBannerText: {
    color: COLORS.background,
    fontSize: FONTS.sm,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
    flex: 1,
  },
  receiptContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  thermalReceipt: {
    backgroundColor: '#FFFFFF', // Simulated white thermal paper
    width: '100%',
    maxWidth: 360,
    borderRadius: 8,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  receiptHeader: {
    fontSize: FONTS.xl,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000000',
  },
  receiptSub: {
    fontSize: 10,
    textAlign: 'center',
    color: '#666666',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  receiptAddress: {
    fontSize: 10,
    textAlign: 'center',
    color: '#666666',
    marginTop: 2,
  },
  dividerDotted: {
    height: 1,
    borderWidth: 1,
    borderColor: '#000000',
    borderStyle: 'dashed',
    marginVertical: SPACING.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metaLabel: {
    fontSize: 11,
    color: '#555555',
  },
  metaValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000000',
  },
  itemRowHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  itemRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  itemDescCol: {
    flex: 3,
  },
  itemText: {
    fontSize: 11,
    color: '#000000',
  },
  itemSubText: {
    fontSize: 9,
    color: '#666666',
    fontStyle: 'italic',
    marginTop: 1,
  },
  qtyCol: {
    flex: 1,
    fontSize: 11,
    color: '#000000',
    textAlign: 'center',
  },
  priceCol: {
    flex: 1.5,
    fontSize: 11,
    color: '#000000',
    textAlign: 'right',
  },
  textBold: {
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  receiptTotalLabel: {
    fontSize: FONTS.md,
    fontWeight: 'bold',
    color: '#000000',
  },
  receiptTotalAmount: {
    fontSize: FONTS.lg,
    fontWeight: 'bold',
    color: '#000000',
  },
  receiptFooter: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000000',
    marginTop: SPACING.sm,
  },
  receiptFooterSub: {
    fontSize: 8,
    textAlign: 'center',
    color: '#888888',
    marginTop: 2,
  },
  actionBtn: {
    backgroundColor: COLORS.secondary,
    marginBottom: SPACING.xl,
  },
});
