import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight } from 'lucide-react-native';
import { useApp } from '@/lib/AppContext';

export function OnboardingScreen() {
  const { colors, completeOnboarding } = useApp();
  const [name, setName] = useState('');
  const canContinue = name.trim().length > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.content}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight }]}>
          <Image source={require('@/assets/images/wom-icon.png')} style={styles.icon} />
        </View>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>WELCOME TO</Text>
        <Text style={[styles.title, { color: colors.text }]}>Who Owes Me?</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>A private place to keep every “I’ll pay you tomorrow” on record.</Text>

        <View style={[styles.setupCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>WHAT SHOULD WE CALL YOU?</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={colors.textTertiary}
            autoFocus
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={() => canContinue && completeOnboarding(name)}
            style={[styles.input, { color: colors.text, backgroundColor: colors.bg, borderColor: colors.border }]}
          />
          <TouchableOpacity disabled={!canContinue} onPress={() => completeOnboarding(name)} style={[styles.continueBtn, { backgroundColor: canContinue ? colors.primary : colors.bgTertiary }]}>
            <Text style={[styles.continueText, { color: canContinue ? '#FFFFFF' : colors.textTertiary }]}>Set up my ledger</Text>
            <ArrowRight size={18} color={canContinue ? '#FFFFFF' : colors.textTertiary} strokeWidth={2.7} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.privacy, { color: colors.textTertiary }]}>Your records stay on this device.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  iconWrap: { width: 74, height: 74, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  icon: { width: 64, height: 64, borderRadius: 20 },
  eyebrow: { fontFamily: 'Outfit_700Bold', fontSize: 11, letterSpacing: 1.1, marginBottom: 5 },
  title: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 31, lineHeight: 39 },
  subtitle: { fontFamily: 'Outfit_400Regular', fontSize: 16, lineHeight: 23, marginTop: 8, marginBottom: 28 },
  setupCard: { borderRadius: 18, padding: 18, borderWidth: 1 },
  label: { fontFamily: 'Outfit_700Bold', fontSize: 11, letterSpacing: 0.7, marginBottom: 8 },
  input: { fontFamily: 'Outfit_600SemiBold', fontSize: 16, borderRadius: 13, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 14 },
  continueBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 13, paddingVertical: 14, marginTop: 14 },
  continueText: { fontFamily: 'Outfit_700Bold', fontSize: 15 },
  privacy: { fontFamily: 'Outfit_400Regular', fontSize: 12, textAlign: 'center', marginTop: 18 },
});
