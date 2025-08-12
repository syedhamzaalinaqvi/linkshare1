try:
    import firebase_admin
    from firebase_admin import credentials, firestore, storage
    try:
        from google.cloud.firestore_v1.transforms import SERVER_TIMESTAMP
    except ImportError:
        from firebase_admin import firestore
        SERVER_TIMESTAMP = firestore.SERVER_TIMESTAMP
    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False
    SERVER_TIMESTAMP = None
import base64
import io
from PIL import Image
import uuid
import os
from datetime import datetime

class FirebaseImageHandler:
    def __init__(self):
        if not FIREBASE_AVAILABLE:
            raise ImportError("Firebase not available")
        
        # Initialize Firebase if not already done
        if not firebase_admin._apps:
            try:
                # Try to use service account key if available
                cred = credentials.Certificate('path/to/serviceAccountKey.json')
                firebase_admin.initialize_app(cred, {
                    'storageBucket': 'your-project-id.appspot.com'
                })
            except:
                # Fallback to default credentials - this may fail in some environments
                try:
                    firebase_admin.initialize_app()
                except Exception as e:
                    raise ImportError(f"Firebase initialization failed: {e}")
        
        try:
            self.db = firestore.client()
        except Exception as e:
            raise ImportError(f"Firestore client creation failed: {e}")
        
        try:
            self.bucket = storage.bucket()
        except:
            self.bucket = None
            print("Warning: Firebase Storage not configured")

    def save_group_image_to_storage(self, image_data, group_id):
        """
        Save base64 image data to Firebase Storage
        Returns the public URL of the uploaded image
        """
        if not self.bucket or not image_data:
            return None
        
        try:
            # Parse base64 data
            if image_data.startswith('data:'):
                # Extract the base64 part
                header, encoded = image_data.split(',', 1)
                content_type = header.split(':')[1].split(';')[0]
            else:
                encoded = image_data
                content_type = 'image/jpeg'  # default
            
            # Decode base64
            image_bytes = base64.b64decode(encoded)
            
            # Create a unique filename
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"group_images/{group_id}_{timestamp}.jpg"
            
            # Optimize image before uploading
            optimized_image_bytes = self._optimize_image(image_bytes)
            
            # Upload to Firebase Storage
            blob = self.bucket.blob(filename)
            blob.upload_from_string(
                optimized_image_bytes,
                content_type='image/jpeg'
            )
            
            # Make the blob publicly accessible
            blob.make_public()
            
            return blob.public_url
            
        except Exception as e:
            print(f"Error saving image to storage: {e}")
            return None

    def _optimize_image(self, image_bytes):
        """
        Optimize image for web display
        """
        try:
            # Open image with PIL
            img = Image.open(io.BytesIO(image_bytes))
            
            # Convert to RGB if necessary
            if img.mode in ('RGBA', 'LA', 'P'):
                rgb_img = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                rgb_img.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
                img = rgb_img
            
            # Resize if too large
            max_size = (400, 400)
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Save optimized image
            output = io.BytesIO()
            img.save(output, format='JPEG', quality=85, optimize=True)
            return output.getvalue()
            
        except Exception as e:
            print(f"Error optimizing image: {e}")
            return image_bytes

    def update_group_with_image(self, group_id, image_url, additional_data=None):
        """
        Update group document in Firestore with image URL
        """
        try:
            group_ref = self.db.collection('groups').document(group_id)
            
            update_data = {
                'image': image_url,
                'image_updated_at': SERVER_TIMESTAMP
            }
            
            # Add any additional data
            if additional_data:
                update_data.update(additional_data)
            
            group_ref.update(update_data)
            return True
            
        except Exception as e:
            print(f"Error updating group: {e}")
            return False

    def save_group_with_extracted_image(self, group_data, extracted_info):
        """
        Save a new group with extracted image and info
        """
        try:
            # Generate unique group ID
            group_id = str(uuid.uuid4())
            
            # Save image to storage if available
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
                'image': image_url or '/favicon-96x96.png',  # fallback
                'views': 0,
                'timestamp': SERVER_TIMESTAMP,
                'created_at': SERVER_TIMESTAMP,
                'image_extracted': bool(image_url)
            }
            
            # Save to Firestore
            self.db.collection('groups').document(group_id).set(group_doc)
            
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