// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Helper function to get auth token
const getToken = () => {
  return localStorage.getItem('auth_token');
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || 'Something went wrong');
  }
  return response.json();
};

// Auth API
export const authAPI = {
  register: async (email, password, name) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    const data = await handleResponse(response);
    localStorage.setItem('auth_token', data.token);
    return data;
  },

  login: async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await handleResponse(response);
    localStorage.setItem('auth_token', data.token);
    return data;
  },

  loginWithGoogle: () => {
    window.location.href = `${API_URL}/auth/google`;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
  },

  isAuthenticated: () => {
    return !!getToken();
  }
};

// User API
export const userAPI = {
  getProfile: async () => {
    const response = await fetch(`${API_URL}/api/user/profile`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    return handleResponse(response);
  },

  updateSettings: async (settings) => {
    const response = await fetch(`${API_URL}/api/user/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(settings)
    });
    return handleResponse(response);
  }
};

// Categories API
export const categoriesAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/api/categories`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    return handleResponse(response);
  },

  create: async (category) => {
    const response = await fetch(`${API_URL}/api/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(category)
    });
    return handleResponse(response);
  },

  update: async (id, category) => {
    const response = await fetch(`${API_URL}/api/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(category)
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/api/categories/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    return handleResponse(response);
  }
};

// Transactions API
export const transactionsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/api/transactions`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    return handleResponse(response);
  },

  create: async (transaction) => {
    const response = await fetch(`${API_URL}/api/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(transaction)
    });
    return handleResponse(response);
  },

  update: async (id, transaction) => {
    const response = await fetch(`${API_URL}/api/transactions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(transaction)
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/api/transactions/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    return handleResponse(response);
  }
};

// Extra Income API
export const extraIncomeAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/api/extra-income`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    return handleResponse(response);
  },

  create: async (income) => {
    const response = await fetch(`${API_URL}/api/extra-income`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(income)
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/api/extra-income/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    return handleResponse(response);
  }
};

// Weekly Budgets API
export const weeklyBudgetsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/api/weekly-budgets`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    return handleResponse(response);
  },

  set: async (weeklyBudget) => {
    const response = await fetch(`${API_URL}/api/weekly-budgets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(weeklyBudget)
    });
    return handleResponse(response);
  }
};

// Monthly Savings API
export const monthlySavingsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/api/monthly-savings`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    return handleResponse(response);
  },

  update: async (savings) => {
    const response = await fetch(`${API_URL}/api/monthly-savings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(savings)
    });
    return handleResponse(response);
  }
};
