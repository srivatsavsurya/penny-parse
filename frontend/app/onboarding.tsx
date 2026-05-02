import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Linking, AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useApp } from '../src/context/AppContext';
import { isPermissionGranted, openNotificationSettings, isAvailable } from '../src/hooks/useNotificationListener';
import { spacing, radius, typography } from '../src/theme/design';
import { useTheme } from '../src/theme/ThemeProvider';

export default function OnboardingScreen() {
  const router = useRouter();
  const { updateSettings } = useApp();
  const { colors } = useTheme();
  const [step, setStep] = useState(0);
  const [granted, setGranted] = useState(false);
  const [checking, setChecking] = useState(false);

  // Re-check permission whenever app returns to foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') checkPermission();
    });
    checkPermission();
    return () => sub.remove();
  }, []);

  const checkPermission = async () => {
    setChecking(true);
    try {
      const ok = await isPermissionGranted();
      setGranted(ok);
    } catch {
      setGranted(false);
    } finally {
      setChecking(false);
    }
  };

  const handleGrant = async () => {
    if (!isAvailable) {
      // Web / Expo Go fallback — just continue
      complete();
      return;
    }
    await openNotificationSettings();
    // User will return; AppState listener re-checks
  };

  const complete = () => {
    updateSettings({ hasOnboarded: true, firstRun: false });
    router.replace('/(tabs)');
  };

  const next = () => setStep((s) => s + 1);

  const styles = makeStyles(colors);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {step === 0 && (
            <>
              <View style={styles.iconHero}>
                <Ionicons name="shield-checkmark" size={56} color="#fff" />
              </View>
              <Text style={styles.title}>Welcome to{`\n`}Private Ledger</Text>
              <Text style={styles.subtitle}>
                Track your UPI spending automatically. 100% on-device. Nothing ever leaves your phone.
              </Text>
              <View style={styles.featureList}>
                <FeatureRow icon="flash" title="Instant capture" desc="UPI payments appear the moment you pay" />
                <FeatureRow icon="lock-closed" title="Truly private" desc="No servers, no accounts, no tracking" />
                <FeatureRow icon="sparkles" title="Smart insights" desc="AI-powered analysis of your spending" />
              </View>
              <TouchableOpacity style={styles.cta} onPress={next} activeOpacity={0.85}>
                <Text style={styles.ctaText}>Get started</Text>
                <Ionicons name="arrow-forward" size={18} color={colors.accent} />
              </TouchableOpacity>
            </>
          )}

          {step === 1 && (
            <>
              <View style={styles.iconHero}>
                <Ionicons name="notifications" size={56} color="#fff" />
              </View>
              <Text style={styles.title}>Notification access</Text>
              <Text style={styles.subtitle}>
                To capture UPI payments automatically, Private Ledger reads notifications from PhonePe, Google Pay, Paytm and your bank apps. We never read other notifications.
              </Text>

              <View style={styles.permissionCard}>
                <View style={styles.permissionRow}>
                  <View style={[styles.checkBox, granted && styles.checkBoxOn]}>
                    {granted && <Ionicons name="checkmark" size={14} color="#fff" />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.permTitle}>Notification Listener</Text>
                    <Text style={styles.permDesc}>{granted ? 'Granted — you\'re all set!' : 'Required for auto-capture'}</Text>
                  </View>
                  {!granted && (
                    <TouchableOpacity style={styles.permBtn} onPress={handleGrant}>
                      <Text style={styles.permBtnText}>Allow</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {Platform.OS !== 'android' && (
                <Text style={styles.platformNote}>
                  Note: notification capture is Android-only. You can still use the app to manually log expenses.
                </Text>
              )}

              <View style={styles.privacyBox}>
                <Ionicons name="information-circle" size={16} color="rgba(255,255,255,0.85)" />
                <Text style={styles.privacyText}>
                  Notifications are processed only in memory on your device. Nothing is stored, sent, or shared.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.cta, !granted && Platform.OS === 'android' && styles.ctaSecondary]}
                onPress={complete}
                activeOpacity={0.85}
              >
                <Text style={styles.ctaText}>{granted ? 'Continue' : 'Skip for now'}</Text>
                <Ionicons name="arrow-forward" size={18} color={colors.accent} />
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const FeatureRow: React.FC<{ icon: string; title: string; desc: string }> = ({ icon, title, desc }) => (
  <View style={featureRowStyles.row}>
    <View style={featureRowStyles.iconWrap}>
      <Ionicons name={icon as any} size={18} color="#fff" />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={featureRowStyles.title}>{title}</Text>
      <Text style={featureRowStyles.desc}>{desc}</Text>
    </View>
  </View>
);

const featureRowStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg, gap: spacing.md },
  iconWrap: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '700', color: '#fff' },
  desc: { fontSize: 13, color: 'rgba(255,255,255,0.78)', marginTop: 2 },
});

const makeStyles = (c: any) => StyleSheet.create({
  content: { padding: spacing.xl, paddingTop: spacing.xxxl, paddingBottom: spacing.xxxl },
  iconHero: { width: 96, height: 96, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xxl },
  title: { fontSize: 34, fontWeight: '700', color: '#fff', letterSpacing: -1, lineHeight: 40, marginBottom: spacing.md },
  subtitle: { fontSize: 16, lineHeight: 24, color: 'rgba(255,255,255,0.85)', marginBottom: spacing.xxxl },
  featureList: { marginBottom: spacing.xxxl },
  permissionCard: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  permissionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  checkBox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center' },
  checkBoxOn: { backgroundColor: '#34C759', borderColor: '#34C759' },
  permTitle: { fontSize: 15, fontWeight: '600', color: '#fff' },
  permDesc: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  permBtn: { backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  permBtnText: { fontSize: 13, fontWeight: '700', color: c.accent },
  platformNote: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: spacing.lg, textAlign: 'center' },
  privacyBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: spacing.md, marginBottom: spacing.xxxl, backgroundColor: 'rgba(0,0,0,0.18)', borderRadius: radius.md },
  privacyText: { flex: 1, fontSize: 12, lineHeight: 18, color: 'rgba(255,255,255,0.85)' },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', paddingVertical: 16, borderRadius: radius.lg, gap: 8 },
  ctaSecondary: { backgroundColor: 'rgba(255,255,255,0.92)' },
  ctaText: { fontSize: 16, fontWeight: '700', color: c.accent },
});
