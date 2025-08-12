#!/usr/bin/env python3
"""
Test script for image extraction functionality
"""

import sys
from group_image_extractor import GroupImageExtractor
from static_fallback_handler import StaticFallbackHandler

def test_extraction():
    """Test the image extraction with sample WhatsApp URLs"""
    
    extractor = GroupImageExtractor()
    handler = StaticFallbackHandler()
    
    # Test URLs (you can replace with real ones for testing)
    test_urls = [
        "https://chat.whatsapp.com/sample1",  # Replace with real URL
        "https://chat.whatsapp.com/sample2",  # Replace with real URL
    ]
    
    print("🔍 Testing WhatsApp Group Image Extraction")
    print("=" * 50)
    
    for i, url in enumerate(test_urls, 1):
        print(f"\n📱 Test {i}: {url}")
        print("-" * 30)
        
        # Extract group info
        result = extractor.extract_group_info(url)
        
        if result['success']:
            print(f"✅ Success!")
            print(f"   Title: {result.get('title', 'N/A')}")
            print(f"   Description: {result.get('description', 'N/A')[:100]}...")
            print(f"   Image Found: {'Yes' if result.get('image') else 'No'}")
            
            if result.get('image'):
                # Test saving with fallback handler
                test_group_data = {
                    'title': result.get('title', 'Test Group'),
                    'description': result.get('description', 'Test Description'),
                    'link': url,
                    'category': 'Testing',
                    'country': 'Global'
                }
                
                save_result = handler.save_group_with_extracted_image(
                    test_group_data, 
                    result
                )
                
                if save_result['success']:
                    print(f"   💾 Saved to: {save_result.get('image_url', 'N/A')}")
                else:
                    print(f"   ❌ Save failed: {save_result.get('error')}")
        else:
            print(f"❌ Failed: {result.get('error', 'Unknown error')}")
    
    print("\n" + "=" * 50)
    print("🎯 Test completed!")
    
    # Show saved groups
    import json
    import os
    
    groups_file = "fallback_data/groups.json"
    if os.path.exists(groups_file):
        with open(groups_file, 'r') as f:
            groups = json.load(f)
        
        print(f"\n📊 Total groups saved: {len(groups)}")
        for group in groups[-3:]:  # Show last 3
            print(f"   - {group['title']} ({group.get('image_extracted', False)})")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Test with provided URL
        url = sys.argv[1]
        extractor = GroupImageExtractor()
        result = extractor.extract_group_info(url)
        
        print(f"🔍 Testing: {url}")
        if result['success']:
            print("✅ Success!")
            for key, value in result.items():
                if key != 'image':
                    print(f"   {key}: {value}")
                else:
                    print(f"   image: {'Found' if value else 'Not found'}")
        else:
            print(f"❌ Error: {result.get('error')}")
    else:
        test_extraction()