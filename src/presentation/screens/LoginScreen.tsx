import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { useApp } from '../state/AppContext';
import { COLORS, SPACING, FONTS, globalStyles } from '../styles/theme';

export const LoginScreen = () => {
  const { login, loading } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    setError(null);
    if (!username || !password) {
      setError('Please fill in all fields.');
      return;
    }
    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], width: '100%' }}>
          <View style={styles.headerContainer}>
            <Text style={styles.brandTitle}>Fas Food</Text>
            <Text style={styles.brandSubtitle}>Premium Dining Management</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Cashier Authenticator</Text>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <View style={globalStyles.inputContainer}>
              <Text style={globalStyles.label}>Username</Text>
              <TextInput
                style={globalStyles.input}
                placeholder="e.g. dorry or timmo"
                placeholderTextColor={COLORS.textSecondary}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            <View style={globalStyles.inputContainer}>
              <Text style={globalStyles.label}>Password</Text>
              <TextInput
                style={globalStyles.input}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[globalStyles.button, styles.loginBtn]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.textPrimary} />
              ) : (
                <Text style={globalStyles.buttonText}>Authenticate Session</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.infoFooter}>
            <Text style={styles.footerText}>Authorized Access Only</Text>
            <Text style={styles.footerSubText}>Default Cashiers: dorry / timmo (pwd: dorry)</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  brandTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: COLORS.secondary,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    textShadowColor: 'rgba(229, 57, 53, 0.4)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
  brandSubtitle: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
    letterSpacing: 1.5,
  },
  formCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  formTitle: {
    fontSize: FONTS.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  loginBtn: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: FONTS.sm,
    marginBottom: SPACING.md,
    textAlign: 'center',
    fontWeight: '600',
  },
  infoFooter: {
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.xs,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  footerSubText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },
});
