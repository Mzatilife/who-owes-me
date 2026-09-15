import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ThemeColors } from '@/lib/theme';
import { Debt } from '@/lib/types';
import { formatMoney, getRemainingAmount, getTotalPaid } from '@/lib/utils';
import { getPaymentCelebration, getPartialPaymentMessage } from '@/lib/humor';
import { daysSince } from '@/lib/utils';
import { X, Check } from 'lucide-react-native';

interface PaymentModalProps {
  visible: boolean;
  debt: Debt | null;
  colors: ThemeColors;
  onClose: () => void;
  onAddPayment: (id: string, amount: number) => void;
  onMarkFullyPaid: (id: string) => void;
}

export function PaymentModal({
  visible,
  debt,
  colors,
  onClose,
  onAddPayment,
  onMarkFullyPaid,
}: PaymentModalProps) {
  const [amount, setAmount] = useState('');
  const [celebration, setCelebration] = useState<string | null>(null);

  if (!debt) return null;

  const isMoney = debt.category === 'money';
  const iOwe = debt.direction === 'i_owe';
  const remaining = getRemainingAmount(debt.amount, debt.payments);
  const totalPaid = getTotalPaid(debt.payments);

  const handlePartial = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;
    onAddPayment(debt.id, val);
    if (val >= remaining) {
      setCelebration(iOwe ? `Payment recorded. ${debt.personName} is all settled.` : getPaymentCelebration(debt.personName, remaining, daysSince(debt.dateAdded)));
    } else {
      setCelebration(getPartialPaymentMessage(debt.personName));
    }
    setAmount('');
  };

  const handleFullPayment = () => {
    onMarkFullyPaid(debt.id);
    setCelebration(iOwe ? `Marked as settled with ${debt.personName}.` : getPaymentCelebration(debt.personName, remaining, daysSince(debt.dateAdded)));
    setAmount('');
  };

  const handleClose = () => {
    setCelebration(null);
    setAmount('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: colors.card }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              {celebration ? 'Payment recorded!' : iOwe ? 'Record your payment' : 'Record payment'}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <X size={22} color={colors.textSecondary} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {celebration ? (
            <View style={styles.celebration}>
              <Text style={styles.celebrationEmoji}>🎉</Text>
              <Text style={[styles.celebrationText, { color: colors.text }]}>
                {celebration}
              </Text>
              <TouchableOpacity
                onPress={handleClose}
                style={[styles.doneBtn, { backgroundColor: colors.success }]}
              >
                <Check size={20} color="#FFF" strokeWidth={2.5} />
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={[styles.personName, { color: colors.textSecondary }]}>
                {debt.personName}
              </Text>

              {isMoney ? (
                <>
                  <View style={styles.amountRow}>
                    <View style={styles.amountBox}>
                      <Text style={[styles.amountLabel, { color: colors.textTertiary }]}>
                        Original amount
                      </Text>
                      <Text style={[styles.amountValue, { color: colors.text }]}>
                        {formatMoney(debt.amount, debt.currency)}
                      </Text>
                    </View>
                    <View style={styles.amountBox}>
                      <Text style={[styles.amountLabel, { color: colors.textTertiary }]}>
                        Paid so far
                      </Text>
                      <Text style={[styles.amountValue, { color: colors.success }]}>
                        {formatMoney(totalPaid, debt.currency)}
                      </Text>
                    </View>
                    <View style={styles.amountBox}>
                      <Text style={[styles.amountLabel, { color: colors.textTertiary }]}>
                        Still owed
                      </Text>
                      <Text style={[styles.amountValue, { color: colors.danger }]}>
                        {formatMoney(remaining, debt.currency)}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    {iOwe ? 'Amount you paid' : 'Payment amount'}
                  </Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.bgTertiary, color: colors.text, borderColor: colors.border }]}
                    placeholder="Enter amount"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                  />

                  <View style={styles.actions}>
                    <TouchableOpacity
                      onPress={handlePartial}
                      style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                    >
                      <Text style={styles.actionBtnText}>Add partial payment</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onPress={handleFullPayment}
                    style={[styles.fullBtn, { borderColor: colors.success }]}
                  >
                    <Text style={[styles.fullBtnText, { color: colors.success }]}>
                      Mark as Fully Paid 🎉
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={[styles.nonMoneyDesc, { color: colors.textSecondary }]}>
                    This is a non-money IOU: "{debt.description}"
                  </Text>
                  <TouchableOpacity
                    onPress={handleFullPayment}
                    style={[styles.fullBtn, { backgroundColor: colors.success, borderColor: colors.success, paddingVertical: 16 }]}
                  >
                    <Text style={[styles.fullBtnText, { color: '#FFF', fontSize: 16 }]}>
                      Mark as Returned / Settled 🎉
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </Pressable>
      </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 22,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  personName: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  amountBox: {
    flex: 1,
  },
  amountLabel: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  amountValue: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 16,
    fontWeight: '800',
  },
  inputLabel: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 14,
    padding: 14,
    fontFamily: 'Outfit_400Regular',
    fontSize: 16,
    fontWeight: '600',
    borderWidth: 1,
    marginBottom: 16,
  },
  actions: {
    gap: 10,
  },
  actionBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#FFF',
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
    fontWeight: '700',
  },
  fullBtn: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 2,
  },
  fullBtnText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
    fontWeight: '700',
  },
  nonMoneyDesc: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  celebration: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  celebrationEmoji: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 56,
    marginBottom: 16,
  },
  celebrationText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    fontWeight: '500',
  },
  doneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 14,
    gap: 8,
  },
  doneBtnText: {
    color: '#FFF',
    fontFamily: 'Outfit_400Regular',
    fontSize: 16,
    fontWeight: '700',
  },
});
