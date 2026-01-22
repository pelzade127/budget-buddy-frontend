import React, { useState, useEffect, useRef } from 'react';
import { PlusCircle, TrendingDown, Calendar, Settings, Home, BarChart3, Check, X, ChevronRight, Edit2, Trash2, DollarSign, Palette, Plus, ChevronLeft, ChevronRight as ChevronRightIcon, PieChart } from 'lucide-react';
import { categoriesAPI, userAPI, transactionsAPI } from './api';
// Theme definitions
const THEMES = {
  purple: {
    name: 'Purple',
    primary: '#667eea',
    secondary: '#764ba2',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    colors: ['#667eea', '#8b5cf6', '#a855f7', '#c084fc', '#e879f9', '#f0abfc', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#ddd6fe', '#ede9fe']
  },
  green: {
    name: 'Green',
    primary: '#059669',
    secondary: '#047857',
    gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    colors: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5', '#059669', '#047857', '#065f46', '#064e3b', '#14b8a6', '#2dd4bf', '#5eead4']
  },
  blue: {
    name: 'Blue',
    primary: '#0284c7',
    secondary: '#0369a1',
    gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    colors: ['#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd', '#e0f2fe', '#0284c7', '#0369a1', '#075985', '#0c4a6e', '#06b6d4', '#22d3ee', '#67e8f9']
  },
  neutral: {
    name: 'Neutral',
    primary: '#475569',
    secondary: '#334155',
    gradient: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
    colors: ['#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0', '#f1f5f9', '#475569', '#334155', '#1e293b', '#0f172a', '#78716c', '#a8a29e', '#d6d3d1']
  },
  sunset: {
    name: 'Sunset',
    primary: '#f97316',
    secondary: '#ea580c',
    gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    colors: ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5', '#ea580c', '#c2410c', '#9a3412', '#7c2d12', '#ef4444', '#f87171', '#fca5a5']
  },
  ocean: {
    name: 'Ocean',
    primary: '#0891b2',
    secondary: '#0e7490',
    gradient: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
    colors: ['#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc', '#cffafe', '#0891b2', '#0e7490', '#155e75', '#164e63', '#14b8a6', '#2dd4bf', '#5eead4']
  }
};

// Default categories (total: $3,000 to match default income)
const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Groceries', limit: 400, spent: 0 },
  { id: 2, name: 'Rent/Mortgage', limit: 1200, spent: 0 },
  { id: 3, name: 'Utilities', limit: 150, spent: 0 },
  { id: 4, name: 'Transportation', limit: 200, spent: 0 },
  { id: 5, name: 'Entertainment', limit: 100, spent: 0 },
  { id: 6, name: 'Dining Out', limit: 150, spent: 0 },
  { id: 7, name: 'Shopping', limit: 100, spent: 0 }, // Changed from 150 to 100
  { id: 8, name: 'Healthcare', limit: 100, spent: 0 },
  { id: 9, name: 'Subscriptions', limit: 50, spent: 0 },
  { id: 10, name: 'Savings', limit: 300, spent: 0 },
  { id: 11, name: 'Debt Payments', limit: 200, spent: 0 },
  { id: 12, name: 'Miscellaneous', limit: 50, spent: 0 } // Changed from 100 to 50
];

