import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CategoryType, ParsedSMS } from '../types';
import { CATEGORIES, getCategoryInfo } from '../utils/categories';
import { formatCurrency } from '../utils/formatters';
import { useApp } from '../context/AppContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  smsData?: ParsedSMS | null;
}

export const AddTransactionSheet: React.FC<Props> = ({ visible, onClose, smsData }) => {
  const { addTransaction, confirmSMS, dismissSMS, suggestCategoryFor } = useApp();
  
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState<CategoryType>('others');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (smsData) {
      setAmount(smsData.amount.toString());
      setMerchant(smsData.merchant);
      setCategory(suggestCategoryFor(smsData.merchant));
    } else {
      resetForm();
    }
  }, [smsData, visible]);

  useEffect(() => {
    if (merchant && !smsData) {
      setCategory(suggestCategoryFor(merchant));
    }
  }, [merchant]);

  const resetForm = () => {
    setAmount('');
    setMerchant('');
    setCategory('others');
    setNotes('');
  };

  const handleConfirm = () => {
    if (!amount || parseFloat(amount) <= 0) return;

    if (smsData) {
      confirmSMS(smsData, category);
    } else {
      addTransaction({
        amount: parseFloat(amount),
        merchant: merchant || 'Unknown',
        category,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        isCredit: false,
        notes: notes || undefined,
        source: 'manual',
      });
    }
    
    resetForm();
    onClose();
  };

  const handleDismiss = () => {
    if (smsData) dismissSMS();
    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleDismiss}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={handleDismiss} />
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheet}
        >
          <View style={styles.handle} />
          
          {smsData && (
            <View style={styles.smsBadge}>
              <Ionicons name="chatbubble" size={14} color="#059669" />
              <Text style={styles.smsBadgeText}>SMS Detected</Text>
            </View>
          )}
          
          {/* Amount */}
          <View style={styles.amountRow}>
            <Text style={styles.currency}>₹</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0"
              placeholderTextColor="#ccc"
              keyboardType="decimal-pad"
              autoFocus={!smsData}
            />
          </View>
          
          {/* Merchant */}
          <TextInput
            style={styles.merchantInput}
            value={merchant}
            onChangeText={setMerchant}
            placeholder="Merchant or description"
            placeholderTextColor="#999"
          />
          
          {/* Categories */}
          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {CATEGORIES.map(cat => {
              const isSelected = category === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryChip, isSelected && { backgroundColor: cat.color }]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Ionicons 
                    name={cat.icon as any} 
                    size={18} 
                    color={isSelected ? '#fff' : cat.color} 
                  />
                  <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          
          {/* Notes */}
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add note (optional)"
            placeholderTextColor="#999"
          />
          
          {/* Actions */}
          <TouchableOpacity
            style={[styles.confirmBtn, (!amount || parseFloat(amount) <= 0) && styles.disabledBtn]}
            onPress={handleConfirm}
            disabled={!amount || parseFloat(amount) <= 0}
          >
            <Text style={styles.confirmText}>
              {smsData ? 'Confirm' : 'Add Transaction'}
            </Text>
          </TouchableOpacity>
          
          {smsData && (
            <TouchableOpacity style={styles.skipBtn} onPress={handleDismiss}>
              <Text style={styles.skipText}>Skip this</Text>
            </TouchableOpacity>
          )}
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    maxHeight: SCREEN_HEIGHT * 0.8,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  smsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  smsBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
    marginLeft: 6,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  currency: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  amountInput: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1a1a1a',
    minWidth: 80,
    textAlign: 'center',
  },
  merchantInput: {
    fontSize: 16,
    color: '#1a1a1a',
    textAlign: 'center',
    paddingVertical: 12,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    marginBottom: 10,
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginLeft: 6,
  },
  categoryTextSelected: {
    color: '#fff',
  },
  notesInput: {
    fontSize: 14,
    color: '#1a1a1a',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
  },
  confirmBtn: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledBtn: {
    opacity: 0.4,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  skipText: {
    fontSize: 14,
    color: '#888',
  },
});
