import trafilatura
import requests
import re
from bs4 import BeautifulSoup
import base64
from urllib.parse import urlparse, urljoin
import time
import json

class GroupImageExtractor:
    def __init__(self):
        self.session = requests.Session()
        # Set headers to mimic a real browser
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })

    def extract_group_image_from_whatsapp_link(self, whatsapp_url):
        """
        Extract group image from WhatsApp group invitation link
        """
        try:
            # Validate WhatsApp URL
            if not self.is_valid_whatsapp_url(whatsapp_url):
                return None, "Invalid WhatsApp URL"

            # Fetch the page content
            response = self.session.get(whatsapp_url, timeout=10)
            response.raise_for_status()
            
            # Parse HTML content
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Try multiple methods to extract image
            image_url = self._extract_image_from_meta_tags(soup, whatsapp_url)
            
            if not image_url:
                image_url = self._extract_image_from_content(soup, whatsapp_url)
            
            if image_url:
                # Download and encode image
                image_data = self._download_and_encode_image(image_url)
                if image_data:
                    return image_data, "success"
            
            return None, "No image found"
            
        except requests.RequestException as e:
            return None, f"Network error: {str(e)}"
        except Exception as e:
            return None, f"Extraction error: {str(e)}"

    def is_valid_whatsapp_url(self, url):
        """Check if URL is a valid WhatsApp group invitation link"""
        whatsapp_patterns = [
            r'https://chat\.whatsapp\.com/',
            r'https://wa\.me/',
            r'https://api\.whatsapp\.com/'
        ]
        return any(re.match(pattern, url) for pattern in whatsapp_patterns)

    def _extract_image_from_meta_tags(self, soup, base_url):
        """Extract image from Open Graph and Twitter meta tags"""
        # Try Open Graph image
        og_image = soup.find('meta', property='og:image')
        if og_image and og_image.get('content'):
            return urljoin(base_url, og_image['content'])
        
        # Try Twitter image
        twitter_image = soup.find('meta', name='twitter:image')
        if twitter_image and twitter_image.get('content'):
            return urljoin(base_url, twitter_image['content'])
        
        # Try standard meta image
        meta_image = soup.find('meta', attrs={'name': 'image'})
        if meta_image and meta_image.get('content'):
            return urljoin(base_url, meta_image['content'])
        
        return None

    def _extract_image_from_content(self, soup, base_url):
        """Extract image from page content"""
        # Look for images with group-related classes or attributes
        group_image_selectors = [
            'img[class*="group"]',
            'img[class*="avatar"]',
            'img[class*="photo"]',
            'img[alt*="group"]',
            'img[alt*="Group"]',
            '.group-avatar img',
            '.avatar img',
            'img[src*="group"]'
        ]
        
        for selector in group_image_selectors:
            img = soup.select_one(selector)
            if img and img.get('src'):
                return urljoin(base_url, img['src'])
        
        # Fallback: get the first reasonable image
        images = soup.find_all('img')
        for img in images:
            src = img.get('src')
            if src and self._is_valid_image_url(src):
                return urljoin(base_url, src)
        
        return None

    def _is_valid_image_url(self, url):
        """Check if URL points to a valid image"""
        image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
        url_lower = url.lower()
        return any(ext in url_lower for ext in image_extensions)

    def _download_and_encode_image(self, image_url):
        """Download image and encode it as base64"""
        try:
            response = self.session.get(image_url, timeout=10)
            response.raise_for_status()
            
            # Check if it's actually an image
            content_type = response.headers.get('content-type', '')
            if not content_type.startswith('image/'):
                return None
            
            # Encode to base64
            image_base64 = base64.b64encode(response.content).decode('utf-8')
            return f"data:{content_type};base64,{image_base64}"
            
        except Exception as e:
            print(f"Error downloading image: {e}")
            return None

    def extract_group_info(self, whatsapp_url):
        """
        Extract both image and basic group info from WhatsApp link
        """
        try:
            response = self.session.get(whatsapp_url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract image
            image_data, _ = self.extract_group_image_from_whatsapp_link(whatsapp_url)
            
            # Extract title
            title = None
            og_title = soup.find('meta', property='og:title')
            if og_title and og_title.get('content'):
                title = og_title['content']
            
            if not title:
                title_tag = soup.find('title')
                if title_tag:
                    title = title_tag.get_text().strip()
            
            # Extract description
            description = None
            og_desc = soup.find('meta', property='og:description')
            if og_desc and og_desc.get('content'):
                description = og_desc['content']
            
            if not description:
                meta_desc = soup.find('meta', attrs={'name': 'description'})
                if meta_desc and meta_desc.get('content'):
                    description = meta_desc['content']
            
            return {
                'image': image_data,
                'title': title,
                'description': description,
                'success': True
            }
            
        except Exception as e:
            return {
                'image': None,
                'title': None,
                'description': None,
                'success': False,
                'error': str(e)
            }