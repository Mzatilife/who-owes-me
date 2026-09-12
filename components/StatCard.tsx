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
    padding: 14,
    borderWidth: 1,
    alignItems: 'flex-start',
    minWidth: 100,
  },
  emoji: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 20,
    marginBottom: 8,
  },
  value: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
    marginBottom: 3,
  },
  label: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
    fontWeight: '600',
  },
  sublabel: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 11,
    marginTop: 2,
  },
});
