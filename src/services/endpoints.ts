import axios from 'axios';
import api from './api';
import {
  APIResponse,
  PaginatedData,
  User,
  Customer,
  Asset,
  AssetCategory,
  MarketPriceResult,
  Appraisal,
  PawnTransaction,
  PaymentCalculation,
  Inventory,
  DashboardSummary,
  AuditLog,
} from '../types';

export const authApi = {
  login: async (username: string, password: string) => {
    const res = await api.post<APIResponse<any>>('/auth/login', { username, password });
    return res.data;
  },
};

export const storageApi = {
  getPresignedUpload: async (fileName: string, contentType: string, folder = 'documents') => {
    const res = await api.post<APIResponse<{ upload_url: string; object_key: string }>>('/storage/presigned-upload', {
      file_name: fileName,
      content_type: contentType,
      folder,
    });
    return res.data.data;
  },
  uploadToPresignedUrl: async (uploadUrl: string, file: File) => {
    try {
      if (uploadUrl.includes('mock-upload')) {
        return; // Dev fallback mode
      }
      await axios.put(uploadUrl, file, {
        headers: { 'Content-Type': file.type },
      });
    } catch (e) {
      console.warn('Storage upload fallback warning:', e);
    }
  },
};

export const customerApi = {
  list: async (search = '', page = 1, limit = 20) => {
    const res = await api.get<APIResponse<PaginatedData<Customer>>>(`/customers?search=${search}&page=${page}&limit=${limit}`);
    return res.data.data;
  },
  get: async (id: string) => {
    const res = await api.get<APIResponse<Customer>>(`/customers/${id}`);
    return res.data.data;
  },
  create: async (data: any) => {
    const res = await api.post<APIResponse<Customer>>('/customers', data);
    return res.data.data;
  },
  addDocument: async (customerId: string, documentType: string, objectKey: string) => {
    const res = await api.post<APIResponse<any>>(`/customers/${customerId}/documents`, {
      document_type: documentType,
      object_key: objectKey,
    });
    return res.data.data;
  },
  verifyOCR: async (docId: string, payload: any) => {
    const res = await api.post<APIResponse<any>>(`/customers/documents/${docId}/verify-ocr`, payload);
    return res.data.data;
  },
};

export const assetApi = {
  list: async (categoryId = '', page = 1, limit = 20) => {
    const res = await api.get<APIResponse<PaginatedData<Asset>>>(`/assets?category_id=${categoryId}&page=${page}&limit=${limit}`);
    return res.data.data;
  },
  getCategories: async () => {
    const res = await api.get<APIResponse<AssetCategory[]>>('/assets/categories');
    return res.data.data;
  },
  get: async (id: string) => {
    const res = await api.get<APIResponse<Asset>>(`/assets/${id}`);
    return res.data.data;
  },
  create: async (data: any) => {
    const res = await api.post<APIResponse<Asset>>('/assets', data);
    return res.data.data;
  },
};

export const marketPriceApi = {
  search: async (params: { brand: string; model: string; variant?: string; category_id?: string; condition?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await api.get<APIResponse<MarketPriceResult>>(`/market-price/search?${query}`);
    return res.data.data;
  },
};

export const appraisalApi = {
  create: async (data: any) => {
    const res = await api.post<APIResponse<Appraisal>>('/appraisals', data);
    return res.data.data;
  },
};

export const pawnApi = {
  list: async (status = '', search = '', page = 1, limit = 20) => {
    const res = await api.get<APIResponse<PaginatedData<PawnTransaction>>>(`/pawn-transactions?status=${status}&search=${search}&page=${page}&limit=${limit}`);
    return res.data.data;
  },
  get: async (id: string) => {
    const res = await api.get<APIResponse<PawnTransaction>>(`/pawn-transactions/${id}`);
    return res.data.data;
  },
  create: async (data: any) => {
    const res = await api.post<APIResponse<PawnTransaction>>('/pawn-transactions', data);
    return res.data.data;
  },
  approve: async (id: string, action: 'APPROVE' | 'REJECT', notes = '') => {
    const res = await api.post<APIResponse<PawnTransaction>>(`/pawn-transactions/${id}/approve`, { action, notes });
    return res.data.data;
  },
  disburse: async (id: string, method: string, bankName = '', accountNumber = '', referenceNumber = '') => {
    const res = await api.post<APIResponse<PawnTransaction>>(`/pawn-transactions/${id}/disburse`, {
      method,
      bank_name: bankName,
      account_number: accountNumber,
      reference_number: referenceNumber,
    });
    return res.data.data;
  },
  getPaymentCalc: async (id: string) => {
    const res = await api.get<APIResponse<PaymentCalculation>>(`/pawn-transactions/${id}/payment-calc`);
    return res.data.data;
  },
  processPayment: async (id: string, paymentType: string, amount: number, paymentMethod: string, referenceNumber = '') => {
    const res = await api.post<APIResponse<any>>(`/pawn-transactions/${id}/payments`, {
      payment_type: paymentType,
      amount,
      payment_method: paymentMethod,
      reference_number: referenceNumber,
    });
    return res.data.data;
  },
  releaseAsset: async (id: string, receiverName: string, receiverIDNumber: string, proofKey = '', notes = '') => {
    const res = await api.post<APIResponse<any>>(`/pawn-transactions/${id}/release`, {
      receiver_name: receiverName,
      receiver_id_number: receiverIDNumber,
      proof_object_key: proofKey,
      notes,
    });
    return res.data.data;
  },
};

export const inventoryApi = {
  list: async (page = 1, limit = 20) => {
    const res = await api.get<APIResponse<PaginatedData<Inventory>>>(`/inventory?page=${page}&limit=${limit}`);
    return res.data.data;
  },
  getByQR: async (qr: string) => {
    const res = await api.get<APIResponse<Inventory>>(`/inventory/qr/${encodeURIComponent(qr)}`);
    return res.data.data;
  },
};

export const dashboardApi = {
  getSummary: async () => {
    const res = await api.get<APIResponse<DashboardSummary>>('/dashboard/summary');
    return res.data.data;
  },
};

export const auditLogApi = {
  list: async (entity = '', action = '', page = 1, limit = 20) => {
    const res = await api.get<APIResponse<PaginatedData<AuditLog>>>(`/audit-logs?entity=${entity}&action=${action}&page=${page}&limit=${limit}`);
    return res.data.data;
  },
};
