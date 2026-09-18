import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp, useColors } from '@/lib/AppContext';
import { StatCard } from '@/components/StatCard';
import { EmptyState } from '@/components/EmptyState';
import { formatMoney, formatTotalsByCurrency, getRemainingAmount, getTotalPaid, daysSince } from '@/lib/utils';
import { getEmptyStateMessage } from '@/lib/humor';
import { Debt, DebtDirection } from '@/lib/types';
import { Crown, Clock } from 'lucide-react-native';

export default function StatsScreen() {
  const { state, debts, colors } = useApp();
  const [direction, setDirection] = useState<DebtDirection>('owed_to_me');
  const isIOwe = direction === 'i_owe';

  const stats = useMemo(() => {
    const directionDebts = debts.filter((debt) =>
      direction === 'i_owe' ? debt.direction === 'i_owe' : debt.direction !== 'i_owe'
    );
    const activeDebts = directionDebts.filter((debt) => debt.status !== 'paid' && debt.status !== 'written_off');
    const paidDebts = directionDebts.filter((debt) => debt.status === 'paid');

    const outstanding = formatTotalsByCurrency(activeDebts);
    const settled = formatTotalsByCurrency(paidDebts, (debt) => getTotalPaid(debt.payments));

    const peopleSet = new Set(activeDebts.map((d) => d.personName));
    const peopleCount = peopleSet.size;
    const totalDebts = directionDebts.length;

    // Average repayment time (for paid debts)
    const paidMoneyDebts = paidDebts.filter((d) => d.category === 'money');
    let avgRepaymentDays = 0;
    if (paidMoneyDebts.length > 0) {
      const totalDays = paidMoneyDebts.reduce((sum, d) => {
        const lastPayment = d.payments[d.payments.length - 1];
        if (lastPayment) {
          return sum + daysSince(d.dateAdded);
        }
        return sum;
      }, 0);
      avgRepaymentDays = Math.round(totalDays / paidMoneyDebts.length);
    }

    // Oldest open record stays meaningful for both money owed to the user and money the user owes.
    const longestDebt = activeDebts.reduce<Debt | null>((max, d) => {
      const days = daysSince(d.dateAdded);
      if (!max || days > daysSince(max.dateAdded)) return d;
      return max;
    }, null);

    // Currency amounts must never be compared across currencies. The highlight
    // therefore uses the user's selected default currency only.
    const personTotals: Record<string, number> = {};
    activeDebts
      .filter((d) => d.category === 'money' && d.currency === state.settings.defaultCurrency)
      .forEach((d) => {
        const remaining = getRemainingAmount(d.amount, d.payments);
        personTotals[d.personName] = (personTotals[d.personName] ?? 0) + remaining;
      });
    const largestBalance = Object.entries(personTotals).sort((a, b) => b[1] - a[1])[0];

    return {
      outstanding,
      settled,
      peopleCount,
      totalDebts,
      activeCount: activeDebts.length,
      avgRepaymentDays,
      longestDebt,
      largestBalance: largestBalance ? { name: largestBalance[0], amount: largestBalance[1] } : null,
    };
  }, [debts, direction, state.settings.defaultCurrency]);

  const currency = state.settings.defaultCurrency;
  const emptyMsg = getEmptyStateMessage();

  if (debts.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
        <ScrollView contentContainerStyle={{ flex: 1 }}>
          <EmptyState title={emptyMsg.title} subtitle={emptyMsg.subtitle} emoji="📊" colors={colors} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: colors.text }]}>Statistics</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          A clear view of both sides of your ledger.
        </Text>

        <View style={[styles.directionSwitch, { backgroundColor: colors.bgTertiary, borderColor: colors.border }]}>
          <TouchableOpacity onPress={() => setDirection('owed_to_me')} style={[styles.directionOption, direction === 'owed_to_me' && { backgroundColor: colors.card }]}>
            <Text style={[styles.directionText, { color: direction === 'owed_to_me' ? colors.primary : colors.textSecondary }]}>Owed to me</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setDirection('i_owe')} style={[styles.directionOption, direction === 'i_owe' && { backgroundColor: colors.card }]}>
            <Text style={[styles.directionText, { color: direction === 'i_owe' ? colors.primary : colors.textSecondary }]}>I owe</Text>
          </TouchableOpacity>
        </View>

        {/* Main stat cards */}
        <Text style={[styles.groupTitle, { color: colors.textSecondary }]}>Overview</Text>
        <View style={styles.statsRow}>
          <StatCard
            label={isIOwe ? 'Total I Owe' : 'Owed to Me'}
            value={stats.outstanding}
            emoji="💸"
            colors={colors}
            accentColor={colors.danger}
          />
          <StatCard
            label={isIOwe ? 'Paid by Me' : 'Recovered'}
            value={stats.settled}
            emoji="💰"
            colors={colors}
            accentColor={colors.success}
          />
        </View>

        <View style={styles.statsRow}>
          <StatCard
            label={isIOwe ? 'People I Owe' : 'People Who Owe'}
            value={stats.peopleCount}
            emoji="🧑"
            colors={colors}
          />
          <StatCard
            label="All Records"
            value={stats.totalDebts}
            emoji="📋"
            colors={colors}
          />
        </View>

        <View style={styles.statsRow}>
          <StatCard
            label="Avg Settlement"
            value={stats.avgRepaymentDays > 0 ? `${stats.avgRepaymentDays}d` : '—'}
            emoji="⏱️"
            colors={colors}
          />
          <StatCard
            label="Open Records"
            value={stats.activeCount}
            emoji="🔥"
            colors={colors}
            accentColor={colors.warning}
          />
        </View>

        {/* Longest outstanding */}
        <Text style={[styles.groupTitle, { color: colors.textSecondary }]}>Highlights</Text>
        {stats.longestDebt && (
          <View style={[styles.highlightCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.highlightHeader}>
              <Clock size={20} color={colors.warning} strokeWidth={2.5} />
              <Text style={[styles.highlightLabel, { color: colors.textSecondary }]}>
                Oldest Open Record
              </Text>
            </View>
            <Text style={[styles.highlightName, { color: colors.text }]}>
              {stats.longestDebt.personName}
            </Text>
            <Text style={[styles.highlightValue, { color: colors.text }]}>
              {stats.longestDebt.category === 'money'
                ? formatMoney(getRemainingAmount(stats.longestDebt.amount, stats.longestDebt.payments), stats.longestDebt.currency)
                : stats.longestDebt.description}
            </Text>
            <Text style={[styles.highlightSub, { color: colors.textTertiary }]}>
              {daysSince(stats.longestDebt.dateAdded)} days and counting...
            </Text>
          </View>
        )}

        {stats.largestBalance && (
          <View style={[styles.highlightCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.highlightHeader}>
              <Crown size={20} color={colors.accent} strokeWidth={2.5} />
              <Text style={[styles.highlightLabel, { color: colors.textSecondary }]}>
                Largest {currency} Balance
              </Text>
            </View>
            <Text style={[styles.highlightName, { color: colors.text }]}>
              {stats.largestBalance.name}
            </Text>
            <Text style={[styles.highlightValue, { color: colors.accent }]}>
              {formatMoney(stats.largestBalance.amount, currency)} {isIOwe ? 'to settle' : 'outstanding'}
            </Text>
            <Text style={[styles.highlightSub, { color: colors.textTertiary, fontStyle: 'italic' }]}>
              Based on your default display currency.
            </Text>
          </View>
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
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 28,
    lineHeight: 35,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
    marginBottom: 20,
  },
  directionSwitch: { flexDirection: 'row', borderWidth: 1, borderRadius: 14, padding: 4, marginBottom: 8 },
  directionOption: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10 },
  directionText: { fontFamily: 'Outfit_700Bold', fontSize: 13 },
  groupTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 14,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  highlightCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  highlightLabel: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  highlightName: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 22,
    marginBottom: 4,
  },
  highlightValue: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    marginBottom: 5,
  },
  highlightSub: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
});
