import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ApiClient } from '@/services';
import { colors, radius, spacing, typography } from '@/theme';
import type { ServerHealthStatus } from '../hooks/useServerHealth';

interface ServerStatusCardProps {
  healthStatus: ServerHealthStatus;
  ytdlpVer: string;
  onTest: () => void;
}

export const ServerStatusCard: React.FC<ServerStatusCardProps> = ({
  healthStatus,
  ytdlpVer,
  onTest,
}) => (
  <View style={styles.card}>
    <Text style={styles.sectionTitle}>Servidor de Música (Render)</Text>
    <Text style={styles.serverUrl}>{ApiClient.getBaseUrl()}</Text>
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
      <TouchableOpacity style={styles.testBtn} onPress={onTest}>
        <Text style={styles.testBtnText}>Probar</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  serverUrl: {
    fontSize: typography.size.md,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: radius.xs,
    backgroundColor: colors.warning,
  },
  statusDotOnline: { backgroundColor: colors.success },
  statusDotOffline: { backgroundColor: colors.error },
  statusText: { color: colors.textBody, fontSize: typography.size.base },
  testBtn: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  testBtnText: {
    color: colors.textPrimary,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
});
