"""
Fallback handler for when Firebase is not configured
This provides a simple file-based storage system for testing
"""
import json
import os
import uuid
from datetime import datetime
import base64

class StaticFallbackHandler:
    def __init__(self):
        self.data_dir = "fallback_data"
        self.groups_file = os.path.join(self.data_dir, "groups.json")
        self.images_dir = os.path.join(self.data_dir, "images")
        
        # Create directories if they don't exist
        os.makedirs(self.data_dir, exist_ok=True)
        os.makedirs(self.images_dir, exist_ok=True)
        
        # Initialize groups file if it doesn't exist
        if not os.path.exists(self.groups_file):
            with open(self.groups_file, 'w') as f:
                json.dump([], f)

    def save_group_image_to_storage(self, image_data, group_id):
        """Save base64 image data to local file system"""
        if not image_data:
            return None
        
        try:
            # Parse base64 data
            if image_data.startswith('data:'):
                header, encoded = image_data.split(',', 1)
                content_type = header.split(':')[1].split(';')[0]
                extension = content_type.split('/')[-1]
            else:
                encoded = image_data
                extension = 'jpg'
            
            # Decode base64
            image_bytes = base64.b64decode(encoded)
            
            # Create filename
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"{group_id}_{timestamp}.{extension}"
            filepath = os.path.join(self.images_dir, filename)
            
            # Save to file
            with open(filepath, 'wb') as f:
                f.write(image_bytes)
            
            # Return relative URL
            return f"/fallback_data/images/{filename}"
            
        except Exception as e:
            print(f"Error saving image: {e}")
            return None

    def save_group_with_extracted_image(self, group_data, extracted_info):
        """Save group data to JSON file"""
        try:
            # Generate unique group ID
            group_id = str(uuid.uuid4())
            
            # Save image if available
            image_url = None
            if extracted_info.get('image'):
                image_url = self.save_group_image_to_storage(
                    extracted_info['image'], 
                    group_id
                )
            
            # Prepare group document
            group_doc = {
                'id': group_id,
                'title': extracted_info.get('title') or group_data.get('title', 'Untitled Group'),
                'description': extracted_info.get('description') or group_data.get('description', ''),
                'link': group_data.get('link', ''),
                'category': group_data.get('category', 'Uncategorized'),
                'country': group_data.get('country', 'Global'),
                'image': image_url or '/favicon-96x96.png',
                'views': 0,
                'timestamp': datetime.now().isoformat(),
                'created_at': datetime.now().isoformat(),
                'image_extracted': bool(image_url)
            }
            
            # Load existing groups
            with open(self.groups_file, 'r') as f:
                groups = json.load(f)
            
            # Add new group
            groups.append(group_doc)
            
            # Save back to file
            with open(self.groups_file, 'w') as f:
                json.dump(groups, f, indent=2)
            
            return {
                'success': True,
                'group_id': group_id,
                'image_url': image_url
            }
            
        except Exception as e:
            print(f"Error saving group: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def update_group_with_image(self, group_id, image_url, additional_data=None):
        """Update group with new image URL"""
        try:
            # Load existing groups
            with open(self.groups_file, 'r') as f:
                groups = json.load(f)
            
            # Find and update group
            for group in groups:
                if group['id'] == group_id:
                    group['image'] = image_url
                    group['image_updated_at'] = datetime.now().isoformat()
                    
                    if additional_data:
                        group.update(additional_data)
                    
                    break
            
            # Save back to file
            with open(self.groups_file, 'w') as f:
                json.dump(groups, f, indent=2)
            
            return True
            
        except Exception as e:
            print(f"Error updating group: {e}")
            return False