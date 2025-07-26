// Cloudinary configuration and utility functions
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET;

/**
 * Upload a file to Cloudinary
 * @param {File} file - The file to upload
 * @param {string} folder - Optional folder path in Cloudinary
 * @returns {Promise<Object>} - Upload result with URL and public_id
 */
export const uploadToCloudinary = async (file, folder = 'focusflow') => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      size: result.bytes,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload file to Cloudinary');
  }
};

/**
 * Upload multiple files to Cloudinary
 * @param {File[]} files - Array of files to upload
 * @param {string} folder - Optional folder path in Cloudinary
 * @returns {Promise<Array>} - Array of upload results
 */
export const uploadMultipleToCloudinary = async (files, folder = 'focusflow') => {
  try {
    const uploadPromises = files.map(file => uploadToCloudinary(file, folder));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Multiple files upload error:', error);
    throw new Error('Failed to upload multiple files to Cloudinary');
  }
};

/**
 * Delete a file from Cloudinary
 * @param {string} public_id - The public_id of the file to delete
 * @returns {Promise<Object>} - Deletion result
 */
export const deleteFromCloudinary = async (public_id) => {
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/delete_by_token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: public_id, // You might need to generate a delete token
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Deletion failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
    throw new Error('Failed to delete file from Cloudinary');
  }
};

/**
 * Get optimized URL for Cloudinary image
 * @param {string} url - Original Cloudinary URL
 * @param {Object} options - Transformation options
 * @returns {string} - Optimized URL
 */
export const getOptimizedUrl = (url, options = {}) => {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const {
    width = 'auto',
    height = 'auto',
    quality = 'auto',
    format = 'auto',
    crop = 'scale',
  } = options;

  // Extract the base URL and add transformations
  const baseUrl = url.split('/upload/')[0];
  const publicId = url.split('/upload/')[1];
  
  const transformations = `w_${width},h_${height},q_${quality},f_${format},c_${crop}`;
  
  return `${baseUrl}/upload/${transformations}/${publicId}`;
};

/**
 * Validate file before upload
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/*', 'application/pdf', 'text/*'],
    maxWidth = 4000,
    maxHeight = 4000,
  } = options;

  const errors = [];

  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`);
  }

  // Check file type
  const isAllowedType = allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.slice(0, -1));
    }
    return file.type === type;
  });

  if (!isAllowedType) {
    errors.push('File type not allowed');
  }

  // Check image dimensions if it's an image
  if (file.type.startsWith('image/')) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        if (img.width > maxWidth || img.height > maxHeight) {
          errors.push(`Image dimensions exceed ${maxWidth}x${maxHeight} limit`);
        }
        resolve({ isValid: errors.length === 0, errors });
      };
      img.onerror = () => {
        errors.push('Invalid image file');
        resolve({ isValid: false, errors });
      };
      img.src = URL.createObjectURL(file);
    });
  }

  return Promise.resolve({ isValid: errors.length === 0, errors });
};

/**
 * Get file preview URL
 * @param {File} file - File to get preview for
 * @returns {string} - Preview URL
 */
export const getFilePreview = (file) => {
  if (file.type.startsWith('image/')) {
    return URL.createObjectURL(file);
  }
  return null;
};

/**
 * Clean up preview URLs
 * @param {string} previewUrl - Preview URL to revoke
 */
export const revokePreview = (previewUrl) => {
  if (previewUrl && previewUrl.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl);
  }
};

// Export configuration for easy access
export const cloudinaryConfig = {
  cloudName: CLOUDINARY_CLOUD_NAME,
  uploadPreset: CLOUDINARY_UPLOAD_PRESET,
}; 