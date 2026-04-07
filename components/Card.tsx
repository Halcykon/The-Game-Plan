/**
 * Card Component
 * Wrapper for content with soft shadows and no borders
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { cardStyles, spacing, borderRadius, shadows, colors } from '../lib/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  accent?: boolean; // Highlight with accent border
  warning?: boolean; // Warning state
}

export function Card({ children, style, accent, warning }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        accent && styles.accent,
        warning && styles.warning,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  accent: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  warning: {
    backgroundColor: colors.warningLight,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
});
