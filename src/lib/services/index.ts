import { ProductService, CreateSubmissionInput, CreateServiceRequestInput, GetProductsParams } from './productService';

export const getProducts = (params?: GetProductsParams) => ProductService.getProducts(params);
export const getProductById = (id: string) => ProductService.getProductById(id);
export const createSubmission = (data: CreateSubmissionInput) => ProductService.createSubmission(data);
export const approveSubmission = (id: string, adminComment?: string) => ProductService.approveSubmission(id, adminComment);
export const rejectSubmission = (id: string, adminComment?: string) => ProductService.rejectSubmission(id, adminComment);
export const createServiceRequest = (data: CreateServiceRequestInput) => ProductService.createServiceRequest(data);
export const incrementProductView = (id: string) => ProductService.incrementProductView(id);
export const uploadThumbnail = (fileBuffer: Buffer | Uint8Array, fileName: string, path: string) =>
  ProductService.uploadThumbnail(fileBuffer, fileName, path);
export const uploadPreviewImages = (files: Array<{ buffer: Buffer | Uint8Array; fileName: string }>, basePath: string) =>
  ProductService.uploadPreviewImages(files, basePath);

export { ProductService };
export type { CreateSubmissionInput, CreateServiceRequestInput, GetProductsParams };
