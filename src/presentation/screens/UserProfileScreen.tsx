import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { COLORS, SPACING, FONTS, globalStyles } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../state/AppContext';

export const UserProfileScreen = () => {
  const { cashier, isOnline, setOnlineStatus, logout } = useApp();

  const toggleSwitch = () => {
    setOnlineStatus(!isOnline);
  };

  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.content}>
        {/* Profile Card Info */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {cashier?.username ? cashier.username.charAt(0).toUpperCase() : 'C'}
            </Text>
          </View>
          <Text style={styles.profileName}>{cashier?.username || 'Anonymous'}</Text>
          <Text style={styles.profileRole}>Role: {cashier?.role || 'cashier'}</Text>
        </View>

        {/* Configurations List */}
        <Text style={styles.sectionHeader}>System Controls</Text>

        <View style={styles.configCard}>
          <View style={globalStyles.spaceBetween}>
            <View style={styles.configInfo}>
              <Ionicons name="wifi-outline" size={22} color={COLORS.textPrimary} style={{ marginRight: SPACING.md }} />
              <View>
                <Text style={styles.configTitle}>Simulate Offline State</Text>
                <Text style={styles.configSub}>Force order placement to write to local queue</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: '#767577', true: COLORS.primary }}
              thumbColor={isOnline ? COLORS.secondary : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSwitch}
              value={!isOnline}
            />
          </View>
        </View>

        {/* Server Info Card */}
        <View style={styles.configCard}>
          <View style={styles.configInfo}>
            <Ionicons name="server-outline" size={22} color={COLORS.textPrimary} style={{ marginRight: SPACING.md }} />
            <View>
              <Text style={styles.configTitle}>Backend Connection</Text>
              <Text style={styles.configSub}>API URL: http://10.0.2.2:5000/api</Text>
            </View>
          </View>
        </View>

        {/* Logout button */}
        <TouchableOpacity style={[globalStyles.button, styles.logoutBtn]} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.textPrimary} style={{ marginRight: 8 }} />
          <Text style={globalStyles.buttonText}>Log Out Cashier</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profileCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    marginTop: SPACING.sm,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  profileName: {
    fontSize: FONTS.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textTransform: 'capitalize',
  },
  profileRole: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionHeader: {
    fontSize: FONTS.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.md,
    marginLeft: 4,
  },
  configCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  configInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  configTitle: {
    fontSize: FONTS.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  configSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    maxWidth: '90%',
  },
  logoutBtn: {
    backgroundColor: COLORS.danger,
    marginTop: SPACING.xl,
  },
});
