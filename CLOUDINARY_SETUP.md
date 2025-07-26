# Cloudinary Setup Guide

This guide will help you set up Cloudinary for file storage in your FocusFlow application.

## 1. Create a Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/) and sign up for a free account
2. Verify your email address
3. Log in to your Cloudinary dashboard

## 2. Get Your Cloudinary Credentials

1. In your Cloudinary dashboard, go to **Settings** → **Access Keys**
2. Note down your **Cloud Name**
3. Go to **Settings** → **Upload** → **Upload presets**
4. Create a new upload preset:
   - Click **Add upload preset**
   - Set **Preset name** (e.g., `focusflow_uploads`)
   - Set **Signing Mode** to **Unsigned** (for client-side uploads)
   - Set **Folder** to `focusflow` (optional)
   - Save the preset

## 3. Configure the Application

1. Open `src/utils/cloudinary.js`
2. Replace the placeholder values:
   ```javascript
   const CLOUDINARY_CLOUD_NAME = 'your-actual-cloud-name';
   const CLOUDINARY_UPLOAD_PRESET = 'your-upload-preset-name';
   ```

## 4. Usage Examples

### Basic File Upload
```javascript
import { uploadToCloudinary } from '../utils/cloudinary';

const handleFileUpload = async (file) => {
  try {
    const result = await uploadToCloudinary(file, 'focusflow');
    console.log('Uploaded:', result.url);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### Using the React Hook
```javascript
import { useFileUpload } from '../hooks/useCloudinary';

const MyComponent = () => {
  const {
    selectedFiles,
    uploading,
    error,
    handleFileSelect,
    handleUpload,
    removeSelectedFile
  } = useFileUpload({
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/*', 'application/pdf'],
    folder: 'focusflow'
  });

  return (
    <div>
      <input 
        type="file" 
        multiple 
        onChange={handleFileSelect}
        accept="image/*,application/pdf"
      />
      
      {uploading && <div>Uploading...</div>}
      {error && <div>Error: {error}</div>}
      
      <button onClick={handleUpload} disabled={uploading}>
        Upload Files
      </button>
      
      {selectedFiles.map((file, index) => (
        <div key={index}>
          {file.name}
          <button onClick={() => removeSelectedFile(index)}>Remove</button>
        </div>
      ))}
    </div>
  );
};
```

## 5. Security Considerations

### For Production:
1. **Server-side uploads**: For better security, consider implementing server-side uploads
2. **Upload presets**: Use signed upload presets for more control
3. **File validation**: Always validate files on the server side as well
4. **Rate limiting**: Implement rate limiting for uploads
5. **File size limits**: Set appropriate file size limits

### Environment Variables:
For better security, use environment variables:
```javascript
const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
```

Create a `.env` file:
```
REACT_APP_CLOUDINARY_CLOUD_NAME=your-cloud-name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

## 6. File Types and Limits

### Supported File Types:
- Images: JPEG, PNG, GIF, WebP, SVG
- Documents: PDF, TXT, DOC, DOCX
- Videos: MP4, MOV, AVI (with limits)

### Default Limits:
- Max file size: 10MB
- Max image dimensions: 4000x4000px
- Allowed types: Images, PDFs, Text files

## 7. Integration with Existing Components

To integrate with your existing Journal and Notes components:

1. Replace Firebase Storage uploads with Cloudinary uploads
2. Update the file handling logic to use the new hooks
3. Update the UI to show upload progress and previews
4. Handle file deletion through Cloudinary's API

## 8. Troubleshooting

### Common Issues:
1. **CORS errors**: Ensure your Cloudinary account allows uploads from your domain
2. **Upload preset not found**: Double-check the preset name and ensure it's set to unsigned
3. **File size too large**: Adjust the maxFileSize option or upgrade your Cloudinary plan
4. **Invalid file type**: Check the allowedTypes array in your configuration

### Debug Mode:
Enable debug logging by adding this to your component:
```javascript
const { uploadFile } = useCloudinary({
  onError: (error) => console.error('Cloudinary error:', error),
  onSuccess: (result) => console.log('Upload success:', result)
});
```

## 9. Advanced Features

### Image Transformations:
```javascript
import { getOptimizedUrl } from '../utils/cloudinary';

const optimizedUrl = getOptimizedUrl(originalUrl, {
  width: 300,
  height: 200,
  quality: 80,
  crop: 'fill'
});
```

### File Validation:
```javascript
import { validateFile } from '../utils/cloudinary';

const validation = await validateFile(file, {
  maxSize: 5 * 1024 * 1024,
  allowedTypes: ['image/*'],
  maxWidth: 2000,
  maxHeight: 2000
});

if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
}
```

## 10. Cost Optimization

### Free Tier Limits:
- 25 GB storage
- 25 GB bandwidth per month
- 25,000 transformations per month

### Tips to Stay Within Limits:
1. Compress images before upload
2. Use appropriate image formats (WebP for web)
3. Implement lazy loading for images
4. Clean up unused files regularly
5. Monitor usage in your Cloudinary dashboard 