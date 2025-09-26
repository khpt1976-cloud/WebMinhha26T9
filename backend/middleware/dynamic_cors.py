"""
Dynamic CORS Middleware
Tự động cấu hình CORS dựa trên request origin - KHÔNG HARDCODE BẤT KỲ DOMAIN NÀO
"""

import re
from typing import List, Set
from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response


class DynamicCORSMiddleware(BaseHTTPMiddleware):
    """
    Dynamic CORS Middleware - Tự động cho phép CORS dựa trên patterns
    KHÔNG hardcode bất kỳ domain nào
    """
    
    def __init__(self, app, allow_development: bool = True, allow_localhost: bool = True):
        super().__init__(app)
        self.allow_development = allow_development
        self.allow_localhost = allow_localhost
        self.allowed_patterns = self._get_allowed_patterns()
        
    def _get_allowed_patterns(self) -> List[str]:
        """
        Lấy danh sách patterns được phép - HOÀN TOÀN DYNAMIC
        """
        patterns = []
        
        if self.allow_localhost:
            # Local development patterns
            patterns.extend([
                r'^https?://localhost(:\d+)?$',
                r'^https?://127\.0\.0\.1(:\d+)?$',
                r'^https?://0\.0\.0\.0(:\d+)?$',
            ])
            
        if self.allow_development:
            # Local network patterns (192.168.x.x, 10.x.x.x, etc.)
            patterns.extend([
                r'^https?://192\.168\.\d+\.\d+(:\d+)?$',
                r'^https?://10\.\d+\.\d+\.\d+(:\d+)?$',
                r'^https?://172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+(:\d+)?$',
            ])
            
            # Development/staging patterns (common cloud providers)
            patterns.extend([
                r'^https?://[^.]+\.ngrok\.io$',
                r'^https?://[^.]+\.herokuapp\.com$',
                r'^https?://[^.]+\.vercel\.app$',
                r'^https?://[^.]+\.netlify\.app$',
                r'^https?://[^.]+\.github\.io$',
                r'^https?://[^.]+\.gitpod\.io$',
                r'^https?://[^.]+\.codespaces\.github\.com$',
                r'^https?://[^.]+\.repl\.co$',
                r'^https?://[^.]+\.glitch\.me$',
                # OpenHands specific patterns
                r'^https?://work-\d+-[^.]+\.prod-runtime\.all-hands\.dev$',
                r'^https?://work-\d+-[^.]+\.prod-runtime\.all-hands\.dev:\d+$',
                # Generic cloud patterns - DYNAMIC
                r'^https?://[^.]+\.(dev|test|staging)$',
                r'^https?://[^.]+\.local(:\d+)?$',
                # ANY cloud runtime pattern
                r'^https?://[^.]+\.[^.]+\.(dev|com|io|app)$',
            ])
        
        return patterns
    
    def _is_origin_allowed(self, origin: str) -> bool:
        """
        Kiểm tra origin có được phép không dựa trên patterns
        """
        if not origin:
            return False
            
        # Check against all patterns
        for pattern in self.allowed_patterns:
            if re.match(pattern, origin):
                return True
                
        return False
    
    async def dispatch(self, request: Request, call_next):
        """
        Process request và tự động thêm CORS headers
        """
        origin = request.headers.get('origin')
        
        # Process request
        response = await call_next(request)
        
        # Add CORS headers if origin is allowed
        if origin and self._is_origin_allowed(origin):
            response.headers['Access-Control-Allow-Origin'] = origin
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Accept, Origin, User-Agent, DNT, Cache-Control, X-Mx-ReqToken, Keep-Alive, X-Requested-With, If-Modified-Since'
            response.headers['Access-Control-Max-Age'] = '86400'
            
        # Handle preflight requests
        if request.method == 'OPTIONS':
            if origin and self._is_origin_allowed(origin):
                return Response(
                    status_code=200,
                    headers={
                        'Access-Control-Allow-Origin': origin,
                        'Access-Control-Allow-Credentials': 'true',
                        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Origin, User-Agent, DNT, Cache-Control, X-Mx-ReqToken, Keep-Alive, X-Requested-With, If-Modified-Since',
                        'Access-Control-Max-Age': '86400'
                    }
                )
        
        return response