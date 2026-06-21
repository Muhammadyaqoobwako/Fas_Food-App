import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { InputField } from '../components/InputField';
import { Button } from '../components/Button';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { login, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!username.trim()) {
      setError('Username is required.');
      return;
    }
    if (!password.trim()) {
      setError('Password is required.');
      return;
    }

    const success = await login(username.trim(), password.trim());
    if (success) {
      Alert.alert('WELCOME TO Debonairs Inn System');
      onLoginSuccess();
    } else {
      Alert.alert('INVALID PASSWORD OR USERNAME, PLEASE TRY AGAIN!!!');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Debonairs Pizza</Text>
        <Text style={styles.subtitle}>Cashier Portal Login</Text>

        <InputField
          label="Username"
          value={username}
          onChangeText={setUsername}
          placeholder="Enter username (e.g., dorry)"
        />

        <InputField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
          secureTextEntry
        />

        {error ? <Text style={styles.localError}>{error}</Text> : null}

        <Button
          title="Login"
          onPress={handleLogin}
          loading={isLoading}
          style={styles.loginBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C000C0', // Legacy VB6 Form BackColor &H00C000C0& (Purple/Magenta)
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B35', // Premium Fast Food Orange
    textAlign: 'center',
    marginBottom: 4,
    textDecorationLine: 'underline'
  },
  subtitle: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 24,
    fontWeight: '500'
  },
  localError: {
    color: '#DC3545',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center'
  },
  loginBtn: {
    width: '100%',
    marginTop: 8
  }
});
