import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalSpent, setTotalSpent] = useState(0);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [expensesData, budgetsData, profileData] = await Promise.all([
        supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(5),
        supabase
          .from('budgets')
          .select('*')
          .eq('user_id', user.id),
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle(),
      ]);

      if (expensesData.data) setExpenses(expensesData.data);
      if (budgetsData.data) setBudgets(budgetsData.data);
      if (profileData.data) setProfile(profileData.data);

      const total = expensesData.data?.reduce(
        (sum, expense) => sum + parseFloat(expense.amount),
        0
      ) || 0;
      setTotalSpent(total);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {profile?.name || 'User'}!</Text>
          <Text style={styles.subtitle}>Track your spending</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total Spent</Text>
        <Text style={styles.totalAmount}>${totalSpent.toFixed(2)}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Expenses</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Expenses')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {expenses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No expenses yet</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('Expenses')}
            >
              <Text style={styles.addButtonText}>Add Expense</Text>
            </TouchableOpacity>
          </View>
        ) : (
          expenses.map((expense) => (
            <View key={expense.id} style={styles.expenseCard}>
              <View style={styles.expenseInfo}>
                <Text style={styles.expenseTitle}>{expense.title}</Text>
                <Text style={styles.expenseCategory}>{expense.category}</Text>
              </View>
              <Text style={styles.expenseAmount}>
                ${parseFloat(expense.amount).toFixed(2)}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Budgets</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Budgets')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {budgets.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No budgets set</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('Budgets')}
            >
              <Text style={styles.addButtonText}>Create Budget</Text>
            </TouchableOpacity>
          </View>
        ) : (
          budgets.map((budget) => {
            const spent = expenses
              .filter((e) => e.category === budget.category)
              .reduce((sum, e) => sum + parseFloat(e.amount), 0);
            const percentage = (spent / parseFloat(budget.budget_limit)) * 100;

            return (
              <View key={budget.id} style={styles.budgetCard}>
                <View style={styles.budgetHeader}>
                  <Text style={styles.budgetCategory}>{budget.category}</Text>
                  <Text style={styles.budgetAmount}>
                    ${spent.toFixed(2)} / ${parseFloat(budget.budget_limit).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: percentage > 90 ? '#EF4444' : '#10B981',
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
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
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F9FAFB',
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  totalCard: {
    backgroundColor: '#10B981',
    margin: 24,
    marginTop: 8,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  totalAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  section: {
    padding: 24,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F9FAFB',
  },
  seeAll: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  expenseCard: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseInfo: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  expenseCategory: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  budgetCard: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  budgetCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  budgetAmount: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  emptyState: {
    backgroundColor: '#1E293B',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 16,
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
