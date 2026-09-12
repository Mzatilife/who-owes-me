import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useApp, useColors } from '@/lib/AppContext';
import { Avatar } from '@/components/Avatar';
import { EmptyState } from '@/components/EmptyState';
import { formatMoney, getRemainingAmount, getAvatarColor } from '@/lib/utils';
import { Search as SearchIcon, X, ChevronRight } from 'lucide-react-native';

export default function SearchScreen() {
  const { debts, colors } = useApp();
  const router = useRouter();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const matching = debts.filter((d) => d.personName.toLowerCase().includes(q));
    const grouped: Record<string, typeof debts> = {};
    matching.forEach((d) => {
      if (!grouped[d.personName]) grouped[d.personName] = [];
      grouped[d.personName].push(d);
    });
    return Object.entries(grouped).map(([name, personDebts]) => {
      const totalMoney = personDebts
        .filter((d) => d.category === 'money' && d.status !== 'paid' && d.status !== 'written_off')
        .reduce((sum, d) => sum + getRemainingAmount(d.amount, d.payments), 0);
      const activeItems = personDebts.filter((d) => d.status !== 'paid' && d.status !== 'written_off');
      return { name, debts: personDebts, totalMoney, activeItems };
    });
  }, [query, debts]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <X size={24} color={colors.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Search</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SearchIcon size={20} color={colors.textTertiary} strokeWidth={2.5} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search for a person..."
            placeholderTextColor={colors.textTertiary}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <X size={18} color={colors.textTertiary} strokeWidth={2.5} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {query.trim() && results.length === 0 && (
          <EmptyState
            title="No results found."
            subtitle={`Nobody named "${query}" owes you anything. Either they're clear or you misspelled it.`}
            emoji="🔍"
            colors={colors}
          />
        )}

        {!query.trim() && (
          <EmptyState
            title="Search your debtors."
            subtitle="Type a name to see everything they owe you. Knowledge is power."
            emoji="🕵️"
            colors={colors}
          />
        )}

        {results.map((result) => (
          <View key={result.name} style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.resultHeader}>
              <Avatar name={result.name} size={44} colors={colors} />
              <View style={styles.resultInfo}>
                <Text style={[styles.resultName, { color: colors.text }]}>{result.name}</Text>
                <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
                  {result.activeItems.length} active {result.activeItems.length === 1 ? 'debt' : 'debts'}
                </Text>
              </View>
            </View>

            {/* List all debts */}
            {result.activeItems.map((d) => (
              <View key={d.id} style={styles.debtItem}>
                <Text style={styles.debtBullet}>•</Text>
                <Text style={[styles.debtDesc, { color: colors.text }]}>
                  {d.category === 'money'
                    ? formatMoney(getRemainingAmount(d.amount, d.payments), d.currency)
                    : d.description}
                </Text>
                <Text style={[styles.debtStatus, { color: colors.textTertiary }]}>
                  {d.status === 'partial' ? '(partial)' : ''}
                </Text>
              </View>
            ))}

            {result.totalMoney > 0 && (
              <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
                <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total money owed</Text>
                <Text style={[styles.totalValue, { color: colors.text }]}>
                  {formatMoney(result.totalMoney, 'MWK')}
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={() => router.push(`/debt/${result.debts[0].id}`)}
              style={styles.viewDetailsBtn}
            >
              <Text style={[styles.viewDetailsText, { color: colors.primary }]}>View details</Text>
              <ChevronRight size={16} color={colors.primary} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  searchContainer: {
    padding: 20,
    paddingBottom: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 12,
  },
  resultCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  resultInfo: {
    marginLeft: 12,
    flex: 1,
  },
  resultName: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  resultCount: {
    fontSize: 13,
    fontWeight: '500',
  },
  debtItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 6,
  },
  debtBullet: {
    fontSize: 16,
    color: '#999',
  },
  debtDesc: {
    fontSize: 15,
    fontWeight: '600',
  },
  debtStatus: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 10,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 12,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
