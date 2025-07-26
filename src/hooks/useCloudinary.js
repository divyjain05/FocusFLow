import { useState, useCallback } from 'react';
import { 
  uploadToCloudinary, 
  uploadMultipleToCloudinary, 
  validateFile, 
  getFilePreview, 
  revokePreview 
} from '../utils/cloudinary';

/**
 * React hook for Cloudinary file uploads
 * @param {Object} options - Hook options
 * @returns {Object} - Upload state and functions
 */
export const useCloudinary = (options = {}) => {
  const {
    maxFileSize = 10 * 1024 * 1024, // 10MB
    allowedTypes = ['image/*', 'application/pdf', 'text/*'],
    folder = 'focusflow',
    maxWidth = 4000,
    maxHeight = 4000,
  } = options;

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [error, setError] = useState(null);

  /**
   * Upload a single file
   */
  const uploadFile = useCallback(async (file) => {
    try {
      setError(null);
      setUploading(true);
      setUploadProgress(0);

      // Validate file
      const validation = await validateFile(file, {
        maxSize: maxFileSize,
        allowedTypes,
        maxWidth,
        maxHeight,
      });

      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Upload to Cloudinary
      const result = await uploadToCloudinary(file, folder);
      
      setUploadedFiles(prev => [...prev, result]);
      setUploadProgress(100);
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [folder, maxFileSize, allowedTypes, maxWidth, maxHeight]);

  /**
   * Upload multiple files
   */
  const uploadFiles = useCallback(async (files) => {
    try {
      setError(null);
      setUploading(true);
      setUploadProgress(0);

      // Validate all files
      const validationPromises = files.map(file => 
        validateFile(file, { maxSize: maxFileSize, allowedTypes, maxWidth, maxHeight })
      );
      
      const validations = await Promise.all(validationPromises);
      const invalidFiles = validations.filter(v => !v.isValid);
      
      if (invalidFiles.length > 0) {
        const errors = invalidFiles.flatMap(v => v.errors);
        throw new Error(errors.join(', '));
      }

      // Upload all files
      const results = await uploadMultipleToCloudinary(files, folder);
      
      setUploadedFiles(prev => [...prev, ...results]);
      setUploadProgress(100);
      
      return results;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [folder, maxFileSize, allowedTypes, maxWidth, maxHeight]);

  /**
   * Remove a file from uploaded files
   */
  const removeFile = useCallback((index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * Clear all uploaded files
   */
  const clearFiles = useCallback(() => {
    setUploadedFiles([]);
    setError(null);
  }, []);

  /**
   * Get preview for a file
   */
  const getPreview = useCallback((file) => {
    return getFilePreview(file);
  }, []);

  /**
   * Clean up preview URL
   */
  const cleanupPreview = useCallback((previewUrl) => {
    revokePreview(previewUrl);
  }, []);

  return {
    // State
    uploading,
    uploadProgress,
    uploadedFiles,
    error,
    
    // Functions
    uploadFile,
    uploadFiles,
    removeFile,
    clearFiles,
    getPreview,
    cleanupPreview,
  };
};

/**
 * Hook for handling file input with Cloudinary
 */
export const useFileUpload = (options = {}) => {
  const cloudinary = useCloudinary(options);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const handleFileSelect = useCallback((event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
    
    // Generate previews for images
    const urls = files.map(file => getFilePreview(file)).filter(Boolean);
    setPreviewUrls(urls);
  }, []);

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) return;
    
    try {
      const results = await cloudinary.uploadFiles(selectedFiles);
      setSelectedFiles([]);
      setPreviewUrls([]);
      return results;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  }, [selectedFiles, cloudinary]);

  const removeSelectedFile = useCallback((index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedFiles([]);
    setPreviewUrls([]);
    cloudinary.clearFiles();
  }, [cloudinary]);

  return {
    ...cloudinary,
    selectedFiles,
    previewUrls,
    handleFileSelect,
    handleUpload,
    removeSelectedFile,
    clearSelection,
  };
}; 