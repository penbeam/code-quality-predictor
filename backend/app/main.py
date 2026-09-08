# ============================================
# main.py - FastAPI Application Entry Point
# ============================================

from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List
import logging
from datetime import datetime

from .config import settings
from .database import engine, get_db, Base
from .models import CodeAnalysis
from .schemas import (
    CodeAnalysisRequest, 
    CodeAnalysisResponse, 
    AnalysisHistoryResponse,
    HealthResponse
)
from .ml_model import get_model

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    description=settings.API_DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model instance
model = get_model()

# ============================================
# HEALTH CHECK ENDPOINT
# ============================================

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Check API health status"""
    db_status = "connected"
    try:
        db = next(get_db())
        # Use SQLAlchemy's text() for raw SQL
        db.execute(text("SELECT 1"))
        db.close()
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return HealthResponse(
        status="healthy" if model.is_loaded else "degraded",
        version=settings.API_VERSION,
        model_loaded=model.is_loaded,
        database_status=db_status
    )

# ============================================
# PREDICTION ENDPOINT
# ============================================

@app.post("/predict", response_model=CodeAnalysisResponse)
async def predict_code(
    request: CodeAnalysisRequest,
    db: Session = Depends(get_db),
    req: Request = None
):
    """
    Analyze code quality and return predictions
    
    - **code**: Code snippet to analyze (max 50,000 characters)
    """
    try:
        # Make prediction
        result = model.predict(request.code)
        
        # Save to database
        analysis = CodeAnalysis(
            code_snippet=request.code,
            quality_score=result['quality_score'],
            quality_category=result['quality_category'],
            bug_probability=result['bug_probability'],
            complexity_score=result['complexity_score'],
            complexity_category=result['complexity_category'],
            maintainability_index=result['maintainability_index'],
            line_count=result['code_metrics']['line_count'],
            function_count=result['code_metrics']['function_count'],
            class_count=result['code_metrics']['class_count'],
            comment_count=result['code_metrics']['comment_count'],
            ip_address=req.client.host if req else None
        )
        
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        
        # Prepare response
        response = CodeAnalysisResponse(
            quality_score=result['quality_score'],
            quality_category=result['quality_category'],
            bug_probability=result['bug_probability'],
            complexity_score=result['complexity_score'],
            complexity_category=result['complexity_category'],
            maintainability_index=result['maintainability_index'],
            code_metrics=result['code_metrics'],
            analysis_id=analysis.id
        )
        
        logger.info(f"✅ Prediction saved (ID: {analysis.id})")
        return response
        
    except ValueError as e:
        logger.error(f"❌ Prediction error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"❌ Internal error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ============================================
# HISTORY ENDPOINT
# ============================================

@app.get("/history", response_model=List[AnalysisHistoryResponse])
async def get_history(
    limit: int = 20,
    skip: int = 0,
    db: Session = Depends(get_db)
):
    """
    Get analysis history
    
    - **limit**: Number of records to return (default: 20)
    - **skip**: Number of records to skip (default: 0)
    """
    try:
        analyses = db.query(CodeAnalysis).order_by(
            CodeAnalysis.created_at.desc()
        ).offset(skip).limit(limit).all()
        
        return [analysis.to_dict() for analysis in analyses]
        
    except Exception as e:
        logger.error(f"❌ History error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching history")

# ============================================
# ROOT ENDPOINT
# ============================================

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": settings.API_TITLE,
        "version": settings.API_VERSION,
        "status": "running",
        "docs": "/docs",
        "health": "/health"
    }

# ============================================
# ERROR HANDLERS
# ============================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Custom HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.now().isoformat()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "status_code": 500,
            "timestamp": datetime.now().isoformat()
        }
    )

# ============================================
# STARTUP EVENT
# ============================================

@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    logger.info("🚀 Starting Code Quality Predictor API...")
    logger.info(f"📊 Model loaded: {model.is_loaded}")
    logger.info(f"📚 Database: {settings.DATABASE_URL}")
    logger.info(f"🌐 Allowed origins: {settings.ALLOWED_ORIGINS}")

@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown"""
    logger.info("🛑 Shutting down Code Quality Predictor API...")