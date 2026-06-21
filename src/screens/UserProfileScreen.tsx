import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';

interface UserProfileScreenProps {
  onNavigate: (screen: string) => void;
}

export const UserProfileScreen: React.FC<UserProfileScreenProps> = ({ onNavigate }) => {
  const { cashier, logout } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onNavigate('home')} style={styles.backBtn}>
            <Text style={styles.backText}>← Dashboard</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Cashier Profile</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {cashier?.username ? cashier.username.charAt(0).toUpperCase() : 'C'}
            </Text>
          </View>
          <Text style={styles.name}>{cashier?.username || 'Cashier'}</Text>
          <Text style={styles.role}>{cashier?.role || 'authorized user'}</Text>
        </View>

        <View style={styles.detailsList}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Assigned Role</Text>
            <Text style={styles.detailVal}>POS Terminal Cashier</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>System Access</Text>
            <Text style={styles.detailVal}>Read & Write (Orders)</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Active Station</Text>
            <Text style={styles.detailVal}>Terminal #01</Text>
          </View>
        </View>

        <View style={styles.actionContainer}>
          <Button
            title="LOGOUT SESSION"
            variant="danger"
            onPress={logout}
            style={styles.logoutBtn}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  container: {
    flex: 1,
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
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#EFEFEF'
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold'
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    textTransform: 'capitalize'
  },
  role: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: 4,
    textTransform: 'uppercase',
    fontWeight: '600'
  },
  detailsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    marginBottom: 30
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#F8F9FA'
  },
  detailLabel: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500'
  },
  detailVal: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600'
  },
  actionContainer: {
    alignItems: 'center'
  },
  logoutBtn: {
    width: '100%',
    paddingVertical: 14
  }
});
