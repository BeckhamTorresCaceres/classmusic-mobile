import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { ApiService, DEFAULT_API_URL } from '../services/api';

export const AuthScreen: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('beckhamjosethtorrescaceres@gmail.com');
  const [password, setPassword] = useState('1043444568b*');
  const [serverUrl, setServerUrl] = useState(ApiService.getBaseUrl());
  const [showConfig, setShowConfig] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Campos requeridos', 'Por favor ingresa tu correo y contraseña.');
      return;
    }

    try {
      setLoading(true);
      await ApiService.setBaseUrl(serverUrl);
      await login(email, password);
    } catch (err) {
      Alert.alert(
        'Error al Iniciar Sesión',
        err instanceof Error
          ? err.message
          : 'Verifica tu conexión y que el servidor de Render esté activo.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        {/* Logo / Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Ionicons name="musical-notes" size={32} color="#22c55e" />
          </View>
          <Text style={styles.title}>ClassMusic</Text>
          <Text style={styles.subtitle}>Tu música en tu celular, siempre disponible</Text>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          <Text style={styles.label}>Correo Electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="correo@ejemplo.com"
            placeholderTextColor="#71717a"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#71717a"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* Opciones avanzadas de servidor */}
          <TouchableOpacity
            style={styles.configToggle}
            onPress={() => setShowConfig(!showConfig)}
          >
            <Ionicons name="server-outline" size={16} color="#a1a1aa" />
            <Text style={styles.configToggleText}>
              {showConfig ? 'Ocultar servidor' : 'Configurar servidor API'}
            </Text>
          </TouchableOpacity>

          {showConfig && (
            <View style={styles.configBox}>
              <Text style={styles.label}>URL de la API</Text>
              <TextInput
                style={styles.input}
                value={serverUrl}
                onChangeText={setServerUrl}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setServerUrl(DEFAULT_API_URL)}
                style={styles.resetBtn}
              >
                <Text style={styles.resetText}>Restablecer a Render</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.loginBtnText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#18181b',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(34,197,94,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#a1a1aa',
    marginTop: 4,
    textAlign: 'center',
  },
  form: {
    gap: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#d4d4d8',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#27272a',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 15,
  },
  configToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  configToggleText: {
    color: '#a1a1aa',
    fontSize: 13,
  },
  configBox: {
    backgroundColor: '#1c1917',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#292524',
    gap: 6,
  },
  resetBtn: {
    alignSelf: 'flex-start',
  },
  resetText: {
    color: '#22c55e',
    fontSize: 12,
    fontWeight: '600',
  },
  loginBtn: {
    backgroundColor: '#22c55e',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  loginBtnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
});
