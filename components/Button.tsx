/**
 * Button Component
 * Primary, secondary, tertiary variants following Serene Navigator design
 */

import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle, type StyleProp } from 'react-native';
import { buttonStyles, colors, spacing, typography, borderRadius, shadows } from '../lib/theme';

interface ButtonProps {
  onPress: () => void;
  label: string;
  variant?: 'primary' | 'secondary' | 'tertiary';
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Button({
  onPress,
  label,
  variant = 'primary',
  disabled = false,
  size = 'md',
  fullWidth = false,
  style,
  testID,
}: ButtonProps) {
  const baseStyle = [
    styles.button,
    styles[variant],
    size === 'sm' ? styles.sizeSm : null,
    size === 'lg' ? styles.sizeLg : null,
    fullWidth ? styles.fullWidth : null,
    disabled ? styles.disabled : null,
    style,
  ];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [...baseStyle, pressed && !disabled ? styles.pressed : null]}
      testID={testID}
    >
      <Text style={[styles.label, styles[`label${variant}`]]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },

  // Variants
  primary: {
    backgroundColor: buttonStyles.primary.backgroundColor,
    ...shadows.md,
  },
  secondary: {
    backgroundColor: buttonStyles.secondary.backgroundColor,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tertiary: {
    backgroundColor: 'transparent',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },

  // Sizes
  sizeSm: {
    minHeight: 36,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  sizeLg: {
    minHeight: 56,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
  },

  // Text
  label: {
    ...typography.labelLarge,
    fontFamily: 'SourceSans3_700Bold',
  },
  labelprimary: {
    color: colors.surfaceContainerLowest,
  },
  labelsecondary: {
    color: colors.primary,
  },
  labeltertiary: {
    color: colors.primary,
  },
});
