import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useApp, useColors } from '@/lib/AppContext';
import { Achievement } from '@/lib/types';

function AchievementCard({ achievement, colors }: { achievement: Achievement; colors: ReturnType<typeof useColors> }) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: achievement.unlocked ? colors.card : colors.bgTertiary,
          borderColor: achievement.unlocked ? colors.accent + '60' : 'transparent',
          opacity: achievement.unlocked ? 1 : 0.55,
        },
      ]}
    >
      <View
        style={[
          styles.iconBox,
          { backgroundColor: achievement.unlocked ? colors.accent + '20' : colors.bgSecondary },
        ]}
      >
        <Text style={styles.icon}>{achievement.icon}</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{achievement.title}</Text>
        <Text style={[styles.desc, { color: colors.textSecondary }]}>{achievement.description}</Text>
      </View>
      {achievement.unlocked && <Text style={styles.checkIcon}>✅</Text>}
    </View>
  );
}

export default function AchievementsScreen() {
  const { state, colors } = useApp();
  const unlocked = state.achievements.filter((a) => a.unlocked);
  const locked = state.achievements.filter((a) => !a.unlocked);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: colors.text }]}>Achievements</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {unlocked.length} of {state.achievements.length} unlocked. Flex accordingly.
        </Text>

        {/* Progress bar */}
        <View style={[styles.progressTrack, { backgroundColor: colors.bgTertiary }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.accent,
                width: `${(unlocked.length / state.achievements.length) * 100}%`,
              },
            ]}
          />
        </View>

        {unlocked.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Unlocked</Text>
            {unlocked.map((a) => (
              <AchievementCard key={a.id} achievement={a} colors={colors} />
            ))}
          </>
        )}

        {locked.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Locked</Text>
            {locked.map((a) => (
              <AchievementCard key={a.id} achievement={a} colors={colors} />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 16,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    marginBottom: 24,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  icon: {
    fontSize: 26,
  },
  info: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
  },
  checkIcon: {
    fontSize: 20,
    marginLeft: 8,
  },
});
