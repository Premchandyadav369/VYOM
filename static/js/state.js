/**
 * VERA State Store
 * Minimal, persistent state management without frameworks.
 */

export const state = {
  currentView: localStorage.getItem('vera_view') || 'overview',
  selectedPaymentId: localStorage.getItem('vera_selected_pid') || null,
  selectedPayment: null,
  payments: [],
  filteredPayments: [],
  overview: null,
  blocks: [],
  transactions: [],
  policyRules: [],
  filterStatus: 'ALL',
  searchQuery: '',
  isLiveFeed: false,
  streamTimer: null,
  subscribers: [],

  subscribe(fn) {
    this.subscribers.push(fn);
  },

  notify() {
    this.subscribers.forEach(fn => fn(this));
  },

  setView(viewName) {
    this.currentView = viewName;
    localStorage.setItem('vera_view', viewName);
    this.notify();
  },

  setSelectedPayment(payment) {
    this.selectedPayment = payment;
    this.selectedPaymentId = payment ? payment.payment_id : null;
    if (payment) {
      localStorage.setItem('vera_selected_pid', payment.payment_id);
    } else {
      localStorage.removeItem('vera_selected_pid');
    }
    this.notify();
  }
};
