import { useState } from 'react';
import { Alert } from 'react-native';
import { ApiClient, DEFAULT_API_URL } from '@/services';
import { useAuth } from '@/store';

export function useAuthForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState('beckhamjosethtorrescaceres@gmail.com');
  const [password, setPassword] = useState('1043444568b*');
  const [serverUrl, setServerUrl] = useState(ApiClient.getBaseUrl());
  const [showConfig, setShowConfig] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleConfig = () => setShowConfig((prev) => !prev);
  const resetServerUrl = () => setServerUrl(DEFAULT_API_URL);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        'Campos requeridos',
        'Por favor ingresa tu correo y contraseña.',
      );
      return;
    }

    try {
      setLoading(true);
      await ApiClient.setBaseUrl(serverUrl);
      await login(email, password);
    } catch (err) {
      Alert.alert(
        'Error al Iniciar Sesión',
        err instanceof Error
          ? err.message
          : 'Verifica tu conexión y que el servidor esté activo.',
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    serverUrl,
    setServerUrl,
    showConfig,
    toggleConfig,
    resetServerUrl,
    loading,
    handleLogin,
  };
}
