#!/usr/bin/env python3
"""
Minimal TMDB Proxy Server for H-TV
Simple proxy to keep API key secure while allowing frontend calls
"""

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app)

# TMDB Configuration
TMDB_API_KEY = os.getenv('TMDB_API_KEY')
TMDB_BASE_URL = "https://api.themoviedb.org/3"

@app.route('/')
def serve_index():
    """Serve the main HTML file"""
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    """Serve static files"""
    return send_from_directory('.', filename)

@app.route('/api/tmdb/<path:endpoint>')
def proxy_tmdb(endpoint):
    """Simple proxy for TMDB API calls"""
    try:
        from flask import request
        url = f"{TMDB_BASE_URL}/{endpoint}"
        
        # Get all query parameters from the frontend request
        params = dict(request.args)
        params['api_key'] = TMDB_API_KEY
        
        print(f"🔍 Proxying request to: {url}")
        print(f"🔍 With params: {params}")
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        print(f"🔍 TMDB Response keys: {data.keys()}")
        return jsonify(data)
    except requests.exceptions.RequestException as e:
        print(f"TMDB API Error: {e}")
        return jsonify({'error': 'Failed to fetch data'}), 500


if __name__ == '__main__':
    if not TMDB_API_KEY:
        print("Error: TMDB_API_KEY environment variable not set!")
        exit(1)
    
    print("H-TV API Server starting...")
    print(f"TMDB API Key loaded: {'✓' if TMDB_API_KEY else '✗'}")
    app.run(host='0.0.0.0', port=5000, debug=False)