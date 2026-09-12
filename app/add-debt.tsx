import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useApp, useColors } from '@/lib/AppContext';
import { DebtCategory, CurrencyCode } from '@/lib/types';
import { CURRENCIES } from '@/lib/utils';
import { getRandomConfirmation } from '@/lib/humor';
import { Toast } from '@/components/Toast';
import { X, Check, Calendar, Phone, StickyNote } from 'lucide-react-native';

const CATEGORIES: { id: DebtCategory; label: string; emoji: string }[] = [
  { id: 'money', label: 'Money', emoji: '💵' },
  { id: 'item', label: 'Item', emoji: '📦' },
  { id: 'food', label: 'Food', emoji: '🍽️' },
  { id: 'favour', label: 'Favour', emoji: '🤝' },
  { id: 'other', label: 'Other', emoji: '✨' },
];

export default function AddDebtScreen() {
  const { state, colors, addDebt, checkAchievements } = useApp();
  const router = useRouter();

  const [personName, setPersonName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<DebtCategory>('money');
  const [currency, setCurrency] = useState<CurrencyCode>(state.settings.defaultCurrency);
  const [dueDate, setDueDate] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [showCurrencies, setShowCurrencies] = useState(false);
  const [toast, setToast] = useState({ message: '', visible: false });

  const isMoney = category === 'money';
  const canSave = personName.trim().length > 0 && description.trim().length > 0 && (!isMoney || (parseFloat(amount) > 0 && !isNaN(parseFloat(amount))));

  const handleSave = () => {
    if (!canSave) return;

    addDebt({
      personName: personName.trim(),
      description: description.trim(),
      amount: isMoney ? parseFloat(amount) : 0,
      currency,
      category,
      dateAdded: new Date().toISOString(),
      dueDate: dueDate || undefined,
      notes: notes.trim() || undefined,
      contactPhone: contactPhone.trim() || undefined,
    });

    checkAchievements();
    setToast({ message: getRandomConfirmation(personName.trim()), visible: true });

    setTimeout(() => {
      router.back();
    }, 1800);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <X size={24} color={colors.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Add Debt</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Person name */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>Who owes you?</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          placeholder="e.g. John Banda"
          placeholderTextColor={colors.textTertiary}
          value={personName}
          onChangeText={setPersonName}
        />

        {/* Category */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>What type of debt?</Text>
        <View style={styles.categoryRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setCategory(cat.id)}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: category === cat.id ? colors.primary : colors.card,
                  borderColor: category === cat.id ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text
                style={[
                  styles.categoryLabel,
                  { color: category === cat.id ? '#FFF' : colors.textSecondary },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Description */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          What do they owe you?
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          placeholder={isMoney ? 'e.g. Cash loan' : 'e.g. One lunch'}
          placeholderTextColor={colors.textTertiary}
          value={description}
          onChangeText={setDescription}
        />

        {/* Amount (only for money) */}
        {isMoney && (
          <>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Amount</Text>
            <View style={styles.amountRow}>
              <TouchableOpacity
                onPress={() => setShowCurrencies(!showCurrencies)}
                style={[styles.currencyBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Text style={[styles.currencySymbol, { color: colors.text }]}>
                  {CURRENCIES.find((c) => c.code === currency)?.symbol}
                </Text>
                <Text style={[styles.currencyCode, { color: colors.textSecondary }]}>{currency}</Text>
              </TouchableOpacity>
              <TextInput
                style={[styles.amountInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            {showCurrencies && (
              <View style={[styles.currencyMenu, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {CURRENCIES.map((c) => (
                  <TouchableOpacity
                    key={c.code}
                    onPress={() => {
                      setCurrency(c.code as CurrencyCode);
                      setShowCurrencies(false);
                    }}
                    style={[
                      styles.currencyOption,
                      currency === c.code && { backgroundColor: colors.primaryLight },
                    ]}
                  >
                    <Text style={[styles.currencyOptionText, { color: colors.text }]}>
                      {c.symbol} {c.code} — {c.label}
                    </Text>
                    {currency === c.code && <Text style={styles.checkText}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}

        {/* Optional fields */}
        <Text style={[styles.optionalLabel, { color: colors.textTertiary }]}>Optional</Text>

        {/* Due date */}
        <View style={[styles.optionalRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Calendar size={18} color={colors.textSecondary} strokeWidth={2.5} />
          <TextInput
            style={[styles.optionalInput, { color: colors.text }]}
            placeholder="Due date (YYYY-MM-DD)"
            placeholderTextColor={colors.textTertiary}
            value={dueDate}
            onChangeText={setDueDate}
          />
        </View>

        {/* Phone */}
        <View style={[styles.optionalRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Phone size={18} color={colors.textSecondary} strokeWidth={2.5} />
          <TextInput
            style={[styles.optionalInput, { color: colors.text }]}
            placeholder="Phone number"
            placeholderTextColor={colors.textTertiary}
            keyboardType="phone-pad"
            value={contactPhone}
            onChangeText={setContactPhone}
          />
        </View>

        {/* Notes */}
        <View style={[styles.optionalRow, styles.notesRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <StickyNote size={18} color={colors.textSecondary} strokeWidth={2.5} />
          <TextInput
            style={[styles.optionalInput, { color: colors.text }]}
            placeholder="Notes (the tea, the backstory, the shade...)"
            placeholderTextColor={colors.textTertiary}
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Save button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={!canSave}
          style={[
            styles.saveBtn,
            { backgroundColor: canSave ? colors.primary : colors.bgTertiary },
          ]}
        >
          <Check size={22} color="#FFF" strokeWidth={3} />
          <Text style={[styles.saveBtnText, { color: canSave ? '#FFF' : colors.textTertiary }]}>
            Record This Debt
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

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
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    fontWeight: '500',
    borderWidth: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 5,
    borderWidth: 1.5,
  },
  categoryEmoji: {
    fontSize: 15,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  amountRow: {
    flexDirection: 'row',
    gap: 10,
  },
  currencyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 6,
    borderWidth: 1,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '800',
  },
  currencyCode: {
    fontSize: 13,
    fontWeight: '600',
  },
  amountInput: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    fontSize: 22,
    fontWeight: '800',
    borderWidth: 1,
  },
  currencyMenu: {
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    marginTop: 8,
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  currencyOptionText: {
    fontSize: 15,
    fontWeight: '500',
  },
  checkText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#34D399',
  },
  optionalLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 28,
    marginBottom: 10,
  },
  optionalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  notesRow: {
    alignItems: 'flex-start',
    minHeight: 60,
  },
  optionalInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    minHeight: 24,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    marginTop: 24,
  },
  saveBtnText: {
    fontSize: 17,
    fontWeight: '800',
  },
});
