import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useApp, useColors } from '@/lib/AppContext';
import { Debt, SortOption } from '@/lib/types';
import { DebtCard } from '@/components/DebtCard';
import { ReminderModal } from '@/components/ReminderModal';
import { EmptyState } from '@/components/EmptyState';
import { Toast } from '@/components/Toast';
import { formatMoney, getRemainingAmount } from '@/lib/utils';
import { computeStatus, getEmptyStateMessage } from '@/lib/humor';
import { ArrowUpDown, Search as SearchIcon } from 'lucide-react-native';

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'overdue', label: 'Most Overdue' },
  { id: 'highest', label: 'Highest Amount' },
  { id: 'oldest', label: 'Oldest Debt' },
  { id: 'newest', label: 'Newest Debt' },
  { id: 'name', label: 'Name' },
];

export default function PeopleScreen() {
  const { activeDebts, colors, sortDebts, recordReminder, checkAchievements } = useApp();
  const router = useRouter();
  const [sort, setSort] = useState<SortOption>('overdue');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [reminderDebt, setReminderDebt] = useState<Debt | null>(null);
  const [reminderVisible, setReminderVisible] = useState(false);
  const [toast, setToast] = useState({ message: '', visible: false });

  const sorted = useMemo(() => sortDebts(activeDebts, sort), [activeDebts, sort, sortDebts]);

  const totalOwed = activeDebts
    .filter((d) => d.category === 'money')
    .reduce((sum, d) => sum + getRemainingAmount(d.amount, d.payments), 0);

  const peopleCount = new Set(activeDebts.map((d) => d.personName)).size;

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

  const emptyMsg = getEmptyStateMessage();
  const currentSortLabel = SORT_OPTIONS.find((o) => o.id === sort)?.label ?? 'Sort';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: colors.text }]}>People Who Owe You</Text>
          <TouchableOpacity
            onPress={() => setShowSortMenu(!showSortMenu)}
            style={[styles.sortBtn, { backgroundColor: colors.bgTertiary }]}
          >
            <ArrowUpDown size={16} color={colors.text} strokeWidth={2.5} />
            <Text style={[styles.sortBtnText, { color: colors.text }]}>{currentSortLabel}</Text>
          </TouchableOpacity>
        </View>

        {showSortMenu && (
          <View style={[styles.sortMenu, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                onPress={() => {
                  setSort(opt.id);
                  setShowSortMenu(false);
                }}
                style={[
                  styles.sortOption,
                  sort === opt.id && { backgroundColor: colors.primaryLight },
                ]}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    { color: sort === opt.id ? colors.primary : colors.text },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity
          onPress={() => router.push('/search')}
          style={[styles.searchBtn, { backgroundColor: colors.bgTertiary }]}
        >
          <SearchIcon size={18} color={colors.textTertiary} strokeWidth={2.5} />
          <Text style={[styles.searchBtnText, { color: colors.textTertiary }]}>Search debtors...</Text>
        </TouchableOpacity>
      </View>

      {activeDebts.length === 0 ? (
        <ScrollView contentContainerStyle={{ flex: 1 }}>
          <EmptyState title={emptyMsg.title} subtitle={emptyMsg.subtitle} emoji="🕊️" colors={colors} />
        </ScrollView>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {sorted.map((debt, i) => (
            <DebtCard
              key={debt.id}
              debt={debt}
              colors={colors}
              index={i}
              onPress={() => router.push(`/debt/${debt.id}`)}
              onRemind={() => handleRemind(debt)}
            />
          ))}

          {/* Total at bottom */}
          <View style={[styles.totalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total Money Owed</Text>
              <Text style={[styles.totalValue, { color: colors.text }]}>
                {formatMoney(totalOwed, 'MWK')}
              </Text>
            </View>
            <View style={[styles.totalDivider, { backgroundColor: colors.border }]} />
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Active Debtors</Text>
              <Text style={[styles.totalValue, { color: colors.text }]}>{peopleCount}</Text>
            </View>
          </View>
        </ScrollView>
      )}

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
  header: {
    padding: 20,
    paddingTop: 12,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  sortBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sortMenu: {
    borderRadius: 14,
    padding: 4,
    marginBottom: 12,
    borderWidth: 1,
  },
  sortOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  sortOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 10,
  },
  searchBtnText: {
    fontSize: 15,
    fontWeight: '500',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 16,
  },
  totalCard: {
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    marginTop: 8,
    marginBottom: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  totalDivider: {
    height: 1,
    marginVertical: 14,
  },
});
