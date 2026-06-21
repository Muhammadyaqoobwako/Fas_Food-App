import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'info';
  loading?: boolean;
  disabled?: boolean;
  style?: any;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style
}) => {
  const buttonStyles = [
    styles.btn,
    styles[variant],
    (disabled || loading) && styles.disabled,
    style
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  } as any,
  primary: {
    backgroundColor: '#FF6B35' // Vibrant Fast-Food Orange
  },
  secondary: {
    backgroundColor: '#6C757D'
  },
  danger: {
    backgroundColor: '#DC3545'
  },
  success: {
    backgroundColor: '#28A745'
  },
  info: {
    backgroundColor: '#17A2B8'
  },
  disabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
