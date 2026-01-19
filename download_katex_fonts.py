import os
import urllib.request
from pathlib import Path

# KaTeX fonts to download
KATEX_VERSION = "0.16.9"
FONTS = [
    "KaTeX_AMS-Regular.ttf",
    "KaTeX_AMS-Regular.woff",
    "KaTeX_AMS-Regular.woff2",
    "KaTeX_Caligraphic-Bold.ttf",
    "KaTeX_Caligraphic-Bold.woff",
    "KaTeX_Caligraphic-Bold.woff2",
    "KaTeX_Caligraphic-Regular.ttf",
    "KaTeX_Caligraphic-Regular.woff",
    "KaTeX_Caligraphic-Regular.woff2",
    "KaTeX_Fraktur-Bold.ttf",
    "KaTeX_Fraktur-Bold.woff",
    "KaTeX_Fraktur-Bold.woff2",
    "KaTeX_Fraktur-Regular.ttf",
    "KaTeX_Fraktur-Regular.woff",
    "KaTeX_Fraktur-Regular.woff2",
    "KaTeX_Main-Bold.ttf",
    "KaTeX_Main-Bold.woff",
    "KaTeX_Main-Bold.woff2",
    "KaTeX_Main-BoldItalic.ttf",
    "KaTeX_Main-BoldItalic.woff",
    "KaTeX_Main-BoldItalic.woff2",
    "KaTeX_Main-Italic.ttf",
    "KaTeX_Main-Italic.woff",
    "KaTeX_Main-Italic.woff2",
    "KaTeX_Main-Regular.ttf",
    "KaTeX_Main-Regular.woff",
    "KaTeX_Main-Regular.woff2",
    "KaTeX_Math-BoldItalic.ttf",
    "KaTeX_Math-BoldItalic.woff",
    "KaTeX_Math-BoldItalic.woff2",
    "KaTeX_Math-Italic.ttf",
    "KaTeX_Math-Italic.woff",
    "KaTeX_Math-Italic.woff2",
    "KaTeX_SansSerif-Bold.ttf",
    "KaTeX_SansSerif-Bold.woff",
    "KaTeX_SansSerif-Bold.woff2",
    "KaTeX_SansSerif-Italic.ttf",
    "KaTeX_SansSerif-Italic.woff",
    "KaTeX_SansSerif-Italic.woff2",
    "KaTeX_SansSerif-Regular.ttf",
    "KaTeX_SansSerif-Regular.woff",
    "KaTeX_SansSerif-Regular.woff2",
    "KaTeX_Script-Regular.ttf",
    "KaTeX_Script-Regular.woff",
    "KaTeX_Script-Regular.woff2",
    "KaTeX_Size1-Regular.ttf",
    "KaTeX_Size1-Regular.woff",
    "KaTeX_Size1-Regular.woff2",
    "KaTeX_Size2-Regular.ttf",
    "KaTeX_Size2-Regular.woff",
    "KaTeX_Size2-Regular.woff2",
    "KaTeX_Size3-Regular.ttf",
    "KaTeX_Size3-Regular.woff",
    "KaTeX_Size3-Regular.woff2",
    "KaTeX_Size4-Regular.ttf",
    "KaTeX_Size4-Regular.woff",
    "KaTeX_Size4-Regular.woff2",
    "KaTeX_Typewriter-Regular.ttf",
    "KaTeX_Typewriter-Regular.woff",
    "KaTeX_Typewriter-Regular.woff2",
]

def download_katex_fonts():
    """Download KaTeX fonts from CDN"""
    
    # Create fonts directory
    fonts_dir = Path(__file__).parent / "extension" / "libs" / "katex" / "fonts"
    fonts_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"📁 Created directory: {fonts_dir}")
    print(f"📥 Downloading {len(FONTS)} KaTeX font files...")
    
    success_count = 0
    for font_file in FONTS:
        url = f"https://cdn.jsdelivr.net/npm/katex@{KATEX_VERSION}/dist/fonts/{font_file}"
        dest_path = fonts_dir / font_file
        
        try:
            print(f"  Downloading {font_file}...", end=" ")
            urllib.request.urlretrieve(url, dest_path)
            print("✅")
            success_count += 1
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print(f"\n✅ Downloaded {success_count}/{len(FONTS)} fonts successfully!")
    print(f"📂 Fonts saved to: {fonts_dir}")

if __name__ == "__main__":
    download_katex_fonts()
