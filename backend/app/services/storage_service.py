"""
Backblaze B2 / S3-Compatible Storage Service

This service handles video uploads to cloud object storage.
It uses the boto3 library which works with both B2 and AWS S3.

Setup:
1. Sign up at backblaze.com
2. Create a bucket named 'nk-network-videos'  
3. Generate application keys
4. Add credentials to .env
"""

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
import os
import uuid
from datetime import datetime, timedelta
from typing import Optional, BinaryIO
import logging

logger = logging.getLogger(__name__)


class StorageService:
    """
    Cloud storage service for video files.
    Supports Backblaze B2 and AWS S3 (S3-compatible API).
    """
    
    def __init__(
        self,
        endpoint_url: str,
        access_key: str,
        secret_key: str,
        bucket_name: str,
        cdn_base_url: Optional[str] = None
    ):
        """
        Initialize the storage service.
        
        Args:
            endpoint_url: B2/S3 endpoint (e.g., https://s3.us-west-000.backblazeb2.com)
            access_key: Application Key ID
            secret_key: Application Key Secret
            bucket_name: Name of the bucket
            cdn_base_url: Optional CDN URL prefix (e.g., https://cdn.nakama-network.com)
        """
        self.bucket_name = bucket_name
        self.cdn_base_url = cdn_base_url
        
        self.client = boto3.client(
            's3',
            endpoint_url=endpoint_url,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            config=Config(signature_version='s3v4')
        )
        
        logger.info(f"StorageService initialized for bucket: {bucket_name}")
    
    def upload_file(
        self,
        file: BinaryIO,
        path: str,
        content_type: str = "video/mp4"
    ) -> str:
        """
        Upload a file to cloud storage.
        
        Args:
            file: File-like object to upload
            path: Destination path in bucket (e.g., 'videos/anime_1/ep1.mp4')
            content_type: MIME type of the file
            
        Returns:
            Public URL or CDN URL of the uploaded file
        """
        try:
            self.client.upload_fileobj(
                file,
                self.bucket_name,
                path,
                ExtraArgs={
                    'ContentType': content_type,
                    'ACL': 'public-read'  # Make publicly readable
                }
            )
            
            # Return CDN URL if configured, otherwise direct URL
            if self.cdn_base_url:
                return f"{self.cdn_base_url}/{path}"
            else:
                return self.get_public_url(path)
                
        except ClientError as e:
            logger.error(f"Upload failed: {e}")
            raise
    
    def upload_video(
        self,
        file: BinaryIO,
        anime_id: int,
        episode_number: int,
        quality: str = "source"
    ) -> str:
        """
        Upload a video with organized path structure.
        
        Args:
            file: Video file to upload
            anime_id: ID of the anime
            episode_number: Episode number
            quality: Quality label (e.g., '1080p', '720p', 'source')
            
        Returns:
            URL of the uploaded video
        """
        unique_id = uuid.uuid4().hex[:8]
        timestamp = datetime.now().strftime("%Y%m%d")
        
        path = f"videos/{anime_id}/{episode_number}/{quality}_{timestamp}_{unique_id}.mp4"
        
        return self.upload_file(file, path, content_type="video/mp4")
    
    def get_public_url(self, path: str) -> str:
        """Get the public URL for a file."""
        return f"{self.client.meta.endpoint_url}/{self.bucket_name}/{path}"
    
    def get_signed_url(self, path: str, expires_in: int = 3600) -> str:
        """
        Generate a signed/presigned URL for private files.
        
        Args:
            path: File path in bucket
            expires_in: URL expiration time in seconds (default 1 hour)
            
        Returns:
            Signed URL
        """
        try:
            url = self.client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': path
                },
                ExpiresIn=expires_in
            )
            return url
        except ClientError as e:
            logger.error(f"Failed to generate signed URL: {e}")
            raise
    
    def delete_file(self, path: str) -> bool:
        """
        Delete a file from storage.
        
        Args:
            path: File path in bucket
            
        Returns:
            True if successful
        """
        try:
            self.client.delete_object(
                Bucket=self.bucket_name,
                Key=path
            )
            return True
        except ClientError as e:
            logger.error(f"Delete failed: {e}")
            return False
    
    def list_files(self, prefix: str = "") -> list:
        """
        List files in the bucket.
        
        Args:
            prefix: Filter by path prefix (e.g., 'videos/123/')
            
        Returns:
            List of file keys
        """
        try:
            response = self.client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=prefix
            )
            return [obj['Key'] for obj in response.get('Contents', [])]
        except ClientError as e:
            logger.error(f"List failed: {e}")
            return []


# Singleton instance (initialized from config)
_storage_service: Optional[StorageService] = None


def get_storage_service() -> StorageService:
    """
    Get the global storage service instance.
    Call init_storage_service() first during app startup.
    """
    global _storage_service
    if _storage_service is None:
        raise RuntimeError("StorageService not initialized. Call init_storage_service() first.")
    return _storage_service


def init_storage_service(
    endpoint_url: str,
    access_key: str, 
    secret_key: str,
    bucket_name: str,
    cdn_base_url: Optional[str] = None
) -> StorageService:
    """
    Initialize the global storage service.
    Call this during FastAPI startup.
    """
    global _storage_service
    _storage_service = StorageService(
        endpoint_url=endpoint_url,
        access_key=access_key,
        secret_key=secret_key,
        bucket_name=bucket_name,
        cdn_base_url=cdn_base_url
    )
    return _storage_service
