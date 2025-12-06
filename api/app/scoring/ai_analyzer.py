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
                'ai_reasoning': str,
                'detailed_report': str (comprehensive Spanish analysis)
            }
        """
        if not self.enabled:
            return {
                'ai_risk_score': 0,
                'ai_flags': [],
                'ai_confidence': 0.0,
                'ai_reasoning': 'AI analysis not available',
                'detailed_report': ''
            }
        
        try:
            # Extract domain from sender
            domain = sender.split('@')[-1] if '@' in sender else sender
            
            # Truncate body for API limits
            body_sample = body[:2000] if len(body) > 2000 else body
            
            # Comprehensive fraud analysis prompt with structured report format
            prompt = f"""I want you to verify whether an email address or domain could be fraudulent. ALWAYS analyze these points:

1. Check the domain letter by letter and compare it with the expected legitimate domain (detect minimal changes: one different letter, added words, hyphens, numbers, etc.).
2. Check whether the domain exists in WHOIS and return:
   - Creation date
   - Expiration date
   - DNS server
   - Domain status
3. Evaluate whether the creation date is incompatible with a real, established company (e.g., created months or days ago = high suspicion).
4. Check whether the domain uses providers typical of fraud (fast registrations, non-corporate DNS, etc.).
5. Assess whether the domain imitates another well-known one → identify typosquatting (e.g., grupAsese vs grupOsese, micros0ft vs microsoft).
6. Give a final risk level: Low, Medium, High, Critical.
7. Clearly explain whether the email is probably an impersonation attempt.

Always respond very directly and with ALERTS if you detect danger.

Here is the email or domain to analyze:
Sender: {sender}
Domain: {domain}
Subject: {subject}
Body: {body_sample}

Respond in this EXACT format:

RISK_SCORE: [0-100]
FLAGS: [comma-separated list of specific issues found, or "none"]
CONFIDENCE: [0.0-1.0]
REASONING: [brief explanation]

DETAILED_REPORT:
Generate a comprehensive report following this EXACT structure (adapt language to match the email):

🚨 [ALERT if HIGH/CRITICAL risk]: Risk [LOW/MEDIUM/HIGH/CRITICAL] - [brief summary]

1) Domain letter-by-letter analysis (comparison / minimal changes)
   - Email domain: [domain]
   - Probable legitimate domain it's trying to imitate: [if applicable]
   - Letter-by-letter comparison:
     Expected:  [l e t t e r s]
     Suspicious: [l e t t e r s]
   - ✅ Detected changes: [describe any typosquatting]

2) WHOIS (creation/expiration/DNS/status)
   - Creation date: [date or "Not available"]
   - Expiration date: [date or "Not available"]
   - DNS servers: [servers or "Not available"]
   - Domain status: [status or "Not available"]
   - ⚠️ [Note if WHOIS data unavailable but other signals present]

3) Does the domain "age" match an established company?
   - [Analysis of whether domain age is compatible with claimed identity]
   - [Red flags if recently created]

4) Typical fraud providers / non-corporate infrastructure
   - [Analysis of hosting, DNS, website status]
   - [Note if using parking pages, quick registration services, etc.]

5) Does it imitate another known domain? (typosquatting)
   - ✅ [Yes/No with detailed explanation]
   - [Pattern analysis if typosquatting detected]

6) Final risk level
   - [LOW / MEDIUM / HIGH / CRITICAL]
   - Reasons:
     • [Reason 1]
     • [Reason 2]
     • [Reason 3]

7) Direct conclusion: Is this impersonation?
   🚨 [Yes/No with strong statement]
   - [Clear explanation]
   
   What to do now (recommended):
   • [Action 1]
   • [Action 2]
   • [Action 3]

IMPORTANT: 
- Use 🚨 emoji for alerts
- Use ✅ for detected issues
- Use ⚠️ for warnings
- Be VERY direct and clear
- Write in the same language as the email content (English or Spanish)
- If HIGH or CRITICAL risk, start with a bold alert"""

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
                'ai_reasoning': f'AI analysis error: {str(e)[:100]}',
                'detailed_report': ''
            }
    
    def _parse_response(self, response_text: str) -> Dict[str, Any]:
        """Parse AI response into structured format"""
        result = {
            'ai_risk_score': 0,
            'ai_flags': [],
            'ai_confidence': 0.0,
            'ai_reasoning': '',
            'detailed_report': ''
        }
        
        try:
            lines = response_text.strip().split('\n')
            detailed_report_started = False
            detailed_report_lines = []
            
            for line in lines:
                line_stripped = line.strip()
                
                # Check if we've reached the detailed report section
                if line_stripped.startswith('DETAILED_REPORT:'):
                    detailed_report_started = True
                    continue
                
                # If we're in detailed report section, collect all lines
                if detailed_report_started:
                    detailed_report_lines.append(line)
                    continue
                
                # Parse structured fields
                if line_stripped.startswith('RISK_SCORE:'):
                    score_str = line_stripped.split(':', 1)[1].strip()
                    result['ai_risk_score'] = int(score_str)
                
                elif line_stripped.startswith('FLAGS:'):
                    flags_str = line_stripped.split(':', 1)[1].strip()
                    if flags_str.lower() != 'none':
                        result['ai_flags'] = [f.strip() for f in flags_str.split(',') if f.strip()]
                
                elif line_stripped.startswith('CONFIDENCE:'):
                    conf_str = line_stripped.split(':', 1)[1].strip()
                    result['ai_confidence'] = float(conf_str)
                
                elif line_stripped.startswith('REASONING:'):
                    result['ai_reasoning'] = line_stripped.split(':', 1)[1].strip()
            
            # Join detailed report lines
            if detailed_report_lines:
                result['detailed_report'] = '\n'.join(detailed_report_lines).strip()
            
            # Validate and cap values
            result['ai_risk_score'] = max(0, min(100, result['ai_risk_score']))
            result['ai_confidence'] = max(0.0, min(1.0, result['ai_confidence']))
            
        except Exception as e:
            logger.warning(f"Failed to parse AI response: {e}")
            result['ai_reasoning'] = response_text[:200]  # Fallback to raw response
            result['detailed_report'] = response_text  # Include full response in detailed report
        
        return result
