import apiService from './apiService.js';

const orderService = {
  // Get all orders with filtering
  async getOrders(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.payment_status) queryParams.append('payment_status', params.payment_status);
      if (params.store_id) queryParams.append('store_id', params.store_id);
      if (params.distributor_id) queryParams.append('distributor_id', params.distributor_id);
      if (params.date_from) queryParams.append('date_from', params.date_from);
      if (params.date_to) queryParams.append('date_to', params.date_to);

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/orders?${queryString}` : '/orders';
      
      const response = await apiService.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  // Get single order
  async getOrder(id) {
    try {
      const response = await apiService.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  // Create new order
  async createOrder(orderData) {
    try {
      const response = await apiService.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Update order (draft only)
  async updateOrder(id, orderData) {
    try {
      const response = await apiService.put(`/orders/${id}`, orderData);
      return response.data;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  },

  // Delete order (draft only)
  async deleteOrder(id) {
    try {
      const response = await apiService.delete(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  },

  // Update order status
  async updateOrderStatus(id, status) {
    try {
      const response = await apiService.patch(`/orders/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Update payment status
  async updatePaymentStatus(id, payment_status) {
    try {
      const response = await apiService.patch(`/orders/${id}/payment-status`, { payment_status });
      return response.data;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  },

  // Assign distributor manually
  async assignDistributor(orderId, distributorId) {
    try {
      const response = await apiService.post(`/orders/${orderId}/assign-distributor`, {
        distributor_id: distributorId
      });
      return response.data;
    } catch (error) {
      console.error('Error assigning distributor:', error);
      throw error;
    }
  },

  // Unassign distributor
  async unassignDistributor(orderId) {
    try {
      const response = await apiService.delete(`/orders/${orderId}/assign-distributor`);
      return response.data;
    } catch (error) {
      console.error('Error unassigning distributor:', error);
      throw error;
    }
  },

  // Get distributor orders
  async getDistributorOrders(distributorId, status = null) {
    try {
      const queryParams = status ? `?status=${status}` : '';
      const response = await apiService.get(`/orders/distributor/${distributorId}${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching distributor orders:', error);
      throw error;
    }
  },

  // Get today's orders
  async getTodayOrders() {
    try {
      const response = await apiService.get('/orders/today');
      return response.data;
    } catch (error) {
      console.error('Error fetching today orders:', error);
      throw error;
    }
  },

  // Get order statistics
  async getOrderStatistics() {
    try {
      const response = await apiService.get('/orders/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching order statistics:', error);
      throw error;
    }
  },

  // Export orders
  async exportOrders(format = 'csv') {
    try {
      const response = await apiService.get(`/orders/export?format=${format}`);
      return response.data;
    } catch (error) {
      console.error('Error exporting orders:', error);
      throw error;
    }
  },

  // Helper functions for order management
  getStatusOptions() {
    return [
      { value: 'draft', label: 'Draft', color: 'gray' },
      { value: 'confirmed', label: 'Confirmed', color: 'blue' },
      { value: 'in_progress', label: 'In Progress', color: 'orange' },
      { value: 'delivered', label: 'Delivered', color: 'green' },
      { value: 'cancelled', label: 'Cancelled', color: 'red' }
    ];
  },

  getPaymentStatusOptions() {
    return [
      { value: 'pending', label: 'Pending', color: 'orange' },
      { value: 'paid', label: 'Paid', color: 'green' }
    ];
  },

  getCurrencyOptions() {
    return [
      { value: 'EUR', label: 'Euro (€)' },
      { value: 'SYP', label: 'Syrian Pound (£S)' }
    ];
  },

  // Check if order can be edited
  canEditOrder(order) {
    return order.status === 'draft';
  },

  // Check if order can be cancelled
  canCancelOrder(order) {
    return ['draft', 'confirmed'].includes(order.status);
  },

  // Check if order can be deleted
  canDeleteOrder(order) {
    return order.status === 'draft';
  },

  // Get status color class
  getStatusColor(status) {
    const statusColors = {
      draft: 'bg-gray-100 text-gray-800',
      confirmed: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  },

  // Get payment status color class
  getPaymentStatusColor(paymentStatus) {
    const statusColors = {
      pending: 'bg-orange-100 text-orange-800',
      paid: 'bg-green-100 text-green-800'
    };
    return statusColors[paymentStatus] || 'bg-gray-100 text-gray-800';
  },

  // Format currency amount
  formatAmount(amount, currency) {
    const numAmount = parseFloat(amount) || 0;
    if (currency === 'EUR') {
      return `€${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    } else {
      return `£S${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    }
  }
};

export default orderService; 