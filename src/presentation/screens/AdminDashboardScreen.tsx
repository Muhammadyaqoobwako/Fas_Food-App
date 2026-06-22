import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { COLORS, SPACING, FONTS, globalStyles } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../state/AppContext';
import { ISalesSummary } from '../../types';

export const AdminDashboardScreen = () => {
  const { orderRepository } = useApp();
  const [summary, setSummary] = useState<ISalesSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  }, []);

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

  return (
    <ScrollView style={globalStyles.container} contentContainerStyle={styles.scrollContent}>
      <View style={globalStyles.spaceBetween}>
        <Text style={styles.dashboardTitle}>Real-time Analytics</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchSummary}>
          <Ionicons name="refresh" size={18} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
          <Text style={styles.loadingText}>Fetching sales matrices...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={48} color={COLORS.danger} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={globalStyles.button} onPress={fetchSummary}>
            <Text style={globalStyles.buttonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : summary ? (
        <View>
          {/* Main Metrics cards */}
          <View style={styles.metricCardsContainer}>
            <View style={styles.metricCardBig}>
              <Ionicons name="cash-outline" size={24} color={COLORS.secondary} />
              <Text style={styles.metricValueBig}>R {summary.totalRevenue.toFixed(2)}</Text>
              <Text style={styles.metricLabelBig}>Total Gross Revenue</Text>
            </View>
            <View style={styles.metricCardBig}>
              <Ionicons name="restaurant-outline" size={24} color={COLORS.primary} />
              <Text style={styles.metricValueBig}>{summary.totalOrders}</Text>
              <Text style={styles.metricLabelBig}>Transactions Handled</Text>
            </View>
          </View>

          {/* Chart Breakdowns */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Category Sales Breakdown</Text>
            
            {Object.entries(summary.salesByCategory).map(([cat, rev]) => {
              const maxVal = getMaxRevenue();
              // Compute percentage of max category to display a proportional bar
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
                          backgroundColor: getBarColor(cat) 
                        }
                      ]} 
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: SPACING.md,
  },
  dashboardTitle: {
    fontSize: FONTS.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  refreshBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: COLORS.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    alignItems: 'center',
    marginHorizontal: 4,
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
  metricValueBig: {
    fontSize: FONTS.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginVertical: 4,
  },
  metricLabelBig: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  chartCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  chartTitle: {
    fontSize: FONTS.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  chartRow: {
    marginBottom: SPACING.md,
  },
  categoryName: {
    fontSize: FONTS.sm,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  categoryValue: {
    fontSize: FONTS.sm,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});
