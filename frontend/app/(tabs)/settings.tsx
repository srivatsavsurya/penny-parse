import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/context/AppContext';
import { smsReceiver } from '../../src/native/smsReceiver';

export default function SettingsScreen() {
  const { settings, updateSettings, loadDemo, clearData, simulateSMS } = useApp();
  const [apiKey, setApiKey] = useState(settings.openRouterApiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSaveApiKey = () => {
    updateSettings({ openRouterApiKey: apiKey || undefined });
    Alert.alert('Saved', 'API key has been saved.');
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all transactions. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearData },
      ]
    );
  };

  const handleTestSMS = () => {
    // Simulate a UPI SMS for testing
    const testMessage = 'Rs.458.00 debited from A/c XX1234 to zomato@paytm UPI Ref 412345678901';
    simulateSMS(testMessage);
    Alert.alert('SMS Simulated', 'A test UPI transaction has been sent to the app.');
  };

  const handleRequestSMSPermission = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert('Android Only', 'SMS reading is only available on Android devices.');
      return;
    }
    
    const granted = await smsReceiver.requestSMSPermissions();
    if (granted) {
      Alert.alert('Success', 'SMS permission granted. The app will now detect UPI transactions.');
    } else {
      Alert.alert('Permission Denied', 'SMS permission is required to auto-detect transactions.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* SMS Settings */}
        <Text style={styles.sectionTitle}>SMS Detection</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={handleRequestSMSPermission}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconWrap, { backgroundColor: '#ecfdf5' }]}>
                <Ionicons name="chatbubble-ellipses" size={20} color="#059669" />
              </View>
              <View>
                <Text style={styles.rowTitle}>Enable SMS Reading</Text>
                <Text style={styles.rowSubtitle}>Auto-detect UPI transactions</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconWrap, { backgroundColor: '#f5f5f5' }]}>
                <Ionicons name="flash" size={20} color="#666" />
              </View>
              <View>
                <Text style={styles.rowTitle}>Auto-categorize</Text>
                <Text style={styles.rowSubtitle}>Use smart rules for categories</Text>
              </View>
            </View>
            <Switch
              value={settings.autoCategorizeSms}
              onValueChange={(v) => updateSettings({ autoCategorizeSms: v })}
              trackColor={{ false: '#e0e0e0', true: '#1a1a1a' }}
            />
          </View>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row} onPress={handleTestSMS}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconWrap, { backgroundColor: '#fef3c7' }]}>
                <Ionicons name="bug" size={20} color="#d97706" />
              </View>
              <View>
                <Text style={styles.rowTitle}>Test SMS Detection</Text>
                <Text style={styles.rowSubtitle}>Simulate a UPI transaction</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* AI Settings */}
        <Text style={styles.sectionTitle}>AI Insights (Optional)</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconWrap, { backgroundColor: '#ede9fe' }]}>
                <Ionicons name="sparkles" size={20} color="#7c3aed" />
              </View>
              <View>
                <Text style={styles.rowTitle}>Enable AI Insights</Text>
                <Text style={styles.rowSubtitle}>Get personalized spending tips</Text>
              </View>
            </View>
            <Switch
              value={settings.enableAiInsights}
              onValueChange={(v) => updateSettings({ enableAiInsights: v })}
              trackColor={{ false: '#e0e0e0', true: '#1a1a1a' }}
            />
          </View>

          {settings.enableAiInsights && (
            <>
              <View style={styles.divider} />
              <View style={styles.apiKeySection}>
                <Text style={styles.apiKeyLabel}>OpenRouter API Key</Text>
                <View style={styles.apiKeyRow}>
                  <TextInput
                    style={styles.apiKeyInput}
                    value={apiKey}
                    onChangeText={setApiKey}
                    placeholder="sk-or-..."
                    placeholderTextColor="#999"
                    secureTextEntry={!showApiKey}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowApiKey(!showApiKey)}>
                    <Ionicons name={showApiKey ? 'eye-off' : 'eye'} size={20} color="#888" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveApiKey}>
                  <Text style={styles.saveBtnText}>Save Key</Text>
                </TouchableOpacity>
                <Text style={styles.apiKeyHint}>
                  Get your key at openrouter.ai. Without a key, basic insights are shown.
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Data */}
        <Text style={styles.sectionTitle}>Data</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={loadDemo}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconWrap, { backgroundColor: '#dbeafe' }]}>
                <Ionicons name="download" size={20} color="#2563eb" />
              </View>
              <View>
                <Text style={styles.rowTitle}>Load Demo Data</Text>
                <Text style={styles.rowSubtitle}>Add sample transactions</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row} onPress={handleClearData}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconWrap, { backgroundColor: '#fef2f2' }]}>
                <Ionicons name="trash" size={20} color="#dc2626" />
              </View>
              <View>
                <Text style={[styles.rowTitle, { color: '#dc2626' }]}>Clear All Data</Text>
                <Text style={styles.rowSubtitle}>Delete all transactions</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.about}>
          <Text style={styles.aboutText}>The Private Ledger v1.0</Text>
          <Text style={styles.aboutSubtext}>Your spending, your device.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  scroll: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    marginTop: 8,
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  rowSubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 68,
  },
  apiKeySection: {
    padding: 16,
    paddingTop: 8,
  },
  apiKeyLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  apiKeyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  apiKeyInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1a1a1a',
  },
  saveBtn: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  apiKeyHint: {
    fontSize: 12,
    color: '#888',
    marginTop: 10,
    lineHeight: 18,
  },
  about: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  aboutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
  },
  aboutSubtext: {
    fontSize: 12,
    color: '#bbb',
    marginTop: 4,
  },
});
