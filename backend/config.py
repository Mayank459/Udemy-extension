"""Configuration loaded from .env file"""
from pathlib import Path

# Read .env file
env_path = Path(__file__).parent / '.env'
print(f"[Config] Looking for .env at: {env_path}")
print(f"[Config] .env exists: {env_path.exists()}")
print(f"[Config] __file__ is: {__file__}")
print(f"[Config] parent is: {Path(__file__).parent}")

config = {}

if env_path.exists():
    print(f"[Config] Reading .env file...")
    with open(env_path, 'r', encoding='utf-8-sig') as f:  # utf-8-sig strips BOM automatically
        content = f.read()
        print(f"[Config] File content ({len(content)} chars): {content[:100]}")
        for line in content.splitlines():
            line = line.strip()
            print(f"[Config] Processing line: '{line}'")
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                # Strip BOM and whitespace from key
                key_clean = key.strip().lstrip('\ufeff')
                config[key_clean] = value.strip()
                print(f"[Config] Set {key_clean} = {value.strip()[:20]}...")
else:
    print(f"[Config] .env file NOT FOUND!")

# Export the API key
HUGGINGFACE_API_KEY = config.get('HUGGINGFACE_API_KEY', '')
GROQ_API_KEY = config.get('GROQ_API_KEY', '')
OPENAI_API_KEY = config.get('OPENAI_API_KEY', '')

print(f"[Config] Final config dict: {list(config.keys())}")
print(f"[Config] Loaded HUGGINGFACE_API_KEY: {bool(HUGGINGFACE_API_KEY)}")
if HUGGINGFACE_API_KEY:
    print(f"[Config] Key preview: {HUGGINGFACE_API_KEY[:20]}...")
