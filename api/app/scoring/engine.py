from typing import Dict, Any, List, Tuple
from app.scoring.dns_checker import DNSChecker
from app.scoring.header_parser import HeaderParser
from app.scoring.url_extractor import URLExtractor
from app.scoring.text_analyzer import TextAnalyzer
from app.scoring.domain_age import get_domain_age_provider
from app.scoring.ai_analyzer import AIAnalyzer
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class ScoringEngine:
    """Main scoring engine for phishing detection"""
    
    # Scoring weights - aggressive phishing detection
    WEIGHTS = {
        'no_mx': 30,  # No mail server is very suspicious
        'no_spf': 15,   # Missing SPF is a major red flag
        'no_dmarc': 15, # Missing DMARC is a major red flag
        'no_dkim': 12,  # Missing DKIM is concerning
        'dkim_domain_mismatch': 25,  # Signature doesn't match - major red flag
        'reply_to_mismatch': 20,     # Common phishing tactic
        'return_path_mismatch': 12,
        'auth_fail': 30,  # Failed authentication is very serious
        'url_shortener': 15,
        'url_punycode': 18,
        'url_lookalike': 25,  # Clear impersonation attempt
        'text_urgency': 12,    # "Act now!" pressure tactics
        'text_threats': 15,   # Threatening language
        'text_credential_request': 20,  # Asking for passwords
        'text_payment_request': 18,
        'young_domain': 20,  # Newly registered domains
        'ai_high_risk': 35   # AI detected sophisticated attack
    }
    
    def __init__(self):
        self.dns_checker = DNSChecker()
        self.header_parser = HeaderParser()
        self.url_extractor = URLExtractor()
        self.text_analyzer = TextAnalyzer()
        self.domain_age_provider = get_domain_age_provider(settings.domain_age_provider)
        self.ai_analyzer = AIAnalyzer()
    
    async def score_email(self, sender: str, headers: str, body: str) -> Dict[str, Any]:
        """Score an email and return detailed results"""
        from_domain = self.header_parser.extract_domain(sender)
        
        # Collect signals
        signals = await self._collect_signals(sender, from_domain, headers, body)
        
        # Calculate score
        score, reasons = self._calculate_score(signals, from_domain)
        
        # Determine risk level
        risk_level = self._get_risk_level(score)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(signals, risk_level)
        
        return {
            'risk_level': risk_level,
            'score': score,
            'summary': reasons[:4],  # Top 3-4 reasons
            'signals': signals,
            'recommendations': recommendations
        }
    
    async def _collect_signals(self, sender: str, from_domain: str, headers: str, body: str) -> Dict[str, Any]:
        """Collect all signals from email"""
        signals = {}
        
        # DNS checks
        signals['from_domain'] = from_domain
        signals['mx_present'] = self.dns_checker.check_mx(from_domain)
        
        spf_present, spf_record = self.dns_checker.check_spf(from_domain)
        signals['spf_present'] = spf_present
        signals['spf_record'] = spf_record
        
        dmarc_present, dmarc_record = self.dns_checker.check_dmarc(from_domain)
        signals['dmarc_present'] = dmarc_present
        signals['dmarc_record'] = dmarc_record
        
        # Header analysis
        header_info = self.header_parser.parse_headers(headers)
        signals['dkim_present'] = header_info['dkim_present']
        signals['dkim_d_domain'] = header_info['dkim_d_domain']
        
        # Check mismatches
        signals['reply_to_mismatch'] = False
        if header_info['reply_to']:
            reply_to_domain = self.header_parser.extract_domain(header_info['reply_to'])
            signals['reply_to_mismatch'] = reply_to_domain != from_domain
        
        signals['return_path_mismatch'] = False
        if header_info['return_path']:
            return_path_domain = self.header_parser.extract_domain(header_info['return_path'])
            signals['return_path_mismatch'] = return_path_domain != from_domain
        
        signals['auth_results'] = header_info['auth_results']
        
        # Domain age
        signals['domain_age_days'] = await self.domain_age_provider.get_domain_age_days(from_domain)
        
        # URL analysis
        urls = self.url_extractor.extract_urls(body)
        signals['urls'] = urls
        
        # Text analysis
        text_flags = self.text_analyzer.analyze_text(body)
        signals['text_flags'] = text_flags
        
        # AI analysis (if enabled)
        subject = self._extract_subject(headers)
        ai_result = await self.ai_analyzer.analyze_email(sender, subject, body)
        signals['ai_analysis'] = ai_result
        
        return signals
    
    def _extract_subject(self, headers: str) -> str:
        """Extract subject from headers"""
        import re
        match = re.search(r'Subject:\s*(.+?)(?=\n[A-Z]|\n\n|\Z)', headers, re.IGNORECASE | re.DOTALL)
        if match:
            return match.group(1).strip()
        return ""
    
    def _calculate_score(self, signals: Dict[str, Any], from_domain: str) -> Tuple[int, List[str]]:
        """Calculate risk score and return contributing reasons"""
        score = 0
        reasons = []
        
        # DNS checks
        if not signals['mx_present']:
            score += self.WEIGHTS['no_mx']
            reasons.append(('no_mx', f"Domain {from_domain} has no mail server configured"))
        
        if not signals['spf_present']:
            score += self.WEIGHTS['no_spf']
            reasons.append(('no_spf', f"Sender domain lacks email authentication (SPF)"))
        
        if not signals['dmarc_present']:
            score += self.WEIGHTS['no_dmarc']
            reasons.append(('no_dmarc', f"Domain has no anti-spoofing policy (DMARC)"))
        
        if not signals['dkim_present']:
            score += self.WEIGHTS['no_dkim']
            reasons.append(('no_dkim', "Email is not digitally signed"))
        elif signals['dkim_d_domain'] and signals['dkim_d_domain'] != from_domain:
            score += self.WEIGHTS['dkim_domain_mismatch']
            reasons.append(('dkim_domain_mismatch', f"Email signature doesn't match sender domain"))
        
        # Header mismatches
        if signals['reply_to_mismatch']:
            score += self.WEIGHTS['reply_to_mismatch']
            reasons.append(('reply_to_mismatch', "Replies will go to a different address than the sender"))
        
        if signals['return_path_mismatch']:
            score += self.WEIGHTS['return_path_mismatch']
            reasons.append(('return_path_mismatch', "Email bounce address doesn't match sender"))
        
        # Authentication results
        auth_results = signals.get('auth_results', {})
        if auth_results.get('dkim') == 'fail' or auth_results.get('spf') == 'fail' or auth_results.get('dmarc') == 'fail':
            score += self.WEIGHTS['auth_fail']
            failed = [k.upper() for k, v in auth_results.items() if v == 'fail']
            reasons.append(('auth_fail', f"Email failed security checks ({', '.join(failed)})"))
        
        # URL analysis
        for url_info in signals['urls']:
            if url_info['is_shortener']:
                score += self.WEIGHTS['url_shortener']
                reasons.append(('url_shortener', f"Contains shortened link that hides the real destination"))
                break
        
        for url_info in signals['urls']:
            if url_info['is_punycode']:
                score += self.WEIGHTS['url_punycode']
                reasons.append(('url_punycode', f"Contains suspicious international domain: {url_info['domain']}"))
                break
        
        for url_info in signals['urls']:
            if url_info['is_lookalike']:
                score += self.WEIGHTS['url_lookalike']
                reasons.append(('url_lookalike', f"Contains fake website that mimics a real brand: {url_info['domain']}"))
                break
        
        # Text analysis
        text_flags = signals['text_flags']
        if 'urgency' in text_flags:
            score += self.WEIGHTS['text_urgency']
            reasons.append(('text_urgency', "Uses pressure tactics to make you act quickly"))
        
        if 'threats' in text_flags:
            score += self.WEIGHTS['text_threats']
            reasons.append(('text_threats', "Threatens account suspension or legal action"))
        
        if 'credential_request' in text_flags:
            score += self.WEIGHTS['text_credential_request']
            reasons.append(('text_credential_request', "Asks you to verify your password or login details"))
        
        if 'payment_request' in text_flags:
            score += self.WEIGHTS['text_payment_request']
            reasons.append(('text_payment_request', "Requests payment or financial information"))
        
        # Domain age
        if signals['domain_age_days'] is not None and signals['domain_age_days'] < 30:
            score += self.WEIGHTS['young_domain']
            reasons.append(('young_domain', f"Sender's domain was just created {signals['domain_age_days']} days ago"))
        
        # AI analysis
        ai_analysis = signals.get('ai_analysis', {})
        if ai_analysis.get('ai_risk_score', 0) > 60 and ai_analysis.get('ai_confidence', 0) > 0.7:
            score += self.WEIGHTS['ai_high_risk']
            ai_flags = ai_analysis.get('ai_flags', [])
            if ai_flags:
                reasons.append(('ai_high_risk', f"AI detected: {', '.join(ai_flags[:2])}"))
            else:
                reasons.append(('ai_high_risk', "AI detected sophisticated phishing patterns"))
        
        # Cap at 100
        score = min(score, 100)
        
        # Sort reasons by weight and return human-readable messages
        reasons.sort(key=lambda x: self.WEIGHTS.get(x[0], 0), reverse=True)
        return score, [r[1] for r in reasons]
    
    def _get_risk_level(self, score: int) -> str:
        """Map score to risk level - strict thresholds for better detection"""
        if score <= 15:
            return 'safe'  # Truly safe emails with no concerns
        elif score <= 35:
            return 'low'   # Minor concerns but probably legitimate
        elif score <= 60:
            return 'medium'  # Multiple red flags - likely phishing
        else:
            return 'high'  # Clear phishing attempt
    
    def _generate_recommendations(self, signals: Dict[str, Any], risk_level: str) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []
        
        if risk_level == 'high':
            recommendations.append("Do not click any links or download attachments")
            recommendations.append("Do not reply or provide any personal information")
            recommendations.append("Report this email to your IT security team")
        elif risk_level == 'medium':
            recommendations.append("Verify sender identity through a separate channel before taking action")
            recommendations.append("Be cautious with links and attachments")
        else:
            recommendations.append("Email appears legitimate, but always verify unexpected requests")
        
        # AI-specific recommendations
        ai_analysis = signals.get('ai_analysis', {})
        if ai_analysis.get('ai_risk_score', 0) > 50:
            ai_reasoning = ai_analysis.get('ai_reasoning', '')
            if ai_reasoning and len(ai_reasoning) < 150:
                recommendations.append(f"AI insight: {ai_reasoning}")
        
        # Specific recommendations based on signals
        if not signals['spf_present'] or not signals['dmarc_present']:
            recommendations.append("This domain doesn't have proper security measures in place")
        
        if signals['urls'] and any(u['is_shortener'] for u in signals['urls']):
            recommendations.append("Don't click shortened links - they hide where they really go")
        
        if 'credential_request' in signals['text_flags']:
            recommendations.append("Real companies never ask for your password in an email")
        
        if 'payment_request' in signals['text_flags']:
            recommendations.append("Call the company directly to verify any payment requests")
        
        return recommendations[:6]  # Return top 6
