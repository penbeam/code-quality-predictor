# ============================================
# config.py - Updated for Production
# ============================================

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Settings:
    """Application settings"""
    
    # API Settings
    API_TITLE = "Code Quality Predictor API"
    API_VERSION = "1.0.0"
    API_DESCRIPTION = "ML-powered code quality analysis API"
    
    # Database
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./code_quality.db")
    
    # Model Settings
    MODEL_PATH = os.getenv("MODEL_PATH", "models/code_quality_model.pkl")
    SCALER_PATH = os.getenv("SCALER_PATH", "models/preprocessor.pkl")
    
    # CORS Settings - UPDATE THIS WITH YOUR GITHUB PAGES URL
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "").split(",")
    # Remove any empty strings
    ALLOWED_ORIGINS = [origin.strip() for origin in ALLOWED_ORIGINS if origin.strip()]
    # Add default origins if none provided
    if not ALLOWED_ORIGINS:
        ALLOWED_ORIGINS = [
            "http://localhost:8000",
            "http://localhost:5500",
            "https://yourusername.github.io"  # ← CHANGE THIS
        ]
    
    # Security
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30

settings = Settings()