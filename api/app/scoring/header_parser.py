import re
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)


class HeaderParser:
    """Parse email headers for authentication signals"""
    
    def parse_headers(self, headers: str) -> Dict[str, Any]:
        """Extract relevant header information"""
        result = {
            'reply_to': None,
            'return_path': None,
            'dkim_present': False,
            'dkim_d_domain': None,
            'auth_results': {}
        }
        
        # Parse Reply-To
        reply_to_match = re.search(r'Reply-To:\s*<?([^>\s]+@[^>\s]+)>?', headers, re.IGNORECASE)
        if reply_to_match:
            result['reply_to'] = reply_to_match.group(1).strip()
        
        # Parse Return-Path
        return_path_match = re.search(r'Return-Path:\s*<?([^>\s]+@[^>\s]+)>?', headers, re.IGNORECASE)
        if return_path_match:
            result['return_path'] = return_path_match.group(1).strip()
        
        # Check for DKIM-Signature
        dkim_match = re.search(r'DKIM-Signature:.*?d=([^;\s]+)', headers, re.IGNORECASE | re.DOTALL)
        if dkim_match:
            result['dkim_present'] = True
            result['dkim_d_domain'] = dkim_match.group(1).strip()
        
        # Parse Authentication-Results (best effort)
        auth_results_match = re.search(r'Authentication-Results:(.+?)(?=\n\S|\Z)', headers, re.IGNORECASE | re.DOTALL)
        if auth_results_match:
            auth_text = auth_results_match.group(1)
            
            # Look for dkim=pass/fail
            dkim_result = re.search(r'dkim=(pass|fail|none)', auth_text, re.IGNORECASE)
            if dkim_result:
                result['auth_results']['dkim'] = dkim_result.group(1).lower()
            
            # Look for spf=pass/fail
            spf_result = re.search(r'spf=(pass|fail|none)', auth_text, re.IGNORECASE)
            if spf_result:
                result['auth_results']['spf'] = spf_result.group(1).lower()
            
            # Look for dmarc=pass/fail
            dmarc_result = re.search(r'dmarc=(pass|fail|none)', auth_text, re.IGNORECASE)
            if dmarc_result:
                result['auth_results']['dmarc'] = dmarc_result.group(1).lower()
        
        return result
    
    def extract_domain(self, email: str) -> str:
        """Extract domain from email address"""
        if '@' in email:
            return email.split('@')[1].lower()
        return email.lower()
