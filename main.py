from flask import Flask, send_from_directory, render_template_string, request, jsonify
import os
import re
import requests
from bs4 import BeautifulSoup
import logging
from urllib.parse import urljoin, urlparse
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='.', static_url_path='')

# Database configuration
database_url = os.environ.get('DATABASE_URL')
if database_url:
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        "pool_recycle": 300,
        "pool_pre_ping": True,
    }
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
else:
    # Fallback for environments without database
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///whatsapp_groups.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
db = SQLAlchemy(app)

# WhatsApp Group Model
class WhatsAppGroup(db.Model):
    __tablename__ = 'whatsapp_groups'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    group_url = db.Column(db.String(500), nullable=False, unique=True)
    image_url = db.Column(db.String(500), nullable=True)
    category = db.Column(db.String(100), nullable=True, default='General')
    country = db.Column(db.String(100), nullable=True, default='Global')
    member_count = db.Column(db.Integer, nullable=True, default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'group_url': self.group_url,
            'image_url': self.image_url,
            'category': self.category,
            'country': self.country,
            'member_count': self.member_count,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<WhatsAppGroup {self.title}>'

# Create tables
with app.app_context():
    db.create_all()

# HTML template for group pages
GROUP_TEMPLATE = '''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ group_title }} - WhatsApp Group Hub</title>
    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <nav class="navbar">
        <div class="nav-brand">
            <i class="fab fa-whatsapp"></i>
            <span>WhatsApp Group Hub</span>
        </div>
        <button class="nav-toggle">
            <i class="fas fa-bars"></i>
        </button>
        <ul class="nav-links">
            <li><a href="/">Home</a></li>
            <li><a href="/pages/about.html">About</a></li>
            <li><a href="/pages/contact.html">Contact</a></li>
            <li><a href="/pages/privacy.html">Privacy</a></li>
            <li><a href="/pages/terms.html">Terms</a></li>
        </ul>
    </nav>

    <main class="container group-detail-page">
        <div class="group-header">
            <div class="group-info">
                <h1>{{ group_title }}</h1>
                <div class="group-meta">
                    <span class="category-badge">{{ category }}</span>
                    <span class="country-badge">{{ country }}</span>
                </div>
            </div>
        </div>

        <section class="group-content">
            <div class="group-join-card">
                {{ group_card | safe }}
            </div>

            <div class="group-article">
                <h2>About WhatsApp Groups</h2>

                <h3>What is WhatsApp?</h3>
                <p>WhatsApp is a popular messaging app that allows users to send messages, make voice and video calls, and share media with friends and family worldwide. It's used by over 2 billion people globally and is known for its end-to-end encryption and user-friendly interface.</p>

                <h3>What are WhatsApp Groups?</h3>
                <p>WhatsApp groups are communities within the WhatsApp platform where multiple users can interact together. They serve as virtual meeting spaces where people with common interests can share messages, media, and engage in discussions.</p>

                <h3>Uses of WhatsApp Groups</h3>
                <ul>
                    <li>Connecting with like-minded people in the {{ category }} community</li>
                    <li>Sharing updates and news related to {{ category }}</li>
                    <li>Organizing events and meetups</li>
                    <li>Learning from experts and enthusiasts</li>
                    <li>Networking with people from {{ country }}</li>
                </ul>

                <h3>Advantages of WhatsApp Groups</h3>
                <ul>
                    <li>Free and easy communication with multiple people simultaneously</li>
                    <li>Share photos, videos, and documents instantly</li>
                    <li>Create focused communities around specific interests</li>
                    <li>Stay updated with real-time notifications</li>
                    <li>End-to-end encryption for secure communications</li>
                </ul>

                <h3>Why Join This Group?</h3>
                <p>This {{ category }} group in {{ country }} offers a unique opportunity to connect with others who share your interests. You'll be able to participate in discussions, share knowledge, and stay updated with the latest developments in this field.</p>
            </div>
        </section>
    </main>

    <footer class="footer">
        <div class="footer-content">
            <div class="footer-section">
                <h3>WhatsApp Group Hub</h3>
                <p>Share and discover amazing WhatsApp groups</p>
            </div>
            <div class="footer-links">
                <a href="/pages/about.html">About</a>
                <a href="/pages/privacy.html">Privacy Policy</a>
                <a href="/pages/terms.html">Terms</a>
                <a href="/pages/contact.html">Contact</a>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2024 WhatsApp Group Hub. All rights reserved.</p>
        </div>
    </footer>

    <script>
        const navToggle = document.querySelector('.nav-toggle');
        const navLinks = document.querySelector('.nav-links');

        navToggle?.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    </script>
</body>
</html>
'''

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/api/extract-group-image', methods=['POST'])
def extract_group_image():
    """
    Enhanced WhatsApp group image extraction endpoint
    This endpoint scrapes WhatsApp group pages to extract actual group images
    """
    try:
        data = request.get_json()
        url = data.get('url', '').strip()
        
        if not url:
            return jsonify({'error': 'URL is required'}), 400
            
        if not url.startswith('https://chat.whatsapp.com/'):
            return jsonify({'error': 'Invalid WhatsApp group URL'}), 400
            
        logger.info(f"Extracting image from WhatsApp URL: {url}")
        
        # Set up headers to mimic a real browser
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }
        
        # Fetch the WhatsApp group page
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        # Parse the HTML content
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract group information
        group_image = None
        group_title = None
        group_description = None
        
        # Method 1: Look for Open Graph meta tags (most reliable)
        og_image = soup.find('meta', property='og:image')
        if og_image and hasattr(og_image, 'attrs') and 'content' in og_image.attrs:
            group_image = og_image.attrs['content']
            logger.info(f"Found OG image: {group_image}")
            
        og_title = soup.find('meta', property='og:title')
        if og_title and hasattr(og_title, 'attrs') and 'content' in og_title.attrs:
            group_title = og_title.attrs['content']
            
        og_description = soup.find('meta', property='og:description')
        if og_description and hasattr(og_description, 'attrs') and 'content' in og_description.attrs:
            group_description = og_description.attrs['content']
        
        # Method 2: Look for Twitter Card meta tags as fallback
        if not group_image:
            twitter_image = soup.find('meta', attrs={'name': 'twitter:image'})
            if twitter_image and hasattr(twitter_image, 'attrs') and 'content' in twitter_image.attrs:
                group_image = twitter_image.attrs['content']
                logger.info(f"Found Twitter image: {group_image}")
        
        # Method 3: Look for WhatsApp-specific image containers
        if not group_image:
            # Look for images in typical WhatsApp group page structure
            whatsapp_images = soup.find_all('img', src=True)
            for img in whatsapp_images:
                if hasattr(img, 'attrs') and 'src' in img.attrs:
                    src = img.attrs['src']
                    # Look for WhatsApp profile/group images (usually contain specific patterns)
                    if src and isinstance(src, str) and any(pattern in src.lower() for pattern in ['profile', 'group', 'avatar', 'photo']):
                        if src.startswith('http'):
                            group_image = src
                            logger.info(f"Found WhatsApp-specific image: {group_image}")
                            break
                        elif src.startswith('/'):
                            group_image = urljoin(url, src)
                            logger.info(f"Found relative WhatsApp image: {group_image}")
                            break
        
        # Method 4: Use fallback API if direct scraping doesn't work
        if not group_image:
            logger.info("Trying fallback with Microlink API")
            try:
                microlink_url = f"https://api.microlink.io/?url={url}"
                microlink_response = requests.get(microlink_url, timeout=10)
                microlink_data = microlink_response.json()
                
                if microlink_data.get('status') == 'success':
                    data = microlink_data.get('data', {})
                    if data.get('image', {}).get('url'):
                        group_image = data['image']['url']
                        logger.info(f"Found image via Microlink: {group_image}")
                    
                    # Also update title and description if not found
                    if not group_title and data.get('title'):
                        group_title = data['title']
                    if not group_description and data.get('description'):
                        group_description = data['description']
                        
            except Exception as e:
                logger.warning(f"Microlink fallback failed: {e}")
        
        # If still no image found, use default WhatsApp logo
        if not group_image:
            group_image = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png"
            logger.info("Using default WhatsApp logo")
        
        # Validate the image URL
        if group_image and isinstance(group_image, str) and not group_image.startswith('http'):
            group_image = urljoin(url, group_image)
        
        # Test if the image URL is accessible
        try:
            if group_image and isinstance(group_image, str) and group_image.startswith('http'):
                img_response = requests.head(group_image, timeout=5)
                if img_response.status_code != 200:
                    logger.warning(f"Image URL not accessible: {group_image}")
                    group_image = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png"
        except Exception as e:
            logger.warning(f"Could not verify image URL: {group_image}, error: {e}")
            group_image = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png"
        
        result = {
            'success': True,
            'image': group_image,
            'title': group_title or 'WhatsApp Group',
            'description': group_description or 'Join this WhatsApp group',
            'url': url
        }
        
        logger.info(f"Successfully extracted: {result}")
        return jsonify(result)
        
    except requests.RequestException as e:
        logger.error(f"Request error: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch WhatsApp group page',
            'image': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png'
        }), 500
        
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return jsonify({
            'success': False,
            'error': 'An unexpected error occurred',
            'image': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png'
        }), 500

