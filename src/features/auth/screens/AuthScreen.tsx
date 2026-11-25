import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography, withOpacity } from '@/theme';
import { useAuthForm } from '../hooks/useAuthForm';

export const AuthScreen: React.FC = () => {
  const form = useAuthForm();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Ionicons name="musical-notes" size={32} color={colors.primary} />
          </View>
          <Text style={styles.title}>ClassMusic</Text>
          <Text style={styles.subtitle}>
            Tu música en tu celular, siempre disponible
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Correo Electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="correo@ejemplo.com"
            placeholderTextColor={colors.textMuted}
            value={form.email}
            onChangeText={form.setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            value={form.password}
            onChangeText={form.setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.configToggle}
            onPress={form.toggleConfig}
          >
            <Ionicons
              name="server-outline"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={styles.configToggleText}>
              {form.showConfig
                ? 'Ocultar servidor'
                : 'Configurar servidor API'}
            </Text>
          </TouchableOpacity>

          {form.showConfig && (
            <View style={styles.configBox}>
              <Text style={styles.label}>URL de la API</Text>
              <TextInput
                style={styles.input}
                value={form.serverUrl}
                onChangeText={form.setServerUrl}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={form.resetServerUrl}
                style={styles.resetBtn}
              >
                <Text style={styles.resetText}>Restablecer a servidor</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[styles.loginBtn, form.loading && styles.loginBtnDisabled]}
            onPress={form.handleLogin}
            disabled={form.loading}
          >
            {form.loading ? (
              <ActivityIndicator color={colors.primaryForegroundDark} />
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
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.modal,
    padding: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: { alignItems: 'center', marginBottom: spacing.xxl },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: withOpacity(colors.primary, 0.15),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.size.hero,
    fontWeight: typography.weight.extrabold,
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: typography.size.lg,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  form: { gap: spacing.md },
  label: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.textBody,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
    fontSize: typography.size.xl,
  },
  configToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.xs,
  },
  configToggleText: {
    color: colors.textSecondary,
    fontSize: typography.size.base,
  },
  configBox: {
    backgroundColor: colors.surfaceActive,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    gap: 6,
  },
  resetBtn: { alignSelf: 'flex-start' },
  resetText: {
    color: colors.primary,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
  loginBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: {
    color: colors.primaryForegroundDark,
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
  },
});
