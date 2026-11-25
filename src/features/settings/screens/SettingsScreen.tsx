import React from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/store';
import { colors, radius, spacing, typography, withOpacity } from '@/theme';
import { ServerStatusCard } from '../components/ServerStatusCard';
import { useAppUpdates } from '../hooks/useAppUpdates';
import { useServerHealth } from '../hooks/useServerHealth';

export const SettingsScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const { healthStatus, ytdlpVer, checkServer } = useServerHealth();
  const { checkingUpdate, checkUpdates } = useAppUpdates();

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.userRow}>
          <View style={styles.userBadge}>
            <Ionicons name="person" size={24} color={colors.primary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userTitle}>Usuario Autorizado</Text>
            <Text style={styles.userEmail}>
              {user?.email || 'Sesión activa'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Actualizaciones de la App</Text>
        <Text style={styles.cardSubtitle}>Canal: preview · Versión 1.0.0</Text>
        <TouchableOpacity
          style={styles.updateBtn}
          onPress={checkUpdates}
          disabled={checkingUpdate}
        >
          {checkingUpdate ? (
            <ActivityIndicator size="small" color={colors.textPrimary} />
          ) : (
            <>
              <Ionicons
                name="cloud-download-outline"
                size={18}
                color={colors.primary}
              />
              <Text style={styles.updateBtnText}>Buscar Actualizaciones</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <ServerStatusCard
        healthStatus={healthStatus}
        ytdlpVer={ytdlpVer}
        onTest={checkServer}
      />

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={colors.error} />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    gap: 14,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardSubtitle: {
    fontSize: typography.size.md,
    color: colors.textMuted,
    marginBottom: 10,
  },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  userBadge: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: withOpacity(colors.primary, 0.15),
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: { flex: 1 },
  userTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  userEmail: {
    fontSize: typography.size.base,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  updateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  updateBtnText: {
    color: colors.textPrimary,
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: withOpacity(colors.error, 0.1),
    borderRadius: radius.xl,
    paddingVertical: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: withOpacity(colors.error, 0.2),
  },
  logoutText: {
    color: colors.error,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
  },
});
