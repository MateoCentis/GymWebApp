# Add these lines to your settings.py (or add to existing settings.py)

import os

# Media files (uploads)
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