@app.route('/api/groups', methods=['GET', 'POST'])
def api_groups():
    """API endpoint for managing WhatsApp groups"""
    if request.method == 'GET':
        try:
            groups = WhatsAppGroup.query.filter_by(is_active=True).order_by(WhatsAppGroup.created_at.desc()).all()
            return jsonify({
                'success': True,
                'groups': [group.to_dict() for group in groups]
            })
        except Exception as e:
            logger.error(f"Error getting groups: {e}")
            return jsonify({'success': False, 'error': str(e)}), 500
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            required_fields = ['title', 'description', 'group_url']
            
            for field in required_fields:
                if not data.get(field):
                    return jsonify({'success': False, 'error': f'{field} is required'}), 400
            
            # Check if group already exists
            existing_group = WhatsAppGroup.query.filter_by(group_url=data['group_url']).first()
            if existing_group:
                return jsonify({'success': False, 'error': 'Group already exists'}), 409
            
            # Create new group
            new_group = WhatsAppGroup(
                title=data['title'],
                description=data['description'],
                group_url=data['group_url'],
                image_url=data.get('image_url', 'https://static.whatsapp.net/rsrc.php/v4/yo/r/J5gK5AgJ_L5.png'),
                category=data.get('category', 'General'),
                country=data.get('country', 'Global'),
                member_count=data.get('member_count', 0)
            )
            
            db.session.add(new_group)
            db.session.commit()
            
            logger.info(f"New group added: {new_group.title}")
            
            return jsonify({
                'success': True,
                'message': 'Group added successfully',
                'group': new_group.to_dict()
            }), 201
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error adding group: {e}")
            return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/group/<slug>')
