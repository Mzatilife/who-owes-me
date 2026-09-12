import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp, useColors } from '@/lib/AppContext';
import { Achievement } from '@/lib/types';

function AchievementCard({ achievement, colors }: { achievement: Achievement; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[styles.card, { backgroundColor: achievement.unlocked ? colors.card : colors.bgTertiary, borderColor: colors.border, opacity: achievement.unlocked ? 1 : 0.62 }]}>
      <View style={[styles.iconBox, { backgroundColor: achievement.unlocked ? colors.primaryLight : colors.bgSecondary }]}>
        <Text style={styles.icon}>{achievement.icon}</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{achievement.title}</Text>
        <Text style={[styles.desc, { color: colors.textSecondary }]}>{achievement.description}</Text>
      </View>
      {achievement.unlocked && (
        <View style={[styles.checkBadge, { backgroundColor: colors.success + '18' }]}>
          <Text style={[styles.checkIcon, { color: colors.success }]}>✓</Text>
        </View>
      )}
    </View>
  );
}

export default function AchievementsScreen() {
  const { state, colors } = useApp();
  const unlocked = state.achievements.filter((a) => a.unlocked);
  const locked = state.achievements.filter((a) => !a.unlocked);
  const progress = state.achievements.length ? Math.round((unlocked.length / state.achievements.length) * 100) : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: colors.text }]}>Achievements</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{unlocked.length} of {state.achievements.length} unlocked. Flex accordingly.</Text>

        <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>COLLECTION PROGRESS</Text>
            <Text style={[styles.progressValue, { color: colors.primary }]}>{progress}%</Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: colors.bgTertiary }]}>
            <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${progress}%` }]} />
          </View>
        </View>

        {unlocked.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Unlocked</Text>
            {unlocked.map((achievement) => <AchievementCard key={achievement.id} achievement={achievement} colors={colors} />)}
          </>
        )}

        {locked.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Locked</Text>
            {locked.map((achievement) => <AchievementCard key={achievement.id} achievement={achievement} colors={colors} />)}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 12 },
  title: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 28, lineHeight: 35, marginBottom: 4 },
  subtitle: { fontFamily: 'Outfit_400Regular', fontSize: 15, marginBottom: 16 },
  progressCard: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 10 },
  progressHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 },
  progressLabel: { fontFamily: 'Outfit_700Bold', fontSize: 11, letterSpacing: 0.75 },
  progressValue: { fontFamily: 'Outfit_700Bold', fontSize: 14 },
  progressTrack: { height: 8, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },
  sectionTitle: { fontFamily: 'Outfit_700Bold', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginTop: 14 },
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 8 },
  iconBox: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  icon: { fontFamily: 'Outfit_400Regular', fontSize: 26 },
  info: { flex: 1, minWidth: 0 },
  cardTitle: { fontFamily: 'Outfit_700Bold', fontSize: 16, marginBottom: 2 },
  desc: { fontFamily: 'Outfit_400Regular', fontSize: 13, lineHeight: 18 },
  checkBadge: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  checkIcon: { fontFamily: 'Outfit_700Bold', fontSize: 16 },
});
