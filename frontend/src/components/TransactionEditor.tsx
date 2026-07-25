// Unified popup used for both:
// 1. Auto-captured UPI notifications (banner mode)
// 2. Editing existing transactions (full edit mode)
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform,
  Animated, Easing, Pressable, TextInput, KeyboardAvoidingView, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useApp, PendingTx } from '../context/AppContext';
import { useTheme } from '../theme/ThemeProvider';
import { CategoryType, NeedWantTag } from '../types';
import { getAllCategories, getCategoryInfo, TAGS } from '../utils/categories';
import { spacing, radius, typography } from '../theme/design';
import { format, parseISO } from 'date-fns';

const formatAmt = (amt: number) =>
  new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: amt % 1 === 0 ? 0 : 2,
  }).format(amt);

export const TransactionEditor: React.FC = () => {
  const { pendingTransaction, confirmTransaction, dismissTransaction, deleteTransaction, accounts, customCategories } = useApp();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const visible = !!pendingTransaction;
  const [selectedCat, setSelectedCat] = useState<CategoryType>('others');
  const [selectedTag, setSelectedTag] = useState<NeedWantTag>('unset');
  const [accountId, setAccountId] = useState<string | undefined>();
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);

  const translateY = useRef(new Animated.Value(800)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (pendingTransaction) {
      setSelectedCat(pendingTransaction.category || (pendingTransaction.isDebit ? 'others' : 'income'));
      setSelectedTag(pendingTransaction.tag || 'unset');
      setAccountId(pendingTransaction.accountId);
      setNotes(pendingTransaction.notes || '');
      setDate(pendingTransaction.date || format(new Date(), 'yyyy-MM-dd'));
      setTime(pendingTransaction.time);
      setEditingNotes(false);
    }
  }, [pendingTransaction]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 0, duration: 360, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 1, duration: 240, useNativeDriver: true }),
      ]).start();
    } else {
      translateY.setValue(800);
      backdropOpacity.setValue(0);
    }
  }, [visible]);

  const close = (cb: () => void) => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 900, duration: 240, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => cb());
  };

  const allCats = useMemo(() => getAllCategories(customCategories), [customCategories]);
  const expenseCats = allCats.filter((c) => c.type !== 'income');
  const incomeCats = allCats.filter((c) => c.type === 'income' || c.type === 'transfer');
  const visibleCats = pendingTransaction?.isDebit ? expenseCats : incomeCats;
  const styles = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  // For manual entries: editable amount + merchant (must be declared BEFORE conditional return)
  const [editAmount, setEditAmount] = useState('');
  const [editMerchant, setEditMerchant] = useState('');
  useEffect(() => {
    setEditAmount(pendingTransaction?.amount ? String(pendingTransaction.amount) : '');
    setEditMerchant(pendingTransaction?.merchant || '');
  }, [pendingTransaction?.id, visible]);

  if (!visible || !pendingTransaction) return null;

  const isEdit = !!pendingTransaction.isEdit;
  const isManual = !pendingTransaction.isEdit && (pendingTransaction.merchant === '' || pendingTransaction.amount === 0);
  const isDebit = pendingTransaction.isDebit;
  const amountColor = isDebit ? colors.textPrimary : colors.success;
  const dotColor = isDebit ? colors.error : colors.success;

  const handleSave = () => {
    const finalAmount = isManual || isEdit ? parseFloat(editAmount) || 0 : pendingTransaction.amount;
    const finalMerchant = isManual || isEdit ? editMerchant.trim() || pendingTransaction.merchant : pendingTransaction.merchant;
    if (finalAmount <= 0) return;
    close(() => confirmTransaction({
      category: selectedCat,
      tag: selectedTag,
      accountId,
      notes: notes.trim() || undefined,
      date,
      time,
      amount: finalAmount,
      merchant: finalMerchant || 'Unknown',
    }));
  };

  const handleDelete = () => {
    if (!pendingTransaction.id) return;
    const onConfirm = () => {
      deleteTransaction(pendingTransaction.id!);
      close(dismissTransaction);
    };
    if (Platform.OS === 'web') {
      if (window.confirm('Delete this transaction?')) onConfirm();
    } else {
      Alert.alert('Delete transaction', 'This cannot be undone.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onConfirm },
      ]);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={() => close(dismissTransaction)}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.root}>
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => close(dismissTransaction)} />
          </Animated.View>

          <Animated.View
            style={[styles.sheet, { paddingBottom: Math.max(insets.bottom + spacing.lg, spacing.xxl), transform: [{ translateY }] }]}
          >
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.header}>
              <View style={[styles.typeDot, { backgroundColor: dotColor }]} />
              <Text style={styles.typeLabel}>{isEdit ? (isDebit ? 'Edit Payment' : 'Edit Income') : isDebit ? 'Payment' : 'Received'}</Text>
              {isEdit && pendingTransaction.id ? (
                <TouchableOpacity onPress={handleDelete} style={styles.deleteIcon}>
                  <Ionicons name="trash-outline" size={18} color={colors.error} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Amount — editable for manual + edit, display-only for SMS captures */}
            {(isManual || isEdit) ? (
              <View style={styles.editAmountRow}>
                <Text style={[styles.amountText, { color: amountColor }]}>{(isDebit ? '\u2212' : '+') + '\u20B9'}</Text>
                <TextInput
                  style={[styles.amountText, styles.amountInput, { color: amountColor }]}
                  value={editAmount}
                  onChangeText={setEditAmount}
                  placeholder="0"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numeric"
                />
              </View>
            ) : (
              <Text style={[styles.amountText, { color: amountColor }]} numberOfLines={1}>
                {(isDebit ? '\u2212' : '+') + '\u20B9' + formatAmt(pendingTransaction.amount)}
              </Text>
            )}
            {(isManual || isEdit) ? (
              <TextInput
                style={[styles.merchant, styles.merchantInput, { color: colors.textPrimary }]}
                value={editMerchant}
                onChangeText={setEditMerchant}
                placeholder="Who did you pay?"
                placeholderTextColor={colors.textTertiary}
              />
            ) : (
              <Text style={styles.merchant} numberOfLines={1}>{pendingTransaction.merchant}</Text>
            )}

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {/* Date & Time */}
              <View style={styles.metaRow}>
                <TouchableOpacity style={styles.metaChip} onPress={() => setShowDatePicker(true)} activeOpacity={0.7}>
                  <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.metaText}>{format(parseISO(date), 'EEE, MMM d')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.metaChip} onPress={() => setShowTimePicker(true)} activeOpacity={0.7}>
                  <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.metaText}>{time}</Text>
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={parseISO(date)}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  onChange={(_, d) => { setShowDatePicker(Platform.OS === 'ios'); if (d) setDate(format(d, 'yyyy-MM-dd')); }}
                  maximumDate={new Date()}
                />
              )}
              {showTimePicker && (
                <DateTimePicker
                  value={(() => { try { const d = new Date(); return d; } catch { return new Date(); } })()}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(_, d) => { setShowTimePicker(Platform.OS === 'ios'); if (d) setTime(d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })); }}
                />
              )}

              <View style={styles.divider} />

              {/* Account */}
              {accounts.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Account</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollRow}>
                    {accounts.map((acc) => {
                      const sel = accountId === acc.id;
                      return (
                        <TouchableOpacity
                          key={acc.id}
                          onPress={() => setAccountId(acc.id)}
                          style={[styles.accChip, sel && { backgroundColor: acc.color, borderColor: acc.color }]}
                        >
                          <View style={[styles.accDot, { backgroundColor: sel ? '#fff' : acc.color }]} />
                          <Text style={[styles.accChipText, sel && styles.accChipSelected]}>{acc.name}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              {/* Category */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollRow}>
                  {visibleCats.map((cat) => {
                    const sel = selectedCat === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => setSelectedCat(cat.id)}
                        style={[styles.chip, sel && { backgroundColor: cat.color, borderColor: cat.color }]}
                      >
                        <Ionicons name={cat.icon as any} size={16} color={sel ? '#fff' : cat.color} />
                        <Text style={[styles.chipText, sel && styles.chipSelected]}>{cat.name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Need / Want / Investment / Business tag */}
              {isDebit && (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Type</Text>
                  <View style={styles.tagRow}>
                    {TAGS.map((t) => {
                      const sel = selectedTag === t.id;
                      return (
                        <TouchableOpacity
                          key={t.id}
                          onPress={() => setSelectedTag(sel ? 'unset' : t.id)}
                          style={[styles.tagChip, sel && { backgroundColor: t.color, borderColor: t.color }]}
                        >
                          <Ionicons name={t.icon as any} size={14} color={sel ? '#fff' : t.color} />
                          <Text style={[styles.tagText, sel && styles.tagTextSelected]}>{t.name}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Notes — always editable */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Note</Text>
                <View style={styles.notesBox}>
                  <Ionicons name="create-outline" size={16} color={colors.textTertiary} style={{ marginTop: 2 }} />
                  <TextInput
                    style={styles.notesInput}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Add a note (optional)"
                    placeholderTextColor={colors.textTertiary}
                    multiline
                    onFocus={() => setEditingNotes(true)}
                    onBlur={() => setEditingNotes(false)}
                  />
                </View>
              </View>
            </ScrollView>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.skipBtn} onPress={() => close(dismissTransaction)} activeOpacity={0.7}>
                <Text style={styles.skipText}>{isEdit ? 'Cancel' : 'Skip'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
                <Ionicons name={isEdit ? 'checkmark' : 'checkmark-circle'} size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.saveText}>{isEdit ? 'Save changes' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const makeStyles = (c: any, isDark: boolean) => StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.55)' },
  sheet: {
    backgroundColor: c.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xxl,
    maxHeight: '90%',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 20 },
      android: { elevation: 24 },
    }),
  },
  handle: { width: 40, height: 4, backgroundColor: c.border, borderRadius: 2, alignSelf: 'center', marginTop: spacing.sm, marginBottom: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, gap: spacing.sm },
  typeDot: { width: 6, height: 6, borderRadius: 3 },
  typeLabel: { ...typography.caption, color: c.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, flex: 1 },
  deleteIcon: { padding: 6, borderRadius: 8 },
  amountText: { fontSize: 38, fontWeight: '700', letterSpacing: -0.8, lineHeight: 46, marginBottom: 2 },
  editAmountRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 2 },
  amountInput: { flex: 1, padding: 0, ...(Platform.OS === 'web' ? { outlineStyle: 'none' as any, outlineWidth: 0 as any } : {}) },
  merchantInput: { padding: 0, borderBottomWidth: 1, borderBottomColor: c.borderLight, paddingBottom: 6, ...(Platform.OS === 'web' ? { outlineStyle: 'none' as any, outlineWidth: 0 as any } : {}) },
  merchant: { fontSize: 17, fontWeight: '500', color: c.textPrimary, marginBottom: spacing.lg },
  metaRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: c.surfaceSecondary, borderRadius: radius.md, borderWidth: 1, borderColor: c.borderLight },
  metaText: { fontSize: 13, fontWeight: '600', color: c.textPrimary },
  divider: { height: 1, backgroundColor: c.borderLight, marginBottom: spacing.lg },
  section: { marginBottom: spacing.lg },
  sectionLabel: { ...typography.caption, color: c.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: spacing.sm },
  scrollRow: { gap: spacing.sm, paddingRight: spacing.xxl },
  chip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, paddingHorizontal: 12, backgroundColor: c.surfaceSecondary, borderRadius: radius.full, borderWidth: 1, borderColor: c.borderLight },
  chipText: { fontSize: 13, fontWeight: '600', color: c.textSecondary, marginLeft: 6 },
  chipSelected: { color: '#fff' },
  tagRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  tagChip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, paddingHorizontal: 14, backgroundColor: c.surfaceSecondary, borderRadius: radius.full, borderWidth: 1, borderColor: c.borderLight, gap: 6 },
  tagText: { fontSize: 13, fontWeight: '600', color: c.textSecondary },
  tagTextSelected: { color: '#fff' },
  accChip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, paddingHorizontal: 12, backgroundColor: c.surfaceSecondary, borderRadius: radius.full, borderWidth: 1, borderColor: c.borderLight, gap: 6 },
  accDot: { width: 8, height: 8, borderRadius: 4 },
  accChipText: { fontSize: 13, fontWeight: '600', color: c.textSecondary },
  accChipSelected: { color: '#fff' },
  notesBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: spacing.md, backgroundColor: c.surfaceSecondary, borderRadius: radius.md, borderWidth: 1, borderColor: c.borderLight, minHeight: 56 },
  notesInput: { flex: 1, fontSize: 14, color: c.textPrimary, padding: 0, ...(Platform.OS === 'web' ? { outlineStyle: 'none' as any, outlineWidth: 0 as any } : {}) },
  actions: { flexDirection: 'row', marginTop: spacing.md, gap: spacing.md, paddingTop: spacing.sm },
  skipBtn: { flex: 1, height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: radius.lg, backgroundColor: c.surfaceSecondary },
  skipText: { fontSize: 15, fontWeight: '600', color: c.textSecondary },
  saveBtn: { flex: 2, flexDirection: 'row', height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: radius.lg, backgroundColor: c.accent },
  saveText: { fontSize: 15, fontWeight: '700', color: '#fff', letterSpacing: 0.2 },
});
