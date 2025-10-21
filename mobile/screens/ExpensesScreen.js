import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function ExpensesScreen() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      Alert.alert('Error', 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async () => {
    if (!title || !category || !amount) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const { error } = await supabase.from('expenses').insert([
        {
          user_id: user.id,
          title,
          category,
          amount: parseFloat(amount),
          date,
        },
      ]);

      if (error) throw error;

      setModalVisible(false);
      setTitle('');
      setCategory('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      fetchExpenses();
      Alert.alert('Success', 'Expense added successfully');
    } catch (error) {
      console.error('Error adding expense:', error);
      Alert.alert('Error', 'Failed to add expense');
    }
  };

  const deleteExpense = async (id) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('expenses')
                .delete()
                .eq('id', id);

              if (error) throw error;
              fetchExpenses();
              Alert.alert('Success', 'Expense deleted');
            } catch (error) {
              console.error('Error deleting expense:', error);
              Alert.alert('Error', 'Failed to delete expense');
            }
          },
        },
      ]
    );
  };

  const renderExpenseItem = ({ item }) => (
    <View style={styles.expenseCard}>
      <View style={styles.expenseContent}>
        <View style={styles.expenseInfo}>
          <Text style={styles.expenseTitle}>{item.title}</Text>
          <Text style={styles.expenseCategory}>{item.category}</Text>
          <Text style={styles.expenseDate}>
            {new Date(item.date).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.expenseRight}>
          <Text style={styles.expenseAmount}>
            ${parseFloat(item.amount).toFixed(2)}
          </Text>
          <TouchableOpacity
            onPress={() => deleteExpense(item.id)}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Expenses</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {expenses.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No expenses yet</Text>
          <Text style={styles.emptySubtext}>
            Tap the + Add button to create your first expense
          </Text>
        </View>
      ) : (
        <FlatList
          data={expenses}
          renderItem={renderExpenseItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Expense</Text>

            <TextInput
              style={styles.input}
              placeholder="Title"
              placeholderTextColor="#6B7280"
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={styles.input}
              placeholder="Category (e.g., Food, Transport)"
              placeholderTextColor="#6B7280"
              value={category}
              onChangeText={setCategory}
            />

            <TextInput
              style={styles.input}
              placeholder="Amount"
              placeholderTextColor="#6B7280"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={addExpense}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F9FAFB',
  },
  addButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  list: {
    padding: 24,
    paddingTop: 0,
  },
  expenseCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  expenseContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  expenseInfo: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  expenseCategory: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  expenseDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  expenseRight: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 8,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 20,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#374151',
  },
  cancelButtonText: {
    color: '#F9FAFB',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#10B981',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
