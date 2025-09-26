#!/usr/bin/env python3
"""
Simple HTTP Proxy for Admin Panel
Chuyển tiếp requests từ port công khai đến admin panel localhost:3000
"""

import http.server
import socketserver
import urllib.request
import urllib.parse
import urllib.error
from urllib.parse import urlparse, parse_qs
import json
import sys

class AdminProxyHandler(http.server.BaseHTTPRequestHandler):
    
    def do_GET(self):
        self.proxy_request()
    
    def do_POST(self):
        self.proxy_request()
    
    def do_PUT(self):
        self.proxy_request()
    
    def do_DELETE(self):
        self.proxy_request()
    
    def do_OPTIONS(self):
        self.proxy_request()
    
    def proxy_request(self):
        try:
            # Target admin panel
            target_host = "localhost:3000"
            target_url = f"http://{target_host}{self.path}"
            
            # Prepare request
            headers = {}
            for header, value in self.headers.items():
                if header.lower() not in ['host', 'connection']:
                    headers[header] = value
            
            # Read request body if present
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length) if content_length > 0 else None
            
            # Create request
            req = urllib.request.Request(target_url, data=body, headers=headers, method=self.command)
            
            # Send request
            with urllib.request.urlopen(req) as response:
                # Send response status
                self.send_response(response.status)
                
                # Send response headers
                for header, value in response.headers.items():
                    if header.lower() not in ['connection', 'transfer-encoding']:
                        self.send_header(header, value)
                
                # Add CORS headers
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
                
                self.end_headers()
                
                # Send response body
                response_data = response.read()
                self.wfile.write(response_data)
                
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(e.read())
            
        except Exception as e:
            print(f"Proxy error: {e}")
            self.send_response(500)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(b'Proxy Error')

if __name__ == "__main__":
    PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    
    with socketserver.TCPServer(("0.0.0.0", PORT), AdminProxyHandler) as httpd:
        print(f"🚀 Admin Panel Proxy running on port {PORT}")
        print(f"📱 Access admin panel at: http://localhost:{PORT}")
        print(f"🎯 Proxying to: http://localhost:3000")
        httpd.serve_forever()