from flask import Flask, request, jsonify, render_template
from group_image_extractor import GroupImageExtractor
from static_fallback_handler import StaticFallbackHandler
try:
    from firebase_image_handler import FirebaseImageHandler
    firebase_available = True
except ImportError:
    firebase_available = False
import logging
import json

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def init_api_routes(app):
    """Initialize API routes for the Flask app"""
    
    extractor = GroupImageExtractor()
    
    # Use Firebase if available, otherwise use fallback handler
    if firebase_available:
        try:
            image_handler = FirebaseImageHandler()
            logger.info("Using Firebase for image storage")
        except Exception as e:
            image_handler = StaticFallbackHandler()
            logger.warning(f"Firebase not configured ({e}), using fallback handler")
    else:
        image_handler = StaticFallbackHandler()
        logger.info("Using fallback handler for image storage")
    
    @app.route('/api/extract-group-info', methods=['POST'])
    def extract_group_info():
        """
        API endpoint to extract group information and image from WhatsApp link
        """
        try:
            data = request.get_json()
            whatsapp_url = data.get('link')
            
            if not whatsapp_url:
                return jsonify({
                    'success': False,
                    'error': 'WhatsApp URL is required'
                }), 400
            
            # Extract group information
            logger.info(f"Extracting info from: {whatsapp_url}")
            extracted_info = extractor.extract_group_info(whatsapp_url)
            
            if not extracted_info['success']:
                return jsonify({
                    'success': False,
                    'error': extracted_info.get('error', 'Failed to extract group info')
                }), 400
            
            return jsonify({
                'success': True,
                'data': {
                    'title': extracted_info.get('title'),
                    'description': extracted_info.get('description'),
                    'image': extracted_info.get('image'),
                    'has_image': bool(extracted_info.get('image'))
                }
            })
            
        except Exception as e:
            logger.error(f"Error in extract_group_info: {e}")
            return jsonify({
                'success': False,
                'error': 'Internal server error'
            }), 500
    
    @app.route('/api/submit-group', methods=['POST'])
    def submit_group():
        """
        API endpoint to submit a new group with extracted image
        """
        try:
            data = request.get_json()
            
            # Required fields
            required_fields = ['title', 'description', 'link', 'category', 'country']
            for field in required_fields:
                if not data.get(field):
                    return jsonify({
                        'success': False,
                        'error': f'{field.title()} is required'
                    }), 400
            
            # Extract group info if not already provided
            extracted_info = None
            if data.get('extract_image', True):
                logger.info(f"Extracting image for: {data['link']}")
                extracted_info = extractor.extract_group_info(data['link'])
            
            # Save group with extracted information
            result = image_handler.save_group_with_extracted_image(
                group_data=data,
                extracted_info=extracted_info or {}
            )
            
            if result['success']:
                return jsonify({
                    'success': True,
                    'message': 'Group submitted successfully',
                    'group_id': result['group_id'],
                    'image_url': result.get('image_url')
                })
            else:
                return jsonify({
                    'success': False,
                    'error': result.get('error', 'Failed to save group')
                }), 500
                
        except Exception as e:
            logger.error(f"Error in submit_group: {e}")
            return jsonify({
                'success': False,
                'error': 'Internal server error'
            }), 500
    
    @app.route('/api/update-group-image/<group_id>', methods=['POST'])
    def update_group_image(group_id):
        """
        API endpoint to update group image by re-extracting from link
        """
        try:
            data = request.get_json()
            whatsapp_url = data.get('link')
            
            if not whatsapp_url:
                return jsonify({
                    'success': False,
                    'error': 'WhatsApp URL is required'
                }), 400
            
            # Extract image
            extracted_info = extractor.extract_group_info(whatsapp_url)
            
            if extracted_info.get('image'):
                # Save image to storage
                image_url = image_handler.save_group_image_to_storage(
                    extracted_info['image'], 
                    group_id
                )
                
                if image_url:
                    # Update group document
                    success = image_handler.update_group_with_image(
                        group_id, 
                        image_url,
                        {
                            'title': extracted_info.get('title'),
                            'description': extracted_info.get('description')
                        }
                    )
                    
                    if success:
                        return jsonify({
                            'success': True,
                            'message': 'Group image updated successfully',
                            'image_url': image_url
                        })
            
            return jsonify({
                'success': False,
                'error': 'Failed to extract or save image'
            }), 400
            
        except Exception as e:
            logger.error(f"Error in update_group_image: {e}")
            return jsonify({
                'success': False,
                'error': 'Internal server error'
            }), 500
    
    @app.route('/test-extraction')
    def test_extraction():
        """
        Test page for image extraction functionality
        """
        return render_template('test_extraction.html')