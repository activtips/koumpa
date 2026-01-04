/**
 * Storage Service
 * Handles S3 operations for generated apps
 */

const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const config = require('../config');
const { ExternalServiceError } = require('../errors');

class StorageService {
  constructor() {
    this.client = new S3Client({
      maxAttempts: 3
    });
    this.bucket = config.buckets.apps;
  }

  /**
   * Upload app code to S3
   */
  async uploadApp(projectId, code, contentType = 'text/html') {
    try {
      const key = `${projectId}/index.html`;

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: code,
        ContentType: contentType,
        CacheControl: 'max-age=300', // 5 minutes
        Metadata: {
          projectId,
          uploadedAt: new Date().toISOString()
        }
      });

      await this.client.send(command);

      // Return CloudFront URL
      return `${config.services.cloudfrontUrl}/${key}`;
    } catch (error) {
      throw new ExternalServiceError('S3', error);
    }
  }

  /**
   * Upload additional assets (CSS, JS, images)
   */
  async uploadAsset(projectId, filename, content, contentType) {
    try {
      const key = `${projectId}/${filename}`;

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: content,
        ContentType: contentType,
        CacheControl: 'max-age=86400' // 24 hours for assets
      });

      await this.client.send(command);

      return `${config.services.cloudfrontUrl}/${key}`;
    } catch (error) {
      throw new ExternalServiceError('S3', error);
    }
  }

  /**
   * Get app code from S3
   */
  async getApp(projectId) {
    try {
      const key = `${projectId}/index.html`;

      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key
      });

      const response = await this.client.send(command);
      const code = await response.Body.transformToString();

      return code;
    } catch (error) {
      if (error.name === 'NoSuchKey') {
        return null;
      }
      throw new ExternalServiceError('S3', error);
    }
  }

  /**
   * Delete app from S3
   */
  async deleteApp(projectId) {
    try {
      const key = `${projectId}/index.html`;

      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key
      });

      await this.client.send(command);
      return true;
    } catch (error) {
      throw new ExternalServiceError('S3', error);
    }
  }

  /**
   * Upload multiple files (for multi-file projects)
   */
  async uploadMultipleFiles(projectId, files) {
    try {
      const uploads = files.map(file => 
        this.uploadAsset(projectId, file.name, file.content, file.contentType)
      );

      const urls = await Promise.all(uploads);

      return {
        baseUrl: `${config.services.cloudfrontUrl}/${projectId}`,
        files: urls
      };
    } catch (error) {
      throw new ExternalServiceError('S3', error);
    }
  }

  /**
   * Generate pre-signed URL for direct upload (future feature)
   */
  async generateUploadUrl(projectId, filename, expiresIn = 3600) {
    const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
    
    try {
      const key = `${projectId}/${filename}`;

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key
      });

      const url = await getSignedUrl(this.client, command, { expiresIn });
      return url;
    } catch (error) {
      throw new ExternalServiceError('S3', error);
    }
  }
}

module.exports = StorageService;
