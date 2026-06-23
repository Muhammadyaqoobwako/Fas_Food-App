import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { COLORS, SPACING, FONTS, globalStyles } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../state/AppContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=60',
];

export const UserProfileScreen = () => {
  const { cashier, isOnline, setOnlineStatus, logout, updateProfile } = useApp();
  const navigation = useNavigation<NavigationProp>();

  const isGuest = cashier?.username?.toLowerCase() === 'guest';

  const [username, setUsername] = useState(cashier?.username || '');
  const [email, setEmail] = useState(cashier?.email || '');
  const [avatar, setAvatar] = useState(cashier?.avatar || '');
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  const toggleSwitch = () => {
    setOnlineStatus(!isOnline);
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'manager': return 'Store Manager';
      case 'driver': return 'Delivery Rider';
      case 'owner': return 'Store Owner';
      case 'customer': return 'Valued Customer';
      case 'cashier': return 'Cashier Staff';
      default: return role;
    }
  };

  return (
    <ScrollView style={globalStyles.container} contentContainerStyle={styles.content}>
      {/* Profile Card Info */}
      <View style={styles.profileCard}>
        <TouchableOpacity 
          style={styles.avatarContainer} 
          onPress={() => !isGuest && setShowAvatarSelector(!showAvatarSelector)}
          disabled={isGuest}
          activeOpacity={0.8}
        >
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarImg} />
          ) : (
            <Text style={styles.avatarText}>
              {username ? username.charAt(0).toUpperCase() : 'C'}
            </Text>
          )}
          {!isGuest && (
            <View style={styles.editBadge}>
              <Ionicons name="camera" size={12} color="#FFF" />
            </View>
          )}
        </TouchableOpacity>
        
        <Text style={styles.profileName}>{cashier?.username || 'Guest User'}</Text>
        <Text style={styles.profileRole}>{getRoleDisplayName(cashier?.role || 'customer')}</Text>
        {cashier?.email ? <Text style={styles.profileEmail}>{cashier.email}</Text> : null}
      </View>

      {/* Avatar selection sheet */}
      {showAvatarSelector && !isGuest && (
        <View style={styles.avatarSelectorCard}>
          <Text style={styles.selectorTitle}>Select Profile Avatar</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
            {AVATAR_PRESETS.map((preset, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.presetItem, avatar === preset && styles.presetItemActive]}
                onPress={() => {
                  setAvatar(preset);
                  setShowAvatarSelector(false);
                }}
              >
                <Image source={{ uri: preset }} style={styles.presetImg} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Edit Profile Form (Exclude Guest) */}
      {!isGuest ? (
        <View style={styles.editFormCard}>
          <Text style={styles.formTitle}>Edit Profile Settings</Text>
          
          <Text style={styles.inputLabel}>Name / Username</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter name"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          <Text style={styles.inputLabel}>Email Address</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[globalStyles.button, styles.saveBtn]}
            onPress={() => updateProfile(username, email, avatar)}
          >
            <Ionicons name="save-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={globalStyles.buttonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.guestCard}>
          <Ionicons name="information-circle-outline" size={24} color={COLORS.warning} style={{ marginBottom: 6 }} />
          <Text style={styles.guestTitle}>Guest Mode Account</Text>
          <Text style={styles.guestText}>
            You are currently signed in as a Guest. Register an account on the sign-up screen to upload an avatar profile picture and edit details.
          </Text>
        </View>
      )}

      {/* Account Settings List */}
      <Text style={styles.sectionHeader}>Preferences & Setup</Text>

      <TouchableOpacity 
        style={styles.configCard} 
        onPress={() => navigation.navigate('Settings')}
      >
        <View style={globalStyles.spaceBetween}>
          <View style={styles.configInfo}>
            <Ionicons name="settings-outline" size={22} color={COLORS.primary} style={{ marginRight: SPACING.md }} />
            <View>
              <Text style={styles.configTitle}>App Settings</Text>
              <Text style={styles.configSub}>Configure notifications, safety, and cache</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.configCard} 
        onPress={() => navigation.navigate('Notifications')}
      >
        <View style={globalStyles.spaceBetween}>
          <View style={styles.configInfo}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.primary} style={{ marginRight: SPACING.md }} />
            <View>
              <Text style={styles.configTitle}>Notification Center</Text>
              <Text style={styles.configSub}>Check promos and recent order alerts</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
        </View>
      </TouchableOpacity>

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
          <Ionicons name="server-outline" size={22} color={COLORS.textSecondary} style={{ marginRight: SPACING.md }} />
          <View>
            <Text style={styles.configTitle}>Backend Connection</Text>
            <Text style={styles.configSub}>API URL: https://project-55lvo.vercel.app/api</Text>
          </View>
        </View>
      </View>

      {/* Logout button */}
      <TouchableOpacity style={[globalStyles.button, styles.logoutBtn]} onPress={logout}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.textPrimary} style={{ marginRight: 8 }} />
        <Text style={globalStyles.buttonText}>Sign Out Account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
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
    color: COLORS.primary,
    marginTop: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  profileEmail: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  sectionHeader: {
    fontSize: FONTS.sm,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
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
    borderRadius: 12,
    height: 52,
  },
  avatarImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.cardBg,
  },
  avatarSelectorCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  selectorTitle: {
    fontSize: FONTS.sm,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  selectorScroll: {
    flexDirection: 'row',
  },
  presetItem: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: SPACING.md,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  presetItemActive: {
    borderColor: COLORS.primary,
  },
  presetImg: {
    width: '100%',
    height: '100%',
  },
  editFormCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  formTitle: {
    fontSize: FONTS.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: FONTS.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    backgroundColor: '#1E1E24',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  input: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  guestCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  guestTitle: {
    fontSize: FONTS.md,
    fontWeight: 'bold',
    color: COLORS.warning,
    marginBottom: SPACING.sm,
  },
  guestText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

