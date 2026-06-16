import os
from datetime import timedelta

class Config:
    """Base config."""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-key-change-in-prod')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'postgresql://localhost/compliance')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # OAuth
    GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID', '')
    GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET', '')

    # Session
    REMEMBER_COOKIE_DURATION = timedelta(days=7)
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True

    # File upload
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB max
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', '/tmp/compliance-reports')

class DevelopmentConfig(Config):
    """Development config."""
    DEBUG = True
    SESSION_COOKIE_SECURE = False

class ProductionConfig(Config):
    """Production config."""
    DEBUG = False
