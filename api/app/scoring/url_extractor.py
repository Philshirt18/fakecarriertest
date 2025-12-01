import re
from typing import List, Dict, Any
from html.parser import HTMLParser
import logging

logger = logging.getLogger(__name__)


class URLExtractor:
    """Extract and analyze URLs from email body"""
    
    SHORTENERS = {
        'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly',
        'is.gd', 'buff.ly', 'adf.ly', 'bl.ink', 'lnkd.in'
    }
    
    COMMON_BRANDS = {
        'google', 'microsoft', 'apple', 'amazon', 'paypal',
        'facebook', 'twitter', 'linkedin', 'instagram', 'netflix'
    }
    
    def extract_urls(self, body: str) -> List[Dict[str, Any]]:
        """Extract URLs from body text and HTML"""
        urls = []
        seen = set()
        
        # Extract from plain text URLs
        url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
        for match in re.finditer(url_pattern, body):
            url = match.group(0)
            if url not in seen:
                seen.add(url)
                urls.append(self._analyze_url(url))
        
        # Extract from HTML href attributes
        if '<a' in body.lower():
            try:
                parser = SimpleHTMLParser()
                parser.feed(body)
                for url in parser.urls:
                    if url not in seen and url.startswith('http'):
                        seen.add(url)
                        urls.append(self._analyze_url(url))
            except Exception as e:
                logger.debug(f"HTML parsing failed: {e}")
        
        return urls
    
    def _analyze_url(self, url: str) -> Dict[str, Any]:
        """Analyze a single URL for suspicious patterns"""
        domain = self._extract_domain(url)
        
        return {
            'url': url,
            'domain': domain,
            'is_shortener': domain in self.SHORTENERS,
            'is_punycode': 'xn--' in domain,
            'is_lookalike': self._check_lookalike(domain)
        }
    
    def _extract_domain(self, url: str) -> str:
        """Extract domain from URL"""
        match = re.search(r'https?://([^/]+)', url)
        if match:
            return match.group(1).lower()
        return ''
    
    def _check_lookalike(self, domain: str) -> bool:
        """Simple lookalike detection"""
        # Check for common brand names with slight variations
        for brand in self.COMMON_BRANDS:
            if brand in domain and domain != f"{brand}.com" and domain != f"www.{brand}.com":
                # Check Levenshtein distance
                if self._levenshtein_distance(domain.replace('.com', ''), brand) <= 2:
                    return True
        
        # Check for suspicious characters
        if any(char in domain for char in ['0', '1', 'l', 'i']) and any(brand in domain for brand in self.COMMON_BRANDS):
            return True
        
        return False
    
    def _levenshtein_distance(self, s1: str, s2: str) -> int:
        """Calculate Levenshtein distance between two strings"""
        if len(s1) < len(s2):
            return self._levenshtein_distance(s2, s1)
        
        if len(s2) == 0:
            return len(s1)
        
        previous_row = range(len(s2) + 1)
        for i, c1 in enumerate(s1):
            current_row = [i + 1]
            for j, c2 in enumerate(s2):
                insertions = previous_row[j + 1] + 1
                deletions = current_row[j] + 1
                substitutions = previous_row[j] + (c1 != c2)
                current_row.append(min(insertions, deletions, substitutions))
            previous_row = current_row
        
        return previous_row[-1]


class SimpleHTMLParser(HTMLParser):
    """Simple HTML parser to extract href attributes"""
    
    def __init__(self):
        super().__init__()
        self.urls = []
    
    def handle_starttag(self, tag, attrs):
        if tag == 'a':
            for attr, value in attrs:
                if attr == 'href':
                    self.urls.append(value)
