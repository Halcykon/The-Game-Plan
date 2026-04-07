/**
 * QuestionCard Component
 * Interview-style question prompts with large, readable text
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { colors, spacing, typography } from '../lib/theme';

interface QuestionCardProps {
  question: string;
  subtitle?: string;
  description?: string;
  children: React.ReactNode;
  large?: boolean; // Even larger text for labor room use
}

export function QuestionCard({
  question,
  subtitle,
  description,
  children,
  large = false,
}: QuestionCardProps) {
  return (
    <Card>
      <Text
        style={[
          styles.question,
          large && styles.questionLarge,
        ]}
      >
        Ask her: "{question}"
      </Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {description && <Text style={styles.description}>{description}</Text>}
      <View style={{ marginTop: spacing.lg }}>
        {children}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  question: {
    ...typography.headlineSmall,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    fontFamily: 'Fraunces_900Black',
    lineHeight: 28,
  },
  questionLarge: {
    ...typography.displaySmall,
    fontSize: 32,
    lineHeight: 40,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.md,
    lineHeight: 20,
  },
});
