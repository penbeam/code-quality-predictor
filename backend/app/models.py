# ============================================
# models.py - SQLAlchemy Database Models
# ============================================

from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.sql import func
from .database import Base

class CodeAnalysis(Base):
    """Database model for code analysis results"""
    
    __tablename__ = "code_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Input data
    code_snippet = Column(Text, nullable=False)
    
    # Analysis results
    quality_score = Column(Float, nullable=False)
    quality_category = Column(String(20), nullable=False)
    bug_probability = Column(Float, nullable=False)
    complexity_score = Column(Float, nullable=False)
    complexity_category = Column(String(20), nullable=False)
    maintainability_index = Column(Float, nullable=False)
    
    # Metadata
    line_count = Column(Integer, nullable=True)
    function_count = Column(Integer, nullable=True)
    class_count = Column(Integer, nullable=True)
    comment_count = Column(Integer, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    ip_address = Column(String(45), nullable=True)  # IPv6 support
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            "id": self.id,
            "code_snippet": self.code_snippet[:200] + "..." if len(self.code_snippet) > 200 else self.code_snippet,
            "quality_score": self.quality_score,
            "quality_category": self.quality_category,
            "bug_probability": self.bug_probability,
            "complexity_score": self.complexity_score,
            "complexity_category": self.complexity_category,
            "maintainability_index": self.maintainability_index,
            "line_count": self.line_count,
            "function_count": self.function_count,
            "class_count": self.class_count,
            "comment_count": self.comment_count,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }