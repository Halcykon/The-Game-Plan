/**
 * SectionTitle Component
 * Screen header with icon and description
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../lib/theme';

interface SectionTitleProps {
  icon: string;
  title: string;
  subtitle?: string;
}

export function SectionTitle({
  icon,
  title,
  subtitle,
}: SectionTitleProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xxl,
  },
  icon: {
    fontSize: 32,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.displaySmall,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    fontFamily: 'Fraunces_900Black',
  },
  subtitle: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    lineHeight: 24,
    fontFamily: 'SourceSans3_400Regular',
  },
});
