import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTransactions } from '../../src/context/TransactionContext';
import { DEFAULT_SMART_RULES } from '../../src/utils/smartRules';

export default function PrivacyScreen() {
  const { clearAllData, loadDemoData, smartRules } = useTransactions();

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your transactions. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            clearAllData();
            Alert.alert('Success', 'All data has been cleared.');
          },
        },
      ]
    );
  };

  const handleLoadDemo = () => {
    Alert.alert(
      'Load Demo Data',
      'This will add sample transactions to help you explore the app.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Load',
          onPress: () => {
            loadDemoData();
            Alert.alert('Success', 'Demo data has been loaded.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Ionicons name="shield-checkmark" size={18} color="#0D5D56" />
          </View>
          <Text style={styles.logoText}>The Private Ledger</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="settings-outline" size={24} color="#0D5D56" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Title */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Privacy & Rules</Text>
          <Text style={styles.pageSubtitle}>
            Your financial data stays 100% on your device. No cloud sync, no tracking.
          </Text>
        </View>

        {/* Privacy Status Card */}
        <View style={styles.privacyCard}>
          <View style={styles.privacyHeader}>
            <Ionicons name="shield-checkmark" size={32} color="#FFFFFF" />
            <View style={styles.privacyInfo}>
              <Text style={styles.privacyTitle}>Privacy Protected</Text>
              <Text style={styles.privacySubtitle}>All data encrypted locally</Text>
            </View>
          </View>
          <View style={styles.privacyStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Cloud Uploads</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>100%</Text>
              <Text style={styles.statLabel}>Local Storage</Text>
            </View>
          </View>
        </View>

        {/* Smart Rules Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="sparkles" size={20} color="#0D5D56" />
              <Text style={styles.sectionTitle}>Smart Rules</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.editLink}>Edit Rules</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionDesc}>
            Local engine identifies transactions based on merchant strings. No data leaves your device.
          </Text>

          {DEFAULT_SMART_RULES.slice(0, 4).map((rule, index) => (
            <View key={rule.id} style={styles.ruleItem}>
              <View style={styles.ruleInfo}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.ruleText}>
                  {rule.keywords.slice(0, 2).map(k => k.charAt(0).toUpperCase() + k.slice(1)).join(' / ')}
                </Text>
              </View>
              <Text style={styles.ruleCategory}>
                {rule.category.toUpperCase()}
              </Text>
            </View>
          ))}
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity style={styles.optionItem} onPress={handleLoadDemo}>
            <View style={styles.optionIcon}>
              <Ionicons name="download-outline" size={20} color="#0D5D56" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Load Demo Data</Text>
              <Text style={styles.optionDesc}>Add sample transactions to explore</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <View style={styles.optionIcon}>
              <Ionicons name="document-text-outline" size={20} color="#0D5D56" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Export Data</Text>
              <Text style={styles.optionDesc}>Download as PDF or CSV</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.optionItem, styles.dangerItem]} onPress={handleClearData}>
            <View style={[styles.optionIcon, styles.dangerIcon]}>
              <Ionicons name="trash-outline" size={20} color="#DC2626" />
            </View>
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, styles.dangerText]}>Clear All Data</Text>
              <Text style={styles.optionDesc}>Permanently delete all transactions</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Dark Mode</Text>
              <Text style={styles.settingDesc}>Use dark theme</Text>
            </View>
            <Switch
              value={false}
              trackColor={{ false: '#E5E7EB', true: '#0D5D56' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Notifications</Text>
              <Text style={styles.settingDesc}>Transaction alerts</Text>
            </View>
            <Switch
              value={true}
              trackColor={{ false: '#E5E7EB', true: '#0D5D56' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Biometric Lock</Text>
              <Text style={styles.settingDesc}>Require fingerprint/face</Text>
            </View>
            <Switch
              value={false}
              trackColor={{ false: '#E5E7EB', true: '#0D5D56' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>The Private Ledger v1.0.0</Text>
          <Text style={styles.appTagline}>Your money, your privacy.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#E8F5F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0D5D56',
  },
  profileButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  titleSection: {
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  privacyCard: {
    backgroundColor: '#0D5D56',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  privacyInfo: {
    marginLeft: 16,
  },
  privacyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  privacySubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  privacyStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  editLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D5D56',
  },
  sectionDesc: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 18,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  ruleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ruleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
    marginLeft: 10,
  },
  ruleCategory: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0D5D56',
    backgroundColor: '#E8F5F3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E8F5F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionContent: {
    flex: 1,
    marginLeft: 12,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  optionDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  dangerItem: {
    borderBottomWidth: 0,
  },
  dangerIcon: {
    backgroundColor: '#FEE2E2',
  },
  dangerText: {
    color: '#DC2626',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  settingDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  appVersion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  appTagline: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
});
