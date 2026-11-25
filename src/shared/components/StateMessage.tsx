import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/theme';

interface StateMessageProps {
  variant: 'loading' | 'error' | 'empty';
  message: string;
  title?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
}

export const StateMessage: React.FC<StateMessageProps> = ({
  variant,
  message,
  title,
  icon,
  actionLabel,
  onAction,
}) => {
  if (variant === 'loading') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{message}</Text>
      </View>
    );
  }

  const resolvedIcon: keyof typeof Ionicons.glyphMap =
    icon ||
    (variant === 'error' ? 'alert-circle-outline' : 'musical-notes-outline');
  const iconColor = variant === 'error' ? colors.error : colors.iconDim;

  return (
    <View style={styles.container}>
      <Ionicons name={resolvedIcon} size={48} color={iconColor} />
      {title && <Text style={styles.title}>{title}</Text>}
      <Text
        style={[
          styles.message,
          variant === 'error' && styles.errorMessage,
        ]}
      >
        {message}
      </Text>
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.actionBtn} onPress={onAction}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl + spacing.sm,
    paddingBottom: 60,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: typography.size.lg,
    marginTop: spacing.md,
  },
  title: {
    color: colors.textBody,
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  message: {
    color: colors.textMuted,
    fontSize: typography.size.base,
    marginTop: spacing.xs + 2,
    textAlign: 'center',
    lineHeight: 19,
  },
  errorMessage: {
    color: colors.error,
    fontSize: typography.size.lg,
  },
  actionBtn: {
    marginTop: spacing.md + 2,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  actionText: {
    color: colors.textPrimary,
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
  },
});
