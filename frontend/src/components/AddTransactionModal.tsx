import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { CategoryType } from '../types';
import { CATEGORIES, getCategoryInfo } from '../utils/categories';
import { useTransactions } from '../context/TransactionContext';
import { format } from 'date-fns';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  prefillMerchant?: string;
  prefillAmount?: number;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  visible,
  onClose,
  prefillMerchant = '',
  prefillAmount,
}) => {
  const { addTransaction, suggestCategoryForMerchant } = useTransactions();
  const [merchant, setMerchant] = useState(prefillMerchant);
  const [amount, setAmount] = useState(prefillAmount?.toString() || '');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [suggestedCategory, setSuggestedCategory] = useState<CategoryType | null>(null);
  const [notes, setNotes] = useState('');
  const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT));

  useEffect(() => {
    if (visible) {
      setMerchant(prefillMerchant);
      setAmount(prefillAmount?.toString() || '');
      
      // Auto-suggest category based on merchant
      if (prefillMerchant) {
        const suggested = suggestCategoryForMerchant(prefillMerchant);
        setSuggestedCategory(suggested);
        setSelectedCategory(suggested);
      }
      
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, prefillMerchant, prefillAmount]);

  useEffect(() => {
    if (merchant) {
      const suggested = suggestCategoryForMerchant(merchant);
      setSuggestedCategory(suggested);
      if (!selectedCategory && suggested) {
        setSelectedCategory(suggested);
      }
    }
  }, [merchant]);

  const handleConfirm = () => {
    if (!amount || !selectedCategory) return;

    addTransaction({
      amount: parseFloat(amount),
      merchant: merchant || 'Unknown Merchant',
      category: selectedCategory,
      date: format(new Date(), 'yyyy-MM-dd'),
      time: format(new Date(), 'hh:mm a'),
      isCredit: false,
      notes: notes || undefined,
      verified: 'UPI_VERIFIED',
    });

    // Reset and close
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setMerchant('');
    setAmount('');
    setSelectedCategory(null);
    setSuggestedCategory(null);
    setNotes('');
  };

  const handleIgnore = () => {
    resetForm();
    onClose();
  };

  const mainCategories: CategoryType[] = ['food', 'groceries', 'travel', 'bills', 'entertainment', 'others'];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        
        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <View style={styles.handle} />
            
            {/* Header Badge */}
            <View style={styles.detectedBadge}>
              <Ionicons name="chatbubble" size={14} color="#0D5D56" />
              <Text style={styles.detectedText}>UPI SMS DETECTED</Text>
            </View>

            {/* Amount Display */}
            <View style={styles.amountSection}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
                autoFocus={!prefillAmount}
              />
            </View>

            {/* Merchant */}
            <View style={styles.merchantSection}>
              <Text style={styles.toLabel}>to</Text>
              <TextInput
                style={styles.merchantInput}
                value={merchant}
                onChangeText={setMerchant}
                placeholder="Merchant name"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Category Selection */}
            <View style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryLabel}>SELECT CATEGORY</Text>
                {suggestedCategory && (
                  <View style={styles.smartSuggestion}>
                    <Ionicons name="sparkles" size={12} color="#10B981" />
                    <Text style={styles.smartText}>Smart Suggestion</Text>
                  </View>
                )}
              </View>
              
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScroll}
              >
                {mainCategories.map((cat) => {
                  const info = getCategoryInfo(cat);
                  const isSelected = selectedCategory === cat;
                  const isSuggested = suggestedCategory === cat;

                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryChip,
                        isSelected && styles.selectedChip,
                      ]}
                      onPress={() => setSelectedCategory(cat)}
                    >
                      {isSuggested && !isSelected && (
                        <View style={styles.aiBadge}>
                          <Text style={styles.aiText}>AI</Text>
                        </View>
                      )}
                      <View style={[
                        styles.categoryIcon,
                        isSelected && styles.selectedIcon,
                        !isSelected && { backgroundColor: info.bgColor },
                      ]}>
                        <Ionicons
                          name={info.icon as any}
                          size={22}
                          color={isSelected ? '#FFFFFF' : info.color}
                        />
                      </View>
                      <Text style={[
                        styles.categoryName,
                        isSelected && styles.selectedText,
                      ]}>
                        {info.name.split(' ')[0].toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Notes (Optional) */}
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add a note (optional)"
              placeholderTextColor="#9CA3AF"
              multiline
            />

            {/* Confirm Button */}
            <TouchableOpacity
              style={[
                styles.confirmButton,
                (!amount || !selectedCategory) && styles.disabledButton,
              ]}
              onPress={handleConfirm}
              disabled={!amount || !selectedCategory}
            >
              <Text style={styles.confirmText}>Confirm Transaction</Text>
            </TouchableOpacity>

            {/* Ignore Option */}
            <TouchableOpacity style={styles.ignoreButton} onPress={handleIgnore}>
              <Text style={styles.ignoreText}>Ignore this SMS</Text>
            </TouchableOpacity>

            {/* Privacy Footer */}
            <View style={styles.privacyFooter}>
              <Ionicons name="shield-checkmark" size={14} color="#0D5D56" />
              <Text style={styles.privacyText}>END-TO-END ENCRYPTED LOCAL ANALYSIS</Text>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 24,
    paddingBottom: 40,
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  keyboardView: {
    width: '100%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  detectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#E8F5F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  detectedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0D5D56',
    marginLeft: 8,
  },
  amountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  currencySymbol: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1A1A1A',
    minWidth: 100,
    textAlign: 'center',
  },
  merchantSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  toLabel: {
    fontSize: 18,
    color: '#6B7280',
    marginRight: 8,
  },
  merchantInput: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0D5D56',
    textAlign: 'center',
    minWidth: 120,
  },
  categorySection: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 1,
  },
  smartSuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smartText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 4,
  },
  categoryScroll: {
    paddingVertical: 4,
  },
  categoryChip: {
    width: 90,
    height: 85,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
  },
  selectedChip: {
    backgroundColor: '#0D5D56',
  },
  aiBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  aiText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  selectedIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
  },
  selectedText: {
    color: '#FFFFFF',
  },
  notesInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#1A1A1A',
    marginBottom: 20,
    minHeight: 50,
  },
  confirmButton: {
    backgroundColor: '#0D5D56',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  disabledButton: {
    opacity: 0.5,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  ignoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  ignoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  privacyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  privacyText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0D5D56',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
});
