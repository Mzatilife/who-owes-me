import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.titleBlock}>
            <Text style={[styles.title, { color: colors.text }]}>People</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Keep your debtors close.</Text>
          </View>
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
          <Text style={[styles.groupTitle, { color: colors.textSecondary }]}>
            {activeDebts.length} Active {activeDebts.length === 1 ? 'Debt' : 'Debts'}
          </Text>
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
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleBlock: { flex: 1, paddingRight: 10 },
  title: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 28,
    lineHeight: 35,
  },
  subtitle: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    marginTop: 1,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    gap: 6,
  },
  sortBtnText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 12,
    fontWeight: '700',
  },
  sortMenu: {
    borderRadius: 16,
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
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    fontWeight: '600',
  },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  searchBtnText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
    fontWeight: '500',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  groupTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  totalCard: {
    borderRadius: 16,
    padding: 16,
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
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 15,
    fontWeight: '600',
  },
  totalValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
  },
  totalDivider: {
    height: 1,
    marginVertical: 14,
  },
});
