import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  FlatList,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { COLORS, SPACING, FONTS, globalStyles } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../state/AppContext';
import { ISalesSummary } from '../../types';

export const AdminDashboardScreen = () => {
  const {
    cashier,
    orderRepository,
    orders,
    feedbacks,
    riders,
    employeeBonuses,
    giveEmployeeBonus,
  } = useApp();

  const [summary, setSummary] = useState<ISalesSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab switcher: analytics, employees, reviews
  const [activeTab, setActiveTab] = useState<'analytics' | 'employees' | 'reviews'>('analytics');

  // Bonus modal states
  const [bonusModalVisible, setBonusModalVisible] = useState(false);
  const [selectedEmployeeName, setSelectedEmployeeName] = useState('');
  const [bonusAmountInput, setBonusAmountInput] = useState('');

  const isOwner = cashier?.role === 'owner';

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderRepository.getSalesSummary();
      setSummary(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch sales summary.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [orders]);

  const getBarColor = (category: string) => {
    switch (category) {
      case 'Pizza': return '#FF7043';
      case 'Burger': return '#FFA726';
      case 'Chips': return '#FFEE58';
      case 'Sprite': return '#66BB6A';
      case 'Coke': return '#EF5350';
      case 'IceCream': return '#AB47BC';
      default: return COLORS.secondary;
    }
  };

  const getMaxRevenue = () => {
    if (!summary) return 1;
    const values = Object.values(summary.salesByCategory);
    const max = Math.max(...values);
    return max > 0 ? max : 1;
  };

  const handleOpenBonusModal = (name: string) => {
    setSelectedEmployeeName(name);
    setBonusAmountInput('');
    setBonusModalVisible(true);
  };

  const handleAwardBonus = async () => {
    const amount = parseFloat(bonusAmountInput);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive number for the bonus.');
      return;
    }
    await giveEmployeeBonus(selectedEmployeeName, amount);
    setBonusModalVisible(false);
  };

  // Math Calculations for Revenue and Expenses
  const totalRevenue = summary ? summary.totalRevenue : orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrdersCount = summary ? summary.totalOrders : orders.length;

  const inventoryCost = totalRevenue * 0.40; // 40% ingredients/inventory
  const operatingCost = totalRevenue * 0.10; // 10% utility/packaging/platform fees
  
  const completedDeliveries = orders.filter(o => o.assignedDriver && (o.status === 'delivered' || o.status === 'completed')).length;
  const dispatchCost = completedDeliveries * 80.0; // R80 payout per order delivered
  
  const ridersCount = riders.length;
  const staffSalaries = (2 * 2000.0) + (ridersCount * 1200.0); // Managers/Admins R2000 base, riders R1200 base
  
  const totalBonusesPaid = Object.values(employeeBonuses).reduce((sum, val) => sum + val, 0);
  const totalExpenses = inventoryCost + operatingCost + dispatchCost + staffSalaries + totalBonusesPaid;
  const netProfit = totalRevenue - totalExpenses;

  // Compile Employees List
  const employeesList = [
    // Staff Members
    { username: 'manager', role: 'Staff Manager', type: 'staff' },
    { username: 'owner', role: 'Business Owner', type: 'staff' },
    ...riders.map(r => ({ username: r.username, role: 'Delivery Partner', type: 'driver' })),
  ];

  const getEmployeeStats = (emp: { username: string; role: string; type: string }) => {
    const bonus = employeeBonuses[emp.username] || 0;
    
    if (emp.type === 'driver') {
      const deliveredCount = orders.filter(o => o.assignedDriver === emp.username && (o.status === 'delivered' || o.status === 'completed')).length;
      const matchingFeedbacks = feedbacks.filter(f => f.riderName === emp.username && f.riderRating > 0);
      const avgRating = matchingFeedbacks.length > 0
        ? (matchingFeedbacks.reduce((sum, f) => sum + f.riderRating, 0) / matchingFeedbacks.length).toFixed(1)
        : 'N/A';
      return { tasks: `${deliveredCount} Delivered`, rating: avgRating, bonus };
    } else {
      const processedCount = orders.filter(o => o.cashier === emp.username).length;
      const matchingFeedbacks = feedbacks.filter(f => f.restaurantRating > 0);
      const avgRating = matchingFeedbacks.length > 0
        ? (matchingFeedbacks.reduce((sum, f) => sum + f.restaurantRating, 0) / matchingFeedbacks.length).toFixed(1)
        : 'N/A';
      return { tasks: `${processedCount} Orders`, rating: avgRating, bonus };
    }
  };

  return (
    <View style={globalStyles.container}>
      {/* Top Header Row */}
      <View style={styles.header}>
        <View style={globalStyles.spaceBetween}>
          <View>
            <Text style={styles.headerTitle}>Analytics Dashboard</Text>
            <Text style={styles.headerSubtitle}>
              Logged in as: <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>{cashier?.role?.toUpperCase()}</Text>
            </Text>
          </View>
          <TouchableOpacity style={styles.refreshBtn} onPress={fetchSummary} disabled={loading}>
            <Ionicons name="refresh" size={18} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Tabs Select Bar */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'analytics' && styles.activeTabButton]}
            onPress={() => setActiveTab('analytics')}
            activeOpacity={0.8}
          >
            <Ionicons name="analytics" size={16} color={activeTab === 'analytics' ? '#FFF' : COLORS.textSecondary} style={{ marginRight: 6 }} />
            <Text style={[styles.tabButtonText, activeTab === 'analytics' && styles.activeTabButtonText]}>Finance</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'employees' && styles.activeTabButton]}
            onPress={() => setActiveTab('employees')}
            activeOpacity={0.8}
          >
            <Ionicons name="people" size={16} color={activeTab === 'employees' ? '#FFF' : COLORS.textSecondary} style={{ marginRight: 6 }} />
            <Text style={[styles.tabButtonText, activeTab === 'employees' && styles.activeTabButtonText]}>Employees</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'reviews' && styles.activeTabButton]}
            onPress={() => setActiveTab('reviews')}
            activeOpacity={0.8}
          >
            <Ionicons name="star" size={16} color={activeTab === 'reviews' ? '#FFF' : COLORS.textSecondary} style={{ marginRight: 6 }} />
            <Text style={[styles.tabButtonText, activeTab === 'reviews' && styles.activeTabButtonText]}>Reviews</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
          <Text style={styles.loadingText}>Fetching system summary...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={48} color={COLORS.danger} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={globalStyles.button} onPress={fetchSummary}>
            <Text style={globalStyles.buttonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* TAB 1: FINANCE / ANALYTICS */}
          {activeTab === 'analytics' && (
            <View>
              {/* Financial Big Cards */}
              <View style={styles.metricCardsContainer}>
                <View style={[styles.metricCardBig, { borderColor: COLORS.success }]}>
                  <Ionicons name="cash" size={24} color={COLORS.success} />
                  <Text style={styles.metricValueBig}>R {totalRevenue.toFixed(2)}</Text>
                  <Text style={styles.metricLabelBig}>Gross Revenue</Text>
                </View>
                <View style={[styles.metricCardBig, { borderColor: COLORS.danger }]}>
                  <Ionicons name="card" size={24} color={COLORS.danger} />
                  <Text style={styles.metricValueBig}>R {totalExpenses.toFixed(2)}</Text>
                  <Text style={styles.metricLabelBig}>Expenses Paid</Text>
                </View>
              </View>

              {/* Net Profit Card */}
              <View style={[styles.profitCard, { borderColor: netProfit >= 0 ? COLORS.success : COLORS.danger }]}>
                <View style={globalStyles.spaceBetween}>
                  <View>
                    <Text style={styles.profitLabel}>NET PROFIT / INCOME</Text>
                    <Text style={styles.profitSub}>Revenue minus all operational expenses</Text>
                  </View>
                  <Text style={[styles.profitValue, { color: netProfit >= 0 ? COLORS.success : COLORS.danger }]}>
                    R {netProfit.toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Detailed Operational Expenses Card */}
              <View style={styles.detailsCard}>
                <Text style={styles.detailsCardTitle}>Operational Expenses Breakdown</Text>
                
                <View style={styles.expenseRow}>
                  <Text style={styles.expenseLabel}>Inventory & Ingredients (40%):</Text>
                  <Text style={styles.expenseVal}>R {inventoryCost.toFixed(2)}</Text>
                </View>
                <View style={styles.expenseRow}>
                  <Text style={styles.expenseLabel}>Utilities & Operations (10%):</Text>
                  <Text style={styles.expenseVal}>R {operatingCost.toFixed(2)}</Text>
                </View>
                <View style={styles.expenseRow}>
                  <Text style={styles.expenseLabel}>Rider Dispatch Payouts (R80/ea):</Text>
                  <Text style={styles.expenseVal}>R {dispatchCost.toFixed(2)}</Text>
                </View>
                <View style={styles.expenseRow}>
                  <Text style={styles.expenseLabel}>Staff Base Salaries:</Text>
                  <Text style={styles.expenseVal}>R {staffSalaries.toFixed(2)}</Text>
                </View>
                <View style={styles.expenseRow}>
                  <Text style={styles.expenseLabel}>Employee Bonuses Paid:</Text>
                  <Text style={[styles.expenseVal, { color: COLORS.secondary, fontWeight: 'bold' }]}>
                    R {totalBonusesPaid.toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Category Sales Breakdown Chart */}
              {summary && (
                <View style={styles.chartCard}>
                  <Text style={styles.chartTitle}>Category Sales Breakdown</Text>
                  {Object.entries(summary.salesByCategory).map(([cat, rev]) => {
                    const maxVal = getMaxRevenue();
                    const percentage = (rev / maxVal) * 100;
                    return (
                      <View key={cat} style={styles.chartRow}>
                        <View style={globalStyles.spaceBetween}>
                          <Text style={styles.categoryName}>{cat}</Text>
                          <Text style={styles.categoryValue}>R {rev.toFixed(2)}</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                          <View
                            style={[
                              styles.progressBarFill,
                              {
                                width: `${Math.max(percentage, 2)}%`,
                                backgroundColor: getBarColor(cat),
                              },
                            ]}
                          />
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          {/* TAB 2: EMPLOYEE PERFORMANCE & BONUSES */}
          {activeTab === 'employees' && (
            <View>
              <Text style={styles.tabSectionTitle}>Employee Performance Tracker</Text>
              {!isOwner && (
                <View style={styles.ownerNotice}>
                  <Ionicons name="information-circle-outline" size={18} color={COLORS.secondary} style={{ marginRight: 6 }} />
                  <Text style={styles.ownerNoticeText}>
                    Only logged-in Business Owners can award bonuses.
                  </Text>
                </View>
              )}

              {employeesList.map(emp => {
                const stats = getEmployeeStats(emp);
                return (
                  <View key={emp.username} style={styles.empCard}>
                    <View style={styles.empHeader}>
                      <View style={styles.avatarCircle}>
                        <Ionicons
                          name={emp.type === 'driver' ? 'bicycle-outline' : 'person-outline'}
                          size={24}
                          color={COLORS.primary}
                        />
                      </View>
                      <View style={styles.empInfo}>
                        <Text style={styles.empName}>{emp.username}</Text>
                        <Text style={styles.empRole}>{emp.role}</Text>
                      </View>
                      
                      {isOwner && (
                        <TouchableOpacity
                          style={styles.bonusBtn}
                          onPress={() => handleOpenBonusModal(emp.username)}
                        >
                          <Text style={styles.bonusBtnText}>Give Bonus</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    <View style={styles.empStatsRow}>
                      <View style={styles.statBox}>
                        <Text style={styles.statLabel}>COMPLETED</Text>
                        <Text style={styles.statVal}>{stats.tasks}</Text>
                      </View>
                      <View style={styles.statBox}>
                        <Text style={styles.statLabel}>AVG RATING</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={styles.statVal}>{stats.rating}</Text>
                          {stats.rating !== 'N/A' && <Ionicons name="star" size={12} color={COLORS.warning} style={{ marginLeft: 3 }} />}
                        </View>
                      </View>
                      <View style={styles.statBox}>
                        <Text style={styles.statLabel}>BONUSES PAID</Text>
                        <Text style={[styles.statVal, { color: COLORS.success }]}>R {stats.bonus.toFixed(2)}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* TAB 3: CUSTOMER REVIEWS */}
          {activeTab === 'reviews' && (
            <View>
              <Text style={styles.tabSectionTitle}>Customer Feedback & Reviews</Text>
              
              {feedbacks.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="chatbubbles-outline" size={60} color={COLORS.border} />
                  <Text style={styles.emptyText}>No customer reviews found.</Text>
                </View>
              ) : (
                feedbacks.map(f => (
                  <View key={f.id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <View>
                        <Text style={styles.reviewerName}>{f.customerName}</Text>
                        <Text style={styles.reviewTime}>
                          {new Date(f.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={styles.reviewRatingsBlock}>
                        <View style={styles.ratingBadgeMini}>
                          <Text style={styles.ratingBadgeLabel}>Hotel: </Text>
                          <Text style={styles.ratingValueText}>{f.restaurantRating}</Text>
                          <Ionicons name="star" size={10} color={COLORS.warning} style={{ marginLeft: 2 }} />
                        </View>
                        {f.riderRating > 0 && (
                          <View style={[styles.ratingBadgeMini, { marginTop: 4 }]}>
                            <Text style={styles.ratingBadgeLabel}>Rider: </Text>
                            <Text style={styles.ratingValueText}>{f.riderRating}</Text>
                            <Ionicons name="star" size={10} color={COLORS.warning} style={{ marginLeft: 2 }} />
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Comments */}
                    {f.restaurantComment ? (
                      <View style={styles.commentBox}>
                        <Text style={styles.commentLabel}>About Restaurant / Food:</Text>
                        <Text style={styles.commentText}>"{f.restaurantComment}"</Text>
                      </View>
                    ) : null}

                    {f.riderComment ? (
                      <View style={[styles.commentBox, { marginTop: 8 }]}>
                        <Text style={styles.commentLabel}>About Rider ({f.riderName}):</Text>
                        <Text style={styles.commentText}>"{f.riderComment}"</Text>
                      </View>
                    ) : null}
                  </View>
                ))
              )}
            </View>
          )}
        </ScrollView>
      )}

      {/* Bonus Awarding Input Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={bonusModalVisible}
        onRequestClose={() => setBonusModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Award Bonus Payout</Text>
              <TouchableOpacity onPress={() => setBonusModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Awarding bonus to: <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>{selectedEmployeeName}</Text>
            </Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.currencyPrefix}>R </Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter amount (e.g. 200)"
                placeholderTextColor={COLORS.textSecondary}
                value={bonusAmountInput}
                onChangeText={setBonusAmountInput}
                keyboardType="numeric"
                autoFocus={true}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setBonusModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleAwardBonus}
              >
                <Text style={styles.confirmBtnText}>Award Bonus</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: SPACING.md,
    backgroundColor: COLORS.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONTS.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  refreshBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: COLORS.cardBgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBgElevated,
    borderRadius: 10,
    padding: 3,
    marginTop: SPACING.md,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: COLORS.primary,
  },
  tabButtonText: {
    fontSize: FONTS.sm - 1,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  activeTabButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sm,
    marginTop: SPACING.md,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: FONTS.sm,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  metricCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  metricCardBig: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: SPACING.md,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  metricValueBig: {
    fontSize: FONTS.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginVertical: 4,
  },
  metricLabelBig: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  profitCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  profitLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  profitSub: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  profitValue: {
    fontSize: FONTS.xl,
    fontWeight: 'bold',
  },
  detailsCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  detailsCardTitle: {
    fontSize: FONTS.sm,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 8,
  },
  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  expenseLabel: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
  },
  expenseVal: {
    fontSize: FONTS.xs,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  chartCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  chartTitle: {
    fontSize: FONTS.sm,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  chartRow: {
    marginBottom: SPACING.md,
  },
  categoryName: {
    fontSize: FONTS.xs,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  categoryValue: {
    fontSize: FONTS.xs,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: COLORS.cardBgElevated,
    borderRadius: 3,
    marginTop: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  tabSectionTitle: {
    fontSize: FONTS.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  ownerNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 142, 117, 0.1)',
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  ownerNoticeText: {
    color: COLORS.secondary,
    fontSize: 11,
    fontWeight: '500',
    flex: 1,
  },
  empCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  empHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.cardBgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  empInfo: {
    flex: 1,
  },
  empName: {
    fontSize: FONTS.md - 1,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  empRole: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  bonusBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  bonusBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  empStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBgElevated,
    borderRadius: 10,
    padding: SPACING.sm,
    marginTop: SPACING.md,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 9,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statVal: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
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
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  reviewerName: {
    fontSize: FONTS.sm,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  reviewTime: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  reviewRatingsBlock: {
    alignItems: 'flex-end',
  },
  ratingBadgeMini: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBgElevated,
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  ratingBadgeLabel: {
    fontSize: 9,
    color: COLORS.textSecondary,
  },
  ratingValueText: {
    fontSize: 10,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  commentBox: {
    backgroundColor: COLORS.cardBgElevated,
    borderRadius: 8,
    padding: SPACING.sm,
  },
  commentLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  commentText: {
    fontSize: FONTS.xs,
    color: COLORS.textPrimary,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sm,
    marginTop: SPACING.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 340,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.sm,
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: FONTS.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  modalSubtitle: {
    fontSize: FONTS.sm - 1,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBgElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.md,
  },
  currencyPrefix: {
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  modalInput: {
    flex: 1,
    height: 48,
    color: COLORS.textPrimary,
    fontSize: FONTS.md,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: SPACING.sm,
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sm,
    fontWeight: '600',
  },
  confirmBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  confirmBtnText: {
    color: '#FFF',
    fontSize: FONTS.sm,
    fontWeight: 'bold',
  },
});
