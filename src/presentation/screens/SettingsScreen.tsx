import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, globalStyles } from '../styles/theme';
import { useApp } from '../state/AppContext';

export const SettingsScreen = () => {
  const { cashier } = useApp();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [highDpiEnabled, setHighDpiEnabled] = useState(true);

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear the local image and temporary cache?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', onPress: () => alert('Cache cleared successfully!'), style: 'destructive' },
      ]
    );
  };

  return (
    <ScrollView style={globalStyles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Preferences</Text>

      {/* Preferences Card */}
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.iconContainer}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.primary} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Push Notifications</Text>
            <Text style={styles.subtitle}>Receive order status updates and alerts</Text>
          </View>
          <Switch
            trackColor={{ false: '#2C2C2E', true: COLORS.primary }}
            thumbColor={pushEnabled ? COLORS.textPrimary : '#8E8E93'}
            onValueChange={setPushEnabled}
            value={pushEnabled}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <View style={styles.iconContainer}>
            <Ionicons name="mail-unread-outline" size={22} color={COLORS.primary} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Email Promotions</Text>
            <Text style={styles.subtitle}>Weekly discounts and hot offers</Text>
          </View>
          <Switch
            trackColor={{ false: '#2C2C2E', true: COLORS.primary }}
            thumbColor={emailEnabled ? COLORS.textPrimary : '#8E8E93'}
            onValueChange={setEmailEnabled}
            value={emailEnabled}
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Security & System</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.iconContainer}>
            <Ionicons name="finger-print-outline" size={22} color={COLORS.secondary} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Biometric Sign-In</Text>
            <Text style={styles.subtitle}>Use Face ID / Touch ID for quick access</Text>
          </View>
          <Switch
            trackColor={{ false: '#2C2C2E', true: COLORS.primary }}
            thumbColor={biometricsEnabled ? COLORS.textPrimary : '#8E8E93'}
            onValueChange={setBiometricsEnabled}
            value={biometricsEnabled}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <View style={styles.iconContainer}>
            <Ionicons name="speedometer-outline" size={22} color={COLORS.secondary} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Fast Mode (High DPI)</Text>
            <Text style={styles.subtitle}>Render high resolution graphics and assets</Text>
          </View>
          <Switch
            trackColor={{ false: '#2C2C2E', true: COLORS.primary }}
            thumbColor={highDpiEnabled ? COLORS.textPrimary : '#8E8E93'}
            onValueChange={setHighDpiEnabled}
            value={highDpiEnabled}
          />
        </View>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.row} onPress={handleClearCache}>
          <View style={styles.iconContainer}>
            <Ionicons name="trash-outline" size={22} color={COLORS.danger} />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: COLORS.danger }]}>Clear Temp Cache</Text>
            <Text style={styles.subtitle}>Free up device storage occupied by temp files</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Support & Company</Text>
      <View style={styles.card}>
        <TouchableOpacity style={styles.row} onPress={() => alert('Opening Help Center...')}>
          <View style={styles.iconContainer}>
            <Ionicons name="help-circle-outline" size={22} color={COLORS.textPrimary} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Help & Documentation</Text>
            <Text style={styles.subtitle}>FAQs, live chat, and support tickets</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.row} onPress={() => alert('Terms of Service Agreement')}>
          <View style={styles.iconContainer}>
            <Ionicons name="document-text-outline" size={22} color={COLORS.textPrimary} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Terms of Service</Text>
            <Text style={styles.subtitle}>Privacy policy and terms of use</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.versionText}>Fas Food App — Version 2.4.0</Text>
        <Text style={styles.copyrightText}>© 2026 Fas Food International. All rights reserved.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  sectionTitle: {
    fontSize: FONTS.sm,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
    paddingLeft: 4,
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.cardBgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: FONTS.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  footer: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  versionText: {
    fontSize: FONTS.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  copyrightText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    opacity: 0.7,
    marginTop: 4,
  },
});
