export type ProductCategory =
  | 'WEB'
  | 'AGENT'
  | 'EXCEL'
  | 'AUTOMATION'
  | 'PROMPT'
  | 'DOCUMENT'
  | 'DATA'
  | 'OTHER';

export type ProductStatus = 'PUBLISHED' | 'HIDDEN';

export type AccessPolicy = 'PUBLIC' | 'REQUEST' | 'PRIVATE';

export type PreviewType = 'IMAGE' | 'VIDEO' | 'SAMPLE_INPUT' | 'SAMPLE_OUTPUT';

export type RequestStatus = 'REQUESTED' | 'CONTACTED' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

export interface ProductFeature {
  id: string;
  productId: string;
  featureText: string;
  sortOrder: number;
}

export interface ProductPreview {
  id: string;
  productId: string;
  type: PreviewType;
  fileId?: string;
  url?: string;
  textContent?: string;
  caption?: string;
  sortOrder: number;
}

export interface ProductFile {
  id: string;
  productId: string;
  fileName: string;
  driveFileId?: string;
  fileType: string;
  fileSize?: string;
  accessPolicy: AccessPolicy;
  downloadCount: number;
  sortOrder: number;
}

export interface Product {
  id: string;
  title: string;
  category: ProductCategory;
  shortDescription: string;
  description: string;
  creatorName: string;
  creatorDepartment: string;
  creatorEmail?: string;
  thumbnailUrl: string;
  serviceUrl?: string;
  status: ProductStatus;
  viewCount: number;
  downloadCount: number;
  requestCount: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  features?: ProductFeature[];
  previews?: ProductPreview[];
  files?: ProductFile[];
}

export interface MaterialRequest {
  id: string; // e.g. REQ-20260811-001
  productId: string;
  fileId?: string;
  productTitle: string;
  fileName?: string;
  requestType?: 'SERVICE_ACCESS' | 'FILE_ACCESS';
  requesterName: string;
  requesterDepartment: string;
  requesterEmail: string;
  purpose: string;
  message?: string;
  creatorName?: string;
  creatorDepartment?: string;
  creatorEmail?: string;
  status: RequestStatus;
  requestedAt: string;
}

export type SubmissionStatus = 'REVIEW' | 'APPROVED' | 'REJECTED';

export interface UserSubmission {
  id: string; // SUBMISSION_ID e.g. SUB-20260811-001
  submitterName: string;
  submitterDepartment: string;
  submitterEmail: string;
  title: string;
  category: ProductCategory;
  shortDescription: string;
  description: string;
  features?: string[];
  serviceUrl?: string;
  thumbnailUrl?: string;
  previews?: { id: string; url: string; caption?: string }[];
  status: SubmissionStatus;
  adminComment?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export interface StoreStats {
  totalProducts: number;
  totalViews: number;
  totalDownloads: number;
  totalRequests: number;
  categoryCounts: Record<ProductCategory, number>;
  topViewed: Product[];
  topDownloaded: Product[];
  recentRequests: MaterialRequest[];
}
