import React, { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { ApiService } from '../services/api';

export const SettingsScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [healthStatus, setHealthStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [ytdlpVer, setYtdlpVer] = useState('');

  useEffect(() => {
    checkServer();
  }, []);

  const checkServer = async () => {
    setHealthStatus('checking');
    try {
      const data = await ApiService.checkHealth();
      setHealthStatus('online');
      setYtdlpVer(data.ytdlpVersion || 'OK');
    } catch {
      setHealthStatus('offline');
    }
  };

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Perfil del Usuario */}
      <View style={styles.card}>
        <View style={styles.userRow}>
          <View style={styles.userBadge}>
            <Ionicons name="person" size={24} color="#22c55e" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userTitle}>Usuario Autorizado</Text>
            <Text style={styles.userEmail}>{user?.email || 'Sesión activa'}</Text>
          </View>
        </View>
      </View>

      {/* Estado del Servidor en Render */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Servidor de Música (Render)</Text>
        <Text style={styles.serverUrl}>{ApiService.getBaseUrl()}</Text>

        <View style={styles.statusRow}>
          <View style={styles.statusPill}>
            <View
              style={[
                styles.statusDot,
                healthStatus === 'online' && styles.statusDotOnline,
                healthStatus === 'offline' && styles.statusDotOffline,
              ]}
            />
            <Text style={styles.statusText}>
              {healthStatus === 'checking'
                ? 'Comprobando...'
                : healthStatus === 'online'
                ? `En línea (yt-dlp ${ytdlpVer})`
                : 'Servidor desconectado'}
            </Text>
          </View>

          <TouchableOpacity style={styles.testBtn} onPress={checkServer}>
            <Text style={styles.testBtnText}>Probar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Botón de Cerrar Sesión */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
    padding: 16,
    gap: 14,
  },
  card: {
    backgroundColor: '#18181b',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  userBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(34,197,94,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  userEmail: {
    fontSize: 13,
    color: '#a1a1aa',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  serverUrl: {
    fontSize: 12,
    color: '#71717a',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#eab308',
  },
  statusDotOnline: {
    backgroundColor: '#22c55e',
  },
  statusDotOffline: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    color: '#d4d4d8',
    fontSize: 13,
  },
  testBtn: {
    backgroundColor: '#27272a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  testBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '700',
  },
});
