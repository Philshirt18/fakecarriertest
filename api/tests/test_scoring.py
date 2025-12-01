import pytest
from app.scoring.dns_checker import DNSChecker
from app.scoring.header_parser import HeaderParser
from app.scoring.url_extractor import URLExtractor
from app.scoring.text_analyzer import TextAnalyzer


def test_header_parser_extract_domain():
    parser = HeaderParser()
    assert parser.extract_domain("user@example.com") == "example.com"
    assert parser.extract_domain("test@sub.domain.com") == "sub.domain.com"


def test_header_parser_dkim():
    parser = HeaderParser()
    headers = """From: sender@example.com
DKIM-Signature: v=1; a=rsa-sha256; d=example.com; s=selector;
    h=from:to:subject; bh=hash; b=signature"""
    
    result = parser.parse_headers(headers)
    assert result['dkim_present'] is True
    assert result['dkim_d_domain'] == 'example.com'


def test_header_parser_reply_to():
    parser = HeaderParser()
    headers = """From: sender@example.com
Reply-To: different@other.com"""
    
    result = parser.parse_headers(headers)
    assert result['reply_to'] == 'different@other.com'


def test_url_extractor_basic():
    extractor = URLExtractor()
    body = "Check out https://example.com and http://test.org"
    
    urls = extractor.extract_urls(body)
    assert len(urls) == 2
    assert urls[0]['domain'] == 'example.com'
    assert urls[1]['domain'] == 'test.org'


def test_url_extractor_shortener():
    extractor = URLExtractor()
    body = "Click here: https://bit.ly/abc123"
    
    urls = extractor.extract_urls(body)
    assert len(urls) == 1
    assert urls[0]['is_shortener'] is True


def test_url_extractor_punycode():
    extractor = URLExtractor()
    body = "Visit https://xn--example-abc.com"
    
    urls = extractor.extract_urls(body)
    assert len(urls) == 1
    assert urls[0]['is_punycode'] is True


def test_text_analyzer_urgency():
    analyzer = TextAnalyzer()
    body = "URGENT: Your account will be suspended immediately!"
    
    flags = analyzer.analyze_text(body)
    assert 'urgency' in flags
    assert 'threats' in flags


def test_text_analyzer_credentials():
    analyzer = TextAnalyzer()
    body = "Please verify your account by clicking here and entering your password."
    
    flags = analyzer.analyze_text(body)
    assert 'credential_request' in flags


def test_text_analyzer_payment():
    analyzer = TextAnalyzer()
    body = "Your invoice is ready. Please update your credit card information."
    
    flags = analyzer.analyze_text(body)
    assert 'payment_request' in flags


@pytest.mark.asyncio
async def test_scoring_engine_basic():
    from app.scoring.engine import ScoringEngine
    
    engine = ScoringEngine()
    
    # Test with a suspicious email
    sender = "admin@suspicious-domain.com"
    headers = """From: admin@suspicious-domain.com
Subject: Urgent Account Verification
Reply-To: phisher@different.com"""
    body = """URGENT: Your account will be suspended!
Click here to verify your password immediately: https://bit.ly/verify123"""
    
    result = await engine.score_email(sender, headers, body)
    
    assert result['score'] > 0
    assert result['risk_level'] in ['low', 'medium', 'high']
    assert len(result['summary']) > 0
    assert len(result['recommendations']) > 0
    assert 'from_domain' in result['signals']


def test_levenshtein_distance():
    extractor = URLExtractor()
    
    # Test exact match
    assert extractor._levenshtein_distance("test", "test") == 0
    
    # Test single character difference
    assert extractor._levenshtein_distance("test", "best") == 1
    
    # Test multiple differences
    assert extractor._levenshtein_distance("kitten", "sitting") == 3
