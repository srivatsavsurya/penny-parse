import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert, Modal, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../../src/context/AppContext';
import { useTheme } from '../../src/theme/ThemeProvider';
import { spacing, radius, typography } from '../../src/theme/design';
import { ThemeMode } from '../../src/types';
import { isPermissionGranted, openNotificationSettings, isAvailable } from '../../src/hooks/useNotificationListener';

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, updateSettings, accounts, transactions, clearData, seedDemoData } = useApp();
  const { colors, isDark } = useTheme();
  const [showApiKey, setShowApiKey] = useState(false);
  const [permGranted, setPermGranted] = useState(false);
  const styles = useMemo(() => makeStyles(colors), [colors]);

  React.useEffect(() => {
    isPermissionGranted().then(setPermGranted);
  }, []);

  const confirm = (title: string, msg: string, onYes: () => void) => {
    if (Platform.OS === 'web') { if (window.confirm(msg)) onYes(); }
    else Alert.alert(title, msg, [{ text: 'Cancel', style: 'cancel' }, { text: 'OK', style: 'destructive', onPress: onYes }]);
  };

  const exportCSV = () => {
    if (transactions.length === 0) { Alert.alert('No data', 'Nothing to export.'); return; }
    const header = 'Date,Time,Merchant,Category,Amount,Type,Account,Notes,UPI Ref\n';
    const rows = transactions.map((t) => {
      const acc = accounts.find((a) => a.id === t.accountId)?.name || '';
      return `${t.date},${t.time},"${t.merchant}",${t.category},${t.amount},${t.isCredit ? 'Credit' : 'Debit'},${acc},"${(t.notes || '').replace(/,/g, ';')}",${t.upiRef || ''}`;
    });
    const csv = header + rows.join('\n');
    if (Platform.OS === 'web') {
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `private-ledger-${Date.now()}.csv`; a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Settings</Text>

        {/* Permission Status — critical for MSP */}
        {isAvailable && (
          <Section title="">
            <Row
              icon={permGranted ? 'shield-checkmark' : 'warning'}
              iconColor={permGranted ? colors.success : colors.warning}
              iconBg={permGranted ? colors.successBg : colors.warningBg}
              title={permGranted ? 'Auto-capture is on' : 'Auto-capture is off'}
              subtitle={permGranted ? 'Reading payment notifications' : 'Tap to enable notification access'}
              onPress={async () => { await openNotificationSettings(); setTimeout(async () => setPermGranted(await isPermissionGranted()), 1000); }}
            />
          </Section>
        )}

        {/* Appearance */}
        <Section title="Appearance">
          <View style={styles.themeRow}>
            {(['light', 'dark', 'system'] as ThemeMode[]).map((m) => {
              const sel = settings.themeMode === m;
              const icon = m === 'light' ? 'sunny' : m === 'dark' ? 'moon' : 'phone-portrait';
              const label = m === 'system' ? 'Auto' : m.charAt(0).toUpperCase() + m.slice(1);
              return (
                <TouchableOpacity
                  key={m}
                  style={[styles.themeOpt, sel && { backgroundColor: colors.accent, borderColor: colors.accent }]}
                  onPress={() => updateSettings({ themeMode: m })}
                  activeOpacity={0.85}
                >
                  <Ionicons name={icon as any} size={22} color={sel ? '#fff' : colors.textPrimary} />
                  <Text style={[styles.themeLabel, { color: sel ? '#fff' : colors.textPrimary }]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Section>

        {/* Categories */}
        <Section title="Categories">
          <Row
            icon="pricetags-outline"
            iconColor={colors.accent}
            iconBg={colors.infoBg}
            title="Manage categories"
            subtitle="Add custom categories with icons & colors"
            onPress={() => router.push('/categories' as any)}
          />
        </Section>

        {/* AI */}
        <Section title="AI Insights" subtitle="Powered by OpenRouter (BYOK)">
          <Row
            icon="sparkles"
            iconColor={colors.accent}
            iconBg={colors.infoBg}
            title="AI insights"
            subtitle="Analyze your spending in Analytics"
            right={<Switch value={settings.enableAiInsights} onValueChange={(v) => updateSettings({ enableAiInsights: v })} trackColor={{ false: colors.border, true: colors.accent }} thumbColor="#fff" />}
          />
          <Divider />
          <Row
            icon="hardware-chip"
            iconColor={colors.warning}
            iconBg={colors.warningBg}
            title="AI parse fallback"
            subtitle="When a UPI SMS doesn't match a template, use AI to parse it. Off by default. Account numbers are redacted before sending."
            right={<Switch value={settings.enableLlmFallback} onValueChange={(v) => updateSettings({ enableLlmFallback: v })} trackColor={{ false: colors.border, true: colors.warning }} thumbColor="#fff" />}
          />
          <Divider />
          <View style={styles.apiRow}>
            <Text style={styles.apiLabel}>OpenRouter API Key</Text>
            <View style={styles.apiInputWrap}>
              <TextInput value={settings.openRouterApiKey || ''} onChangeText={(v) => updateSettings({ openRouterApiKey: v })} placeholder="sk-or-v1-…" placeholderTextColor={colors.textTertiary} style={styles.apiInput} secureTextEntry={!showApiKey} autoCapitalize="none" autoCorrect={false} />
              <TouchableOpacity onPress={() => setShowApiKey(!showApiKey)} style={{ padding: 4 }}>
                <Ionicons name={showApiKey ? 'eye-off' : 'eye'} size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => Platform.OS === 'web' ? window.open('https://openrouter.ai/keys', '_blank') : Alert.alert('Get a key', 'Visit openrouter.ai/keys')}>
              <Text style={styles.apiHint}>Get free key → openrouter.ai/keys</Text>
            </TouchableOpacity>
          </View>
        </Section>

        {/* Data */}
        <Section title="Data">
          <Row icon="download-outline" iconColor={colors.info} iconBg={colors.infoBg} title="Export CSV" subtitle="Download all transactions" onPress={exportCSV} />
          <Divider />
          <Row icon="flash-outline" iconColor={colors.warning} iconBg={colors.warningBg} title="Load demo data" subtitle="Populate with sample transactions" onPress={() => confirm('Load demo', 'Replace existing transactions with demo?', seedDemoData)} />
          <Divider />
          <Row icon="trash-outline" iconColor={colors.error} iconBg={colors.errorBg} title="Clear all data" subtitle="Delete transactions and budgets" onPress={() => confirm('Clear data', 'Permanently delete all data?', clearData)} />
        </Section>

        {/* About */}
        <Section title="About">
          <Row icon="shield-checkmark-outline" iconColor={colors.success} iconBg={colors.successBg} title="100% Private" subtitle="All data stays on your device" />
          <Divider />
          <Row icon="information-circle-outline" iconColor={colors.textSecondary} iconBg={colors.surfaceSecondary} title="Version" subtitle="1.0.0" />
        </Section>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const Section: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({ title, subtitle, children }) => {
  const { colors } = useTheme();
  return (
    <View style={{ marginBottom: spacing.xl }}>
      {title ? (
        <View style={{ marginBottom: spacing.sm, paddingHorizontal: 4 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary, letterSpacing: 0.3 }}>{title}</Text>
          {subtitle ? <Text style={{ fontSize: 12, color: colors.textTertiary, marginTop: 2 }}>{subtitle}</Text> : null}
        </View>
      ) : null}
      <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.borderLight }}>{children}</View>
    </View>
  );
};

const Row: React.FC<{ icon: string; iconColor: string; iconBg: string; title: string; subtitle?: string; right?: React.ReactNode; onPress?: () => void; }> = ({ icon, iconColor, iconBg, title, subtitle, right, onPress }) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md, minHeight: 56 }} onPress={onPress} activeOpacity={onPress ? 0.7 : 1} disabled={!onPress}>
      <View style={{ width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: iconBg }}>
        <Ionicons name={icon as any} size={18} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>{title}</Text>
        {subtitle ? <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>{subtitle}</Text> : null}
      </View>
      {right || (onPress && <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />)}
    </TouchableOpacity>
  );
};

