/**
 * ProgressBar Component
 * Overall app progress indicator
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '../lib/theme';

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
}

export function ProgressBar({
  current,
  total,
  showLabel = false,
}: ProgressBarProps) {
  const percentage = (current / Math.max(total, 1)) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${percentage}%` },
          ]}
        />
      </View>
      {showLabel && (
        <View style={styles.label}>
          <Text style={styles.labelText}>
            {Math.round(percentage)}%
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  track: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
  },
  label: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  labelText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
