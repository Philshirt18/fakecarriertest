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
Generate a comprehensive, conversational fraud analysis report. Detect the language of the email and respond in the SAME language (English or Spanish).

For HIGH/CRITICAL risk, start with:
🚨 ALERT: HIGH / CRITICAL risk of impersonation (phishing) with {sender}. That domain looks like an imitation ("typosquatting") of a real company.

For MEDIUM risk:
⚠️ WARNING: MEDIUM risk with {sender}. This domain shows several suspicious patterns.

For LOW risk:
ℹ️ NOTICE: LOW risk with {sender}. Minor concerns detected but likely legitimate.

Then provide detailed analysis in this EXACT structure:

1) Domain letter by letter (comparison / minimal changes)
Email domain: [domain]
"Likely" legitimate domain it is trying to imitate: [real domain and company name with context, e.g., "codognotto (logistics company Codognotto; their corporate site uses codognotto.eu and email @codognotto.it)"]

Core comparison:
Expected legitimate: [l e t t e r s with spaces]
Suspicious:        [l e t t e r s with spaces, aligned]
✅ Detected: [describe the exact change, e.g., "an extra 's' → ...g n... → ...g s n... (classic typo/typosquatting)"]
✅ Also: [any other changes like TLD differences, e.g., "the TLD is changed to .com instead of .eu / .it (common in impersonation)"]

2) WHOIS (creation/expiration/DNS/status)
[If you can find WHOIS data, provide it. Otherwise:]
⚠️ I was not able to obtain a publicly verifiable WHOIS/RDAP record to return with full confidence (exact dates, nameservers, and EPP status) from the sources accessible in this check.

This does NOT reduce the risk: based on what is visible, there are already strong signs of deception.

(If you want to complete it yourself: use "ICANN Lookup" or any WHOIS/RDAP tool and paste the result here, and I'll interpret it line by line.)

3) Does the domain "age" fit an established company?
[Provide conversational analysis, e.g.:]
What is observable is that the domain's website is [describe status: "under construction", "parked", "active but suspicious", etc.].

For a [describe what type of company it's impersonating], a corporate domain used for email normally has:
• a consistent corporate site,
• well-established email infrastructure,
• and naming aligned with the real brand.

[Conclude with assessment, e.g., "A typo domain + placeholder site is incompatible with a 'normal' corporate email."]

4) Typical fraud providers / "non-corporate" infrastructure
[Provide detailed analysis, e.g.:]
The domain shows a "[describe what you find: Coming Soon page, Squarespace parking, cheap hosting, etc.]"

This doesn't prove fraud by itself, but it adds weight when the domain is already a typo.

5) Does it imitate another known brand? (typosquatting)
✅ Yes. [domain] imitates the [Brand name] brand/domain via [describe the technique: "a minimal insertion of 1 letter", "character substitution", "homograph attack", etc.].

This pattern is classic in impersonation campaigns so it "looks legitimate at a glance."

[OR if no typosquatting:]
❌ No clear typosquatting detected. The domain appears to be [describe].

6) Final risk level
[CRITICAL / HIGH / MEDIUM / LOW]

Reasons:
• [Detailed reason 1]
• [Detailed reason 2]
• [Detailed reason 3]

7) Direct conclusion: is it impersonation?
🚨 Yes: it is VERY LIKELY to be impersonation.
I would treat any email from @[domain] as phishing until proven otherwise.

[OR for lower risk:]
⚠️ Possibly: [explain the uncertainty]

[OR for legitimate:]
✅ Unlikely: [explain why it appears legitimate]

What to do now (recommended):
• Do not reply, do not open links, do not download attachments.
• Verify via an alternate channel: call the company or write only to an official published email (e.g., @[real-domain]).
• [Add specific third recommendation based on context]

IMPORTANT FORMATTING RULES:
- Write in a conversational, explanatory tone with context in parentheses
- Use quotes around technical terms like "typosquatting", "under construction", etc.
- Provide specific company context when identifying the legitimate domain
- Use 🚨 for critical alerts, ⚠️ for warnings, ✅ for confirmations, ❌ for negations, ℹ️ for info
- Use • for bullet points
- Be VERY detailed and educational - explain WHY each signal matters
- If Spanish: use "Dominio letra por letra", "¿La edad del dominio encaja?", "Proveedores típicos de fraude", "¿Imita a otro conocido?", "Nivel de riesgo final", "Conclusión: ¿es suplantación?", "Qué hacer ahora (recomendado)"
"""

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
