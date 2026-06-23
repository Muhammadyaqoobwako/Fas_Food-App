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

type SignUpRole = 'customer' | 'owner' | 'driver';
type FocusField = 'fullName' | 'email' | 'username' | 'password' | 'confirmPassword' | 'restaurantName' | 'vehicleModel' | 'licensePlate' | 'driverLicense' | null;

export const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const { register, loading } = useApp();
  const [role, setRole] = useState<SignUpRole>('customer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Role-Specific Inputs
  const [restaurantName, setRestaurantName] = useState('');
  const [vehicleType, setVehicleType] = useState('Motorcycle');
  const [vehicleModel, setVehicleModel] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [driverLicense, setDriverLicense] = useState('');

  // Active Focus Track
  const [focusedField, setFocusedField] = useState<FocusField>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSignUp = async () => {
    setError(null);

    if (!fullName || !email || !username || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (role === 'owner' && !restaurantName) {
      setError('Please specify your Restaurant or Hotel Name.');
      return;
    }

    if (role === 'driver' && (!licensePlate || !vehicleType || !vehicleModel || !driverLicense)) {
      setError('Please fill in all rider license and vehicle details.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      // Map SignUpRole driver to database cashier role string 'driver'
      const targetRole = role === 'driver' ? 'driver' : role === 'owner' ? 'owner' : 'customer';
      await register(
        fullName, 
        email, 
        username, 
        password, 
        targetRole, 
        role === 'owner' ? restaurantName : undefined
      );
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
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
          {/* Header */}
          <View style={styles.headerContainer}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.brandTitle}>Fas Food</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Create Account</Text>
            <Text style={styles.formSubtitle}>Join the Fas Food network today</Text>

            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color={COLORS.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Segmented Account Type Selector */}
            <Text style={styles.pickerLabel}>I want to register as a</Text>
            <View style={styles.rolePickerRow}>
              {[
                { key: 'customer', label: 'Customer', icon: 'person-outline' },
                { key: 'owner', label: 'Owner / Hotel', icon: 'business-outline' },
                { key: 'driver', label: 'Rider', icon: 'bicycle-outline' },
              ].map(item => {
                const isActive = role === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.rolePickerTab, isActive && styles.rolePickerTabActive]}
                    onPress={() => setRole(item.key as SignUpRole)}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name={item.icon as any} 
                      size={13} 
                      color={isActive ? '#FFF' : COLORS.textSecondary} 
                      style={{ marginRight: 4 }}
                    />
                    <Text style={[styles.rolePickerText, isActive && styles.rolePickerTextActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Conditionally Animate Owner Fields */}
            {role === 'owner' && (
              <View style={[
                styles.inputWrapper,
                focusedField === 'restaurantName' && styles.inputWrapperFocused
              ]}>
                <View style={styles.inputIconContainer}>
                  <Ionicons 
                    name="business-outline" 
                    size={20} 
                    color={focusedField === 'restaurantName' ? COLORS.primary : COLORS.textSecondary} 
                  />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Restaurant or Hotel Name"
                  placeholderTextColor={COLORS.textSecondary}
                  value={restaurantName}
                  onChangeText={setRestaurantName}
                  autoCapitalize="words"
                  onFocus={() => setFocusedField('restaurantName')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            )}

            {/* Conditionally Animate Rider/Driver Fields */}
            {role === 'driver' && (
              <>
                {/* Vehicle Selector */}
                <View style={styles.vehiclePickerRow}>
                  {['Motorcycle', 'Bicycle', 'Car'].map(vType => {
                    const isSelected = vehicleType === vType;
                    const vIcon = vType === 'Motorcycle' ? 'bicycle-outline' : vType === 'Bicycle' ? 'walk-outline' : 'car-outline';
                    return (
                      <TouchableOpacity
                        key={vType}
                        style={[styles.vehicleBtn, isSelected && styles.vehicleBtnActive]}
                        onPress={() => setVehicleType(vType)}
                        activeOpacity={0.7}
                      >
                        <Ionicons 
                          name={vIcon as any} 
                          size={14} 
                          color={isSelected ? '#FFF' : COLORS.textSecondary} 
                          style={{ marginRight: 4 }}
                        />
                        <Text style={[styles.vehicleText, isSelected && styles.vehicleTextActive]}>{vType}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Driver's License Number */}
                <View style={[
                  styles.inputWrapper,
                  focusedField === 'driverLicense' && styles.inputWrapperFocused
                ]}>
                  <View style={styles.inputIconContainer}>
                    <Ionicons 
                      name="shield-outline" 
                      size={20} 
                      color={focusedField === 'driverLicense' ? COLORS.primary : COLORS.textSecondary} 
                    />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Rider's License Number (e.g. DL-840283)"
                    placeholderTextColor={COLORS.textSecondary}
                    value={driverLicense}
                    onChangeText={setDriverLicense}
                    autoCapitalize="characters"
                    onFocus={() => setFocusedField('driverLicense')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>

                {/* Vehicle Model */}
                <View style={[
                  styles.inputWrapper,
                  focusedField === 'vehicleModel' && styles.inputWrapperFocused
                ]}>
                  <View style={styles.inputIconContainer}>
                    <Ionicons 
                      name="construct-outline" 
                      size={20} 
                      color={focusedField === 'vehicleModel' ? COLORS.primary : COLORS.textSecondary} 
                    />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Vehicle Model / Make (e.g. Honda Cub)"
                    placeholderTextColor={COLORS.textSecondary}
                    value={vehicleModel}
                    onChangeText={setVehicleModel}
                    autoCapitalize="words"
                    onFocus={() => setFocusedField('vehicleModel')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>

                {/* License Plate */}
                <View style={[
                  styles.inputWrapper,
                  focusedField === 'licensePlate' && styles.inputWrapperFocused
                ]}>
                  <View style={styles.inputIconContainer}>
                    <Ionicons 
                      name="card-outline" 
                      size={20} 
                      color={focusedField === 'licensePlate' ? COLORS.primary : COLORS.textSecondary} 
                    />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="License Plate (e.g. CA 482-943)"
                    placeholderTextColor={COLORS.textSecondary}
                    value={licensePlate}
                    onChangeText={setLicensePlate}
                    autoCapitalize="characters"
                    onFocus={() => setFocusedField('licensePlate')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </>
            )}

            {/* Full Name Input */}
            <View style={[
              styles.inputWrapper,
              focusedField === 'fullName' && styles.inputWrapperFocused
            ]}>
              <View style={styles.inputIconContainer}>
                <Ionicons 
                  name="card-outline" 
                  size={20} 
                  color={focusedField === 'fullName' ? COLORS.primary : COLORS.textSecondary} 
                />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={COLORS.textSecondary}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                onFocus={() => setFocusedField('fullName')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            {/* Email Input */}
            <View style={[
              styles.inputWrapper,
              focusedField === 'email' && styles.inputWrapperFocused
            ]}>
              <View style={styles.inputIconContainer}>
                <Ionicons 
                  name="mail-outline" 
                  size={20} 
                  color={focusedField === 'email' ? COLORS.primary : COLORS.textSecondary} 
                />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor={COLORS.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

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
                placeholder="Password (min 6 chars)"
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

            {/* Confirm Password Input */}
            <View style={[
              styles.inputWrapper,
              focusedField === 'confirmPassword' && styles.inputWrapperFocused
            ]}>
              <View style={styles.inputIconContainer}>
                <Ionicons 
                  name="shield-checkmark-outline" 
                  size={20} 
                  color={focusedField === 'confirmPassword' ? COLORS.primary : COLORS.textSecondary} 
                />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor={COLORS.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField(null)}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Sign Up Action Button */}
            <TouchableOpacity
              style={styles.signUpBtn}
              onPress={handleSignUp}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.signUpBtnText}>Create Account</Text>
                  <Ionicons name="checkmark-circle" size={20} color="#FFF" style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Sign In Link */}
          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.signInLink}>Sign In</Text>
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.cardBgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
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
  formTitle: {
    fontSize: FONTS.xxl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: SPACING.lg,
  },
  pickerLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    paddingLeft: 2,
  },
  rolePickerRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBgElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 4,
    marginBottom: SPACING.md,
    height: 48,
    alignItems: 'center',
  },
  rolePickerTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    height: '100%',
  },
  rolePickerTabActive: {
    backgroundColor: COLORS.primary,
  },
  rolePickerText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  rolePickerTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  vehiclePickerRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBgElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 3,
    marginBottom: SPACING.sm,
    height: 40,
    alignItems: 'center',
  },
  vehicleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    height: '100%',
  },
  vehicleBtnActive: {
    backgroundColor: COLORS.secondary,
  },
  vehicleText: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  vehicleTextActive: {
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
  signUpBtn: {
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
    marginTop: SPACING.md,
  },
  signUpBtnText: {
    color: '#FFF',
    fontSize: FONTS.lg,
    fontWeight: 'bold',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  signInText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  signInLink: {
    fontSize: FONTS.sm,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});
