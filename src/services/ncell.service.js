import api from './api';

export const ncellService = {
  getPacks: async () => {
    const response = await api.get('/api/ncell/packs/');
    return response.data;
  },

  sendOtp: async (data) => {
    const response = await api.post('/api/ncell/send-otp/', data);
    return response.data;
  },

  confirmPurchase: async (data) => {
    const response = await api.post('/api/ncell/confirm/', data);
    return response.data;
  },
};

