/**
 * Welcome Screen
 * Introduction to the app
 */

import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SectionTitle, Card, Button } from '../components';
import { colors, spacing, typography } from '../lib/theme';

export function WelcomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroContainer}>
        <Text style={styles.emoji}>🤝</Text>
        <SectionTitle
          icon=""
          title="Labor Prep Together"
          subtitle="Everything you need to prepare as a birth partner"
        />
      </View>

      <Card>
        <Text style={styles.description}>
          This app guides you through a structured interview with your partner,
          building a shared labor game plan. You'll tackle her preferences, medical
          interventions, packing the labor bag, comfort techniques, and more.
        </Text>
      </Card>

      <Card accent>
        <Text style={styles.subtitle}>How this works:</Text>
        <Text style={styles.bulletPoint}>
          📋 Go through each section together
        </Text>
        <Text style={styles.bulletPoint}>
          💬 Ask her the questions out loud
        </Text>
        <Text style={styles.bulletPoint}>
          ✍️ Write down her answers
        </Text>
        <Text style={styles.bulletPoint}>
          ✅ Build your complete game plan
        </Text>
      </Card>

      <Card>
        <Text style={styles.subtitle}>What you'll cover:</Text>
        <Text style={styles.bulletPoint}>👶 Birth Plan preferences</Text>
        <Text style={styles.bulletPoint}>🏥 Medical interventions</Text>
        <Text style={styles.bulletPoint}>🎒 Labor bag checklist</Text>
        <Text style={styles.bulletPoint}>🍽️ Food & drink preferences</Text>
        <Text style={styles.bulletPoint}>🎵 Comfort & vibes plan</Text>
      </Card>

      <View style={styles.ctaContainer}>
        <Text style={styles.ctaText}>
          Ready? Start with the Birth Plan section and sit down with your partner.
        </Text>
        <Button label="Get Started →" onPress={() => {}} fullWidth />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          This app works completely offline. All your data is stored on your phone — never sent to the cloud.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  heroContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  description: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  subtitle: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    fontFamily: 'SourceSans3_700Bold',
  },
  bulletPoint: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginLeft: spacing.md,
    lineHeight: 20,
  },
  ctaContainer: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  ctaText: {
    ...typography.bodyLarge,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
