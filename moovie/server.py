#!/usr/bin/env python3
"""
Secure HTTP server for H-TV video streaming application.
Implements proper CORS headers and security measures for Replit environment.
"""

import http.server
import socketserver
import os
import mimetypes
from urllib.parse import urlparse

class SecureHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom HTTP request handler with security headers and CORS support."""
    
    def end_headers(self):
        """Add security headers to all responses."""
        # Security headers
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'SAMEORIGIN')
        self.send_header('X-XSS-Protection', '1; mode=block')
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')
        
        # CORS headers for development (restrict in production)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        
        super().end_headers()
    
    def do_GET(self):
        """Handle GET requests with proper security checks."""
        # Parse the URL
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        # Security: Prevent directory traversal
        if '..' in path or path.startswith('/.'):
            self.send_error(403, "Forbidden")
            return
        
        # Default to index.html for root path
        if path == '/':
            path = '/index.html'
        
        # Remove leading slash for file system access
        file_path = path.lstrip('/')
        
        # Check if file exists
        if not os.path.exists(file_path):
            self.send_error(404, "File not found")
            return
        
        # Prevent access to sensitive files
        sensitive_extensions = ['.py', '.md', '.txt', '.json', '.env']
        if any(file_path.endswith(ext) for ext in sensitive_extensions):
            # Allow access to specific files needed for the app
            allowed_files = ['replit.md']
            if not any(file_path.endswith(allowed) for allowed in allowed_files):
                self.send_error(403, "Forbidden")
                return
        
        super().do_GET()
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests."""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def log_message(self, format, *args):
        """Override to provide cleaner logging."""
        print(f"{self.address_string()} - {format % args}")

def main():
    """Start the secure HTTP server."""
    PORT = 5000
    HOST = '0.0.0.0'
    
    # Change to the directory containing the web files
    web_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(web_dir)
    
    # Create server with socket reuse option
    class ReusableServer(socketserver.TCPServer):
        allow_reuse_address = True
    
    with ReusableServer((HOST, PORT), SecureHTTPRequestHandler) as httpd:
        print(f"H-TV Secure Server running on http://{HOST}:{PORT}")
        print("Serving files with security headers and CORS support")
        print("Press Ctrl+C to stop the server")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped by user")
        except Exception as e:
            print(f"Server error: {e}")

if __name__ == "__main__":
    main()