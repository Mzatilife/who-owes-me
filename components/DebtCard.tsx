import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Avatar } from './Avatar';
import { ThemeColors } from '@/lib/theme';
import { Debt } from '@/lib/types';
import { formatMoney, getRemainingAmount, getTotalPaid, relativeDate } from '@/lib/utils';
import { computeStatus, getStatusEmoji, getStatusColor } from '@/lib/humor';
import { Bell, CalendarDays, ChevronRight } from 'lucide-react-native';

interface DebtCardProps {
  debt: Debt;
  colors: ThemeColors;
  onPress: () => void;
  onRemind: () => void;
  index?: number;
}

export function DebtCard({ debt, colors, onPress, onRemind }: DebtCardProps) {
  const status = computeStatus(debt.dueDate, debt.dateAdded);
  const statusColor = getStatusColor(status);
  const isMoney = debt.category === 'money';
  const remaining = getRemainingAmount(debt.amount, debt.payments);
  const totalPaid = getTotalPaid(debt.payments);
  const isPaid = debt.status === 'paid';
  const isWrittenOff = debt.status === 'written_off';
  const isInactive = isPaid || isWrittenOff;
  const dueLabel = debt.dueDate ? relativeDate(debt.dueDate, debt.dateAdded) : 'No due date set';
  const displayAmount = isMoney ? formatMoney(remaining, debt.currency) : debt.description;
  const statusLabel = isPaid ? 'Paid' : isWrittenOff ? 'Written off' : getStatusEmoji(status);
  const progress = isMoney && debt.amount > 0 ? Math.min(totalPaid / debt.amount, 1) : 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow },
        pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
      ]}
    >
      <LinearGradient
        colors={[isInactive ? colors.bgTertiary : statusColor + '24', colors.card]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.9 }}
        style={styles.gradient}
      >
        <View style={[styles.decorativeOrb, { backgroundColor: (isInactive ? colors.textTertiary : statusColor) + '14' }]} />
        <View style={styles.content}>
          <View style={styles.topRow}>
          <View style={styles.personBlock}>
            <Avatar name={debt.personName} size={46} colors={colors} />
            <View style={styles.personCopy}>
              <Text style={[styles.category, { color: colors.textTertiary }]}>{debt.category} debt</Text>
              <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{debt.personName}</Text>
            </View>
          </View>
          <ChevronRight size={19} color={colors.textTertiary} strokeWidth={2.5} />
          </View>

          <View style={[styles.amountPanel, { backgroundColor: colors.card + 'D9', borderColor: colors.border }]}>
          <View style={styles.amountCopy}>
            <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>{isMoney ? 'OUTSTANDING' : 'OWED TO YOU'}</Text>
            <Text style={[styles.description, { color: colors.text }]} numberOfLines={1}>{debt.description}</Text>
          </View>
          <Text style={[styles.amount, { color: isPaid ? colors.success : isWrittenOff ? colors.textTertiary : colors.text }]} numberOfLines={1}>
            {displayAmount}
          </Text>
          </View>

          {isMoney && totalPaid > 0 && !isWrittenOff && (
            <View style={styles.progressSection}>
              <View style={styles.progressLabels}>
                <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>REPAYMENT PROGRESS</Text>
                <Text style={[styles.progressValue, { color: colors.success }]}>{Math.round(progress * 100)}%</Text>
              </View>
              <View style={[styles.progressTrack, { backgroundColor: colors.bgTertiary }]}>
                <View style={[styles.progressFill, { backgroundColor: colors.success, width: `${progress * 100}%` }]} />
              </View>
            </View>
          )}

          <View style={styles.metaRow}>
          <View style={styles.dueMeta}>
            <CalendarDays size={15} color={colors.textTertiary} strokeWidth={2.4} />
            <Text style={[styles.dueText, { color: colors.textSecondary }]}>{dueLabel}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: (isInactive ? colors.textTertiary : statusColor) + '18' }]}>
            <Text style={[styles.statusBadgeText, { color: isInactive ? colors.textTertiary : statusColor }]}>{statusLabel}</Text>
          </View>
          </View>

          {!isInactive && (
            <TouchableOpacity onPress={onRemind} activeOpacity={0.8} style={[styles.remindBtn, { backgroundColor: colors.primary }]}>
              <Bell size={15} color="#FFFFFF" strokeWidth={2.7} />
              <Text style={styles.remindBtnText}>Send a friendly reminder</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 22, borderWidth: 1, marginBottom: 14, overflow: 'hidden', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 14, elevation: 5 },
  gradient: { overflow: 'hidden' },
  decorativeOrb: { position: 'absolute', width: 150, height: 150, borderRadius: 75, right: -42, top: -66 },
  content: { padding: 18 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  personBlock: { flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0 },
  personCopy: { marginLeft: 12, flex: 1, minWidth: 0 },
  category: { fontFamily: 'Outfit_600SemiBold', fontSize: 11, letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 2 },
  name: { fontFamily: 'Outfit_700Bold', fontSize: 17, lineHeight: 22 },
  amountPanel: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 13, marginTop: 17, borderWidth: 1 },
  amountCopy: { flex: 1, paddingRight: 10, minWidth: 0 },
  amountLabel: { fontFamily: 'Outfit_700Bold', fontSize: 10, letterSpacing: 0.8, marginBottom: 2 },
  description: { fontFamily: 'Outfit_600SemiBold', fontSize: 14, lineHeight: 19 },
  amount: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20 },
  progressSection: { marginTop: 14 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontFamily: 'Outfit_700Bold', fontSize: 10, letterSpacing: 0.75 },
  progressValue: { fontFamily: 'Outfit_700Bold', fontSize: 11 },
  progressTrack: { height: 6, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, gap: 8 },
  dueMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 },
  dueText: { fontFamily: 'Outfit_600SemiBold', fontSize: 12, flexShrink: 1 },
  statusBadge: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  statusBadgeText: { fontFamily: 'Outfit_700Bold', fontSize: 11 },
  remindBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 13, gap: 7, marginTop: 16 },
  remindBtnText: { color: '#FFFFFF', fontFamily: 'Outfit_700Bold', fontSize: 13 },
});
