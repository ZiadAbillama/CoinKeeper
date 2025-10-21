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

export default function BudgetsScreen() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [budgetsData, expensesData] = await Promise.all([
        supabase
          .from('budgets')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user.id),
      ]);

      if (budgetsData.error) throw budgetsData.error;
      if (expensesData.error) throw expensesData.error;

      setBudgets(budgetsData.data || []);
      setExpenses(expensesData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  const addBudget = async () => {
    if (!category || !limit) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (parseFloat(limit) <= 0) {
      Alert.alert('Error', 'Budget limit must be greater than 0');
      return;
    }

    try {
      const { error } = await supabase.from('budgets').insert([
        {
          user_id: user.id,
          category,
          budget_limit: parseFloat(limit),
        },
      ]);

      if (error) throw error;

      setModalVisible(false);
      setCategory('');
      setLimit('');
      fetchData();
      Alert.alert('Success', 'Budget created successfully');
    } catch (error) {
      console.error('Error adding budget:', error);
      Alert.alert('Error', 'Failed to create budget');
    }
  };

  const deleteBudget = async (id) => {
    Alert.alert(
      'Delete Budget',
      'Are you sure you want to delete this budget?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('budgets')
                .delete()
                .eq('id', id);

              if (error) throw error;
              fetchData();
              Alert.alert('Success', 'Budget deleted');
            } catch (error) {
              console.error('Error deleting budget:', error);
              Alert.alert('Error', 'Failed to delete budget');
            }
          },
        },
      ]
    );
  };

  const calculateSpent = (budgetCategory) => {
    return expenses
      .filter((e) => e.category === budgetCategory)
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);
  };

  const renderBudgetItem = ({ item }) => {
    const spent = calculateSpent(item.category);
    const budgetLimit = parseFloat(item.budget_limit);
    const percentage = (spent / budgetLimit) * 100;
    const remaining = budgetLimit - spent;

    return (
      <View style={styles.budgetCard}>
        <View style={styles.budgetHeader}>
          <Text style={styles.budgetCategory}>{item.category}</Text>
          <TouchableOpacity
            onPress={() => deleteBudget(item.id)}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.budgetAmounts}>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Spent</Text>
            <Text style={styles.amountValue}>${spent.toFixed(2)}</Text>
          </View>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Budget</Text>
            <Text style={styles.amountValue}>${budgetLimit.toFixed(2)}</Text>
          </View>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Remaining</Text>
            <Text
              style={[
                styles.amountValue,
                { color: remaining < 0 ? '#EF4444' : '#10B981' },
              ]}
            >
              ${Math.abs(remaining).toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(percentage, 100)}%`,
                backgroundColor:
                  percentage > 100
                    ? '#EF4444'
                    : percentage > 90
                    ? '#F59E0B'
                    : '#10B981',
              },
            ]}
          />
        </View>

        <Text style={styles.percentageText}>
          {percentage.toFixed(1)}% used
        </Text>

        {percentage > 100 && (
          <View style={styles.warningBadge}>
            <Text style={styles.warningText}>Over Budget!</Text>
          </View>
        )}
        {percentage > 90 && percentage <= 100 && (
          <View style={styles.cautionBadge}>
            <Text style={styles.cautionText}>Near Limit</Text>
          </View>
        )}
      </View>
    );
  };

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
        <Text style={styles.headerTitle}>My Budgets</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {budgets.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No budgets yet</Text>
          <Text style={styles.emptySubtext}>
            Create a budget to track your spending by category
          </Text>
        </View>
      ) : (
        <FlatList
          data={budgets}
          renderItem={renderBudgetItem}
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
            <Text style={styles.modalTitle}>Create Budget</Text>

            <TextInput
              style={styles.input}
              placeholder="Category (e.g., Food, Transport)"
              placeholderTextColor="#6B7280"
              value={category}
              onChangeText={setCategory}
            />

            <TextInput
              style={styles.input}
              placeholder="Budget Limit"
              placeholderTextColor="#6B7280"
              value={limit}
              onChangeText={setLimit}
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
                onPress={addBudget}
              >
                <Text style={styles.saveButtonText}>Create</Text>
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
  budgetCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  budgetCategory: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F9FAFB',
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
  budgetAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  amountItem: {
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F9FAFB',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#334155',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  percentageText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  warningBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'center',
    marginTop: 12,
  },
  warningText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  cautionBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'center',
    marginTop: 12,
  },
  cautionText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
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
