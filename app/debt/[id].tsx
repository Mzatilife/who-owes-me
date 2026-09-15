import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApp, useColors } from '@/lib/AppContext';
import { Avatar } from '@/components/Avatar';
import { ReminderModal } from '@/components/ReminderModal';
import { PaymentModal } from '@/components/PaymentModal';
import { Toast } from '@/components/Toast';
import { formatMoney, getRemainingAmount, getTotalPaid, formatDate, daysSince, daysOverdue, relativeDate } from '@/lib/utils';
import { computeStatus, getStatusEmoji, getStatusColor, getStatusMessage, computeHealth, HEALTH_INFO, getReputationScore } from '@/lib/humor';
import { Debt } from '@/lib/types';
import { X, Bell, CheckCircle, Trash2, StickyNote, Phone, Calendar } from 'lucide-react-native';

export default function DebtDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, colors, deleteDebt, recordReminder, addPayment, markAsPaid, writeOffDebt, checkAchievements } = useApp();
  const router = useRouter();

  const [reminderVisible, setReminderVisible] = useState(false);
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [toast, setToast] = useState({ message: '', visible: false });

  const debt = state.debts.find((d) => d.id === id);

  const personDebts = useMemo(() => {
    if (!debt) return [];
    return state.debts.filter(
      (d) => d.personName === debt.personName && (d.direction === 'i_owe') === (debt.direction === 'i_owe')
    );
  }, [debt, state.debts]);

  if (!debt) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: colors.text }]}>Debt not found.</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: colors.primary, fontFamily: 'Outfit_700Bold' }}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isMoney = debt.category === 'money';
  const iOwe = debt.direction === 'i_owe';
  const remaining = getRemainingAmount(debt.amount, debt.payments);
  const totalPaid = getTotalPaid(debt.payments);
  const status = computeStatus(debt.dueDate, debt.dateAdded);
  const statusColor = getStatusColor(status);
  const statusEmoji = getStatusEmoji(status);
  const statusMsg = getStatusMessage(status, debt.id.charCodeAt(0) || 0);
  const health = computeHealth(status);
  const healthInfo = HEALTH_INFO[health];
  const isPaid = debt.status === 'paid';
  const isWrittenOff = debt.status === 'written_off';
  const isInactive = isPaid || isWrittenOff;
  const overdueDays = daysOverdue(debt.dueDate, debt.dateAdded);

  // Reputation
  const personPaidCount = personDebts.filter((d) => d.status === 'paid').length;
  const reputation = getReputationScore(personPaidCount, personDebts.length);

  const handleDelete = () => {
    Alert.alert(
      'Delete this debt?',
      `Remove ${debt.personName}'s debt from your records? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteDebt(debt.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleWriteOff = () => {
    Alert.alert(
      'Write off this debt?',
      'This means you have accepted your loss. The debt will be moved to history as "written off".',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Write Off',
          style: 'destructive',
          onPress: () => {
            writeOffDebt(debt.id);
            checkAchievements();
            setToast({ message: 'Debt written off. We pour one out. 🕊️', visible: true });
          },
        },
      ]
    );
  };

  const handleReminderSent = () => {
    recordReminder(debt.id);
    checkAchievements();
    setToast({ message: 'Reminder sent! The shade has been delivered.', visible: true });
    setReminderVisible(false);
  };

  const renderStars = (count: number) => {
    return '⭐'.repeat(count) + '☆'.repeat(5 - count);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.bgTertiary }]}>
          <X size={24} color={colors.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.headerCopy}><Text style={[styles.headerTitle, { color: colors.text }]}>Debt details</Text><Text style={[styles.headerSub, { color: colors.textSecondary }]}>Keep the record straight.</Text></View>
        <TouchableOpacity onPress={handleDelete} style={[styles.backBtn, { backgroundColor: colors.danger + '12' }]}>
          <Trash2 size={22} color={colors.danger} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.groupTitle, { color: colors.textSecondary }]}>Debt record</Text>
        <View style={[styles.personCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.personHeader}>
            <Avatar name={debt.personName} size={64} colors={colors} />
            <View style={styles.personInfo}>
              <Text style={[styles.personName, { color: colors.text }]}>{debt.personName}</Text>
              <Text style={[styles.personCategory, { color: colors.textSecondary }]}>
                {iOwe ? 'I owe' : 'Owed to me'} · {debt.category}
              </Text>
            </View>
            {!isInactive && (
              <View style={[styles.statusCircle, { backgroundColor: statusColor + '20' }]}>
                <Text style={styles.statusCircleEmoji}>{statusEmoji}</Text>
              </View>
            )}
            {isPaid && <Text style={styles.bigEmoji}>✅</Text>}
            {isWrittenOff && <Text style={styles.bigEmoji}>☠️</Text>}
          </View>

          {/* Amount */}
          <View style={[styles.amountSection, { backgroundColor: colors.bgTertiary, borderColor: colors.border }]}>
            <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>
              {isMoney ? (iOwe ? 'You still owe' : 'Outstanding') : (iOwe ? 'What you owe' : 'What they owe')}
            </Text>
            <Text style={[styles.amountValue, { color: isInactive ? colors.textTertiary : colors.text }]}>
              {isMoney ? formatMoney(remaining, debt.currency) : debt.description}
            </Text>
            {isMoney && totalPaid > 0 && !isPaid && (
              <Text style={[styles.amountSub, { color: colors.textTertiary }]}>
                of {formatMoney(debt.amount, debt.currency)} ({formatMoney(totalPaid, debt.currency)} paid)
              </Text>
            )}
          </View>

          {/* Status message */}
          {!isInactive && (
            <View style={[styles.statusBox, { backgroundColor: statusColor + '15' }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{statusMsg}</Text>
            </View>
          )}
          {isPaid && (
            <View style={[styles.statusBox, { backgroundColor: colors.success + '15' }]}>
              <Text style={[styles.statusText, { color: colors.success }]}>
                Debt settled. A miracle has been documented.
              </Text>
            </View>
          )}
          {isWrittenOff && (
            <View style={[styles.statusBox, { backgroundColor: colors.textTertiary + '15' }]}>
              <Text style={[styles.statusText, { color: colors.textTertiary }]}>
                Written off. May it rest in peace.
              </Text>
            </View>
          )}
        </View>

        <Text style={[styles.groupTitle, { color: colors.textSecondary }]}>Details</Text>
        <View style={styles.infoGrid}>
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Calendar size={18} color={colors.textSecondary} strokeWidth={2.5} />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Date Added</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{formatDate(debt.dateAdded)}</Text>
          </View>

          {debt.dueDate && (
            <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Calendar size={18} color={overdueDays > 0 ? colors.danger : colors.textSecondary} strokeWidth={2.5} />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Due Date</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{formatDate(debt.dueDate)}</Text>
              <Text style={[styles.infoSub, { color: overdueDays > 0 ? colors.danger : colors.textTertiary }]}>
                {relativeDate(debt.dueDate)}
              </Text>
            </View>
          )}

          {debt.contactPhone && (
            <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Phone size={18} color={colors.textSecondary} strokeWidth={2.5} />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Phone</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{debt.contactPhone}</Text>
            </View>
          )}

          {debt.notes && (
            <View style={[styles.infoCard, styles.notesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <StickyNote size={18} color={colors.textSecondary} strokeWidth={2.5} />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Notes</Text>
              <Text style={[styles.infoValue, { color: colors.text, fontStyle: 'italic' }]}>{debt.notes}</Text>
            </View>
          )}
        </View>

        {/* Debt Health */}
        {!isInactive && (
          <>
          <Text style={[styles.groupTitle, { color: colors.textSecondary }]}>Debt health</Text>
          <View style={[styles.healthCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.healthHeader}>
              <Text style={[styles.healthTitle, { color: colors.text }]}>Debt Health</Text>
              <View style={[styles.healthBadge, { backgroundColor: healthInfo.color + '20' }]}>
                <Text style={[styles.healthBadgeText, { color: healthInfo.color }]}>{healthInfo.label}</Text>
              </View>
            </View>
            <Text style={[styles.healthMessage, { color: colors.textSecondary }]}>{healthInfo.message}</Text>
          </View>
          </>
        )}

        {/* Payment history */}
        {isMoney && debt.payments.length > 0 && (
          <>
          <Text style={[styles.groupTitle, { color: colors.textSecondary }]}>Payments</Text>
          <View style={[styles.historyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.historyTitle, { color: colors.text }]}>Payment History</Text>
            {debt.payments.map((p) => (
              <View key={p.id} style={styles.paymentItem}>
                <View style={[styles.paymentDot, { backgroundColor: colors.success }]} />
                <Text style={[styles.paymentAmount, { color: colors.text }]}>
                  {formatMoney(p.amount, debt.currency)}
                </Text>
                <Text style={[styles.paymentDate, { color: colors.textTertiary }]}>
                  {formatDate(p.date)}
                </Text>
              </View>
            ))}
          </View>
          </>
        )}

        {/* Person's debt history */}
        <Text style={[styles.groupTitle, { color: colors.textSecondary }]}>{iOwe ? 'History' : 'History & reputation'}</Text>
        <View style={[styles.historyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.historyTitle, { color: colors.text }]}>
            {debt.personName}'s {iOwe ? 'Record History' : 'Debt History'}
          </Text>
          {personDebts.map((d) => (
            <View key={d.id} style={styles.historyItem}>
              <Text style={[styles.historyDesc, { color: colors.text }]}>
                {d.category === 'money' ? formatMoney(d.amount, d.currency) : d.description}
              </Text>
              <View style={[
                styles.historyBadge,
                { backgroundColor: d.status === 'paid' ? colors.success + '20' : d.status === 'written_off' ? colors.textTertiary + '20' : colors.warning + '20' }
              ]}>
                <Text style={[
                  styles.historyBadgeText,
                  { color: d.status === 'paid' ? colors.success : d.status === 'written_off' ? colors.textTertiary : colors.warning }
                ]}>
                  {d.status === 'paid' ? 'Paid' : d.status === 'written_off' ? 'Written off' : d.status === 'partial' ? 'Partial' : 'Outstanding'}
                </Text>
              </View>
            </View>
          ))}

          {/* Reputation */}
          {!iOwe && <View style={[styles.reputationBox, { borderTopColor: colors.border }]}>
            <Text style={[styles.reputationTitle, { color: colors.text }]}>
              {debt.personName}'s Debt Reputation
            </Text>
            <Text style={styles.reputationStars}>{renderStars(reputation.stars)}</Text>
            <Text style={[styles.reputationReview, { color: colors.textSecondary }]}>
              "{reputation.review}"
            </Text>
          </View>}
        </View>

        {/* Action buttons */}
        {!isInactive && (
          <><Text style={[styles.groupTitle, { color: colors.textSecondary }]}>Actions</Text><View style={styles.actions}>
            {!iOwe && <TouchableOpacity
              onPress={() => setReminderVisible(true)}
              style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            >
              <Bell size={18} color="#FFF" strokeWidth={2.5} />
              <Text style={styles.actionBtnText}>Remind {debt.personName.split(' ')[0]}</Text>
            </TouchableOpacity>}

            <TouchableOpacity
              onPress={() => setPaymentVisible(true)}
              style={[styles.actionBtn, { backgroundColor: colors.success }]}
            >
              <CheckCircle size={18} color="#FFF" strokeWidth={2.5} />
              <Text style={styles.actionBtnText}>{iOwe ? 'Record My Payment' : 'Record Payment'}</Text>
            </TouchableOpacity>

            {!iOwe && <TouchableOpacity
              onPress={handleWriteOff}
              style={[styles.actionBtn, { backgroundColor: 'transparent', borderColor: colors.danger, borderWidth: 1.5 }]}
            >
              <Text style={[styles.actionBtnText, { color: colors.danger }]}>Write Off as Charity 💀</Text>
            </TouchableOpacity>}
          </View>
          </>
        )}

        {isPaid && (
          <View style={[styles.celebrationBox, { backgroundColor: colors.success + '15', borderColor: colors.success + '40' }]}>
            <Text style={styles.celebrationEmoji}>🎉</Text>
            <Text style={[styles.celebrationText, { color: colors.text }]}>
              This debt has been settled.
            </Text>
            <Text style={[styles.celebrationSub, { color: colors.textSecondary }]}>
              {debt.personName} came through after {daysSince(debt.dateAdded)} days.
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <ReminderModal
        visible={reminderVisible}
        debt={debt}
        colors={colors}
        onClose={() => setReminderVisible(false)}
        onSent={handleReminderSent}
      />

      <PaymentModal
        visible={paymentVisible}
        debt={debt}
        colors={colors}
        onClose={() => setPaymentVisible(false)}
        onAddPayment={addPayment}
        onMarkFullyPaid={markAsPaid}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  headerCopy: { flex: 1, marginLeft: 12 },
  headerTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
  },
  headerSub: { fontFamily: 'Outfit_400Regular', fontSize: 12, marginTop: 1 },
  scrollContent: {
    padding: 20,
    paddingTop: 16,
  },
  groupTitle: { fontFamily: 'Outfit_700Bold', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 20, marginBottom: 8 },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  notFoundText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
  },
  personCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginBottom: 0,
  },
  personHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  personInfo: {
    marginLeft: 14,
    flex: 1,
  },
  personName: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 22,
    marginBottom: 2,
  },
  personCategory: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  statusCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCircleEmoji: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 20,
  },
  bigEmoji: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 28,
  },
  amountSection: {
    marginBottom: 14,
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
  },
  amountLabel: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  amountValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 28,
  },
  amountSub: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    marginTop: 4,
  },
  statusBox: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statusText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 15,
    fontStyle: 'italic',
  },
  infoGrid: {
    gap: 10,
    marginBottom: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
  },
  notesCard: {
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 13,
  },
  infoValue: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 15,
    marginLeft: 'auto',
  },
  infoSub: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
    marginLeft: 'auto',
  },
  healthCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    marginBottom: 0,
  },
  healthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  healthTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
  },
  healthBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  healthBadgeText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 13,
  },
  healthMessage: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  historyCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    marginBottom: 0,
  },
  historyTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    marginBottom: 14,
  },
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  paymentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  paymentAmount: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 15,
    flex: 1,
  },
  paymentDate: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 13,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  historyDesc: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 15,
  },
  historyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  historyBadgeText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 12,
  },
  reputationBox: {
    borderTopWidth: 1,
    marginTop: 14,
    paddingTop: 14,
  },
  reputationTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 14,
    marginBottom: 8,
  },
  reputationStars: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 22,
    marginBottom: 6,
  },
  reputationReview: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  actions: {
    gap: 10,
    marginBottom: 0,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 16,
    gap: 8,
  },
  actionBtnText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 15,
    color: '#FFF',
  },
  celebrationBox: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    marginBottom: 20,
  },
  celebrationEmoji: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 48,
    marginBottom: 12,
  },
  celebrationText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    marginBottom: 6,
  },
  celebrationSub: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    textAlign: 'center',
  },
});
