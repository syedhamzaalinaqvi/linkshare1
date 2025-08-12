from flask import Flask, send_from_directory, render_template_string
import os
import re

app = Flask(__name__, static_folder='.', static_url_path='')

# Import and initialize API endpoints
try:
    from api_endpoints import init_api_routes
    init_api_routes(app)
except ImportError:
    print("API endpoints not available")

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

@app.route('/<path:path>')
def serve_files(path):
    return send_from_directory('.', path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)