def serve_group_page(slug):
    # Convert slug back to title (basic implementation)
    group_title = ' '.join(slug.split('-')).title()
    # In a real implementation, you'd fetch the actual group data from your database

    # Example group data (you'll need to implement actual data fetching)
    group_data = {
        'title': group_title,
        'category': 'Technology',  # This would come from your database
        'country': 'United States',  # This would come from your database
        'image': None,  # This would come from your database
        'description': 'Group description here',  # This would come from your database
        'link': 'https://chat.whatsapp.com/example'  # This would be the actual WhatsApp link
    }

    # Generate the image HTML separately to avoid f-string escaping issues
    image_html = ''
    if group_data['image']:
        image_html = '<img src="{}" alt="{}" onerror="this.src=\'https://via.placeholder.com/150\'">'.format(
            group_data['image'],
            group_data['title']
        )

    group_card_html = f"""
    <div class="group-card detail-view">
        {image_html}
        <h3>{group_data['title']}</h3>
        <div class="group-badges">
            <span class="category-badge">{group_data['category']}</span>
            <span class="country-badge">{group_data['country']}</span>
        </div>
        <p>{group_data['description']}</p>
        <div class="card-actions">
            <a href="{group_data['link']}" target="_blank" rel="noopener noreferrer" class="join-btn primary">
                <i class="fab fa-whatsapp"></i> Join WhatsApp Group
            </a>
        </div>
    </div>
    """

    return render_template_string(
        GROUP_TEMPLATE,
        group_title=group_data['title'],
        category=group_data['category'],
        country=group_data['country'],
        group_card=group_card_html
    )

@app.route('/<path:filename>')
def serve_file(filename):
    return send_from_directory('.', filename)

@app.route('/<path:folder>/')
def serve_folder_index(folder):
    return send_from_directory(folder, 'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)