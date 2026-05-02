import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../src/context/AppContext';
import { useTheme } from '../src/theme/ThemeProvider';
import { CategoryInfo } from '../src/types';
import { DEFAULT_CATEGORIES, ICON_OPTIONS, COLOR_PALETTE } from '../src/utils/categories';
import { spacing, radius, typography } from '../src/theme/design';

export default function CategoriesScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { customCategories, addCustomCategory, updateCustomCategory, deleteCustomCategory } = useApp();
  const [editing, setEditing] = useState<CategoryInfo | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const handleDelete = (id: string) => {
    const onConfirm = () => deleteCustomCategory(id);
    if (Platform.OS === 'web') { if (window.confirm('Delete this category?')) onConfirm(); }
    else Alert.alert('Delete category', 'Delete this category?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: onConfirm }]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Categories</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>Default</Text>
        <View style={styles.card}>
          {DEFAULT_CATEGORIES.map((c, i) => (
            <View key={c.id}>
              <CategoryRow cat={c} isCustom={false} />
              {i < DEFAULT_CATEGORIES.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Custom ({customCategories.length})</Text>
        <View style={styles.card}>
          {customCategories.length === 0 ? (
            <Text style={styles.empty}>No custom categories yet</Text>
          ) : (
            customCategories.map((c, i) => (
              <View key={c.id}>
                <CategoryRow cat={c} isCustom onEdit={() => setEditing(c)} onDelete={() => handleDelete(c.id)} />
                {i < customCategories.length - 1 && <View style={styles.divider} />}
              </View>
            ))
          )}
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)} activeOpacity={0.85}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addText}>New category</Text>
        </TouchableOpacity>
      </ScrollView>

      <CategoryEditor
        visible={showAdd || !!editing}
        category={editing}
        onClose={() => { setShowAdd(false); setEditing(null); }}
        onSave={(data) => {
          if (editing) updateCustomCategory(editing.id, data);
          else addCustomCategory(data);
          setShowAdd(false); setEditing(null);
        }}
      />
    </SafeAreaView>
  );
}

const CategoryRow: React.FC<{ cat: CategoryInfo; isCustom: boolean; onEdit?: () => void; onDelete?: () => void }> = ({ cat, isCustom, onEdit, onDelete }) => {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md }}>
      <View style={{ width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: cat.bgColor }}>
        <Ionicons name={cat.icon as any} size={18} color={cat.color} />
      </View>
      <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>{cat.name}</Text>
      {isCustom ? (
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <TouchableOpacity onPress={onEdit} style={{ padding: 6 }}><Ionicons name="pencil" size={16} color={colors.accent} /></TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={{ padding: 6 }}><Ionicons name="trash-outline" size={16} color={colors.error} /></TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

const CategoryEditor: React.FC<{ visible: boolean; category: CategoryInfo | null; onClose: () => void; onSave: (data: Omit<CategoryInfo, 'id' | 'isCustom'>) => void }> = ({ visible, category, onClose, onSave }) => {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('pricetag');
  const [color, setColor] = useState(COLOR_PALETTE[0]);
  const [type, setType] = useState<'expense' | 'income' | 'transfer'>('expense');
  const styles = useMemo(() => makeEditorStyles(colors), [colors]);

  React.useEffect(() => {
    if (category) { setName(category.name); setIcon(category.icon); setColor(category.color); setType(category.type || 'expense'); }
    else { setName(''); setIcon('pricetag'); setColor(COLOR_PALETTE[0]); setType('expense'); }
  }, [category, visible]);

  const bgColor = color + '22';

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), icon, color, bgColor, type });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
          <Text style={styles.title}>{category ? 'Edit Category' : 'New Category'}</Text>
          <TouchableOpacity onPress={handleSave}><Text style={styles.save}>Save</Text></TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
          {/* Preview */}
          <View style={styles.preview}>
            <View style={[styles.previewIcon, { backgroundColor: bgColor }]}>
              <Ionicons name={icon as any} size={28} color={color} />
            </View>
            <Text style={styles.previewName}>{name || 'Category name'}</Text>
          </View>

          <View>
            <Text style={styles.label}>Name</Text>
            <TextInput
              value={name} onChangeText={setName}
              placeholder="e.g. Subscriptions" placeholderTextColor={colors.textTertiary}
              style={styles.input} autoCapitalize="words"
            />
          </View>

          <View>
            <Text style={styles.label}>Type</Text>
            <View style={styles.row}>
              {(['expense', 'income', 'transfer'] as const).map((t) => (
                <TouchableOpacity key={t} onPress={() => setType(t)} style={[styles.chip, type === t && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                  <Text style={[styles.chipText, type === t && styles.chipActive]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <Text style={styles.label}>Color</Text>
            <View style={styles.row}>
              {COLOR_PALETTE.map((c) => (
                <TouchableOpacity key={c} onPress={() => setColor(c)} style={[styles.swatch, { backgroundColor: c }, color === c && { borderWidth: 3, borderColor: colors.textPrimary }]} />
              ))}
            </View>
          </View>

          <View>
            <Text style={styles.label}>Icon</Text>
            <View style={styles.iconGrid}>
              {ICON_OPTIONS.map((ic) => (
                <TouchableOpacity
                  key={ic}
                  onPress={() => setIcon(ic)}
                  style={[styles.iconCell, icon === ic && { backgroundColor: bgColor, borderColor: color }]}
                >
                  <Ionicons name={ic as any} size={20} color={icon === ic ? color : colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const makeStyles = (c: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, paddingBottom: spacing.sm },
  backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  title: { ...typography.subtitle, color: c.textPrimary },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: c.textSecondary, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: spacing.sm, marginBottom: 6, paddingHorizontal: 4 },
  card: { backgroundColor: c.surface, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: c.borderLight },
  divider: { height: 1, backgroundColor: c.borderLight, marginLeft: 36 + spacing.md * 2 },
  empty: { padding: spacing.lg, fontSize: 13, color: c.textTertiary, textAlign: 'center' },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: c.accent, paddingVertical: 14, borderRadius: radius.lg, gap: 6, marginTop: spacing.lg },
  addText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

const makeEditorStyles = (c: any) => StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: c.borderLight, backgroundColor: c.surface },
  cancel: { fontSize: 15, color: c.textSecondary, fontWeight: '500' },
  save: { fontSize: 15, color: c.accent, fontWeight: '700' },
  title: { fontSize: 16, fontWeight: '700', color: c.textPrimary },
  preview: { alignItems: 'center', padding: spacing.xl, backgroundColor: c.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: c.borderLight },
  previewIcon: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  previewName: { fontSize: 17, fontWeight: '600', color: c.textPrimary },
  label: { fontSize: 11, fontWeight: '700', color: c.textSecondary, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 },
  input: { backgroundColor: c.surface, borderRadius: radius.md, padding: 14, fontSize: 15, color: c.textPrimary, borderWidth: 1, borderColor: c.borderLight, ...(Platform.OS === 'web' ? { outlineStyle: 'none' as any, outlineWidth: 0 as any } : {}) },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: radius.full, backgroundColor: c.surface, borderWidth: 1, borderColor: c.borderLight },
  chipText: { fontSize: 13, fontWeight: '600', color: c.textSecondary },
  chipActive: { color: c.background === '#000000' ? '#000' : '#fff' },
  swatch: { width: 36, height: 36, borderRadius: 18 },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconCell: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surface, borderWidth: 1, borderColor: c.borderLight },
});
