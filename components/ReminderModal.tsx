import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Share,
  Platform,
} from 'react-native';
import { ThemeColors } from '@/lib/theme';
import { ReminderTone, Debt } from '@/lib/types';
import { generateReminder } from '@/lib/humor';
import { formatMoney, getRemainingAmount } from '@/lib/utils';
import { X, Copy, Share as ShareIcon, Check } from 'lucide-react-native';

interface ReminderModalProps {
  visible: boolean;
  debt: Debt | null;
  colors: ThemeColors;
  onClose: () => void;
  onSent: () => void;
}

const TONES: { id: ReminderTone; label: string; emoji: string }[] = [
  { id: 'friendly', label: 'Friendly', emoji: '😊' },
  { id: 'funny', label: 'Funny', emoji: '😂' },
  { id: 'serious', label: 'Serious', emoji: '😐' },
  { id: 'savage', label: 'Savage', emoji: '🔥' },
  { id: 'dramatic', label: 'Extremely Dramatic', emoji: '🚨' },
];

export function ReminderModal({ visible, debt, colors, onClose, onSent }: ReminderModalProps) {
  const [selectedTone, setSelectedTone] = useState<ReminderTone>('funny');
  const [copied, setCopied] = useState(false);

  if (!debt) return null;

  const isMoney = debt.category === 'money';
  const remaining = getRemainingAmount(debt.amount, debt.payments);
  const message = generateReminder(
    selectedTone,
    debt.personName,
    remaining,
    debt.currency,
    debt.description,
    isMoney
  );

  const handleShare = async () => {
    try {
      await Share.share({ message });
      onSent();
    } catch (e) {
      // user cancelled share
    }
  };

  const handleCopy = async () => {
    if (Platform.OS === 'web') {
      try {
        await navigator.clipboard.writeText(message);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
        // fallback
      }
    }
    onSent();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: colors.card }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Generate Reminder</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={22} color={colors.textSecondary} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Choose your level of aggression
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.toneScroll}>
            {TONES.map((tone) => (
              <TouchableOpacity
                key={tone.id}
                onPress={() => setSelectedTone(tone.id)}
                style={[
                  styles.toneChip,
                  {
                    backgroundColor: selectedTone === tone.id ? colors.primary : colors.bgTertiary,
                    borderColor: selectedTone === tone.id ? colors.primary : 'transparent',
                  },
                ]}
              >
                <Text style={styles.toneEmoji}>{tone.emoji}</Text>
                <Text
                  style={[
                    styles.toneLabel,
                    { color: selectedTone === tone.id ? '#FFF' : colors.textSecondary },
                  ]}
                >
                  {tone.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={[styles.messageBox, { backgroundColor: colors.bgTertiary, borderColor: colors.border }]}>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.messageScroll}>
              <Text style={[styles.messageText, { color: colors.text }]}>{message}</Text>
            </ScrollView>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={handleCopy}
              style={[styles.actionBtn, { backgroundColor: colors.bgTertiary, borderColor: colors.border }]}
            >
              {copied ? (
                <Check size={18} color={colors.success} strokeWidth={2.5} />
              ) : (
                <Copy size={18} color={colors.text} strokeWidth={2.5} />
              )}
              <Text style={[styles.actionBtnText, { color: colors.text }]}>
                {copied ? 'Copied!' : 'Copy'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleShare}
              style={[styles.actionBtn, { backgroundColor: colors.primary, flex: 1.5 }]}
            >
              <ShareIcon size={18} color="#FFF" strokeWidth={2.5} />
              <Text style={[styles.actionBtnText, { color: '#FFF' }]}>Share via WhatsApp / SMS</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
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
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  toneScroll: {
    marginBottom: 16,
  },
  toneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1.5,
    gap: 5,
  },
  toneEmoji: {
    fontSize: 15,
  },
  toneLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  messageBox: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    minHeight: 120,
    maxHeight: 200,
    marginBottom: 16,
  },
  messageScroll: {
    maxHeight: 180,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    flex: 1,
    gap: 8,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
