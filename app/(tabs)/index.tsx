import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useApp, useColors } from '@/lib/AppContext';
import { Debt, DebtDirection } from '@/lib/types';
import { DebtCard } from '@/components/DebtCard';
import { ReminderModal } from '@/components/ReminderModal';
import { Toast } from '@/components/Toast';
import { EmptyState } from '@/components/EmptyState';
import { formatMoney, getRemainingAmount, daysOverdue } from '@/lib/utils';
import { getGreeting, getGreetingSubtitle, computeStatus, getEmptyStateMessage, getManyDebtsMessage } from '@/lib/humor';
import { Plus, TrendingUp, AlertTriangle, Package } from 'lucide-react-native';

export default function HomeScreen() {
  const { state, activeDebts, colors, recordReminder, checkAchievements } = useApp();
  const router = useRouter();
  const [reminderDebt, setReminderDebt] = useState<Debt | null>(null);
  const [reminderVisible, setReminderVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({ message: '', visible: false });
  const [direction, setDirection] = useState<DebtDirection>('owed_to_me');

  const visibleDebts = activeDebts.filter((debt) =>
    direction === 'i_owe' ? debt.direction === 'i_owe' : debt.direction !== 'i_owe'
  );
  const isIOwe = direction === 'i_owe';

  const totalOwed = visibleDebts
    .filter((d) => d.category === 'money')
    .reduce((sum, d) => sum + getRemainingAmount(d.amount, d.payments), 0);

  const peopleCount = new Set(visibleDebts.map((d) => d.personName)).size;
  const overdueDebts = visibleDebts.filter((d) => {
    const status = computeStatus(d.dueDate, d.dateAdded);
    return status !== 'fresh' && status !== 'remembering';
  });
  const overdueAmount = overdueDebts
    .filter((d) => d.category === 'money')
    .reduce((sum, d) => sum + getRemainingAmount(d.amount, d.payments), 0);
  const thingsOwed = visibleDebts.filter((d) => d.category !== 'money').length;

  const sortedUrgent = [...visibleDebts].sort((a, b) => {
    const aDays = daysOverdue(a.dueDate, a.dateAdded);
    const bDays = daysOverdue(b.dueDate, b.dateAdded);
    return bDays - aDays;
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    checkAchievements();
    setTimeout(() => setRefreshing(false), 800);
  }, [checkAchievements]);

  const handleRemind = (debt: Debt) => {
    setReminderDebt(debt);
    setReminderVisible(true);
  };

  const handleReminderSent = () => {
    if (reminderDebt) {
      recordReminder(reminderDebt.id);
      checkAchievements();
      setToast({ message: 'Reminder sent! The shade has been delivered.', visible: true });
    }
    setReminderVisible(false);
  };

  const greeting = getGreeting(state.settings.userName);
  const subtitle = getGreetingSubtitle();
  const emptyMsg = getEmptyStateMessage();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.brandRow}>
          <View style={[styles.brandMark, { backgroundColor: colors.primaryLight }]}>
            <Image source={require('@/assets/images/new-logo.png')} style={styles.brandImage} />
          </View>
          <View>
            <Text style={[styles.brandName, { color: colors.text }]}>Who Owes Me?</Text>
            <Text style={[styles.brandTagline, { color: colors.textSecondary }]}>Your friendly debt ledger</Text>
          </View>
        </View>

        {/* Greeting */}
        <View style={styles.greetingSection}>
          <Text style={[styles.greeting, { color: colors.text }]}>{greeting}</Text>
          <Text style={[styles.greetingSub, { color: colors.textSecondary }]}>{subtitle}</Text>
        </View>

        <View style={[styles.directionSwitch, { backgroundColor: colors.bgTertiary, borderColor: colors.border }]}>
          <TouchableOpacity onPress={() => setDirection('owed_to_me')} style={[styles.directionOption, direction === 'owed_to_me' && { backgroundColor: colors.card }]}>
            <Text style={[styles.directionText, { color: direction === 'owed_to_me' ? colors.primary : colors.textSecondary }]}>Owed to me</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setDirection('i_owe')} style={[styles.directionOption, direction === 'i_owe' && { backgroundColor: colors.card }]}>
            <Text style={[styles.directionText, { color: direction === 'i_owe' ? colors.primary : colors.textSecondary }]}>I owe</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.ledgerSection}>
          <View style={styles.ledgerHeading}>
            <Text style={[styles.groupTitle, { color: colors.textSecondary }]}>Your Ledger</Text>
            <Text style={[styles.ledgerDate, { color: colors.textTertiary }]}>LIVE OVERVIEW</Text>
          </View>
          <LinearGradient colors={[colors.primaryDark, colors.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
            <View style={styles.heroOrb} />
            <Text style={styles.heroLabel}>{isIOwe ? 'TOTAL YOU OWE' : 'TOTAL OWED TO YOU'}</Text>
            <Text style={styles.heroAmount}>{formatMoney(totalOwed, state.settings.defaultCurrency)}</Text>
            <Text style={styles.heroCaption}>Across {peopleCount} {peopleCount === 1 ? 'person' : 'people'} in your ledger</Text>
            <View style={styles.heroStats}>
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatValue}>{visibleDebts.length}</Text>
                <Text style={styles.heroStatLabel}>open records</Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatValue}>{overdueDebts.length}</Text>
                <Text style={styles.heroStatLabel}>need attention</Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatValue}>{thingsOwed}</Text>
                <Text style={styles.heroStatLabel}>{isIOwe ? 'items to return' : 'items owed'}</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.quickStatsRow}>
            <View style={[styles.quickStat, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.quickIcon, { backgroundColor: colors.danger + '14' }]}><TrendingUp size={17} color={colors.danger} strokeWidth={2.5} /></View>
              <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>{isIOwe ? 'PAYMENT DUE' : 'OVERDUE VALUE'}</Text>
              <Text style={[styles.quickStatValue, { color: colors.text }]}>{formatMoney(overdueAmount, state.settings.defaultCurrency)}</Text>
            </View>
            <View style={[styles.quickStat, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.quickIcon, { backgroundColor: colors.accent + '16' }]}><Package size={17} color={colors.accent} strokeWidth={2.5} /></View>
              <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>NON-CASH ITEMS</Text>
              <Text style={[styles.quickStatValue, { color: colors.text }]}>{thingsOwed}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={() => router.push({ pathname: '/add-debt', params: { direction } })} activeOpacity={0.88} style={[styles.addBtn, { backgroundColor: colors.primary }]}>
          <View style={styles.addBtnIcon}><Plus size={20} color="#FFF" strokeWidth={3} /></View>
          <View><Text style={styles.addBtnText}>{isIOwe ? 'Record what I owe' : 'Add a debt'}</Text><Text style={styles.addBtnSubtext}>Keep the record straight</Text></View>
        </TouchableOpacity>

        {/* Debts list or empty state */}
        {visibleDebts.length === 0 ? (
          <EmptyState title={emptyMsg.title} subtitle={emptyMsg.subtitle} emoji="🕊️" colors={colors} />
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{isIOwe ? 'Payments to make' : 'Most urgent cases'}</Text>
                <Text style={[styles.sectionSub, { color: colors.textTertiary }]}>{visibleDebts.length > 5 ? getManyDebtsMessage() : isIOwe ? 'Stay on top of what you need to settle.' : 'Sorted by who needs a reminder first.'}</Text>
              </View>
              {sortedUrgent.length > 5 && <TouchableOpacity onPress={() => router.push('/people')}><Text style={[styles.sectionLink, { color: colors.primary }]}>See all</Text></TouchableOpacity>}
            </View>

            {sortedUrgent.slice(0, 5).map((debt, i) => (
              <DebtCard
                key={debt.id}
                debt={debt}
                colors={colors}
                index={i}
                onPress={() => router.push(`/debt/${debt.id}`)}
                onRemind={() => handleRemind(debt)}
              />
            ))}

          </>
        )}
      </ScrollView>

      <ReminderModal
        visible={reminderVisible}
        debt={reminderDebt}
        colors={colors}
        onClose={() => setReminderVisible(false)}
        onSent={handleReminderSent}
      />
      <Toast
        message={toast.message}
        visible={toast.visible}
        colors={colors}
        onHide={() => setToast({ message: '', visible: false })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  brandMark: {
    width: 42,
    height: 42,
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandImage: { width: 38, height: 38, resizeMode: 'contain' },
  brandName: { fontFamily: 'Outfit_700Bold', fontSize: 15 },
  brandTagline: { fontFamily: 'Outfit_400Regular', fontSize: 12, marginTop: 1 },
  greetingSection: {
    marginBottom: 18,
  },
  greeting: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 27,
    lineHeight: 34,
    marginBottom: 4,
  },
  greetingSub: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
    lineHeight: 21,
  },
  groupTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  directionSwitch: { flexDirection: 'row', borderWidth: 1, borderRadius: 14, padding: 4, marginBottom: 16 },
  directionOption: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10 },
  directionText: { fontFamily: 'Outfit_700Bold', fontSize: 13 },
  ledgerSection: {
    marginBottom: 20,
  },
  ledgerHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ledgerDate: { fontFamily: 'Outfit_700Bold', fontSize: 10, letterSpacing: 0.8 },
  heroCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#6E470B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 7,
    overflow: 'hidden',
  },
  heroOrb: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.08)', right: -52, top: -92,
  },
  heroLabel: {
    color: '#FFF0BE',
    fontFamily: 'Outfit_700Bold',
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  heroAmount: {
    color: '#FFFFFF',
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 38,
    marginBottom: 20,
  },
  heroCaption: { color: '#FFF0BE', fontFamily: 'Outfit_600SemiBold', fontSize: 13, marginTop: -13, marginBottom: 18 },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroStatItem: {
    flex: 1,
    alignItems: 'flex-start',
  },
  heroStatValue: {
    color: '#FFFFFF',
    fontFamily: 'Outfit_800ExtraBold',
    fontSize: 21,
    fontWeight: '800',
    marginBottom: 2,
  },
  heroStatLabel: {
    color: '#FFF0BE',
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 11,
    fontWeight: '500',
  },
  heroDivider: {
    backgroundColor: 'rgba(209, 250, 229, 0.45)',
    width: 1,
    height: 32,
  },
  quickStatsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  quickStat: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: 'flex-start',
    gap: 5,
    borderWidth: 1,
  },
  quickIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  quickStatValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 17,
    fontWeight: '800',
  },
  quickStatLabel: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 10,
    letterSpacing: 0.55,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderRadius: 16,
    gap: 10,
    paddingHorizontal: 14,
    marginBottom: 25,
  },
  addBtnIcon: { height: 36, width: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  addBtnText: {
    color: '#FFF',
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
  },
  addBtnSubtext: { color: '#FFF0BE', fontFamily: 'Outfit_400Regular', fontSize: 12, marginTop: 1 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
    lineHeight: 26,
    marginBottom: 4,
  },
  sectionSub: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 2,
    maxWidth: 245,
  },
  sectionLink: { fontFamily: 'Outfit_700Bold', fontSize: 13, paddingBottom: 2 },
  seeAllBtn: {
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 6,
    marginBottom: 20,
  },
  seeAllText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 14,
    letterSpacing: 0.1,
  },
});
