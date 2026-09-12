import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Avatar } from './Avatar';
import { ThemeColors } from '@/lib/theme';
import { Debt } from '@/lib/types';
import { formatMoney, getRemainingAmount, relativeDate, daysOverdue } from '@/lib/utils';
import { computeStatus, getStatusEmoji, getStatusColor, getStatusMessage } from '@/lib/humor';
import { Bell } from 'lucide-react-native';

interface DebtCardProps {
  debt: Debt;
  colors: ThemeColors;
  onPress: () => void;
  onRemind: () => void;
  index?: number;
}

export function DebtCard({ debt, colors, onPress, onRemind, index = 0 }: DebtCardProps) {
  const status = computeStatus(debt.dueDate, debt.dateAdded);
  const statusColor = getStatusColor(status);
  const statusEmoji = getStatusEmoji(status);
  const seed = index + (debt.id.charCodeAt(0) || 0);
  const statusMsg = getStatusMessage(status, seed);
  const isMoney = debt.category === 'money';
  const remaining = getRemainingAmount(debt.amount, debt.payments);
  const overdueDays = daysOverdue(debt.dueDate, debt.dateAdded);
  const isPaid = debt.status === 'paid';
  const isWrittenOff = debt.status === 'written_off';

  const displayAmount = isMoney
    ? remaining < debt.amount
      ? `${formatMoney(remaining, debt.currency)} / ${formatMoney(debt.amount, debt.currency)}`
      : formatMoney(debt.amount, debt.currency)
    : debt.description;

  const borderColor = isPaid ? colors.border : isWrittenOff ? colors.border : statusColor + '40';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor,
          shadowColor: colors.shadow,
        },
        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.leftSection}>
          <Avatar name={debt.personName} size={48} colors={colors} />
          <View style={styles.info}>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
              {debt.personName}
            </Text>
            <Text style={[styles.amount, { color: isPaid ? colors.success : isWrittenOff ? colors.textTertiary : colors.text }]}>
              {displayAmount}
            </Text>
          </View>
        </View>
        {!isPaid && !isWrittenOff && (
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '18' }]}>
            <Text style={styles.statusBadgeEmoji}>{statusEmoji}</Text>
          </View>
        )}
        {isPaid && <Text style={styles.paidEmoji}>✅</Text>}
        {isWrittenOff && <Text style={styles.paidEmoji}>☠️</Text>}
      </View>

      {!isPaid && !isWrittenOff && (
        <Text style={[styles.statusMsg, { color: statusColor }]} numberOfLines={1}>
          {statusMsg}
        </Text>
      )}
      {isPaid && (
        <Text style={[styles.statusMsg, { color: colors.success }]}>Debt settled. We witness a miracle.</Text>
      )}
      {isWrittenOff && (
        <Text style={[styles.statusMsg, { color: colors.textTertiary }]}>Written off. RIP.</Text>
      )}

      <View style={styles.bottomRow}>
        <Text style={[styles.dueText, { color: colors.textSecondary }]}>
          {relativeDate(debt.dueDate, debt.dateAdded)}
        </Text>
        {!isPaid && !isWrittenOff && (
          <TouchableOpacity
            onPress={onRemind}
            activeOpacity={0.8}
            style={[styles.remindBtn, { backgroundColor: colors.primary }]}
          >
            <Bell size={14} color="#FFF" strokeWidth={2.5} />
            <Text style={styles.remindBtnText}>Remind</Text>
          </TouchableOpacity>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  info: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  amount: {
    fontSize: 20,
    fontWeight: '800',
  },
  statusBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadgeEmoji: {
    fontSize: 16,
  },
  paidEmoji: {
    fontSize: 22,
  },
  statusMsg: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 10,
    fontWeight: '500',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  dueText: {
    fontSize: 13,
    fontWeight: '500',
  },
  remindBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
  },
  remindBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
