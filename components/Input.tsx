/**
 * Input Component
 * Text input and textarea following design system
 */

import React from 'react';
import { TextInput, View, Text, StyleSheet, ViewStyle, TextInputProps } from 'react-native';
import { colors, spacing, inputStyles, typography, borderRadius } from '../lib/theme';

interface InputComponentProps extends TextInputProps {
  label?: string;
  multiline?: boolean;
  rows?: number;
  error?: string;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  multiline = false,
  rows = 1,
  error,
  containerStyle,
  ...props
}: InputComponentProps) {
  const height = multiline ? rows * 40 : undefined;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        {...props}
        multiline={multiline}
        style={[
          styles.input,
          { height },
          error ? styles.inputError : null,
        ]}
        placeholderTextColor={colors.textTertiary}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.labelMedium,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    fontFamily: 'SourceSans3_600SemiBold',
  },
  input: {
    ...inputStyles,
    color: colors.textPrimary,
    fontFamily: 'SourceSans3_400Regular',
    fontSize: 16,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
