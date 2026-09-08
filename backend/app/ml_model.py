# ============================================
# ml_model.py - ML Model Loading & Prediction
# ============================================

import pickle
import numpy as np
import pandas as pd
from pathlib import Path
import logging
from typing import Dict, Any, Optional
from .config import settings

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CodeQualityModel:
    """Code Quality Prediction Model Wrapper"""
    
    def __init__(self):
        self.model = None
        self.scaler = None
        self.feature_columns = None
        self.metadata = None
        self.is_loaded = False
        
        # Feature columns from training
        self.FEATURE_COLUMNS = [
            'line_count', 'char_count', 'word_count',
            'keyword_count', 'function_count', 'class_count',
            'loop_count', 'condition_count', 'comment_count',
            'nested_depth', 'avg_line_length', 'complexity_heuristic'
        ]
        
        # Load model on initialization
        self.load_model()
    
    def load_model(self) -> bool:
        """Load the trained model and scaler"""
        try:
            # Load combined model
            model_path = Path(settings.MODEL_PATH)
            if not model_path.exists():
                logger.error(f"Model file not found: {model_path}")
                return False
            
            with open(model_path, 'rb') as f:
                model_data = pickle.load(f)
            
            # Extract components
            self.model = {
                'quality': model_data.get('quality_model'),
                'bug': model_data.get('bug_model'),
                'complexity': model_data.get('complexity_model'),
                'maintainability': model_data.get('maintainability_model')
            }
            
            self.scaler = model_data.get('scaler')
            self.metadata = model_data.get('metadata', {})
            self.feature_columns = model_data.get('feature_columns', self.FEATURE_COLUMNS)
            
            # Validate all models loaded
            missing_models = [k for k, v in self.model.items() if v is None]
            if missing_models:
                logger.error(f"Missing models: {missing_models}")
                return False
            
            self.is_loaded = True
            logger.info("✅ Model loaded successfully!")
            logger.info(f"📊 Model metadata: {self.metadata}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error loading model: {str(e)}")
            self.is_loaded = False
            return False
    
    def extract_features(self, code: str) -> Dict[str, float]:
        """Extract features from code snippet"""
        features = {}
        
        # Basic metrics
        lines = code.split('\n')
        features['line_count'] = len(lines)
        features['char_count'] = len(code)
        features['word_count'] = len(code.split())
        
        # Count keywords
        keywords = ['def', 'class', 'if', 'else', 'elif', 'for', 'while', 
                    'try', 'except', 'return', 'import', 'from', 'with']
        features['keyword_count'] = sum(code.count(k) for k in keywords)
        
        # Count function and class definitions
        features['function_count'] = code.count('def ')
        features['class_count'] = code.count('class ')
        
        # Count loops and conditionals
        features['loop_count'] = code.count('for ') + code.count('while ')
        features['condition_count'] = code.count('if ') + code.count('elif ')
        
        # Count comments
        features['comment_count'] = code.count('#') + code.count('"""') // 2
        
        # Approximate nested depth
        features['nested_depth'] = code.count('    ') // 4
        
        # Average line length
        non_empty_lines = [line for line in lines if line.strip()]
        features['avg_line_length'] = np.mean([len(line) for line in non_empty_lines]) if non_empty_lines else 0
        
        # Complexity heuristic
        features['complexity_heuristic'] = (
            features['loop_count'] * 0.3 + 
            features['condition_count'] * 0.2 + 
            features['nested_depth'] * 0.5
        )
        
        return features
    
    def predict(self, code: str) -> Dict[str, Any]:
        """
        Predict code quality metrics
        
        Returns:
            Dict with quality_score, bug_probability, complexity_score, maintainability_index
        """
        if not self.is_loaded:
            raise ValueError("Model not loaded. Please call load_model() first.")
        
        # Extract features
        features = self.extract_features(code)
        feature_values = [features[col] for col in self.feature_columns]
        
        # Scale features
        feature_array = np.array([feature_values])
        feature_scaled = self.scaler.transform(feature_array)
        
        # Make predictions
        predictions = {
            'quality_score': float(self.model['quality'].predict(feature_scaled)[0]),
            'bug_probability': float(self.model['bug'].predict(feature_scaled)[0]),
            'complexity_score': float(self.model['complexity'].predict(feature_scaled)[0]),
            'maintainability_index': float(self.model['maintainability'].predict(feature_scaled)[0])
        }
        
        # Convert bug probability to percentage
        predictions['bug_probability'] = predictions['bug_probability'] * 100
        
        # Quality category
        score = predictions['quality_score']
        if score >= 70:
            predictions['quality_category'] = 'Good'
        elif score >= 50:
            predictions['quality_category'] = 'Medium'
        else:
            predictions['quality_category'] = 'Poor'
        
        # Complexity category
        complexity = predictions['complexity_score']
        if complexity < 0.33:
            predictions['complexity_category'] = 'Low'
        elif complexity < 0.66:
            predictions['complexity_category'] = 'Medium'
        else:
            predictions['complexity_category'] = 'High'
        
        # Round values
        predictions['quality_score'] = round(predictions['quality_score'], 2)
        predictions['bug_probability'] = round(predictions['bug_probability'], 2)
        predictions['complexity_score'] = round(predictions['complexity_score'], 3)
        predictions['maintainability_index'] = round(predictions['maintainability_index'], 2)
        
        # Add code metrics
        predictions['code_metrics'] = {
            'line_count': features['line_count'],
            'function_count': features['function_count'],
            'class_count': features['class_count'],
            'comment_count': features['comment_count']
        }
        
        return predictions

# Global instance
code_quality_model = CodeQualityModel()

def get_model() -> CodeQualityModel:
    """Get the global model instance"""
    return code_quality_model