const App = () => {
  const [currentView, setCurrentView] = useState('home');
  const [isFirstTime, setIsFirstTime] = useState(false); // Start as false
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [setupStep, setSetupStep] = useState(0);
  
  // Ref to prevent double category creation (React StrictMode issue)
  const categoriesCreated = useRef(false);
  
  // User data
  const [theme, setTheme] = useState('purple');
  const [monthlyIncome, setMonthlyIncome] = useState(3000);
  const [extraIncome, setExtraIncome] = useState(0);
  const [extraIncomeTransactions, setExtraIncomeTransactions] = useState([]); // Track individual extra income entries
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [transactions, setTransactions] = useState([]);
  const [monthlyHistory, setMonthlyHistory] = useState({});
  const [currentMonth, setCurrentMonth] = useState(() => {
    try {
      const saved = localStorage.getItem('history_viewing_month');
      return saved || new Date().toISOString().slice(0, 7);
    } catch {
      return new Date().toISOString().slice(0, 7);
    }
  }); // YYYY-MM format
  const [weeklyBudgets, setWeeklyBudgets] = useState({}); // Track budget allocations per week
  const [weeklySpending, setWeeklySpending] = useState({}); // Track spending per week
  const [weeklyRollovers, setWeeklyRollovers] = useState({}); // Track rollover amounts added to each week
  const [monthlySavings, setMonthlySavings] = useState({}); // Track savings per month (YYYY-MM: amount)
  
  // Quick add modal
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAmount, setQuickAmount] = useState('');
  const [quickCategory, setQuickCategory] = useState(null);
  const [quickDescription, setQuickDescription] = useState('');
  const [quickDate, setQuickDate] = useState(new Date().toISOString().slice(0, 10));

  // Edit modals
  const [showEditIncome, setShowEditIncome] = useState(false);
  const [editIncomeValue, setEditIncomeValue] = useState('');
  const [showEditCategory, setShowEditCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryLimit, setEditCategoryLimit] = useState('');
  
  // Add extra income modal
  const [showAddExtraIncome, setShowAddExtraIncome] = useState(false);
  const [newExtraIncome, setNewExtraIncome] = useState('');
  const [newExtraIncomeDescription, setNewExtraIncomeDescription] = useState('');
  
  // Set weekly budget modal
  const [showSetWeeklyBudget, setShowSetWeeklyBudget] = useState(false);
  const [weeklyBudgetAmount, setWeeklyBudgetAmount] = useState('');
  
  // Add category modal
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryLimit, setNewCategoryLimit] = useState('');

  // Edit expense modal
  const [showEditExpense, setShowEditExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editExpenseDescription, setEditExpenseDescription] = useState('');
  const [editExpenseAmount, setEditExpenseAmount] = useState('');
  const [editExpenseDate, setEditExpenseDate] = useState('');
  const [editExpenseCategory, setEditExpenseCategory] = useState(null);
  
  // Search expenses
  const [expenseSearchQuery, setExpenseSearchQuery] = useState('');

  // Get current theme
  const currentTheme = THEMES[theme];

  // Assign colors to categories based on theme
  const getCategoryColor = (index) => {
    return currentTheme.colors[index % currentTheme.colors.length];
  };

  // Get week of month (1-5) - weeks start on Sunday
  const getWeekOfMonth = (date) => {
    const d = new Date(date);
    const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday
    const offsetDate = d.getDate() + firstDayOfWeek - 1;
    return Math.floor(offsetDate / 7) + 1;
  };

  // Get week key for storage (e.g., "2026-01-W2")
  const getWeekKey = (date) => {
    const d = new Date(date);
    const month = d.toISOString().slice(0, 7); // YYYY-MM
    const week = getWeekOfMonth(date);
    return `${month}-W${week}`;
  };

  // Get current week info
  const getCurrentWeek = () => {
    const now = new Date();
    return {
      weekNumber: getWeekOfMonth(now),
      weekKey: getWeekKey(now),
      month: now.toISOString().slice(0, 7)
    };
  };

  // Get previous week key
  const getPreviousWeekKey = (currentWeekKey) => {
    // Parse current week key (e.g., "2026-01-W2")
    const parts = currentWeekKey.split('-W');
    const month = parts[0];
    const weekNum = parseInt(parts[1]);
    
    if (weekNum > 1) {
      // Previous week in same month
      return `${month}-W${weekNum - 1}`;
    } else {
      // Previous week was in previous month
      const date = new Date(month + '-01');
      date.setDate(date.getDate() - 7); // Go back a week
      return getWeekKey(date.toISOString().slice(0, 10));
    }
  };

  // Load data from localStorage and backend
  useEffect(() => {
    const loadData = async () => {
      let userProfile = null; // Define outside try blocks so it's accessible everywhere
      
      try {
        // Load user profile from backend to get monthly income and theme
        try {
          userProfile = await userAPI.getProfile();
          if (userProfile) {
            if (userProfile.monthly_income) {
              setMonthlyIncome(parseFloat(userProfile.monthly_income));
            }
            if (userProfile.theme) {
              setTheme(userProfile.theme);
            }
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        }

        // Load categories from backend
        try {
          const categoriesData = await categoriesAPI.getAll();
          console.log('Categories from backend:', categoriesData); // Debug
          
          if (categoriesData && categoriesData.length > 0) {
            const formattedCategories = categoriesData.map(cat => ({
              id: cat.id,
              name: cat.name,
              limit: parseFloat(cat.limit_amount),
              spent: parseFloat(cat.spent)
            }));
            console.log('Loaded categories from backend:', formattedCategories); // Debug
            setCategories(formattedCategories);
            
            // Only skip setup if user has income set (completed setup before)
            if (userProfile && userProfile.monthly_income && userProfile.monthly_income > 0) {
              setIsFirstTime(false); // Returning user with income - skip setup
            } else {
              setIsFirstTime(true); // Need to do setup (no income set)
            }
          } else {
            // No categories yet - create defaults for new user
            // But ONLY if categories state is still default (prevent double-run)
            if (!categoriesCreated.current) {
              categoriesCreated.current = true; // Mark as creating
              console.log('No categories found, creating defaults...');
              const createdCategories = [];
              const failedCategories = [];
              
              // Create each default category in the backend
              for (const defaultCat of DEFAULT_CATEGORIES) {
                try {
                  const newCat = await categoriesAPI.create({
                    name: defaultCat.name,
                    limit: defaultCat.limit
                  });
                  createdCategories.push({
                    id: newCat.id,
                    name: newCat.name,
                    limit: parseFloat(newCat.limit_amount),
                    spent: 0
                  });
                  console.log(`✅ Created: ${defaultCat.name}`);
                } catch (err) {
                  console.error(`❌ Failed to create category ${defaultCat.name}:`, err);
                  failedCategories.push(defaultCat.name);
                }
              }
              
              console.log(`Created ${createdCategories.length} of ${DEFAULT_CATEGORIES.length} categories`);
              if (failedCategories.length > 0) {
                console.error(`Failed categories:`, failedCategories);
              }
              console.log('Setting categories to:', createdCategories); // Debug
              setCategories(createdCategories);
            } else {
              console.log('Skipping category creation - already created or in progress');
            }
            // New user - always show setup
            setIsFirstTime(true);
          }
        } catch (error) {
          console.error('Error loading categories:', error);
          // Fall back to default categories locally only
          setCategories(DEFAULT_CATEGORIES);
        }
        
        // Load transactions from backend
        try {
          const transactionsData = await transactionsAPI.getAll();
          if (transactionsData && transactionsData.length > 0) {
            const formattedTransactions = transactionsData.map(trans => ({
              id: trans.id,
              categoryId: trans.category_id,
              categoryName: trans.category_name,
              amount: parseFloat(trans.amount),
              description: trans.description,
              date: trans.date,
              weekKey: trans.week_key
            }));
            console.log('Loaded transactions from backend:', formattedTransactions.length);
            setTransactions(formattedTransactions);
          } else {
            console.log('No transactions found');
            setTransactions([]);
          }
        } catch (error) {
          console.error('Error loading transactions:', error);
          setTransactions([]);
        }
        
        // TODO Phase 4: Load extra income, weekly budgets, monthly savings
        
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        // Done loading - show the app
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Save data to localStorage
  const saveData = () => {
    try {
      localStorage.setItem('setup_complete', 'true');
      localStorage.setItem('theme', theme);
      localStorage.setItem('monthly_income', monthlyIncome.toString());
      localStorage.setItem('extra_income', extraIncome.toString());
      localStorage.setItem('extra_income_transactions', JSON.stringify(extraIncomeTransactions));
      localStorage.setItem('transactions', JSON.stringify(transactions));
      localStorage.setItem('monthly_history', JSON.stringify(monthlyHistory));
      localStorage.setItem('weekly_budgets', JSON.stringify(weeklyBudgets));
      localStorage.setItem('weekly_spending', JSON.stringify(weeklySpending));
      localStorage.setItem('weekly_rollovers', JSON.stringify(weeklyRollovers));
      localStorage.setItem('monthly_savings', JSON.stringify(monthlySavings));
    } catch (error) {
      console.error('Storage error:', error);
    }
  };

  useEffect(() => {
    if (!isFirstTime) {
      saveData();
    }
  }, [theme, monthlyIncome, extraIncome, extraIncomeTransactions, categories, transactions, monthlyHistory, weeklyBudgets, weeklySpending, weeklyRollovers, monthlySavings, isFirstTime]);

  // Migrate old transactions to add weekKey
  useEffect(() => {
    if (!isFirstTime && transactions.length > 0) {
      const needsMigration = transactions.some(t => !t.weekKey);
      if (needsMigration) {
        const migratedTransactions = transactions.map(trans => {
          if (!trans.weekKey) {
            return {
              ...trans,
              weekKey: getWeekKey(trans.date)
            };
          }
          return trans;
        });
        setTransactions(migratedTransactions);
        
        // Recalculate weekly spending from transactions
        const newWeeklySpending = {};
        migratedTransactions.forEach(trans => {
          if (trans.weekKey) {
            newWeeklySpending[trans.weekKey] = (newWeeklySpending[trans.weekKey] || 0) + trans.amount;
          }
        });
        setWeeklySpending(newWeeklySpending);
      }
    }
  }, [isFirstTime]);

  // Update monthly history whenever categories change
  useEffect(() => {
    if (!isFirstTime) {
      const monthKey = new Date().toISOString().slice(0, 7);
      setMonthlyHistory(prev => ({
        ...prev,
        [monthKey]: {
          income: monthlyIncome,
          categories: categories.map(cat => ({
            name: cat.name,
            limit: cat.limit,
            spent: cat.spent
          })),
          totalSpent: categories.reduce((sum, cat) => sum + cat.spent, 0),
          date: new Date().toISOString()
        }
      }));
    }
  }, [categories, monthlyIncome, isFirstTime]);

  const completeSetup = () => {
    setIsFirstTime(false);
    saveData();
  };

  const handleSetupIncome = async (value) => {
    const income = parseFloat(value) || 0;
    setMonthlyIncome(income);
    
    // Scale category budgets proportionally to new income
    // Default total is $3000, scale all categories to match new income
    const defaultTotal = 3000; // Sum of all DEFAULT_CATEGORIES limits
    const ratio = income / defaultTotal;
    
    const scaledCategories = categories.map(cat => ({
      ...cat,
      limit: Math.round(cat.limit * ratio)
    }));
    
    setCategories(scaledCategories);
    
    // Save income to backend
    try {
      await userAPI.updateSettings({ monthly_income: income });
    } catch (error) {
      console.error('Error saving income:', error);
    }
    
    setSetupStep(1);
  };

  const handleSetupCategories = async () => {
    // Update all category limits in backend
    try {
      for (const cat of categories) {
        await categoriesAPI.update(cat.id, {
          name: cat.name,
          limit: cat.limit
        });
      }
    } catch (error) {
      console.error('Error updating categories:', error);
    }
    
    setIsFirstTime(false); // Setup complete!
    setSetupStep(0); // Reset for next time
  };

  const updateCategoryLimit = (id, newLimit) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, limit: parseFloat(newLimit) || 0 } : cat
    ));
  };

  const addTransaction = async () => {
    if (!quickAmount || !quickCategory || !quickDescription.trim()) return;
    
    const amount = parseFloat(quickAmount);
    const transactionDate = quickDate + 'T12:00:00.000Z';
    const weekKey = getWeekKey(quickDate);
    
    try {
      // Save to backend
      const newTransaction = await transactionsAPI.create({
        category_id: quickCategory.id,
        amount: amount,
        description: quickDescription.trim(),
        date: transactionDate,
        week_key: weekKey
      });
      
      // Update local state
      const formattedTransaction = {
        id: newTransaction.id,
        categoryId: quickCategory.id,
        amount: amount,
        description: quickDescription.trim(),
        date: transactionDate,
        categoryName: quickCategory.name,
        month: quickDate.slice(0, 7),
        weekKey: weekKey
      };
      
      setTransactions([formattedTransaction, ...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)));
      
      // Update category spent (backend does this too, but update local state for instant feedback)
      setCategories(categories.map(cat =>
        cat.id === quickCategory.id ? { ...cat, spent: cat.spent + amount } : cat
      ));
      
      // Update weekly spending (Phase 4 will move this to backend)
      setWeeklySpending(prev => ({
        ...prev,
        [weekKey]: (prev[weekKey] || 0) + amount
      }));
      
      // Clear form
      setQuickAmount('');
      setQuickCategory(null);
      setQuickDescription('');
      setQuickDate(new Date().toISOString().slice(0, 10));
      setShowQuickAdd(false);
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Failed to add expense. Please try again.');
    }
  };

  // Edit income
  const openEditIncome = () => {
    setEditIncomeValue(monthlyIncome.toString());
    setShowEditIncome(true);
  };

  const saveIncome = async () => {
    const newIncome = parseFloat(editIncomeValue);
    if (newIncome > 0) {
      const oldIncome = monthlyIncome;
      
      // Check if user wants to adjust budgets proportionally
      if (categories.length > 0 && newIncome !== oldIncome) {
        const shouldAdjust = window.confirm(
          `Adjust category budgets proportionally?\n\n` +
          `Old income: $${oldIncome.toFixed(2)}\n` +
          `New income: $${newIncome.toFixed(2)}\n\n` +
          `Click OK to scale all budgets, or Cancel to keep budgets the same.`
        );
        
        if (shouldAdjust) {
          const ratio = newIncome / oldIncome;
          
          // Update each category proportionally
          const updatedCategories = [];
          for (const cat of categories) {
            const newLimit = Math.round(cat.limit * ratio);
            try {
              await categoriesAPI.update(cat.id, {
                name: cat.name,
                limit: newLimit
              });
              updatedCategories.push({ ...cat, limit: newLimit });
            } catch (error) {
              console.error(`Failed to update ${cat.name}:`, error);
              updatedCategories.push(cat); // Keep old value if update fails
            }
          }
          setCategories(updatedCategories);
        }
      }
      
      // Save income to backend
      try {
        await userAPI.updateSettings({ monthly_income: newIncome });
      } catch (error) {
        console.error('Error saving income:', error);
      }
      
      setMonthlyIncome(newIncome);
      setShowEditIncome(false);
    }
  };

  // Select theme and save to backend
  const selectTheme = async (themeName) => {
    try {
      await userAPI.updateSettings({ theme: themeName });
      setTheme(themeName);
    } catch (error) {
      console.error('Error saving theme:', error);
      // Still update locally even if save fails
      setTheme(themeName);
    }
  };

  // Edit category
  const openEditCategory = (category) => {
    setEditingCategory(category);
    setEditCategoryName(category.name);
    setEditCategoryLimit(category.limit.toString());
    setShowEditCategory(true);
  };
  
  const saveCategory = async () => {
    if (!editCategoryName.trim() || !editCategoryLimit) return;
    
    try {
      // Update in backend
      await categoriesAPI.update(editingCategory.id, {
        name: editCategoryName.trim(),
        limit: parseFloat(editCategoryLimit)
      });

      // Update local state
      setCategories(categories.map(cat =>
        cat.id === editingCategory.id
          ? { ...cat, name: editCategoryName.trim(), limit: parseFloat(editCategoryLimit) }
          : cat
      ));
      
      // Update transaction names if category was renamed
      if (editCategoryName !== editingCategory.name) {
        setTransactions(transactions.map(trans =>
          trans.categoryId === editingCategory.id
            ? { ...trans, categoryName: editCategoryName.trim() }
            : trans
        ));
      }
      
      setShowEditCategory(false);
      setEditingCategory(null);
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category. Please try again.');
    }
  };

  // Add new category
  const openAddCategory = () => {
    setNewCategoryName('');
    setNewCategoryLimit('');
    setShowAddCategory(true);
  };

  const addCategory = async () => {
    const limit = parseFloat(newCategoryLimit);
    if (newCategoryName.trim() && limit > 0) {
      try {
        // Save to backend
        const newCategory = await categoriesAPI.create({
          name: newCategoryName.trim(),
          limit: limit
        });

        // Update local state
        setCategories([...categories, {
          id: newCategory.id,
          name: newCategory.name,
          limit: parseFloat(newCategory.limit_amount),
          spent: 0
        }]);
        
        setShowAddCategory(false);
      } catch (error) {
        console.error('Error adding category:', error);
        alert('Failed to add category. Please try again.');
      }
    }
  };


  // Delete category
  const deleteCategory = async (cat) => {
    if (window.confirm(`Delete "${cat.name}" category? All transactions in this category will also be deleted.`)) {
      try {
        // Delete from backend
        await categoriesAPI.delete(cat.id);

        // Update local state
        setCategories(categories.filter(c => c.id !== cat.id));
        setTransactions(transactions.filter(t => t.categoryId !== cat.id));
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category. Please try again.');
      }
    }
  };

  // Add extra income
  const openAddExtraIncome = () => {
    setNewExtraIncome('');
    setNewExtraIncomeDescription('');
    setShowAddExtraIncome(true);
  };

  const addExtraIncome = () => {
    const amount = parseFloat(newExtraIncome);
    if (amount > 0 && newExtraIncomeDescription.trim()) {
      const transaction = {
        id: Date.now(),
        description: newExtraIncomeDescription.trim(),
        amount: amount,
        date: new Date().toISOString()
      };
      
      setExtraIncome(extraIncome + amount);
      setExtraIncomeTransactions([transaction, ...extraIncomeTransactions]);
      setShowAddExtraIncome(false);
    }
  };

  const resetExtraIncome = () => {
    if (window.confirm('Reset gift/extra income to $0? This will clear all extra income entries.')) {
      setExtraIncome(0);
      setExtraIncomeTransactions([]);
    }
  };

  const deleteExtraIncomeTransaction = (transactionId) => {
    if (window.confirm('Delete this extra income entry?')) {
      const transaction = extraIncomeTransactions.find(t => t.id === transactionId);
      if (transaction) {
        setExtraIncome(extraIncome - transaction.amount);
        setExtraIncomeTransactions(extraIncomeTransactions.filter(t => t.id !== transactionId));
      }
    }
  };

  // Set weekly budget
  const openSetWeeklyBudget = () => {
    const currentWeek = getCurrentWeek();
    const currentBudget = weeklyBudgets[currentWeek.weekKey] || 0;
    setWeeklyBudgetAmount(currentBudget > 0 ? currentBudget.toString() : '');
    setShowSetWeeklyBudget(true);
  };

  const saveWeeklyBudget = (applyAdjustment = false) => {
    const amount = parseFloat(weeklyBudgetAmount);
    if (amount > 0) {
      const currentWeek = getCurrentWeek();
      setWeeklyBudgets(prev => ({
        ...prev,
        [currentWeek.weekKey]: amount
      }));
      
      // Apply rollover or reduce for overspending based on user choice
      if (applyAdjustment) {
        if (availableRollover > 0) {
          // Add rollover
          setWeeklyRollovers(prev => ({
            ...prev,
            [currentWeek.weekKey]: availableRollover
          }));
          
          // Track this as monthly savings
          const currentMonth = new Date().toISOString().slice(0, 7);
          setMonthlySavings(prev => ({
            ...prev,
            [currentMonth]: (prev[currentMonth] || 0) + availableRollover
          }));
        } else if (overspentAmount > 0) {
          // Subtract overspending (negative rollover)
          setWeeklyRollovers(prev => ({
            ...prev,
            [currentWeek.weekKey]: -overspentAmount
          }));
        }
      }
      
      setShowSetWeeklyBudget(false);
    }
  };

  // Delete expense
  const deleteExpense = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      const expense = transactions.find(t => t.id === expenseId);
      if (expense) {
        try {
          // Delete from backend
          await transactionsAPI.delete(expenseId);
          
          // Update local state
          setTransactions(transactions.filter(t => t.id !== expenseId));
          
          // Update category spent amount
          setCategories(categories.map(cat =>
            cat.id === expense.categoryId ? { ...cat, spent: cat.spent - expense.amount } : cat
          ));
          
          // Update weekly spending (Phase 4 will move to backend)
          if (expense.weekKey) {
            setWeeklySpending(prev => ({
              ...prev,
              [expense.weekKey]: Math.max(0, (prev[expense.weekKey] || 0) - expense.amount)
            }));
          }
        } catch (error) {
          console.error('Error deleting expense:', error);
          alert('Failed to delete expense. Please try again.');
        }
      }
    }
  };

  // Edit expense
  const openEditExpense = (expense) => {
    setEditingExpense(expense);
    setEditExpenseDescription(expense.description);
    setEditExpenseAmount(expense.amount.toString());
    setEditExpenseDate(expense.date.slice(0, 10));
    setEditExpenseCategory(categories.find(cat => cat.id === expense.categoryId));
    setShowEditExpense(true);
  };

  const saveExpense = async () => {
    if (!editExpenseDescription.trim() || !editExpenseAmount || !editExpenseCategory) return;
    
    const oldExpense = editingExpense;
    const newAmount = parseFloat(editExpenseAmount);
    const amountDiff = newAmount - oldExpense.amount;
    const newWeekKey = getWeekKey(editExpenseDate);
    const oldWeekKey = oldExpense.weekKey;
    
    try {
      // Update in backend
      await transactionsAPI.update(oldExpense.id, {
        category_id: editExpenseCategory.id,
        amount: newAmount,
        description: editExpenseDescription.trim(),
        date: editExpenseDate + 'T12:00:00.000Z',
        week_key: newWeekKey
      });
      
      // Update local state
      setTransactions(transactions.map(trans =>
        trans.id === oldExpense.id
          ? {
              ...trans,
              description: editExpenseDescription.trim(),
              amount: newAmount,
              date: editExpenseDate + 'T12:00:00.000Z',
              categoryId: editExpenseCategory.id,
              categoryName: editExpenseCategory.name,
              month: editExpenseDate.slice(0, 7),
              weekKey: newWeekKey
            }
          : trans
      ).sort((a, b) => new Date(b.date) - new Date(a.date)));
      
      // Update category spent amounts (backend handles this too, but update local for instant feedback)
      if (oldExpense.categoryId === editExpenseCategory.id) {
        // Same category, just adjust the difference
        setCategories(categories.map(cat =>
          cat.id === editExpenseCategory.id ? { ...cat, spent: cat.spent + amountDiff } : cat
        ));
      } else {
        // Different category, subtract from old and add to new
        setCategories(categories.map(cat => {
          if (cat.id === oldExpense.categoryId) {
            return { ...cat, spent: cat.spent - oldExpense.amount };
          } else if (cat.id === editExpenseCategory.id) {
            return { ...cat, spent: cat.spent + newAmount };
          }
          return cat;
        }));
      }
      
      // Update weekly spending (Phase 4 will move to backend)
      if (oldWeekKey === newWeekKey) {
        // Same week, just adjust the difference
        setWeeklySpending(prev => ({
          ...prev,
          [newWeekKey]: (prev[newWeekKey] || 0) + amountDiff
        }));
      } else {
        // Different week, subtract from old and add to new
        setWeeklySpending(prev => ({
          ...prev,
          [oldWeekKey]: Math.max(0, (prev[oldWeekKey] || 0) - oldExpense.amount),
          [newWeekKey]: (prev[newWeekKey] || 0) + newAmount
        }));
      }
      
      setShowEditExpense(false);
      setEditingExpense(null);
    } catch (error) {
      console.error('Error updating expense:', error);
      alert('Failed to update expense. Please try again.');
    }
  };

  // Month navigation
  const changeMonth = (direction) => {
    const [year, month] = currentMonth.split('-').map(Number);
    const date = new Date(year, month - 1, 15); // Use middle of month to avoid timezone issues
    const today = new Date();
    const todayMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    console.log('Current month before change:', currentMonth);
    
    if (direction === 'prev') {
      date.setMonth(date.getMonth() - 1);
      const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      console.log('Going PREV to:', newMonth);
      setCurrentMonth(newMonth);
      localStorage.setItem('history_viewing_month', newMonth);
    } else {
      date.setMonth(date.getMonth() + 1);
      const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      console.log('Trying to go to:', newMonth, 'Today is:', todayMonth, 'Can proceed:', newMonth <= todayMonth);
      // Only update if new month is not in the future
      if (newMonth <= todayMonth) {
        console.log('Actually calling setCurrentMonth with:', newMonth);
        setCurrentMonth(newMonth);
        localStorage.setItem('history_viewing_month', newMonth);
        console.log('Called setCurrentMonth');
      } else {
        console.log('NOT updating because in future');
      }
    }
  };

  // Get data for selected month
  const getMonthData = () => {
    const thisMonth = new Date().toISOString().slice(0, 7);
    if (currentMonth === thisMonth) {
      return {
        income: monthlyIncome,
        categories: categories,
        totalSpent: categories.reduce((sum, cat) => sum + cat.spent, 0)
      };
    } else if (monthlyHistory[currentMonth]) {
      return monthlyHistory[currentMonth];
    } else {
      return null;
    }
  };

  const monthData = getMonthData();

  // Calculate safe to spend
  const totalBudgeted = categories.reduce((sum, cat) => sum + cat.limit, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const totalExtraIncome = extraIncomeTransactions.reduce((sum, trans) => sum + trans.amount, 0);
  const totalIncome = monthlyIncome + totalExtraIncome;
  const safeToSpend = totalIncome - totalSpent;
  
  // Weekly calculations
  const currentWeek = getCurrentWeek();
  const thisWeekSpent = weeklySpending[currentWeek.weekKey] || 0;
  const thisWeekBudget = weeklyBudgets[currentWeek.weekKey] || 0;
  const thisWeekRollover = weeklyRollovers[currentWeek.weekKey] || 0;
  const thisWeekTotal = thisWeekBudget + thisWeekRollover;
  const thisWeekRemaining = thisWeekTotal > 0 ? thisWeekTotal - thisWeekSpent : safeToSpend / 4;
  const hasWeeklyBudget = weeklyBudgets[currentWeek.weekKey] > 0;
  
  // Calculate available rollover from last week
  const previousWeekKey = getPreviousWeekKey(currentWeek.weekKey);
  const lastWeekBudget = (weeklyBudgets[previousWeekKey] || 0) + (weeklyRollovers[previousWeekKey] || 0);
  const lastWeekSpent = weeklySpending[previousWeekKey] || 0;
  const lastWeekDifference = lastWeekBudget - lastWeekSpent;
  const availableRollover = Math.max(0, lastWeekDifference);
  const overspentAmount = Math.abs(Math.min(0, lastWeekDifference));

  // Setup wizard
  // Show loading screen while data loads
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '24px',
        fontWeight: '700',
        fontFamily: '"DM Sans", system-ui, -apple-system, sans-serif'
      }}>
        Loading...
      </div>
    );
  }

  if (isFirstTime) {
    return (
      <div style={{
        minHeight: '100vh',
        background: currentTheme.gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"DM Sans", system-ui, -apple-system, sans-serif',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '48px',
          maxWidth: '600px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          {setupStep === 0 && (
            <div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: '700',
                marginBottom: '12px',
                background: currentTheme.gradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>Welcome! Let's get started.</h1>
              <p style={{ fontSize: '18px', color: '#64748b', marginBottom: '32px' }}>
                This will only take a minute. We'll set up the basics so you can start tracking right away.
              </p>
              
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b' }}>
                What's your monthly income?
              </label>
              <input
                type="number"
                placeholder="3000"
                defaultValue={monthlyIncome}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSetupIncome(e.target.value);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '24px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  marginBottom: '24px',
                  fontWeight: '600'
                }}
              />
              
              <button
                onClick={(e) => {
                  const input = e.target.parentElement.querySelector('input');
                  handleSetupIncome(input.value);
                }}
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '18px',
                  fontWeight: '600',
                  background: currentTheme.gradient,
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                Continue
              </button>
            </div>
          )}
          
          {setupStep === 1 && (
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '12px', color: '#1e293b' }}>
                Budget Categories
              </h2>
              <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '24px' }}>
                We've set up 12 common categories with suggested amounts. You can adjust these now or anytime later.
              </p>
              
              <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '24px' }}>
                {categories.map(cat => (
                  <div key={cat.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    borderBottom: '1px solid #f1f5f9',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontWeight: '500', color: '#334155' }}>{cat.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#94a3b8' }}>$</span>
                      <input
                        type="number"
                        value={cat.limit}
                        onChange={(e) => updateCategoryLimit(cat.id, e.target.value)}
                        style={{
                          width: '100px',
                          padding: '8px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          textAlign: 'right',
                          fontSize: '16px',
                          fontWeight: '600'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div style={{
                background: '#f8fafc',
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#64748b' }}>Monthly Income:</span>
                  <span style={{ fontWeight: '700', color: '#1e293b' }}>${monthlyIncome.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Total Budgeted:</span>
                  <span style={{ fontWeight: '700', color: '#1e293b' }}>${totalBudgeted.toFixed(2)}</span>
                </div>
              </div>
              
              <button
                onClick={handleSetupCategories}
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '18px',
                  fontWeight: '600',
                  background: currentTheme.gradient,
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                Continue
              </button>
            </div>
          )}
          
          {setupStep === 2 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: currentTheme.gradient,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px'
              }}>
                <Check size={48} color="white" />
              </div>
              
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '12px', color: '#1e293b' }}>
                All set!
              </h2>
              <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '32px' }}>
                You're ready to start tracking your budget. Remember, you can adjust anything anytime.
              </p>
              
              <button
                onClick={completeSetup}
                style={{
                  padding: '16px 48px',
                  fontSize: '18px',
                  fontWeight: '600',
                  background: currentTheme.gradient,
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                Start Tracking
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main app
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: '"DM Sans", system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: currentTheme.gradient,
        padding: '32px 24px',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>Budget Buddy</h1>
        
        {currentView === 'home' && (
          <div>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px', fontWeight: '500' }}>
              Week {currentWeek.weekNumber} - {hasWeeklyBudget ? 'Budget Left' : 'Safe to Spend'}
            </div>
            <div style={{ fontSize: '48px', fontWeight: '800', marginBottom: '8px' }}>
              ${thisWeekRemaining.toFixed(2)}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '12px' }}>
              {hasWeeklyBudget ? (
                <>
                  ${thisWeekSpent.toFixed(2)} spent of ${thisWeekTotal.toFixed(2)}
                  {thisWeekRollover > 0 && ` (+ $${thisWeekRollover.toFixed(2)} rollover)`}
                </>
              ) : (
                `$${safeToSpend.toFixed(2)} left this month / 4`
              )}
            </div>
            <button
              onClick={openSetWeeklyBudget}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              {hasWeeklyBudget ? 'Update' : 'Set'} Weekly Budget
            </button>
          </div>
        )}

        {currentView === 'charts' && (
          <div>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px', fontWeight: '500' }}>
              Budget Overview
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700' }}>
              Visual Insights
            </div>
          </div>
        )}

        {currentView === 'history' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '16px' }}>
              <button
                onClick={() => changeMonth('prev')}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ChevronLeft size={24} color="white" />
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '700' }}>
                  {(() => {
                    const [year, month] = currentMonth.split('-');
                    const date = new Date(parseInt(year), parseInt(month) - 1, 15); // Use middle of month to avoid timezone issues
                    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                  })()}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.7 }}>
                  ({currentMonth})
                </div>
              </div>
              <button
                onClick={() => changeMonth('next')}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ChevronRightIcon size={24} color="white" />
              </button>
            </div>
            {monthData && (
              <>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>
                  Total Spent
                </div>
                <div style={{ fontSize: '36px', fontWeight: '800' }}>
                  ${monthData.totalSpent.toFixed(2)}
                </div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>
                  of ${monthData.income.toFixed(2)} income
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '24px', paddingBottom: '100px' }}>
        {currentView === 'home' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>
                Categories
              </h2>
            </div>

            {/* Extra Income Card */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: `2px solid ${currentTheme.primary}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: extraIncomeTransactions.length > 0 ? '16px' : '0' }}>
                <div>
                  <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>
                    Gift / Extra Income
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: currentTheme.primary }}>
                    ${extraIncome.toFixed(2)}
                  </div>
                  {extraIncomeTransactions.length > 0 && (
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                      {extraIncomeTransactions.length} {extraIncomeTransactions.length === 1 ? 'entry' : 'entries'}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={openAddExtraIncome}
                    style={{
                      background: currentTheme.primary,
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Plus size={16} />
                    Add
                  </button>
                  {extraIncome > 0 && (
                    <button
                      onClick={resetExtraIncome}
                      style={{
                        background: '#f1f5f9',
                        color: '#64748b',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
              
              {/* Extra Income Transactions List */}
              {extraIncomeTransactions.length > 0 && (
                <div style={{
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {extraIncomeTransactions.slice(0, 3).map(trans => (
                    <div key={trans.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px',
                      background: '#f8fafc',
                      borderRadius: '8px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>
                          {trans.description}
                        </div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                          {new Date(trans.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '700', color: currentTheme.primary, fontSize: '16px' }}>
                          +${trans.amount.toFixed(2)}
                        </span>
                        <button
                          onClick={() => deleteExtraIncomeTransaction(trans.id)}
                          style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {extraIncomeTransactions.length > 3 && (
                    <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', marginTop: '4px' }}>
                      +{extraIncomeTransactions.length - 3} more {extraIncomeTransactions.length - 3 === 1 ? 'entry' : 'entries'}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {categories.map((cat, index) => {
                const percentage = (cat.spent / cat.limit) * 100;
                const remaining = cat.limit - cat.spent;
                const categoryColor = getCategoryColor(index);
                let barColor = categoryColor;
                if (percentage >= 100) barColor = '#ef4444';
                else if (percentage >= 75) barColor = '#f59e0b';

                return (
                  <div key={cat.id} style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '12px'
                    }}>
                      <span style={{ fontWeight: '600', color: '#1e293b', fontSize: '16px' }}>
                        {cat.name}
                      </span>
                      <span style={{ fontWeight: '700', color: '#64748b' }}>
                        ${remaining.toFixed(2)} left
                      </span>
                    </div>
                    
                    <div style={{
                      background: '#f1f5f9',
                      height: '8px',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      marginBottom: '8px'
                    }}>
                      <div style={{
                        background: barColor,
                        height: '100%',
                        width: `${Math.min(percentage, 100)}%`,
                        transition: 'width 0.3s ease',
                        borderRadius: '4px'
                      }} />
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '14px',
                      color: '#94a3b8'
                    }}>
                      <span>${cat.spent.toFixed(2)} of ${cat.limit.toFixed(2)}</span>
                      <span>{percentage.toFixed(0)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {currentView === 'expenses' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>
              Itemized Expenses
            </h2>
            
            {/* Search Bar */}
            <div style={{ marginBottom: '24px' }}>
              <input
                type="text"
                value={expenseSearchQuery}
                onChange={(e) => setExpenseSearchQuery(e.target.value)}
                placeholder="Search expenses..."
                style={{
                  width: 'calc(100% - 24px)',
                  padding: '12px',
                  fontSize: '16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  background: 'white'
                }}
              />
            </div>
            
            {transactions.length === 0 ? (
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '48px',
                textAlign: 'center',
                color: '#94a3b8'
              }}>
                <TrendingDown size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                <p>No expenses yet. Tap the + button to add your first expense!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {(() => {
                  // Filter transactions by search query
                  const filteredTransactions = transactions.filter(trans =>
                    trans.description.toLowerCase().includes(expenseSearchQuery.toLowerCase()) ||
                    trans.categoryName.toLowerCase().includes(expenseSearchQuery.toLowerCase())
                  );
                  
                  // Group by category
                  const groupedByCategory = {};
                  filteredTransactions.forEach(trans => {
                    if (!groupedByCategory[trans.categoryName]) {
                      groupedByCategory[trans.categoryName] = [];
                    }
                    groupedByCategory[trans.categoryName].push(trans);
                  });
                  
                  // Sort categories alphabetically
                  const sortedCategories = Object.keys(groupedByCategory).sort();
                  
                  if (sortedCategories.length === 0) {
                    return (
                      <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '48px',
                        textAlign: 'center',
                        color: '#94a3b8'
                      }}>
                        <p>No expenses match your search.</p>
                      </div>
                    );
                  }
                  
                  return sortedCategories.map(categoryName => {
                    const categoryTransactions = groupedByCategory[categoryName];
                    const categoryTotal = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
                    const category = categories.find(cat => cat.name === categoryName);
                    const categoryIndex = categories.findIndex(cat => cat.name === categoryName);
                    const categoryColor = getCategoryColor(categoryIndex);
                    
                    return (
                      <div key={categoryName}>
                        {/* Category Header */}
                        <div style={{
                          background: 'white',
                          borderRadius: '12px',
                          padding: '16px',
                          marginBottom: '12px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          borderLeft: `4px solid ${categoryColor}`
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
                                {categoryName}
                              </div>
                              <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                                {categoryTransactions.length} {categoryTransactions.length === 1 ? 'expense' : 'expenses'}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
                                ${categoryTotal.toFixed(2)}
                              </div>
                              {category && (
                                <div style={{ fontSize: '14px', color: '#64748b' }}>
                                  of ${category.limit.toFixed(2)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Category Transactions */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '8px' }}>
                          {categoryTransactions.map(trans => (
                            <div key={trans.id} style={{
                              background: 'white',
                              borderRadius: '12px',
                              padding: '16px',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '16px', marginBottom: '4px' }}>
                                    {trans.description}
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                                    {new Date(trans.date).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric', 
                                      year: 'numeric' 
                                    })}
                                  </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
                                    ${trans.amount.toFixed(2)}
                                  </div>
                                  <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                      onClick={() => openEditExpense(trans)}
                                      style={{
                                        background: currentTheme.primary,
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '6px 10px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        fontWeight: '600'
                                      }}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => deleteExpense(trans.id)}
                                      style={{
                                        background: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '6px 10px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        fontWeight: '600'
                                      }}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>
        )}

        {currentView === 'charts' && (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>
              Spending Overview
            </h3>
            
            {/* Summary Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              marginBottom: '24px'
            }}>
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
                  Total Income
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: currentTheme.primary }}>
                  ${totalIncome.toFixed(2)}
                </div>
              </div>
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
                  Total Spent
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>
                  ${totalSpent.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Yearly Savings Tracker */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              marginBottom: '24px'
            }}>
              <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>
                💰 Yearly Savings Tracker
              </h4>
              {(() => {
                const currentYear = new Date().getFullYear();
                const yearSavings = Object.entries(monthlySavings)
                  .filter(([month]) => month.startsWith(currentYear.toString()))
                  .reduce((total, [, amount]) => total + amount, 0);
                
                const monthlySavingsForYear = Object.entries(monthlySavings)
                  .filter(([month]) => month.startsWith(currentYear.toString()))
                  .sort(([a], [b]) => a.localeCompare(b));
                
                return (
                  <>
                    <div style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      borderRadius: '12px',
                      padding: '24px',
                      marginBottom: '20px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', marginBottom: '8px', fontWeight: '600' }}>
                        Total Saved in {currentYear}
                      </div>
                      <div style={{ fontSize: '48px', fontWeight: '800', color: 'white' }}>
                        ${yearSavings.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                        {monthlySavingsForYear.length} {monthlySavingsForYear.length === 1 ? 'month' : 'months'} of savings tracked
                      </div>
                    </div>

                    {monthlySavingsForYear.length > 0 && (
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' }}>
                          Monthly Breakdown
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {monthlySavingsForYear.map(([month, amount]) => {
                            const [year, monthNum] = month.split('-').map(Number);
                            const date = new Date(year, monthNum - 1, 15);
                            const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                            return (
                              <div key={month} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px',
                                background: '#f8fafc',
                                borderRadius: '8px'
                              }}>
                                <span style={{ fontWeight: '600', color: '#334155' }}>{monthName}</span>
                                <span style={{ fontWeight: '700', color: '#10b981', fontSize: '18px' }}>
                                  +${amount.toFixed(2)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {monthlySavingsForYear.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
                        <p>Start rolling over unspent weekly budgets to track your savings!</p>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Budget Allocation Pie Chart */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              marginBottom: '24px'
            }}>
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '20px', textAlign: 'center' }}>
                Budget Allocation (Optimal)
              </h4>
              <svg viewBox="0 0 200 200" style={{ width: '100%', maxWidth: '300px', margin: '0 auto 24px', display: 'block' }}>
                {(() => {
                  let currentAngle = 0;
                  const total = categories.reduce((sum, cat) => sum + cat.limit, 0);
                  
                  return categories.map((cat, index) => {
                    const percentage = (cat.limit / total) * 100;
                    const angle = (percentage / 100) * 360;
                    const startAngle = currentAngle;
                    const endAngle = currentAngle + angle;
                    
                    const x1 = 100 + 80 * Math.cos((startAngle - 90) * Math.PI / 180);
                    const y1 = 100 + 80 * Math.sin((startAngle - 90) * Math.PI / 180);
                    const x2 = 100 + 80 * Math.cos((endAngle - 90) * Math.PI / 180);
                    const y2 = 100 + 80 * Math.sin((endAngle - 90) * Math.PI / 180);
                    
                    const largeArc = angle > 180 ? 1 : 0;
                    const path = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`;
                    
                    currentAngle = endAngle;
                    
                    return (
                      <path
                        key={cat.id}
                        d={path}
                        fill={getCategoryColor(index)}
                        stroke="white"
                        strokeWidth="2"
                      />
                    );
                  });
                })()}
              </svg>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {categories.map((cat, index) => (
                  <div key={cat.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px'
                  }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '4px',
                      background: getCategoryColor(index),
                      flexShrink: 0
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>{cat.name}</div>
                    </div>
                    <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '14px' }}>
                      ${cat.limit.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actual Spending Pie Chart */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              marginBottom: '24px'
            }}>
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '20px', textAlign: 'center' }}>
                Actual Spending by Category
              </h4>
              <svg viewBox="0 0 200 200" style={{ width: '100%', maxWidth: '300px', margin: '0 auto 24px', display: 'block' }}>
                {(() => {
                  let currentAngle = 0;
                  const totalSpentInCategories = categories.reduce((sum, cat) => sum + cat.spent, 0);
                  
                  if (totalSpentInCategories === 0) {
                    return (
                      <g>
                        <circle cx="100" cy="100" r="80" fill="#e2e8f0" />
                        <text x="100" y="105" textAnchor="middle" fontSize="14" fill="#64748b" fontWeight="600">
                          No spending yet
                        </text>
                      </g>
                    );
                  }
                  
                  return categories
                    .filter(cat => cat.spent > 0)
                    .map((cat, index) => {
                      const categoryIndex = categories.findIndex(c => c.id === cat.id);
                      const percentage = (cat.spent / totalSpentInCategories) * 100;
                      const angle = (percentage / 100) * 360;
                      const startAngle = currentAngle;
                      const endAngle = currentAngle + angle;
                      
                      const x1 = 100 + 80 * Math.cos((startAngle - 90) * Math.PI / 180);
                      const y1 = 100 + 80 * Math.sin((startAngle - 90) * Math.PI / 180);
                      const x2 = 100 + 80 * Math.cos((endAngle - 90) * Math.PI / 180);
                      const y2 = 100 + 80 * Math.sin((endAngle - 90) * Math.PI / 180);
                      
                      const largeArc = angle > 180 ? 1 : 0;
                      const path = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`;
                      
                      currentAngle = endAngle;
                      
                      return (
                        <path
                          key={cat.id}
                          d={path}
                          fill={getCategoryColor(categoryIndex)}
                          stroke="white"
                          strokeWidth="2"
                        />
                      );
                    });
                })()}
              </svg>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {categories
                  .filter(cat => cat.spent > 0)
                  .map((cat, idx) => {
                    const categoryIndex = categories.findIndex(c => c.id === cat.id);
                    const totalSpentInCategories = categories.reduce((sum, c) => sum + c.spent, 0);
                    const percentage = totalSpentInCategories > 0 ? (cat.spent / totalSpentInCategories) * 100 : 0;
                    
                    return (
                      <div key={cat.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '8px'
                      }}>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '4px',
                          background: getCategoryColor(categoryIndex),
                          flexShrink: 0
                        }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>{cat.name}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>{percentage.toFixed(1)}% of spending</div>
                        </div>
                        <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '14px' }}>
                          ${cat.spent.toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                {categories.filter(cat => cat.spent > 0).length === 0 && (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
                    <p>No spending recorded yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Overall Money Status Pie Chart */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              marginBottom: '24px'
            }}>
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '20px', textAlign: 'center' }}>
                Overall Money Status
              </h4>
              <svg viewBox="0 0 200 200" style={{ width: '100%', maxWidth: '300px', margin: '0 auto 24px', display: 'block' }}>
                {(() => {
                  const spentPercentage = totalIncome > 0 ? (totalSpent / totalIncome) * 100 : 0;
                  const remainingPercentage = 100 - spentPercentage;
                  
                  // Spent slice (red)
                  const spentAngle = (spentPercentage / 100) * 360;
                  const x1 = 100 + 80 * Math.cos((-90) * Math.PI / 180);
                  const y1 = 100 + 80 * Math.sin((-90) * Math.PI / 180);
                  const x2 = 100 + 80 * Math.cos((spentAngle - 90) * Math.PI / 180);
                  const y2 = 100 + 80 * Math.sin((spentAngle - 90) * Math.PI / 180);
                  const largeArc1 = spentAngle > 180 ? 1 : 0;
                  const spentPath = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc1} 1 ${x2} ${y2} Z`;
                  
                  // Remaining slice (green)
                  const remainingAngle = (remainingPercentage / 100) * 360;
                  const x3 = 100 + 80 * Math.cos((spentAngle - 90) * Math.PI / 180);
                  const y3 = 100 + 80 * Math.sin((spentAngle - 90) * Math.PI / 180);
                  const x4 = 100 + 80 * Math.cos((-90) * Math.PI / 180);
                  const y4 = 100 + 80 * Math.sin((-90) * Math.PI / 180);
                  const largeArc2 = remainingAngle > 180 ? 1 : 0;
                  const remainingPath = `M 100 100 L ${x3} ${y3} A 80 80 0 ${largeArc2} 1 ${x4} ${y4} Z`;
                  
                  return (
                    <>
                      <path
                        d={spentPath}
                        fill="#ef4444"
                        stroke="white"
                        strokeWidth="2"
                      />
                      <path
                        d={remainingPath}
                        fill="#10b981"
                        stroke="white"
                        strokeWidth="2"
                      />
                      <circle cx="100" cy="100" r="50" fill="white" />
                      <text x="100" y="95" textAnchor="middle" fontSize="14" fill="#64748b" fontWeight="600">
                        Remaining
                      </text>
                      <text x="100" y="115" textAnchor="middle" fontSize="20" fill="#1e293b" fontWeight="700">
                        ${safeToSpend.toFixed(0)}
                      </text>
                    </>
                  );
                })()}
              </svg>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: '#fef2f2',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '4px',
                    background: '#ef4444'
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: '#1e293b' }}>Spent</div>
                    <div style={{ fontSize: '14px', color: '#64748b' }}>
                      {totalIncome > 0 ? ((totalSpent / totalIncome) * 100).toFixed(1) : 0}% of total income
                    </div>
                  </div>
                  <div style={{ fontWeight: '700', color: '#ef4444', fontSize: '18px' }}>
                    ${totalSpent.toFixed(2)}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: '#f0fdf4',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '4px',
                    background: '#10b981'
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: '#1e293b' }}>Remaining</div>
                    <div style={{ fontSize: '14px', color: '#64748b' }}>
                      {totalIncome > 0 ? ((safeToSpend / totalIncome) * 100).toFixed(1) : 0}% of total income
                    </div>
                  </div>
                  <div style={{ fontWeight: '700', color: '#10b981', fontSize: '18px' }}>
                    ${safeToSpend.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'history' && (
          <div>
            {monthData ? (
              <div>
                <div style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '20px',
                  marginBottom: '24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: '#64748b' }}>Income:</span>
                    <span style={{ fontWeight: '700', color: '#1e293b' }}>${monthData.income.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: '#64748b' }}>Spent:</span>
                    <span style={{ fontWeight: '700', color: '#ef4444' }}>${monthData.totalSpent.toFixed(2)}</span>
                  </div>
                  <div style={{
                    borderTop: '1px solid #e2e8f0',
                    paddingTop: '12px',
                    marginTop: '12px',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ fontWeight: '600', color: '#1e293b' }}>Remaining:</span>
                    <span style={{ fontWeight: '700', color: monthData.income - monthData.totalSpent >= 0 ? '#10b981' : '#ef4444' }}>
                      ${(monthData.income - monthData.totalSpent).toFixed(2)}
                    </span>
                  </div>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>
                  Category Breakdown
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {monthData.categories.map((cat, index) => {
                    const percentage = (cat.spent / cat.limit) * 100;
                    const categoryColor = getCategoryColor(index);
                    
                    return (
                      <div key={index} style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '16px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '8px'
                        }}>
                          <span style={{ fontWeight: '600', color: '#1e293b' }}>{cat.name}</span>
                          <span style={{ fontSize: '14px', color: '#64748b' }}>
                            ${cat.spent.toFixed(2)} / ${cat.limit.toFixed(2)}
                          </span>
                        </div>
                        <div style={{
                          background: '#f1f5f9',
                          height: '8px',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            background: percentage >= 100 ? '#ef4444' : percentage >= 75 ? '#f59e0b' : categoryColor,
                            height: '100%',
                            width: `${Math.min(percentage, 100)}%`,
                            borderRadius: '4px'
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '48px',
                textAlign: 'center',
                color: '#94a3b8'
              }}>
                <Calendar size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                <p>No data available for this month.</p>
              </div>
            )}
          </div>
        )}

        {currentView === 'settings' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '24px' }}>
              Settings
            </h2>

            {/* Theme Selector */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <Palette size={20} color={currentTheme.primary} />
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>
                  Theme
                </h3>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px'
              }}>
                {Object.entries(THEMES).map(([key, themeOption]) => (
                  <button
                    key={key}
                    onClick={() => selectTheme(key)}
                    style={{
                      padding: '16px',
                      background: theme === key ? themeOption.gradient : 'white',
                      color: theme === key ? 'white' : '#334155',
                      border: `2px solid ${theme === key ? 'transparent' : '#e2e8f0'}`,
                      borderRadius: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {themeOption.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Monthly Income */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                    Monthly Income
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: currentTheme.primary }}>
                    ${monthlyIncome.toFixed(2)}
                  </div>
                </div>
                <button
                  onClick={openEditIncome}
                  style={{
                    background: currentTheme.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Edit2 size={16} />
                  Edit
                </button>
              </div>
            </div>

            {/* Categories */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              marginTop: '32px'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
                Manage Categories
              </h3>
              <button
                onClick={openAddCategory}
                style={{
                  background: currentTheme.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Plus size={16} />
                Add
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {categories.map(cat => (
                <div key={cat.id} style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                      {cat.name}
                    </div>
                    <div style={{ fontSize: '14px', color: '#64748b' }}>
                      Budget: ${cat.limit.toFixed(2)}/month
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => openEditCategory(cat)}
                      style={{
                        background: currentTheme.primary,
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteCategory(cat)}
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Income Modal */}
      {showEditIncome && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px'
        }} onClick={() => setShowEditIncome(false)}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '32px',
            width: '100%',
            maxWidth: '400px'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '24px' }}>
              Edit Monthly Income
            </h3>

            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>
              Monthly Income
            </label>
            <input
              type="number"
              value={editIncomeValue}
              onChange={(e) => setEditIncomeValue(e.target.value)}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '24px',
                fontWeight: '700',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                marginBottom: '24px'
              }}
              autoFocus
            />

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowEditIncome(false)}
                style={{
                  flex: 1,
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: '600',
                  background: '#f1f5f9',
                  color: '#64748b',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveIncome}
                style={{
                  flex: 1,
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: '600',
                  background: currentTheme.gradient,
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditCategory && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px'
        }} onClick={() => setShowEditCategory(false)}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '32px',
            width: '100%',
            maxWidth: '400px'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '24px' }}>
              Edit Category
            </h3>

            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>
              Category Name
            </label>
            <input
              type="text"
              value={editCategoryName}
              onChange={(e) => setEditCategoryName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                marginBottom: '16px'
              }}
            />

            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>
              Monthly Budget
            </label>
            <input
              type="number"
              value={editCategoryLimit}
              onChange={(e) => setEditCategoryLimit(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                marginBottom: '24px'
              }}
            />

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowEditCategory(false)}
                style={{
                  flex: 1,
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: '600',
                  background: '#f1f5f9',
                  color: '#64748b',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveCategory}
                style={{
                  flex: 1,
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: '600',
                  background: currentTheme.gradient,
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategory && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px'
        }} onClick={() => setShowAddCategory(false)}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '32px',
            width: '100%',
            maxWidth: '400px'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '24px' }}>
              Add New Category
            </h3>

            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>
              Category Name
            </label>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="e.g., Pet Care"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                marginBottom: '16px'
              }}
              autoFocus
            />

            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>
              Monthly Budget
            </label>
            <input
              type="number"
              value={newCategoryLimit}
              onChange={(e) => setNewCategoryLimit(e.target.value)}
              placeholder="0.00"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                marginBottom: '24px'
              }}
            />

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowAddCategory(false)}
                style={{
                  flex: 1,
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: '600',
                  background: '#f1f5f9',
                  color: '#64748b',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={addCategory}
                disabled={!newCategoryName.trim() || !newCategoryLimit}
                style={{
                  flex: 1,
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: '600',
                  background: (!newCategoryName.trim() || !newCategoryLimit) ? '#e2e8f0' : currentTheme.gradient,
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: (!newCategoryName.trim() || !newCategoryLimit) ? 'not-allowed' : 'pointer'
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Set Weekly Budget Modal */}
      {showSetWeeklyBudget && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px'
        }} onClick={() => setShowSetWeeklyBudget(false)}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '32px',
            width: '100%',
            maxWidth: '400px'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '12px' }}>
              Set Budget for Week {currentWeek.weekNumber}
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
              Set how much you want to spend this week. The app will track your spending against this budget.
            </p>

            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>
              Weekly Budget
            </label>
            <input
              type="number"
              value={weeklyBudgetAmount}
              onChange={(e) => setWeeklyBudgetAmount(e.target.value)}
              placeholder="0.00"
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '24px',
                fontWeight: '700',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                marginBottom: '16px'
              }}
              autoFocus
            />

            {/* Rollover Option */}
            {availableRollover > 0 && (
              <div style={{
                background: '#f0fdf4',
                border: '2px solid #10b981',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#10b981'
                  }} />
                  <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '16px' }}>
                    Rollover Available!
                  </span>
                </div>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>
                  You have <strong style={{ color: '#10b981' }}>${availableRollover.toFixed(2)}</strong> unspent from last week. Would you like to add it to this week's budget?
                </p>
                <div style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>
                  This will give you ${(parseFloat(weeklyBudgetAmount || 0) + availableRollover).toFixed(2)} total for the week and track it as savings.
                </div>
              </div>
            )}

            {/* Overspending Option */}
            {overspentAmount > 0 && (
              <div style={{
                background: '#fef2f2',
                border: '2px solid #ef4444',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#ef4444'
                  }} />
                  <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '16px' }}>
                    Overspent Last Week
                  </span>
                </div>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>
                  You overspent by <strong style={{ color: '#ef4444' }}>${overspentAmount.toFixed(2)}</strong> last week. Would you like to reduce this week's budget to make up for it?
                </p>
                <div style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>
                  This will give you ${(parseFloat(weeklyBudgetAmount || 0) - overspentAmount).toFixed(2)} total for the week to get back on track.
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowSetWeeklyBudget(false)}
                style={{
                  flex: 1,
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: '600',
                  background: '#f1f5f9',
                  color: '#64748b',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              {(availableRollover > 0 || overspentAmount > 0) ? (
                <>
                  <button
                    onClick={() => saveWeeklyBudget(false)}
                    disabled={!weeklyBudgetAmount || parseFloat(weeklyBudgetAmount) <= 0}
                    style={{
                      flex: 1,
                      padding: '16px',
                      fontSize: '16px',
                      fontWeight: '600',
                      background: (!weeklyBudgetAmount || parseFloat(weeklyBudgetAmount) <= 0) ? '#e2e8f0' : '#64748b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: (!weeklyBudgetAmount || parseFloat(weeklyBudgetAmount) <= 0) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Save Only
                  </button>
                  <button
                    onClick={() => saveWeeklyBudget(true)}
                    disabled={!weeklyBudgetAmount || parseFloat(weeklyBudgetAmount) <= 0}
                    style={{
                      flex: 1,
                      padding: '16px',
                      fontSize: '16px',
                      fontWeight: '600',
                      background: (!weeklyBudgetAmount || parseFloat(weeklyBudgetAmount) <= 0) 
                        ? '#e2e8f0' 
                        : availableRollover > 0 ? '#10b981' : '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: (!weeklyBudgetAmount || parseFloat(weeklyBudgetAmount) <= 0) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {availableRollover > 0 ? '+ Rollover' : '− Overspent'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => saveWeeklyBudget(false)}
                  disabled={!weeklyBudgetAmount || parseFloat(weeklyBudgetAmount) <= 0}
                  style={{
                    flex: 1,
                    padding: '16px',
                    fontSize: '16px',
                    fontWeight: '600',
                    background: (!weeklyBudgetAmount || parseFloat(weeklyBudgetAmount) <= 0) ? '#e2e8f0' : currentTheme.gradient,
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: (!weeklyBudgetAmount || parseFloat(weeklyBudgetAmount) <= 0) ? 'not-allowed' : 'pointer'
                  }}
                >
                  Save
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Extra Income Modal */}
      {showAddExtraIncome && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px'
        }} onClick={() => setShowAddExtraIncome(false)}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '32px',
            width: '100%',
            maxWidth: '400px'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '12px' }}>
              Add Extra Income
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
              Add any gifts, bonuses, or extra income for this month.
            </p>

            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>
              Description
            </label>
            <input
              type="text"
              value={newExtraIncomeDescription}
              onChange={(e) => setNewExtraIncomeDescription(e.target.value)}
              placeholder="e.g., Birthday gift, Bonus"
              style={{
                width: 'calc(100% - 24px)',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                marginBottom: '16px'
              }}
              autoFocus
            />

            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>
              Amount
            </label>
            <input
              type="number"
              value={newExtraIncome}
              onChange={(e) => setNewExtraIncome(e.target.value)}
              placeholder="0.00"
              style={{
                width: 'calc(100% - 32px)',
                padding: '16px',
                fontSize: '24px',
                fontWeight: '700',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                marginBottom: '24px'
              }}
            />

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowAddExtraIncome(false)}
                style={{
                  flex: 1,
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: '600',
                  background: '#f1f5f9',
                  color: '#64748b',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={addExtraIncome}
                disabled={!newExtraIncome || parseFloat(newExtraIncome) <= 0 || !newExtraIncomeDescription.trim()}
                style={{
                  flex: 1,
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: '600',
                  background: (!newExtraIncome || parseFloat(newExtraIncome) <= 0 || !newExtraIncomeDescription.trim()) ? '#e2e8f0' : currentTheme.gradient,
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: (!newExtraIncome || parseFloat(newExtraIncome) <= 0 || !newExtraIncomeDescription.trim()) ? 'not-allowed' : 'pointer'
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Expense Modal */}
      {showEditExpense && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px'
        }} onClick={() => setShowEditExpense(false)}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '32px',
            width: '100%',
            maxWidth: '400px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '24px' }}>
              Edit Expense
            </h3>

            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>
              Description
            </label>
            <input
              type="text"
              value={editExpenseDescription}
              onChange={(e) => setEditExpenseDescription(e.target.value)}
              placeholder="e.g., Chick-fil-A"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                marginBottom: '16px'
              }}
            />

            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>
              Amount
            </label>
            <input
              type="number"
              value={editExpenseAmount}
              onChange={(e) => setEditExpenseAmount(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                marginBottom: '16px'
              }}
            />

            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>
              Date
            </label>
            <input
              type="date"
              value={editExpenseDate}
              onChange={(e) => setEditExpenseDate(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                marginBottom: '16px'
              }}
            />

            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>
              Category
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
              marginBottom: '24px'
            }}>
              {categories.map((cat, index) => {
                const categoryColor = getCategoryColor(index);
                return (
                  <button
                    key={cat.id}
                    onClick={() => setEditExpenseCategory(cat)}
                    style={{
                      padding: '12px',
                      background: editExpenseCategory?.id === cat.id ? categoryColor : 'white',
                      color: editExpenseCategory?.id === cat.id ? 'white' : '#334155',
                      border: `2px solid ${editExpenseCategory?.id === cat.id ? categoryColor : '#e2e8f0'}`,
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontSize: '14px'
                    }}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowEditExpense(false)}
                style={{
                  flex: 1,
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: '600',
                  background: '#f1f5f9',
                  color: '#64748b',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveExpense}
                disabled={!editExpenseDescription.trim() || !editExpenseAmount || !editExpenseCategory}
                style={{
                  flex: 1,
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: '600',
                  background: (!editExpenseDescription.trim() || !editExpenseAmount || !editExpenseCategory) ? '#e2e8f0' : currentTheme.gradient,
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: (!editExpenseDescription.trim() || !editExpenseAmount || !editExpenseCategory) ? 'not-allowed' : 'pointer'
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'flex-end',
          zIndex: 1000
        }} onClick={() => setShowQuickAdd(false)}>
          <div style={{
            background: 'white',
            borderRadius: '24px 24px 0 0',
            padding: '32px 24px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
                Add Expense
              </h3>
              <button
                onClick={() => setShowQuickAdd(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px'
                }}
              >
                <X size={24} color="#64748b" />
              </button>
            </div>

            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>
              Description
            </label>
            <input
              type="text"
              value={quickDescription}
              onChange={(e) => setQuickDescription(e.target.value)}
              placeholder="e.g., Chick-fil-A"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                marginBottom: '16px'
              }}
              autoFocus
            />

            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>
              Amount
            </label>
            <input
              type="number"
              value={quickAmount}
              onChange={(e) => setQuickAmount(e.target.value)}
              placeholder="0.00"
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '32px',
                fontWeight: '700',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                marginBottom: '16px',
                textAlign: 'center'
              }}
            />

            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>
              Date
            </label>
            <input
              type="date"
              value={quickDate}
              onChange={(e) => setQuickDate(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                marginBottom: '24px'
              }}
            />

            <label style={{ display: 'block', marginBottom: '16px', fontWeight: '600', color: '#334155' }}>
              Category
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              marginBottom: '24px'
            }}>
              {categories.map((cat, index) => {
                const categoryColor = getCategoryColor(index);
                return (
                  <button
                    key={cat.id}
                    onClick={() => setQuickCategory(cat)}
                    style={{
                      padding: '16px',
                      background: quickCategory?.id === cat.id ? categoryColor : 'white',
                      color: quickCategory?.id === cat.id ? 'white' : '#334155',
                      border: `2px solid ${quickCategory?.id === cat.id ? categoryColor : '#e2e8f0'}`,
                      borderRadius: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>

            <button
              onClick={addTransaction}
              disabled={!quickAmount || !quickCategory || !quickDescription.trim()}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '18px',
                fontWeight: '600',
                background: (!quickAmount || !quickCategory || !quickDescription.trim()) ? '#e2e8f0' : currentTheme.gradient,
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: (!quickAmount || !quickCategory || !quickDescription.trim()) ? 'not-allowed' : 'pointer'
              }}
            >
              Add Expense
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setShowQuickAdd(true)}
        style={{
          position: 'fixed',
          bottom: '88px',
          right: '24px',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: currentTheme.gradient,
          border: 'none',
          boxShadow: `0 8px 24px ${currentTheme.primary}66`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}
      >
        <PlusCircle size={32} color="white" />
      </button>

      {/* Bottom Navigation */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '12px 0',
        zIndex: 100
      }}>
        <button
          onClick={() => setCurrentView('home')}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            color: currentView === 'home' ? currentTheme.primary : '#94a3b8',
            padding: '8px 16px',
            flex: 1
          }}
        >
          <Home size={24} />
          <span style={{ fontSize: '11px', fontWeight: '600' }}>Home</span>
        </button>
        
        <button
          onClick={() => setCurrentView('expenses')}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            color: currentView === 'expenses' ? currentTheme.primary : '#94a3b8',
            padding: '8px 16px',
            flex: 1
          }}
        >
          <TrendingDown size={24} />
          <span style={{ fontSize: '11px', fontWeight: '600' }}>Expenses</span>
        </button>

        <button
          onClick={() => setCurrentView('charts')}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            color: currentView === 'charts' ? currentTheme.primary : '#94a3b8',
            padding: '8px 16px',
            flex: 1
          }}
        >
          <BarChart3 size={24} />
          <span style={{ fontSize: '11px', fontWeight: '600' }}>Charts</span>
        </button>

        <button
          onClick={() => setCurrentView('history')}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            color: currentView === 'history' ? currentTheme.primary : '#94a3b8',
            padding: '8px 16px',
            flex: 1
          }}
        >
          <Calendar size={24} />
          <span style={{ fontSize: '11px', fontWeight: '600' }}>History</span>
        </button>

        <button
          onClick={() => setCurrentView('settings')}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            color: currentView === 'settings' ? currentTheme.primary : '#94a3b8',
            padding: '8px 16px',
            flex: 1
          }}
        >
          <Settings size={24} />
          <span style={{ fontSize: '11px', fontWeight: '600' }}>Settings</span>
        </button>
      </div>
    </div>
  );
};

export default App;