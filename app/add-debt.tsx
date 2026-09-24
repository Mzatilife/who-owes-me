import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { useApp } from '@/lib/AppContext';
import { DebtCategory, CurrencyCode, DebtDirection } from '@/lib/types';
import { CURRENCIES } from '@/lib/utils';
import { getRandomConfirmation } from '@/lib/humor';
import { getTotalPaid } from '@/lib/utils';
import { Toast } from '@/components/Toast';
import { X, Check, Calendar, Phone, StickyNote, UserRound, ReceiptText } from 'lucide-react-native';

const CATEGORIES: { id: DebtCategory; label: string; emoji: string }[] = [
  { id: 'money', label: 'Money', emoji: '💵' },
  { id: 'item', label: 'Item', emoji: '📦' },
  { id: 'food', label: 'Food', emoji: '🍽️' },
  { id: 'favour', label: 'Favour', emoji: '🤝' },
  { id: 'other', label: 'Other', emoji: '✨' },
];

export default function AddDebtScreen() {
  const { state, colors, addDebt, updateDebt, checkAchievements } = useApp();
  const router = useRouter();
  const { direction: initialDirection, id, personName: initialPersonName } = useLocalSearchParams<{ direction?: DebtDirection; id?: string; personName?: string }>();
  const existingDebt = id ? state.debts.find((debt) => debt.id === id) : undefined;
  const isEditing = Boolean(existingDebt);

  const [personName, setPersonName] = useState(existingDebt?.personName ?? initialPersonName ?? '');
  const [description, setDescription] = useState(existingDebt?.description ?? '');
  const [amount, setAmount] = useState(existingDebt?.amount ? String(existingDebt.amount) : '');
  const [category, setCategory] = useState<DebtCategory>(existingDebt?.category ?? 'money');
  const [currency, setCurrency] = useState<CurrencyCode>(existingDebt?.currency ?? state.settings.defaultCurrency);
  const [dueDate, setDueDate] = useState(existingDebt?.dueDate ?? '');
  const [contactPhone, setContactPhone] = useState(existingDebt?.contactPhone ?? '');
  const [notes, setNotes] = useState(existingDebt?.notes ?? '');
  const [direction, setDirection] = useState<DebtDirection>(existingDebt?.direction ?? (initialDirection === 'i_owe' ? 'i_owe' : 'owed_to_me'));
  const [showCurrencies, setShowCurrencies] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [toast, setToast] = useState({ message: '', visible: false });
  const scrollRef = useRef<ScrollView>(null);

  // Scroll after the keyboard has started opening, keeping the focused field in view.
  const revealField = (y: number) => {
    setTimeout(() => scrollRef.current?.scrollTo({ y, animated: true }), 120);
  };

  const isMoney = category === 'money';
  const canSave = personName.trim().length > 0 && description.trim().length > 0 && (!isMoney || (parseFloat(amount) > 0 && !isNaN(parseFloat(amount))));

  const handleSave = () => {
    if (!canSave) return;

    if (existingDebt && isMoney && parseFloat(amount) < getTotalPaid(existingDebt.payments)) {
      setToast({ message: 'Amount cannot be lower than payments already recorded.', visible: true });
      return;
    }

    const updates = {
      personName: personName.trim(),
      description: description.trim(),
      amount: isMoney ? parseFloat(amount) : 0,
      currency,
      category,
      direction,
      dueDate: dueDate || undefined,
      notes: notes.trim() || undefined,
      contactPhone: contactPhone.trim() || undefined,
    };

    if (existingDebt) {
      updateDebt(existingDebt.id, updates);
      setToast({ message: 'Record updated.', visible: true });
    } else {
      addDebt({ ...updates, dateAdded: new Date().toISOString() });
      checkAchievements();
      setToast({ message: getRandomConfirmation(personName.trim()), visible: true });
    }

    setTimeout(() => {
      router.back();
    }, 1800);
  };

  const handleDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS !== 'ios') setShowDatePicker(false);
    if (selectedDate) setDueDate(selectedDate.toISOString());
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.bgTertiary }]}>
          <X size={24} color={colors.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{isEditing ? 'Edit record' : 'Add a debt'}</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>{isEditing ? 'Keep the details accurate.' : 'Write it down. They cannot deny it later.'}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView style={styles.keyboardSafe} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={8}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={[styles.directionSwitch, { backgroundColor: colors.bgTertiary, borderColor: colors.border }]}>
          <TouchableOpacity onPress={() => setDirection('owed_to_me')} style={[styles.directionOption, direction === 'owed_to_me' && { backgroundColor: colors.card }]}><Text style={[styles.directionText, { color: direction === 'owed_to_me' ? colors.primary : colors.textSecondary }]}>Owed to me</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setDirection('i_owe')} style={[styles.directionOption, direction === 'i_owe' && { backgroundColor: colors.card }]}><Text style={[styles.directionText, { color: direction === 'i_owe' ? colors.primary : colors.textSecondary }]}>I owe</Text></TouchableOpacity>
        </View>
        <View style={styles.formHeading}>
          <View style={[styles.formHeadingIcon, { backgroundColor: colors.primaryLight }]}><UserRound size={18} color={colors.primary} strokeWidth={2.5} /></View>
          <View><Text style={[styles.groupTitle, { color: colors.textSecondary }]}>Debt details</Text><Text style={[styles.groupHint, { color: colors.textTertiary }]}>Who and what is being tracked?</Text></View>
        </View>
        <View style={[styles.formSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{direction === 'i_owe' ? 'Who do you owe?' : 'Who owes you?'}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
            placeholder="e.g. John Banda"
            placeholderTextColor={colors.textTertiary}
            value={personName}
            onChangeText={setPersonName}
            onFocus={() => revealField(0)}
          />

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

          <Text style={[styles.label, { color: colors.textSecondary }]}>{direction === 'i_owe' ? 'What do you owe?' : 'What do they owe you?'}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
            placeholder={isMoney ? 'e.g. Cash loan' : 'e.g. One lunch'}
            placeholderTextColor={colors.textTertiary}
            value={description}
            onChangeText={setDescription}
            onFocus={() => revealField(170)}
          />
        </View>

        {/* Amount (only for money) */}
        {isMoney && (
          <>
            <View style={styles.formHeading}>
              <View style={[styles.formHeadingIcon, { backgroundColor: colors.accent + '16' }]}><ReceiptText size={18} color={colors.accent} strokeWidth={2.5} /></View>
              <View><Text style={[styles.groupTitle, { color: colors.textSecondary }]}>Amount</Text><Text style={[styles.groupHint, { color: colors.textTertiary }]}>{direction === 'i_owe' ? 'The amount you still need to pay.' : 'The amount still owed to you.'}</Text></View>
            </View>
            <View style={[styles.formSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
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
                onFocus={() => revealField(360)}
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
            </View>
          </>
        )}

        <View style={styles.formHeading}>
          <View style={[styles.formHeadingIcon, { backgroundColor: colors.bgTertiary }]}><StickyNote size={18} color={colors.textSecondary} strokeWidth={2.5} /></View>
          <View><Text style={[styles.groupTitle, { color: colors.textSecondary }]}>Additional details</Text><Text style={[styles.groupHint, { color: colors.textTertiary }]}>Add context if you need it later.</Text></View>
        </View>
        <View style={[styles.formSection, { backgroundColor: colors.card, borderColor: colors.border }]}>

        {/* Due date */}
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.75}
          style={[styles.optionalRow, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Calendar size={18} color={colors.textSecondary} strokeWidth={2.5} />
          <Text style={[styles.optionalInput, { color: dueDate ? colors.text : colors.textTertiary }]}>
            {dueDate ? new Date(dueDate).toLocaleDateString() : 'Choose a due date'}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={dueDate ? new Date(dueDate) : new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
          />
        )}

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
            onFocus={() => revealField(540)}
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
            onFocus={() => revealField(640)}
          />
        </View>
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
          <View><Text style={[styles.saveBtnText, { color: canSave ? '#FFF' : colors.textTertiary }]}>{isEditing ? 'Save changes' : direction === 'i_owe' ? 'Record what I owe' : 'Record this debt'}</Text><Text style={[styles.saveBtnSubtext, { color: canSave ? '#D1FAE5' : colors.textTertiary }]}>{isEditing ? 'Update this ledger entry' : 'Add it to your ledger'}</Text></View>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
      </KeyboardAvoidingView>

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
  keyboardSafe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: { flex: 1, marginLeft: 12 },
  headerSpacer: { width: 38 },
  headerTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
  },
  headerSub: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    marginTop: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 280,
  },
  directionSwitch: { flexDirection: 'row', borderWidth: 1, borderRadius: 14, padding: 4, marginBottom: 8 },
  directionOption: { flex: 1, borderRadius: 10, alignItems: 'center', paddingVertical: 10 },
  directionText: { fontFamily: 'Outfit_700Bold', fontSize: 13 },
  formHeading: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 8 },
  formHeadingIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  groupTitle: { fontFamily: 'Outfit_700Bold', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 },
  groupHint: { fontFamily: 'Outfit_400Regular', fontSize: 12, marginTop: 1 },
  formSection: { borderRadius: 16, padding: 16, borderWidth: 1 },
  label: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderRadius: 14,
    padding: 14,
    fontFamily: 'Outfit_400Regular',
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
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
  },
  categoryLabel: {
    fontFamily: 'Outfit_400Regular',
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
    fontFamily: 'Outfit_400Regular',
    fontSize: 18,
    fontWeight: '800',
  },
  currencyCode: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    fontWeight: '600',
  },
  amountInput: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    fontFamily: 'Outfit_400Regular',
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
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
    fontWeight: '500',
  },
  checkText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 18,
    fontWeight: '700',
    color: '#34D399',
  },
  optionalLabel: {
    fontFamily: 'Outfit_400Regular',
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
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    marginBottom: 10,
  },
  notesRow: {
    alignItems: 'flex-start',
    minHeight: 60,
  },
  optionalInput: {
    flex: 1,
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
    fontWeight: '500',
    minHeight: 24,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 10,
    marginTop: 24,
  },
  saveBtnText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
  },
  saveBtnSubtext: { fontFamily: 'Outfit_400Regular', fontSize: 12, marginTop: 1 },
});
