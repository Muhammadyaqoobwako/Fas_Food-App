import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, SafeAreaView, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';
import { Button } from '../components/Button';

interface SalesSummary {
  totalRevenue: number;
  totalOrders: number;
  salesByCategory: {
    Sprite: number;
    Coke: number;
    Burger: number;
    Pizza: number;
    IceCream: number;
    Chips: number;
  };
}

interface AdminDashboardScreenProps {
  onNavigate: (screen: string) => void;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ onNavigate }) => {
  const { token } = useAuth();
  const [report, setReport] = useState<SalesSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await apiService.getSalesReport(token);
      setReport(data);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to retrieve sales report metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onNavigate('home')} style={styles.backBtn}>
            <Text style={styles.backText}>← Dashboard</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Admin Sales Board</Text>
        </View>

        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#FF6B35" />
          </View>
        ) : report ? (
          <View>
            {/* STAT CARDS */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Total Revenue</Text>
                <Text style={[styles.statValue, { color: '#28A745' }]}>
                  ${report.totalRevenue.toFixed(2)}
                </Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Orders Placed</Text>
                <Text style={styles.statValue}>{report.totalOrders}</Text>
              </View>
            </View>

            {/* CATEGORY BREAKDOWN TABLE */}
            <Text style={styles.sectionTitle}>Category Revenue Split</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeadCell}>Category</Text>
                <Text style={[styles.tableHeadCell, { textAlign: 'right' }]}>Total Revenue</Text>
              </View>

              {Object.entries(report.salesByCategory).map(([category, amount]) => (
                <View key={category} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{category}</Text>
                  <Text style={[styles.tableCell, { textAlign: 'right', fontWeight: 'bold' }]}>
                    ${amount.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>

            <Button
              title="Refresh Sales Data"
              onPress={fetchReport}
              style={styles.refreshBtn}
            />

            <Button
              title="Manage Menu Items 🍔"
              onPress={() => onNavigate('admin-menu')}
              variant="secondary"
              style={[styles.refreshBtn, { marginTop: 12 }]}
            />
          </View>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Failed to load reporting metrics.</Text>
            <Button title="Retry" onPress={fetchReport} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  container: {
    padding: 20
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24
  },
  backBtn: {
    paddingRight: 16
  },
  backText: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: 'bold'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50'
  },
  loader: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  statCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#EFEFEF'
  },
  statLabel: {
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 6
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12
  },
  table: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    overflow: 'hidden',
    marginBottom: 24
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F1F1F1',
    padding: 12
  },
  tableHeadCell: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#F8F9FA'
  },
  tableCell: {
    fontSize: 14,
    color: '#333333',
    flex: 1
  },
  refreshBtn: {
    width: '100%',
    paddingVertical: 14
  },
  empty: {
    paddingVertical: 80,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 16,
    color: '#6C757D',
    marginBottom: 16
  }
});
