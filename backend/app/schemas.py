# ============================================
# schemas.py - Pydantic Data Validation
# ============================================

from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime

class CodeAnalysisRequest(BaseModel):
    """Request schema for code analysis"""
    
    code: str = Field(..., min_length=1, max_length=50000, description="Code snippet to analyze")
    
    @validator('code')
    def validate_code(cls, v):
        """Validate code input"""
        if not v.strip():
            raise ValueError("Code cannot be empty")
        if len(v) > 50000:
            raise ValueError("Code exceeds maximum length of 50000 characters")
        return v

class CodeAnalysisResponse(BaseModel):
    """Response schema for code analysis"""
    
    quality_score: float = Field(..., ge=0, le=100, description="Quality score (0-100)")
    quality_category: str = Field(..., description="Quality category: Good/Medium/Poor")
    bug_probability: float = Field(..., ge=0, le=100, description="Bug probability percentage")
    complexity_score: float = Field(..., ge=0, le=1, description="Complexity score (0-1)")
    complexity_category: str = Field(..., description="Complexity category: Low/Medium/High")
    maintainability_index: float = Field(..., ge=0, le=100, description="Maintainability index (0-100)")
    
    # Optional metadata
    code_metrics: Optional[dict] = Field(None, description="Code metrics")
    analysis_id: Optional[int] = Field(None, description="Database record ID")

class AnalysisHistoryResponse(BaseModel):
    """Response schema for analysis history"""
    
    id: int
    code_snippet: str
    quality_score: float
    quality_category: str
    bug_probability: float
    complexity_score: float
    complexity_category: str
    maintainability_index: float
    created_at: str

class HealthResponse(BaseModel):
    """Health check response"""
    
    status: str
    version: str
    model_loaded: bool
    database_status: str