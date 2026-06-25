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

type Step = 'email' | 'otp' | 'reset';

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { forgotPassword, resetPassword, loading } = useApp();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    animateTransition();
  }, [step]);

  const animateTransition = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleRequestOtp = async () => {
    setError(null);
    if (!email) {
      setError('Please enter your registered email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      await forgotPassword(email);
      setSuccess('Reset code has been sent to your email.');
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please verify your email.');
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }
    // Verify locally or go directly to step 3. Since we verify on reset, we can just proceed.
    setStep('reset');
  };

  const handleResetPassword = async () => {
    setError(null);
    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await resetPassword(email, otp, newPassword);
      setSuccess('Your password has been successfully reset.');
      setTimeout(() => {
        navigation.navigate('Login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Reset failed. Please verify the OTP and try again.');
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
              onPress={() => {
                if (step === 'otp') setStep('email');
                else if (step === 'reset') setStep('otp');
                else navigation.goBack();
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Reset Password</Text>
            <Text style={styles.headerSubtitle}>
              {step === 'email' && 'Enter your email to receive a password reset OTP'}
              {step === 'otp' && 'Enter the 6-digit validation code sent to your email'}
              {step === 'reset' && 'Create your brand new secure password'}
            </Text>
          </View>

          {/* Alert messages */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#FFD2D2" style={{ marginRight: 8 }} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {success && (
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle" size={20} color="#D4EDDA" style={{ marginRight: 8 }} />
              <Text style={styles.successText}>{success}</Text>
            </View>
          )}

          {/* Form Content */}
          <View style={styles.formContainer}>
            {step === 'email' && (
              <View style={globalStyles.inputContainer}>
                <Text style={globalStyles.label}>Registered Email</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.inputField}
                    placeholder="e.g. sahil@gmail.com"
                    placeholderTextColor={COLORS.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>
            )}

            {step === 'otp' && (
              <View style={globalStyles.inputContainer}>
                <Text style={globalStyles.label}>OTP Code</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="key-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.inputField}
                    placeholder="Enter 6-digit Code"
                    placeholderTextColor={COLORS.textSecondary}
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="numeric"
                    maxLength={6}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>
            )}

            {step === 'reset' && (
              <>
                <View style={globalStyles.inputContainer}>
                  <Text style={globalStyles.label}>New Password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.inputField}
                      placeholder="Minimum 6 characters"
                      placeholderTextColor={COLORS.textSecondary}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                      <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={globalStyles.inputContainer}>
                  <Text style={globalStyles.label}>Confirm Password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.inputField}
                      placeholder="Confirm new password"
                      placeholderTextColor={COLORS.textSecondary}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                      <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}

            {/* Next Action Button */}
            <TouchableOpacity 
              style={[globalStyles.button, styles.actionButton]}
              onPress={
                step === 'email' ? handleRequestOtp :
                step === 'otp' ? handleVerifyOtp :
                handleResetPassword
              }
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Text style={globalStyles.buttonText}>
                    {step === 'email' && 'Request Verification OTP'}
                    {step === 'otp' && 'Verify and Proceed'}
                    {step === 'reset' && 'Reset My Password'}
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelLink}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.cancelText}>Back to Login</Text>
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
    padding: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? 70 : 40,
    alignItems: 'center',
  },
  headerContainer: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONTS.xxl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3D1C1C',
    borderWidth: 1,
    borderColor: COLORS.danger,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    width: '100%',
  },
  errorText: {
    color: '#FFD2D2',
    fontSize: FONTS.sm,
    flex: 1,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3D23',
    borderWidth: 1,
    borderColor: COLORS.success,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    width: '100%',
  },
  successText: {
    color: '#D4EDDA',
    fontSize: FONTS.sm,
    flex: 1,
  },
  formContainer: {
    width: '100%',
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E24',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    height: 52,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  inputField: {
    flex: 1,
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
  },
  eyeIcon: {
    padding: SPACING.xs,
  },
  actionButton: {
    marginTop: SPACING.md,
    height: 50,
  },
  cancelLink: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  cancelText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sm,
    textDecorationLine: 'underline',
  },
});
