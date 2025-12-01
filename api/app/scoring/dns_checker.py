import dns.resolver
from typing import Optional, Tuple
import logging

logger = logging.getLogger(__name__)


class DNSChecker:
    """Check DNS records for email authentication"""
    
    def __init__(self):
        self.resolver = dns.resolver.Resolver()
        self.resolver.timeout = 5
        self.resolver.lifetime = 5
    
    def check_mx(self, domain: str) -> bool:
        """Check if domain has MX records"""
        try:
            answers = self.resolver.resolve(domain, 'MX')
            return len(answers) > 0
        except Exception as e:
            logger.debug(f"MX lookup failed for {domain}: {e}")
            return False
    
    def check_spf(self, domain: str) -> Tuple[bool, Optional[str]]:
        """Check if domain has SPF record"""
        try:
            answers = self.resolver.resolve(domain, 'TXT')
            for rdata in answers:
                txt = str(rdata).strip('"')
                if txt.startswith('v=spf1'):
                    return True, txt
            return False, None
        except Exception as e:
            logger.debug(f"SPF lookup failed for {domain}: {e}")
            return False, None
    
    def check_dmarc(self, domain: str) -> Tuple[bool, Optional[str]]:
        """Check if domain has DMARC record"""
        dmarc_domain = f"_dmarc.{domain}"
        try:
            answers = self.resolver.resolve(dmarc_domain, 'TXT')
            for rdata in answers:
                txt = str(rdata).strip('"')
                if 'v=DMARC1' in txt:
                    return True, txt
            return False, None
        except Exception as e:
            logger.debug(f"DMARC lookup failed for {dmarc_domain}: {e}")
            return False, None
