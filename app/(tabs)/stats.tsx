import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp, useColors } from '@/lib/AppContext';
import { StatCard } from '@/components/StatCard';
import { EmptyState } from '@/components/EmptyState';
import { formatMoney, getRemainingAmount, getTotalPaid, daysSince, getCurrencySymbol } from '@/lib/utils';
import { computeStatus, getBiggestOffenderMessage, getMostReliableMessage, getEmptyStateMessage } from '@/lib/humor';
import { Debt } from '@/lib/types';
import { Crown, ShieldCheck, Clock, TrendingUp, Wallet, Users, Receipt, Timer } from 'lucide-react-native';

export default function StatsScreen() {
  const { state, debts, activeDebts, paidDebts, colors } = useApp();

  const stats = useMemo(() => {
    const moneyDebts = debts.filter((d) => d.category === 'money');
    const totalOwed = activeDebts
      .filter((d) => d.category === 'money')
      .reduce((sum, d) => sum + getRemainingAmount(d.amount, d.payments), 0);
    const totalRecovered = paidDebts
      .filter((d) => d.category === 'money')
      .reduce((sum, d) => sum + getTotalPaid(d.payments), 0);

    const peopleSet = new Set(activeDebts.map((d) => d.personName));
    const peopleCount = peopleSet.size;
    const totalDebts = debts.length;

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

    // Longest outstanding debt
    const longestDebt = activeDebts.reduce<Debt | null>((max, d) => {
      const days = daysSince(d.dateAdded);
      if (!max || days > daysSince(max.dateAdded)) return d;
      return max;
    }, null);

    // Biggest offender (most outstanding)
    const personTotals: Record<string, number> = {};
    activeDebts
      .filter((d) => d.category === 'money')
      .forEach((d) => {
        const remaining = getRemainingAmount(d.amount, d.payments);
        personTotals[d.personName] = (personTotals[d.personName] ?? 0) + remaining;
      });
    const biggestOffender = Object.entries(personTotals).sort((a, b) => b[1] - a[1])[0];

    // Most reliable (paid debts with 0 reminders)
    const personReliability: Record<string, { paid: number; total: number }> = {};
    debts.forEach((d) => {
      if (!personReliability[d.personName]) {
        personReliability[d.personName] = { paid: 0, total: 0 };
      }
      personReliability[d.personName].total++;
      if (d.status === 'paid') {
        personReliability[d.personName].paid++;
      }
    });
    const mostReliable = Object.entries(personReliability)
      .filter(([, r]) => r.total >= 2 && r.paid > 0)
      .sort((a, b) => {
        const aRatio = a[1].paid / a[1].total;
        const bRatio = b[1].paid / b[1].total;
        return bRatio - aRatio;
      })[0];

    return {
      totalOwed,
      totalRecovered,
      peopleCount,
      totalDebts,
      avgRepaymentDays,
      longestDebt,
      biggestOffender: biggestOffender ? { name: biggestOffender[0], amount: biggestOffender[1] } : null,
      mostReliable: mostReliable ? mostReliable[0] : null,
    };
  }, [debts, activeDebts, paidDebts]);

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
          The numbers don't lie. Your friends do.
        </Text>

        {/* Main stat cards */}
        <Text style={[styles.groupTitle, { color: colors.textSecondary }]}>Overview</Text>
        <View style={styles.statsRow}>
          <StatCard
            label="Total Owed"
            value={formatMoney(stats.totalOwed, currency)}
            emoji="💸"
            colors={colors}
            accentColor={colors.danger}
          />
          <StatCard
            label="Recovered"
            value={formatMoney(stats.totalRecovered, currency)}
            emoji="💰"
            colors={colors}
            accentColor={colors.success}
          />
        </View>

        <View style={styles.statsRow}>
          <StatCard
            label="Debtors"
            value={stats.peopleCount}
            emoji="🧑"
            colors={colors}
          />
          <StatCard
            label="Total Debts"
            value={stats.totalDebts}
            emoji="📋"
            colors={colors}
          />
        </View>

        <View style={styles.statsRow}>
          <StatCard
            label="Avg Repayment"
            value={stats.avgRepaymentDays > 0 ? `${stats.avgRepaymentDays}d` : '—'}
            emoji="⏱️"
            colors={colors}
          />
          <StatCard
            label="Active Debts"
            value={activeDebts.length}
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
                Longest Outstanding Debt
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

        {/* Biggest offender */}
        {stats.biggestOffender && (
          <View style={[styles.highlightCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.highlightHeader}>
              <Crown size={20} color={colors.accent} strokeWidth={2.5} />
              <Text style={[styles.highlightLabel, { color: colors.textSecondary }]}>
                Biggest Offender
              </Text>
            </View>
            <Text style={[styles.highlightName, { color: colors.text }]}>
              {stats.biggestOffender.name}
            </Text>
            <Text style={[styles.highlightValue, { color: colors.accent }]}>
              {formatMoney(stats.biggestOffender.amount, currency)} outstanding
            </Text>
            <Text style={[styles.highlightSub, { color: colors.textTertiary, fontStyle: 'italic' }]}>
              {getBiggestOffenderMessage(stats.biggestOffender.name)}
            </Text>
          </View>
        )}

        {/* Most reliable */}
        {stats.mostReliable && (
          <View style={[styles.highlightCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.highlightHeader}>
              <ShieldCheck size={20} color={colors.success} strokeWidth={2.5} />
              <Text style={[styles.highlightLabel, { color: colors.textSecondary }]}>
                Most Reliable Debtor
              </Text>
            </View>
            <Text style={[styles.highlightName, { color: colors.text }]}>
              {stats.mostReliable}
            </Text>
            <Text style={[styles.highlightSub, { color: colors.textTertiary, fontStyle: 'italic' }]}>
              {getMostReliableMessage(stats.mostReliable)}
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
