"""
SFTP Storage Service for IONOS Web Hosting

This service uploads videos to IONOS hosting via SFTP.
Videos are then served directly from the domain with optional Cloudflare CDN.

Setup:
1. Add SFTP credentials to .env
2. Create /videos directory on hosting
3. Optionally add Cloudflare for caching
"""

import paramiko
import os
import uuid
from datetime import datetime
from typing import Optional, BinaryIO
from io import BytesIO
import logging

logger = logging.getLogger(__name__)


class SFTPStorageService:
    """
    SFTP-based video storage for IONOS web hosting.
    Uploads videos and returns public URLs.
    """
    
    def __init__(
        self,
        host: str,
        port: int,
        username: str,
        password: str,
        base_path: str = "/videos",
        public_url_base: str = ""
    ):
        """
        Initialize SFTP storage service.
        
        Args:
            host: SFTP server hostname
            port: SFTP port (usually 22)
            username: SFTP username
            password: SFTP password
            base_path: Remote directory for videos (e.g., /videos)
            public_url_base: Public URL prefix (e.g., https://platkelvconcept.net)
        """
        self.host = host
        self.port = port
        self.username = username
        self.password = password
        self.base_path = base_path
        self.public_url_base = public_url_base.rstrip('/')
        
        logger.info(f"SFTPStorageService initialized for {host}")
    
    def _get_connection(self) -> paramiko.SFTPClient:
        """Create and return an SFTP connection."""
        transport = paramiko.Transport((self.host, self.port))
        transport.connect(username=self.username, password=self.password)
        sftp = paramiko.SFTPClient.from_transport(transport)
        return sftp, transport
    
    def _ensure_directory(self, sftp: paramiko.SFTPClient, path: str):
        """Recursively create directories if they don't exist."""
        dirs = path.split('/')
        current_path = ""
        for dir_name in dirs:
            if not dir_name:
                continue
            current_path += f"/{dir_name}"
            try:
                sftp.stat(current_path)
            except FileNotFoundError:
                try:
                    sftp.mkdir(current_path)
                    logger.info(f"Created directory: {current_path}")
                except Exception as e:
                    logger.debug(f"Directory may exist: {e}")
    
    def upload_file(
        self,
        file_data: bytes,
        remote_path: str,
        content_type: str = "video/mp4"
    ) -> str:
        """
        Upload a file to SFTP server.
        
        Args:
            file_data: File content as bytes
            remote_path: Destination path (relative to base_path)
            content_type: MIME type (for logging)
            
        Returns:
            Public URL of the uploaded file
        """
        full_remote_path = f"{self.base_path}/{remote_path}".replace("//", "/")
        
        sftp = None
        transport = None
        try:
            sftp, transport = self._get_connection()
            
            # Ensure directory exists
            dir_path = os.path.dirname(full_remote_path)
            self._ensure_directory(sftp, dir_path)
            
            # Upload file
            file_obj = BytesIO(file_data)
            sftp.putfo(file_obj, full_remote_path)
            
            logger.info(f"Uploaded: {full_remote_path}")
            
            # Return public URL
            public_url = f"{self.public_url_base}{full_remote_path}"
            return public_url
            
        except Exception as e:
            logger.error(f"SFTP upload failed: {e}")
            raise
        finally:
            if sftp:
                sftp.close()
            if transport:
                transport.close()
    
    def upload_video(
        self,
        file_data: bytes,
        anime_id: int,
        episode_number: int,
        quality: str = "source",
        extension: str = "mp4"
    ) -> str:
        """
        Upload a video with organized path structure.
        
        Args:
            file_data: Video file bytes
            anime_id: ID of the anime
            episode_number: Episode number
            quality: Quality label
            extension: File extension
            
        Returns:
            Public URL of the uploaded video
        """
        unique_id = uuid.uuid4().hex[:8]
        timestamp = datetime.now().strftime("%Y%m%d")
        
        remote_path = f"anime/{anime_id}/ep{episode_number}_{quality}_{timestamp}_{unique_id}.{extension}"
        
        return self.upload_file(file_data, remote_path, content_type=f"video/{extension}")
    
    def delete_file(self, remote_path: str) -> bool:
        """
        Delete a file from SFTP server.
        
        Args:
            remote_path: Path relative to base_path
            
        Returns:
            True if successful
        """
        full_remote_path = f"{self.base_path}/{remote_path}".replace("//", "/")
        
        sftp = None
        transport = None
        try:
            sftp, transport = self._get_connection()
            sftp.remove(full_remote_path)
            logger.info(f"Deleted: {full_remote_path}")
            return True
        except Exception as e:
            logger.error(f"SFTP delete failed: {e}")
            return False
        finally:
            if sftp:
                sftp.close()
            if transport:
                transport.close()
    
    def list_files(self, remote_path: str = "") -> list:
        """
        List files in a directory.
        
        Args:
            remote_path: Path relative to base_path
            
        Returns:
            List of filenames
        """
        full_remote_path = f"{self.base_path}/{remote_path}".replace("//", "/")
        
        sftp = None
        transport = None
        try:
            sftp, transport = self._get_connection()
            return sftp.listdir(full_remote_path)
        except Exception as e:
            logger.error(f"SFTP list failed: {e}")
            return []
        finally:
            if sftp:
                sftp.close()
            if transport:
                transport.close()


# Singleton instance
_sftp_service: Optional[SFTPStorageService] = None


def get_sftp_service() -> SFTPStorageService:
    """Get the global SFTP service instance."""
    global _sftp_service
    if _sftp_service is None:
        raise RuntimeError("SFTPStorageService not initialized. Call init_sftp_service() first.")
    return _sftp_service


def init_sftp_service(
    host: str,
    port: int,
    username: str,
    password: str,
    base_path: str = "/videos",
    public_url_base: str = ""
) -> SFTPStorageService:
    """Initialize the global SFTP service."""
    global _sftp_service
    _sftp_service = SFTPStorageService(
        host=host,
        port=port,
        username=username,
        password=password,
        base_path=base_path,
        public_url_base=public_url_base
    )
    return _sftp_service
