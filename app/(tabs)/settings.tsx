import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp, useColors } from '@/lib/AppContext';
import { ThemeMode, CurrencyCode } from '@/lib/types';
import { CURRENCIES } from '@/lib/utils';
import { debtsToCSV } from '@/lib/export';
import { Sun, Moon, Download, RefreshCw, Info, Bell, Globe, Shield, Fingerprint } from 'lucide-react-native';

export default function SettingsScreen() {
  const { state, colors, updateSettings, toggleTheme, resetData, checkAchievements } = useApp();
  const [showCurrencies, setShowCurrencies] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const handleExport = async () => {
    const csv = debtsToCSV(state.debts);
    try {
      await Share.share({ message: csv, title: 'Who Owes Me? - Export' });
    } catch (e) {
      Alert.alert('Export failed', 'Could not share the CSV data.');
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset All Data?',
          'This will remove all debts and return the app to its first-use setup. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetData();
            checkAchievements();
          },
        },
      ]
    );
  };

  const reminderOptions: { id: 'daily' | 'weekly' | 'monthly' | 'never'; label: string }[] = [
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'never', label: 'Never' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

        {/* Profile */}
        <View style={[styles.profileCard, { backgroundColor: colors.primaryLight, borderColor: colors.border }]}>
          <View style={[styles.profileIconWrap, { backgroundColor: colors.card }]}>
            <Image source={require('@/assets/images/new-logo.png')} style={styles.profileIcon} />
          </View>
          <View style={styles.profileDetails}>
            <Text style={[styles.profileLabel, { color: colors.primaryDark }]}>YOUR LEDGER</Text>
            <Text style={[styles.profileName, { color: colors.text }]}>{state.settings.userName}</Text>
            <Text style={[styles.profileHint, { color: colors.textSecondary }]}>Keeping the receipts in one place.</Text>
          </View>
        </View>

        {/* Theme */}
        <Text style={[styles.groupTitle, { color: colors.textSecondary }]}>Appearance</Text>
        <View style={[styles.rowCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.rowLeft}>
            {state.settings.themeMode === 'dark' ? (
              <Moon size={20} color={colors.primary} strokeWidth={2.5} />
            ) : (
              <Sun size={20} color={colors.accent} strokeWidth={2.5} />
            )}
            <Text style={[styles.rowLabel, { color: colors.text }]}>Theme</Text>
          </View>
          <View style={styles.themeToggle}>
            <TouchableOpacity
              onPress={() => state.settings.themeMode !== 'light' && toggleTheme()}
              style={[
                styles.themeBtn,
                state.settings.themeMode === 'light' && { backgroundColor: colors.accent },
              ]}
            >
              <Sun size={16} color={state.settings.themeMode === 'light' ? '#FFF' : colors.textTertiary} strokeWidth={2.5} />
              <Text
                style={[
                  styles.themeBtnText,
                  { color: state.settings.themeMode === 'light' ? '#FFF' : colors.textTertiary },
                ]}
              >
                Light
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => state.settings.themeMode !== 'dark' && toggleTheme()}
              style={[
                styles.themeBtn,
                state.settings.themeMode === 'dark' && { backgroundColor: colors.primary },
              ]}
            >
              <Moon size={16} color={state.settings.themeMode === 'dark' ? '#FFF' : colors.textTertiary} strokeWidth={2.5} />
              <Text
                style={[
                  styles.themeBtnText,
                  { color: state.settings.themeMode === 'dark' ? '#FFF' : colors.textTertiary },
                ]}
              >
                Dark
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Currency */}
        <Text style={[styles.groupTitle, { color: colors.textSecondary }]}>Currency</Text>
        <TouchableOpacity
          onPress={() => setShowCurrencies(!showCurrencies)}
          style={[styles.rowCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={styles.rowLeft}>
            <Globe size={20} color={colors.primary} strokeWidth={2.5} />
            <Text style={[styles.rowLabel, { color: colors.text }]}>Default Currency</Text>
          </View>
          <Text style={[styles.rowValue, { color: colors.textSecondary }]}>
            {state.settings.defaultCurrency}
          </Text>
        </TouchableOpacity>

        {showCurrencies && (
          <View style={[styles.expandedMenu, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {CURRENCIES.map((c) => (
              <TouchableOpacity
                key={c.code}
                onPress={() => {
                  updateSettings({ defaultCurrency: c.code as CurrencyCode });
                  setShowCurrencies(false);
                }}
                style={[
                  styles.menuOption,
                  state.settings.defaultCurrency === c.code && { backgroundColor: colors.primaryLight },
                ]}
              >
                <Text style={[styles.menuOptionText, { color: colors.text }]}>
                  {c.code} — {c.label}
                </Text>
                {state.settings.defaultCurrency === c.code && <Text style={styles.checkText}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Notifications */}
        <Text style={[styles.groupTitle, { color: colors.textSecondary }]}>Reminders</Text>
        <View style={[styles.rowCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.rowLeft}>
            <Bell size={20} color={colors.warning} strokeWidth={2.5} />
            <Text style={[styles.rowLabel, { color: colors.text }]}>Reminder Frequency</Text>
          </View>
        </View>
        <View style={styles.freqRow}>
          {reminderOptions.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              onPress={() => updateSettings({ reminderFrequency: opt.id })}
              style={[
                styles.freqChip,
                {
                  backgroundColor: state.settings.reminderFrequency === opt.id ? colors.primary : colors.card,
                  borderColor: state.settings.reminderFrequency === opt.id ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.freqChipText,
                  { color: state.settings.reminderFrequency === opt.id ? '#FFF' : colors.textSecondary },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.securityDesc, { color: colors.textSecondary }]}>
          Due-date alerts arrive at 9:00 AM. Daily starts 3 days before, weekly 7 days before, and monthly 30 days before.
        </Text>

        {/* Security */}
        <Text style={[styles.groupTitle, { color: colors.textSecondary }]}>Security</Text>
        <View style={[styles.rowCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.rowLeft}>
            <Fingerprint size={20} color={colors.primary} strokeWidth={2.5} />
            <View style={styles.securityInfo}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>App Lock</Text>
              <Text style={[styles.securityDesc, { color: colors.textSecondary }]}>
                Require Face ID, fingerprint, or passcode to open
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => updateSettings({ biometricEnabled: !state.settings.biometricEnabled })}
            style={[
              styles.toggleSwitch,
              state.settings.biometricEnabled
                ? { backgroundColor: colors.primary }
                : { backgroundColor: colors.bgTertiary },
            ]}
          >
            <View
              style={[
                styles.toggleKnob,
                state.settings.biometricEnabled && styles.toggleKnobActive,
              ]}
            />
          </TouchableOpacity>
        </View>

        {/* Data */}
        <Text style={[styles.groupTitle, { color: colors.textSecondary }]}>Data Management</Text>
        <TouchableOpacity
          onPress={handleExport}
          style={[styles.rowCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={styles.rowLeft}>
            <Download size={20} color={colors.success} strokeWidth={2.5} />
            <Text style={[styles.rowLabel, { color: colors.text }]}>Export as CSV</Text>
          </View>
          <Text style={[styles.rowValue, { color: colors.textTertiary }]}>Share ›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleReset}
          style={[styles.rowCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={styles.rowLeft}>
            <RefreshCw size={20} color={colors.danger} strokeWidth={2.5} />
            <Text style={[styles.rowLabel, { color: colors.text }]}>Reset All Data</Text>
          </View>
          <Text style={[styles.rowValue, { color: colors.textTertiary }]}>›</Text>
        </TouchableOpacity>

        {/* Privacy note */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Shield size={18} color={colors.success} strokeWidth={2.5} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            All your data is stored locally on this device. No cloud sync. No one sees your debts but you.
          </Text>
        </View>

        {/* About */}
        <TouchableOpacity
          onPress={() => setShowAbout(!showAbout)}
          style={[styles.rowCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={styles.rowLeft}>
            <Info size={20} color={colors.primary} strokeWidth={2.5} />
            <Text style={[styles.rowLabel, { color: colors.text }]}>About</Text>
          </View>
          <Text style={[styles.rowValue, { color: colors.textTertiary }]}>{showAbout ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {showAbout && (
          <View style={[styles.aboutCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Image source={require('@/assets/images/new-logo.png')} style={styles.aboutIcon} />
            <Text style={[styles.aboutTitle, { color: colors.text }]}>Who Owes Me? v1.0.0</Text>
            <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
              A serious debt tracker that accidentally became hilarious. Track what people owe you, generate funny reminders, and keep tabs on who's paying and who's dodging.
            </Text>
            <Text style={[styles.aboutFooter, { color: colors.textTertiary }]}>
              Your data never leaves your device.
            </Text>
            <TouchableOpacity onPress={() => Linking.openURL('https://mahala.graduatemw.com')} activeOpacity={0.7}>
              <Text style={[styles.creator, { color: colors.primary }]}>Created by Mahala Mzati Mkwepu</Text>
              <Text style={[styles.creatorTagline, { color: colors.textSecondary }]}>Because “I’ll pay you tomorrow” needed a database.</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 12,
  },
  title: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 20,
  },
  section: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  profileIconWrap: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  profileIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  profileDetails: {
    flex: 1,
    minWidth: 0,
  },
  profileLabel: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 11,
    letterSpacing: 1.1,
  },
  profileName: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 21,
    lineHeight: 27,
    marginTop: 2,
  },
  profileHint: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  sectionLabel: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  sectionValue: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 18,
    fontWeight: '700',
  },
  groupTitle: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 8,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
    gap: 12,
  },
  rowLabel: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 16,
    fontWeight: '600',
  },
  rowValue: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
    fontWeight: '600',
  },
  themeToggle: {
    flexDirection: 'row',
    gap: 6,
  },
  themeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 5,
  },
  themeBtnText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    fontWeight: '700',
  },
  expandedMenu: {
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    marginBottom: 8,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  menuOptionText: {
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
  freqRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  freqChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  freqChipText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    fontWeight: '700',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginTop: 8,
    marginBottom: 8,
  },
  infoText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  aboutCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginBottom: 8,
  },
  aboutTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  aboutText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
  },
  aboutFooter: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    fontStyle: 'italic',
  },
  aboutIcon: {
    width: 56,
    height: 56,
    resizeMode: 'contain',
    marginBottom: 14,
  },
  creator: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 14,
    marginTop: 20,
    textDecorationLine: 'underline',
  },
  creatorTagline: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 19,
    marginTop: 3,
  },
  securityInfo: {
    flex: 1,
    minWidth: 0,
  },
  securityDesc: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    marginTop: 2,
  },
  toggleSwitch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
    flexShrink: 0,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
    alignSelf: 'flex-start',
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
});
