import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { borderRadius, colors, shadows, spacing, typography } from '../lib/theme';

export type BulkAction = {
  id: string;
  label: string;
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
};

export type SelectableCardProps = {
  selectionMode: boolean;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
  onEnterSelection?: () => void;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

type SelectionHeaderProps = {
  selecting: boolean;
  selectedCount: number;
  onSelect: () => void;
  onCancel: () => void;
  onSelectAll: () => void;
  onClear: () => void;
  allSelected: boolean;
};

type BulkActionBarProps = {
  title: string;
  actions: BulkAction[];
};

export function SelectionHeader({
  selecting,
  selectedCount,
  onSelect,
  onCancel,
  onSelectAll,
  onClear,
  allSelected,
}: SelectionHeaderProps) {
  return (
    <View style={styles.selectionHeader}>
      {selecting ? (
        <>
          <Pressable onPress={onCancel} style={styles.selectionHeaderButton}>
            <Text style={styles.selectionHeaderButtonText}>Cancel</Text>
          </Pressable>
          <Text style={styles.selectionHeaderTitle}>{selectedCount} selected</Text>
          <Pressable onPress={allSelected ? onClear : onSelectAll} style={styles.selectionHeaderButton}>
            <Text style={styles.selectionHeaderButtonText}>{allSelected ? 'Clear' : 'Select all'}</Text>
          </Pressable>
        </>
      ) : (
        <>
          <View style={styles.selectionHeaderSpacer} />
          <Text style={styles.selectionHeaderHint}>Long-press to multi-select</Text>
          <Pressable onPress={onSelect} style={styles.selectionHeaderButton}>
            <Text style={styles.selectionHeaderButtonText}>Select</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

export function BulkActionBar({ title, actions }: BulkActionBarProps) {
  return (
    <View style={styles.bulkActionBar}>
      <Text style={styles.bulkActionBarTitle}>{title}</Text>
      <View style={styles.bulkActionBarActions}>
        {actions.map((action) => (
          <Pressable
            key={action.id}
            onPress={action.onPress}
            disabled={action.disabled}
            style={[
              action.destructive ? styles.bulkActionDangerButton : styles.bulkActionButton,
              action.disabled && styles.buttonDisabled,
            ]}
          >
            <Text style={action.destructive ? styles.bulkActionDangerText : styles.bulkActionText}>{action.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export function SelectableCard({
  selectionMode,
  selected,
  onSelect,
  onOpen,
  onEnterSelection,
  style,
  children,
}: SelectableCardProps) {
  return (
    <Pressable
      onLongPress={onEnterSelection}
      onPress={selectionMode ? onSelect : onOpen}
      style={[styles.selectableCard, selected && styles.selectableCardActive, style]}
    >
      <View style={styles.selectableRow}>
        {selectionMode ? (
          <View style={[styles.selectionMark, selected && styles.selectionMarkActive]}>
            {selected ? <Text style={styles.selectionMarkText}>✓</Text> : null}
          </View>
        ) : null}
        <View style={styles.selectableContent}>{children}</View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 52,
  },
  selectionHeaderSpacer: {
    width: 72,
  },
  selectionHeaderHint: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  selectionHeaderTitle: {
    ...typography.titleMedium,
    color: colors.onSurface,
  },
  selectionHeaderButton: {
    minWidth: 72,
    paddingVertical: spacing.xs,
  },
  selectionHeaderButtonText: {
    ...typography.labelLarge,
    color: colors.primary,
  },
  bulkActionBar: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 24,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    ...shadows.lg,
  },
  bulkActionBarTitle: {
    ...typography.titleMedium,
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  bulkActionBarActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  bulkActionButton: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  bulkActionText: {
    ...typography.labelLarge,
    color: colors.primary,
  },
  bulkActionDangerButton: {
    backgroundColor: colors.errorLight,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  bulkActionDangerText: {
    ...typography.labelLarge,
    color: colors.error,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  selectableCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 24,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  selectableCardActive: {
    backgroundColor: '#edf4f1',
    borderWidth: 2,
    borderColor: colors.primaryLight,
  },
  selectableRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  selectableContent: {
    flex: 1,
  },
  selectionMark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    marginTop: 4,
  },
  selectionMarkActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectionMarkText: {
    ...typography.labelMedium,
    color: colors.surfaceContainerLowest,
  },
});
