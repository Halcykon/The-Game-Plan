/**
 * Chip Component
 * Choice buttons for single-select or multi-select options
 */

import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../lib/theme';

interface ChipProps {
  label: string;
  onPress: () => void;
  selected?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Chip({
  label,
  onPress,
  selected = false,
  disabled = false,
  style,
}: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.chip,
        selected && styles.chipSelected,
        disabled && styles.chipDisabled,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          selected && styles.labelSelected,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: borderRadius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipDisabled: {
    opacity: 0.5,
  },
  label: {
    ...typography.labelMedium,
    color: colors.textSecondary,
    fontFamily: 'SourceSans3_600SemiBold',
  },
  labelSelected: {
    color: colors.surfaceContainerLowest,
  },
});
