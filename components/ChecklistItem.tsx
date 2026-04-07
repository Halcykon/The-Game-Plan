/**
 * ChecklistItem Component
 * Item with checkbox toggle for bag packing, etc.
 */

import React from 'react';
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Card } from './Card';
import { colors, spacing, typography, borderRadius } from '../lib/theme';

interface ChecklistItemProps {
  label: string;
  checked: boolean;
  onToggle: (checked: boolean) => void;
  detail?: string; // e.g., location, tag
  disabled?: boolean;
  style?: ViewStyle;
}

export function ChecklistItem({
  label,
  checked,
  onToggle,
  detail,
  disabled = false,
  style,
}: ChecklistItemProps) {
  return (
    <Pressable
      onPress={() => !disabled && onToggle(!checked)}
      disabled={disabled}
      style={[{ opacity: disabled ? 0.5 : 1 }, style]}
    >
      <Card style={styles.card}>
        <View style={styles.content}>
          {/* Checkbox */}
          <View
            style={[
              styles.checkbox,
              checked && styles.checkboxChecked,
            ]}
          >
            {checked && <Text style={styles.checkmark}>✓</Text>}
          </View>

          {/* Text */}
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.label,
                checked && styles.labelDone,
              ]}
            >
              {label}
            </Text>
            {detail && (
              <Text style={styles.detail}>{detail}</Text>
            )}
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.surfaceContainerLowest,
    fontWeight: '800',
    fontSize: 16,
  },
  textContainer: {
    flex: 1,
    paddingVertical: spacing.xs,
  },
  label: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontFamily: 'SourceSans3_600SemiBold',
  },
  labelDone: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  detail: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    marginTop: spacing.xs,
    fontFamily: 'SourceSans3_400Regular',
  },
});
