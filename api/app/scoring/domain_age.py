from abc import ABC, abstractmethod
from typing import Optional


class DomainAgeProvider(ABC):
    """Interface for domain age providers (RDAP/WHOIS)"""
    
    @abstractmethod
    async def get_domain_age_days(self, domain: str) -> Optional[int]:
        """Return domain age in days, or None if unavailable"""
        pass


class NullDomainAgeProvider(DomainAgeProvider):
    """Default provider that returns None"""
    
    async def get_domain_age_days(self, domain: str) -> Optional[int]:
        return None


def get_domain_age_provider(provider_name: Optional[str] = None) -> DomainAgeProvider:
    """Factory for domain age providers"""
    if provider_name is None or provider_name == "null":
        return NullDomainAgeProvider()
    # Future: add RDAP/WHOIS providers
    return NullDomainAgeProvider()
