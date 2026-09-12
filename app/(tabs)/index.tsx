import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useApp, useColors } from '@/lib/AppContext';
import { Debt } from '@/lib/types';
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

  const totalOwed = activeDebts
    .filter((d) => d.category === 'money')
    .reduce((sum, d) => sum + getRemainingAmount(d.amount, d.payments), 0);

  const peopleCount = new Set(activeDebts.map((d) => d.personName)).size;
  const overdueDebts = activeDebts.filter((d) => {
    const status = computeStatus(d.dueDate, d.dateAdded);
    return status !== 'fresh' && status !== 'remembering';
  });
  const overdueAmount = overdueDebts
    .filter((d) => d.category === 'money')
    .reduce((sum, d) => sum + getRemainingAmount(d.amount, d.payments), 0);
  const thingsOwed = activeDebts.filter((d) => d.category !== 'money').length;

  const sortedUrgent = [...activeDebts].sort((a, b) => {
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
        {/* Greeting */}
        <View style={styles.greetingSection}>
          <Text style={[styles.greeting, { color: colors.text }]}>{greeting}</Text>
          <Text style={[styles.greetingSub, { color: colors.textSecondary }]}>{subtitle}</Text>
        </View>

        {/* Total Owed Hero */}
        <View style={[styles.heroCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.heroLabel, { color: colors.textSecondary }]}>YOU ARE OWED</Text>
          <Text style={[styles.heroAmount, { color: colors.text }]}>
            {formatMoney(totalOwed, state.settings.defaultCurrency)}
          </Text>
          <View style={styles.heroStats}>
            <View style={styles.heroStatItem}>
              <Text style={[styles.heroStatValue, { color: colors.text }]}>{peopleCount}</Text>
              <Text style={[styles.heroStatLabel, { color: colors.textSecondary }]}>
                {peopleCount === 1 ? 'person' : 'people'}
              </Text>
            </View>
            <View style={[styles.heroDivider, { backgroundColor: colors.border }]} />
            <View style={styles.heroStatItem}>
              <Text style={[styles.heroStatValue, { color: overdueDebts.length > 0 ? colors.danger : colors.text }]}>
                {overdueDebts.length}
              </Text>
              <Text style={[styles.heroStatLabel, { color: colors.textSecondary }]}>overdue</Text>
            </View>
            <View style={[styles.heroDivider, { backgroundColor: colors.border }]} />
            <View style={styles.heroStatItem}>
              <Text style={[styles.heroStatValue, { color: colors.text }]}>{thingsOwed}</Text>
              <Text style={[styles.heroStatLabel, { color: colors.textSecondary }]}>things</Text>
            </View>
          </View>
        </View>

        {/* Quick stats row */}
        {activeDebts.length > 0 && (
          <View style={styles.quickStatsRow}>
            <View style={[styles.quickStat, { backgroundColor: colors.card }]}>
              <TrendingUp size={18} color={colors.success} strokeWidth={2.5} />
              <Text style={[styles.quickStatValue, { color: colors.text }]}>
                {formatMoney(overdueAmount, state.settings.defaultCurrency)}
              </Text>
              <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>overdue</Text>
            </View>
            <View style={[styles.quickStat, { backgroundColor: colors.card }]}>
              <Package size={18} color={colors.accent} strokeWidth={2.5} />
              <Text style={[styles.quickStatValue, { color: colors.text }]}>{thingsOwed}</Text>
              <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>items owed</Text>
            </View>
          </View>
        )}

        {/* Add Debt Button */}
        <TouchableOpacity
          onPress={() => router.push('/add-debt')}
          activeOpacity={0.85}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
        >
          <Plus size={22} color="#FFF" strokeWidth={3} />
          <Text style={styles.addBtnText}>Add Debt</Text>
        </TouchableOpacity>

        {/* Debts list or empty state */}
        {activeDebts.length === 0 ? (
          <EmptyState title={emptyMsg.title} subtitle={emptyMsg.subtitle} emoji="🕊️" colors={colors} />
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {activeDebts.length > 5 ? 'Most Urgent Cases' : 'Active Debts'}
              </Text>
              {activeDebts.length > 5 && (
                <Text style={[styles.sectionSub, { color: colors.textTertiary }]}>
                  {getManyDebtsMessage()}
                </Text>
              )}
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

            {sortedUrgent.length > 5 && (
              <TouchableOpacity
                onPress={() => router.push('/people')}
                style={[styles.seeAllBtn, { borderColor: colors.border }]}
              >
                <Text style={[styles.seeAllText, { color: colors.primary }]}>
                  See all {activeDebts.length} debts
                </Text>
              </TouchableOpacity>
            )}
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
    paddingTop: 12,
  },
  greetingSection: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  greetingSub: {
    fontSize: 15,
  },
  heroCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  heroAmount: {
    fontSize: 44,
    fontWeight: '900',
    marginBottom: 20,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatValue: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 2,
  },
  heroStatLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  heroDivider: {
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
    alignItems: 'center',
    gap: 4,
  },
  quickStatValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  quickStatLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    marginBottom: 24,
  },
  addBtnText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '800',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  sectionSub: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  seeAllBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    marginTop: 4,
    marginBottom: 20,
  },
  seeAllText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
