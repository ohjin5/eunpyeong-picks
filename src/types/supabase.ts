import { ProductCategory } from './store';

export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'HIDDEN';
export type SubmissionStatus = 'REVIEW' | 'APPROVED' | 'REJECTED';
export type ServiceRequestStatus = 'REQUESTED' | 'APPROVED' | 'REJECTED';

// Supabase table row schemas
export interface ProductRow {
  id: string;
  title: string;
  category: ProductCategory;
  short_description: string;
  description: string;
  service_url?: string;
  thumbnail_url?: string;
  view_count: number;
  download_count: number;
  request_count: number;
  featured: boolean;
  creator_name: string;
  creator_department: string;
  creator_email: string;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
}

export interface ProductFeatureRow {
  id: string;
  product_id: string;
  feature_text: string;
  sort_order: number;
}

export interface ProductPreviewRow {
  id: string;
  product_id: string;
  type: 'IMAGE' | 'TEXT' | 'YOUTUBE';
  url?: string;
  text_content?: string;
  caption?: string;
  sort_order: number;
}

export interface SubmissionRow {
  id: string;
  submitter_name: string;
  submitter_department: string;
  submitter_email: string;
  title: string;
  category: ProductCategory;
  short_description: string;
  description: string;
  service_url?: string;
  thumbnail_url?: string;
  status: SubmissionStatus;
  admin_comment?: string;
  submitted_at: string;
  reviewed_at?: string;
}

export interface SubmissionFeatureRow {
  id: string;
  submission_id: string;
  feature_text: string;
  sort_order: number;
}

export interface SubmissionPreviewRow {
  id: string;
  submission_id: string;
  image_url: string;
  caption?: string;
  sort_order: number;
}

export interface ServiceRequestRow {
  id: string;
  product_id: string;
  product_title?: string;
  requester_name: string;
  requester_department: string;
  requester_email: string;
  purpose: string;
  notes?: string;
  creator_name: string;
  creator_department: string;
  creator_email: string;
  status: ServiceRequestStatus;
  created_at: string;
}