const Divider: React.FC = () => {
  const { colors } = useTheme();
  return <View style={{ height: 1, backgroundColor: colors.borderLight, marginLeft: 36 + spacing.md * 2 }} />;
};

const makeStyles = (c: any) => StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  title: { ...typography.title, color: c.textPrimary, marginBottom: spacing.lg },
  themeRow: { flexDirection: 'row', padding: spacing.md, gap: spacing.sm },
  themeOpt: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.lg, borderRadius: radius.md, backgroundColor: c.surfaceSecondary, borderWidth: 1, borderColor: c.borderLight, gap: 6 },
  themeLabel: { fontSize: 13, fontWeight: '600' },
  apiRow: { padding: spacing.md, gap: 8 },
  apiLabel: { fontSize: 11, fontWeight: '700', color: c.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  apiInputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.surfaceSecondary, borderRadius: radius.md, paddingHorizontal: spacing.md, height: 44, gap: 8, borderWidth: 1, borderColor: c.borderLight },
  apiInput: { flex: 1, fontSize: 13, color: c.textPrimary, ...(Platform.OS === 'web' ? { outlineStyle: 'none' as any, outlineWidth: 0 as any } : {}) },
  apiHint: { fontSize: 11, color: c.accent, fontWeight: '600', marginTop: 4 },
});
