import re
from typing import List
import logging

logger = logging.getLogger(__name__)


class TextAnalyzer:
    """Analyze email text for phishing indicators"""
    
    URGENCY_PATTERNS = [
        r'\b(urgent|immediately|asap|right away|act now|time sensitive|expires|deadline)\b',
        r'\b(within \d+ (hours?|minutes?|days?))\b',
        r'\b(limited time|last chance|final notice)\b'
    ]
    
    THREAT_PATTERNS = [
        r'\b(suspend|suspended|locked|blocked|terminated|closed|disabled)\b',
        r'\b(unauthorized|suspicious activity|security alert|breach)\b',
        r'\b(legal action|lawsuit|penalty|fine)\b'
    ]
    
    CREDENTIAL_PATTERNS = [
        r'\b(verify|confirm|update|validate) (your )?(account|identity|information|credentials|password)\b',
        r'\b(click here|log in|sign in) to (verify|confirm|update|restore)\b',
        r'\b(re-?enter|provide|submit) (your )?(password|credentials|information)\b'
    ]
    
    PAYMENT_PATTERNS = [
        r'\b(payment|invoice|refund|transaction|billing|charge)\b',
        r'\b(bank|credit card|debit card|account number|routing number)\b',
        r'\b(wire transfer|send money|pay now)\b'
    ]
    
    def analyze_text(self, body: str) -> List[str]:
        """Analyze text for phishing indicators"""
        flags = []
        body_lower = body.lower()
        
        # Check urgency
        if self._check_patterns(body_lower, self.URGENCY_PATTERNS):
            flags.append('urgency')
        
        # Check threats
        if self._check_patterns(body_lower, self.THREAT_PATTERNS):
            flags.append('threats')
        
        # Check credential requests
        if self._check_patterns(body_lower, self.CREDENTIAL_PATTERNS):
            flags.append('credential_request')
        
        # Check payment/banking
        if self._check_patterns(body_lower, self.PAYMENT_PATTERNS):
            flags.append('payment_request')
        
        return flags
    
    def _check_patterns(self, text: str, patterns: List[str]) -> bool:
        """Check if any pattern matches the text"""
        for pattern in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return True
        return False
