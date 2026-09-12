import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeColors } from '@/lib/theme';

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  emoji?: string;
  colors: ThemeColors;
  accentColor?: string;
}

export function StatCard({ label, value, sublabel, emoji, colors, accentColor }: StatCardProps) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      {emoji && <Text style={styles.emoji}>{emoji}</Text>}
      <Text style={[styles.value, { color: accentColor ?? colors.text }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      {sublabel && <Text style={[styles.sublabel, { color: colors.textTertiary }]}>{sublabel}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 100,
  },
  emoji: {
    fontSize: 22,
    marginBottom: 6,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  sublabel: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
});
