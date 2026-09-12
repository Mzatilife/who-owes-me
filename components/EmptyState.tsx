import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeColors } from '@/lib/theme';

interface EmptyStateProps {
  title: string;
  subtitle: string;
  emoji?: string;
  colors: ThemeColors;
}

export function EmptyState({ title, subtitle, emoji = '📭', colors }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emoji: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 56,
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
