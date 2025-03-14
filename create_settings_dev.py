"""
Script to check and fix Django settings for development.
"""
import os
import re

def ensure_static_root_setting():
    """Ensure STATIC_ROOT is properly set in Django settings."""
    settings_path = os.path.join('backend', 'backend', 'settings.py')
    
    if not os.path.exists(settings_path):
        print(f"Cannot find Django settings at {settings_path}")
        return False
    
    with open(settings_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if STATIC_ROOT is already defined
    if 'STATIC_ROOT' in content:
        print("STATIC_ROOT already defined in settings.")
        return True
    
    # Find where to insert STATIC_ROOT
    static_url_match = re.search(r'STATIC_URL\s*=\s*[\'"].*[\'"]', content)
    if not static_url_match:
        print("Could not find STATIC_URL setting to insert STATIC_ROOT after it.")
        return False
    
    # Insert STATIC_ROOT after STATIC_URL
    static_url_end = static_url_match.end()
    new_content = (
        content[:static_url_end] + 
        "\nSTATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')\n" + 
        content[static_url_end:]
    )
    
    # Write the updated content back
    with open(settings_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print("Added STATIC_ROOT setting to Django settings.")
    return True

def check_media_root():
    """Ensure MEDIA_ROOT is properly set in Django settings."""
    settings_path = os.path.join('backend', 'backend', 'settings.py')
    
    if not os.path.exists(settings_path):
        return False
    
    with open(settings_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if MEDIA_ROOT is already defined
    if 'MEDIA_ROOT' not in content:
        # Find where to insert MEDIA_ROOT
        static_root_match = re.search(r'STATIC_ROOT\s*=\s*.*', content)
        if static_root_match:
            # Insert MEDIA_ROOT after STATIC_ROOT
            static_root_end = static_root_match.end()
            new_content = (
                content[:static_root_end] + 
                "\nMEDIA_ROOT = os.path.join(BASE_DIR, 'media')" +
                "\nMEDIA_URL = '/media/'\n" + 
                content[static_root_end:]
            )
            
            # Write the updated content back
            with open(settings_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            print("Added MEDIA_ROOT and MEDIA_URL settings to Django settings.")
    else:
        print("MEDIA_ROOT already defined in settings.")
    
    return True

if __name__ == "__main__":
    print("Checking Django settings...")
    ensure_static_root_setting()
    check_media_root()
    print("Done checking settings.")
