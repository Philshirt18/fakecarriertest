import logging
from typing import Optional, Dict, Any
from app.config import settings

logger = logging.getLogger(__name__)


class AIAnalyzer:
    """AI-powered email content analysis using Gemini"""
    
    def __init__(self):
        self.enabled = bool(settings.gemini_api_key)
        self.model = None
        
        if self.enabled:
            try:
                import google.generativeai as genai
                genai.configure(api_key=settings.gemini_api_key)
                self.model = genai.GenerativeModel(settings.gemini_model)
                logger.info(f"AI analyzer enabled with model: {settings.gemini_model}")
            except Exception as e:
                logger.warning(f"Failed to initialize AI analyzer: {e}")
                self.enabled = False
    
    async def analyze_email(self, sender: str, subject: str, body: str) -> Dict[str, Any]:
        """
        Analyze email content using AI to detect sophisticated phishing patterns
        
        Returns:
            {
                'ai_risk_score': int (0-100),
                'ai_flags': list of detected issues,
                'ai_confidence': float (0-1),
                'ai_reasoning': str
            }
        """
        if not self.enabled:
            return {
                'ai_risk_score': 0,
                'ai_flags': [],
                'ai_confidence': 0.0,
                'ai_reasoning': 'AI analysis not available'
            }
        
        try:
            # Truncate body for API limits
            body_sample = body[:2000] if len(body) > 2000 else body
            
            prompt = f"""Analyze this email for phishing and impersonation risks. Provide a structured assessment.

Sender: {sender}
Subject: {subject}
Body: {body_sample}

Evaluate the following aspects:
1. Social engineering tactics (urgency, fear, authority)
2. Credential harvesting attempts
3. Financial fraud indicators
4. Impersonation of legitimate entities
5. Suspicious language patterns
6. Inconsistencies between sender and content

Respond in this exact format:
RISK_SCORE: [0-100]
FLAGS: [comma-separated list of specific issues found, or "none"]
CONFIDENCE: [0.0-1.0]
REASONING: [brief explanation of the assessment]

Be concise and specific."""

            response = self.model.generate_content(prompt)
            result = self._parse_response(response.text)
            
            logger.info(f"AI analysis completed: score={result['ai_risk_score']}, confidence={result['ai_confidence']}")
            return result
            
        except Exception as e:
            logger.error(f"AI analysis failed: {e}")
            return {
                'ai_risk_score': 0,
                'ai_flags': [],
                'ai_confidence': 0.0,
                'ai_reasoning': f'AI analysis error: {str(e)[:100]}'
            }
    
    def _parse_response(self, response_text: str) -> Dict[str, Any]:
        """Parse AI response into structured format"""
        result = {
            'ai_risk_score': 0,
            'ai_flags': [],
            'ai_confidence': 0.0,
            'ai_reasoning': ''
        }
        
        try:
            lines = response_text.strip().split('\n')
            
            for line in lines:
                line = line.strip()
                
                if line.startswith('RISK_SCORE:'):
                    score_str = line.split(':', 1)[1].strip()
                    result['ai_risk_score'] = int(score_str)
                
                elif line.startswith('FLAGS:'):
                    flags_str = line.split(':', 1)[1].strip()
                    if flags_str.lower() != 'none':
                        result['ai_flags'] = [f.strip() for f in flags_str.split(',') if f.strip()]
                
                elif line.startswith('CONFIDENCE:'):
                    conf_str = line.split(':', 1)[1].strip()
                    result['ai_confidence'] = float(conf_str)
                
                elif line.startswith('REASONING:'):
                    result['ai_reasoning'] = line.split(':', 1)[1].strip()
            
            # Validate and cap values
            result['ai_risk_score'] = max(0, min(100, result['ai_risk_score']))
            result['ai_confidence'] = max(0.0, min(1.0, result['ai_confidence']))
            
        except Exception as e:
            logger.warning(f"Failed to parse AI response: {e}")
            result['ai_reasoning'] = response_text[:200]  # Fallback to raw response
        
        return result
