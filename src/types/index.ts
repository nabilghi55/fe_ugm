export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'APPRAISER' | 'CASHIER' | 'MANAGER';

export interface User {
  id: string;
  branch_id?: string;
  username: string;
  email: string;
  full_name: string;
  role: Role;
  is_active: boolean;
  last_login_at?: string;
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  address: string;
  phone: string;
  is_active: boolean;
}

export interface CustomerDocument {
  id: string;
  customer_id: string;
  document_type: 'KTP' | 'SELFIE' | 'SELFIE_WITH_KTP' | 'OTHER';
  object_key: string;
  view_url?: string;
  ocr_data?: string;
  ocr_confidence?: number;
  verification_status: 'UNVERIFIED' | 'VERIFIED' | 'REJECTED';
  verified_at?: string;
}

export interface Customer {
  id: string;
  customer_code: string;
  nik: string;
  full_name: string;
  birth_place?: string;
  birth_date?: string;
  gender?: 'MALE' | 'FEMALE';
  address?: string;
  province?: string;
  city?: string;
  district?: string;
  village?: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  occupation?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  documents?: CustomerDocument[];
  created_at: string;
}

export interface AssetCategory {
  id: string;
  name: string;
  ltv_percent: number;
  checklists?: CategoryChecklist[];
}

export interface CategoryChecklist {
  id: string;
  category_id: string;
  item_name: string;
  description: string;
}

export interface AssetPhoto {
  id: string;
  asset_id: string;
  object_key: string;
  view_url?: string;
  image_type: string;
  is_primary: boolean;
}

export interface AssetInspection {
  id: string;
  asset_id: string;
  item_name: string;
  status: 'GOOD' | 'FAIR' | 'POOR' | 'BROKEN';
  notes?: string;
}

export interface Asset {
  id: string;
  asset_code: string;
  category_id: string;
  category?: AssetCategory;
  subcategory?: string;
  brand: string;
  model: string;
  variant?: string;
  serial_number?: string;
  imei?: string;
  year?: number;
  color?: string;
  specification?: string;
  accessories?: string;
  physical_condition: string;
  functional_condition: string;
  purchase_price: number;
  notes?: string;
  photos?: AssetPhoto[];
  inspections?: AssetInspection[];
  created_at: string;
}

export interface MarketComparable {
  source: string;
  external_id?: string;
  title: string;
  url?: string;
  price: number;
  location?: string;
  condition?: string;
  seller_type?: string;
  brand: string;
  model: string;
  variant?: string;
  specification?: string;
  fetched_at: string;
  similarity_score: number;
}

export interface MarketPriceResult {
  recommended_price: number;
  minimum_price: number;
  maximum_price: number;
  median_price: number;
  trimmed_mean_price: number;
  confidence_score: number;
  comparable_count: number;
  historical_price: number;
  comparables: MarketComparable[];
}

export interface Appraisal {
  id: string;
  asset_id: string;
  asset?: Asset;
  market_price: number;
  market_price_min: number;
  market_price_max: number;
  market_confidence: number;
  historical_price: number;
  condition_adjustment_percent: number;
  adjusted_market_price: number;
  appraiser_price: number;
  appraiser_notes?: string;
  loan_to_value: number;
  maximum_loan: number;
  recommended_loan: number;
  appraised_at: string;
}

export type PawnStatus =
  | 'DRAFT'
  | 'WAITING_APPRAISAL'
  | 'WAITING_APPROVAL'
  | 'APPROVED'
  | 'ACTIVE'
  | 'DUE_SOON'
  | 'OVERDUE'
  | 'EXTENDED'
  | 'PAID'
  | 'READY_FOR_RELEASE'
  | 'RELEASED'
  | 'DEFAULTED'
  | 'AUCTION_READY'
  | 'AUCTIONED'
  | 'CANCELLED';

export interface PawnTransaction {
  id: string;
  pawn_number: string;
  customer_id: string;
  customer?: Customer;
  branch_id: string;
  branch?: Branch;
  appraisal_id: string;
  appraisal?: Appraisal;
  principal_amount: number;
  interest_rate: number;
  administration_fee: number;
  storage_fee: number;
  penalty_rate: number;
  loan_date: string;
  due_date: string;
  grace_period: number;
  status: PawnStatus;
  approved_at?: string;
  approval_notes?: string;
  created_at: string;
}

export interface PaymentCalculation {
  outstanding_principal: number;
  accrued_interest: number;
  admin_fee: number;
  storage_fee: number;
  penalty_fee: number;
  days_overdue: number;
  total_payoff: number;
}

export interface Inventory {
  id: string;
  branch_id: string;
  warehouse: string;
  rack: string;
  box: string;
  asset_id: string;
  asset?: Asset;
  pawn_transaction_id?: string;
  pawn_transaction?: PawnTransaction;
  status: string;
  qr_code: string;
}

export interface DashboardSummary {
  active_loans_count: number;
  total_loan_outstanding: number;
  total_asset_market_value: number;
  today_disbursement: number;
  today_payment: number;
  interest_income_total: number;
  overdue_count: number;
  total_customers: number;
  stored_assets_count: number;
  completed_loans_count: number;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user?: User;
  action: string;
  entity: string;
  entity_id: string;
  old_value?: string;
  new_value?: string;
  ip_address?: string;
  created_at: string;
}

export interface APIResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: any;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface PaginatedData<T> {
  data: T[];
  meta: PaginatedMeta;
}
