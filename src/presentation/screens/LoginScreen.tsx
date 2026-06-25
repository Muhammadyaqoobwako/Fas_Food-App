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
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../state/AppContext';
import { COLORS, SPACING, FONTS, globalStyles } from '../styles/theme';

interface Props {
  navigation: any;
}

type LoginRole = 'customer' | 'owner' | 'driver' | 'staff';

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login, loading } = useApp();
  const [selectedRole, setSelectedRole] = useState<LoginRole>('customer');
  const [username, setUsername] = useState('customer');
  const [password, setPassword] = useState('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track focused input for custom glow effects
  const [focusedField, setFocusedField] = useState<'username' | 'password' | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRoleChange = (role: LoginRole) => {
    setSelectedRole(role);
    setError(null);
    // Pre-fill demo accounts for fast user switching
    if (role === 'customer') {
      setUsername('customer');
      setPassword('customer');
    } else if (role === 'owner') {
      setUsername('owner');
      setPassword('owner');
    } else if (role === 'driver') {
      setUsername('driver');
      setPassword('driver');
    } else if (role === 'staff') {
      setUsername('manager');
      setPassword('manager');
    }
  };

  const handleLogin = async () => {
    setError(null);
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }
    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    }
  };

  const handleGuestLogin = async () => {
    setError(null);
    try {
      await login('guest', 'guest');
    } catch (err: any) {
      setError(err.message || 'Guest login failed.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          width: '100%',
        }}>
          {/* Logo & Brand Header */}
          <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }] }]}>
            <View style={styles.logoCircle}>
              <Ionicons name="restaurant-outline" size={40} color={COLORS.primary} />
            </View>
            <Text style={styles.brandTitle}>Fas Food</Text>
            <Text style={styles.brandSubtitle}>Premium Ordering Platform</Text>
          </Animated.View>

          {/* Login Form Card */}
          <View style={styles.formCard}>
            {/* Professional Role Selection Header */}
            <Text style={styles.rolePickerLabel}>Sign In As</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.roleTabsContainer}
              contentContainerStyle={styles.roleTabsContent}
            >
              {[
                { key: 'customer', label: 'Customer', icon: 'person-outline' },
                { key: 'owner', label: 'Rider / Delivery Partner', icon: 'bicycle-outline' }, // maps to rider tab under owner key name
                { key: 'driver', label: 'Rider Partner', icon: 'bicycle-outline' }, // maps to driver internally
                { key: 'staff', label: 'Staff / Admin', icon: 'people-outline' },
              ].map(item => {
                // Filter out duplicates (item.key driver and owner are distinct, but let's show them nicely)
                // Wait, owner should be Owner/Hotel, driver should be Rider!
                let label = '';
                let icon = '';
                if (item.key === 'customer') { label = 'Customer'; icon = 'person-outline'; }
                else if (item.key === 'owner') { label = 'Owner / Hotel'; icon = 'business-outline'; }
                else if (item.key === 'driver') { label = 'Rider'; icon = 'bicycle-outline'; }
                else if (item.key === 'staff') { label = 'Staff / Admin'; icon = 'people-outline'; }

                const isActive = selectedRole === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.roleTab, isActive && styles.roleTabActive]}
                    onPress={() => handleRoleChange(item.key as LoginRole)}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name={icon as any} 
                      size={14} 
                      color={isActive ? '#FFF' : COLORS.textSecondary} 
                      style={{ marginRight: 6 }}
                    />
                    <Text style={[styles.roleTabText, isActive && styles.roleTabTextActive]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color={COLORS.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Username Input */}
            <View style={[
              styles.inputWrapper,
              focusedField === 'username' && styles.inputWrapperFocused
            ]}>
              <View style={styles.inputIconContainer}>
                <Ionicons 
                  name="person-outline" 
                  size={20} 
                  color={focusedField === 'username' ? COLORS.primary : COLORS.textSecondary} 
                />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor={COLORS.textSecondary}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            {/* Password Input */}
            <View style={[
              styles.inputWrapper,
              focusedField === 'password' && styles.inputWrapperFocused
            ]}>
              <View style={styles.inputIconContainer}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={20} 
                  color={focusedField === 'password' ? COLORS.primary : COLORS.textSecondary} 
                />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={COLORS.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity 
              style={styles.forgotBtn}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Sign In Action Button */}
            <TouchableOpacity
              style={styles.signInBtn}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.signInBtnText}>Sign In</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Sign Up Link & Guest option */}
          <View style={styles.footerContainer}>
            <View style={styles.signUpRow}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.signUpLink}>Create Account</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.guestLink} 
              onPress={handleGuestLogin}
              activeOpacity={0.7}
            >
              <Text style={styles.guestLinkText}>Continue as Guest</Text>
            </TouchableOpacity>
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
    paddingBottom: SPACING.xl * 2,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.cardBgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginBottom: SPACING.md,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  formCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  rolePickerLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    paddingLeft: 2,
  },
  roleTabsContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.cardBgElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 4,
    height: 48,
  },
  roleTabsContent: {
    alignItems: 'center',
  },
  roleTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    height: '100%',
    borderRadius: 8,
    marginRight: 4,
  },
  roleTabActive: {
    backgroundColor: COLORS.primary,
  },
  roleTabText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  roleTabTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244,67,54,0.1)',
    borderRadius: 10,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(244,67,54,0.2)',
  },
  errorText: {
    color: COLORS.danger,
    fontSize: FONTS.sm,
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBgElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    marginBottom: SPACING.md,
    height: 52,
  },
  inputWrapperFocused: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  inputIconContainer: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
    height: '100%',
  },
  eyeBtn: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.lg,
  },
  forgotText: {
    fontSize: FONTS.sm,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  signInBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signInBtnText: {
    color: '#FFF',
    fontSize: FONTS.lg,
    fontWeight: 'bold',
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  signUpLink: {
    fontSize: FONTS.sm,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  guestLink: {
    marginTop: SPACING.md,
    paddingVertical: 4,
  },
  guestLinkText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
