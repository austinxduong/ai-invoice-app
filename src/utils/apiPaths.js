// frontend/src/utils/apiPaths.js
export const BASE_URL = "https://crustless-diastrophic-thi.ngrok-free.dev";

export const API_PATHS = {
  // OLD AUTH (Keep for backward compatibility during transition)
  AUTH_OLD: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    GET_PROFILE: "/auth/me",
    UPDATE_PROFILE: "/auth/me"
  },

  // NEW AUTH (Multi-tenant endpoints)
  AUTH: {
    REGISTER: "/auth-new/register",       // Create new account
    LOGIN: "/auth-new/login",             // Login
    GET_PROFILE: "/auth-new/me",          // Get current user (GET)
    UPDATE_PROFILE: "/auth-new/me",       // Update profile (PUT)
    UPDATE_ORGANIZATION: "/auth-new/organization", // Update company details
    LOGOUT: "/auth-new/logout"            // Logout
  },

  INVOICE: {
    CREATE: "/invoices",
    GET_ALL_INVOICES: "/invoices/",
    GET_INVOICE_BY_ID: (id) => `/invoices/${id}`,
    UPDATE_INVOICE: (id) => `/invoices/${id}`,
    DELETE_INVOICES: (id) => `/invoices/${id}`,
  },

  AI: {
    PARSE_INVOICE_TEXT: '/ai/parse-text',
    GENERATE_REMINDER: '/ai/generate-reminder',
    GET_DASHBOARD_SUMMARY: '/ai/dashboard-summary'
  },

  DEMO: {
    BOOK: "/demo-requests",
    STATUS: "/demo/status",
    LIST: "/demo/requests"
  },

  PRODUCTS: {
    GET_ALL: "/products",
    GET_BY_ID: (id) => `/products/${id}`,
    CREATE: "/products",
    UPDATE: (id) => `/products/${id}`,
    DELETE: (id) => `/products/${id}`,
    STATS: "/products/categories/stats"
  },

  TRANSACTIONS: {
    GET_ALL: "/transactions",
    GET_BY_ID: (id) => `/transactions/${id}`,
    CREATE: "/transactions",
    REFUND: (id) => `/transactions/${id}/refund`,
    REPORTS: {
      SUMMARY: "/transactions/reports/summary",
      DAILY: "/transactions/reports/daily"
    }
  }
}