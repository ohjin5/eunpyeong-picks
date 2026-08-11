import subprocess
import os

# Create directory if it doesn't exist
os.makedirs('public/brand', exist_ok=True)
os.makedirs('dist/brand', exist_ok=True)

svg_logo = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 120" width="1440" height="240">
  <defs>
    <style>
      .kor-title { font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans CJK KR', sans-serif; font-weight: 800; fill: #333333; font-size: 42px; letter-spacing: -1.5px; }
      .eng-sub { font-family: 'Arial', 'Helvetica', sans-serif; font-weight: 600; fill: #4B5563; font-size: 15px; letter-spacing: 0.3px; }
      .kor-title-w { font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans CJK KR', sans-serif; font-weight: 800; fill: #FFFFFF; font-size: 42px; letter-spacing: -1.5px; }
      .eng-sub-w { font-family: 'Arial', 'Helvetica', sans-serif; font-weight: 600; fill: #9CA3AF; font-size: 15px; letter-spacing: 0.3px; }
    </style>
  </defs>

  <!-- Left Catholic Shield Emblem -->
  <g transform="translate(10, 8)">
    <!-- Outer Shield Frame -->
    <path d="M 12 10 Q 55 2 98 10 C 104 50 100 85 55 106 C 10 85 6 50 12 10 Z" fill="#003B89"/>
    <!-- Inner White Line Shield Frame -->
    <path d="M 15 13 Q 55 6 95 13 C 100 49 96 82 55 102 C 14 82 10 49 15 13 Z" fill="none" stroke="#FFFFFF" stroke-width="2.5"/>
    
    <!-- Top Arc Text: CATHOLIC -->
    <path id="topArc" d="M 22 28 Q 55 18 88 28" fill="none"/>
    <text font-family="'Arial', sans-serif" font-weight="800" font-size="11" fill="#FFFFFF" letter-spacing="3" text-anchor="middle">
      <textPath href="#topArc" startOffset="50%">CATHOLIC</textPath>
    </text>

    <!-- Center Stylized Catholic Symbol / Cross Box -->
    <g transform="translate(24, 31)">
      <!-- White background box for center graphic -->
      <rect x="0" y="0" width="62" height="42" fill="#FFFFFF" rx="2"/>
      <!-- Internal Blue Cross & Grid details -->
      <path d="M 6 0 L 22 0 L 22 42 L 6 42 Z" fill="#003B89"/>
      <path d="M 0 10 L 62 10 L 62 20 L 0 20 Z" fill="#003B89"/>
      <path d="M 26 5 L 58 5 L 58 8 L 26 8 Z" fill="#003B89"/>
      <path d="M 26 24 L 58 24 L 58 27 L 26 27 Z" fill="#003B89"/>
      <path d="M 26 31 L 58 31 L 58 34 L 26 34 Z" fill="#003B89"/>
      <path d="M 26 37 L 58 37 L 58 40 L 26 40 Z" fill="#003B89"/>
      <circle cx="14" cy="15" r="3" fill="#FFFFFF"/>
    </g>

    <!-- Bottom Arc Text: UNIVERSITY OF KOREA -->
    <path id="bottomArc" d="M 18 80 Q 55 102 92 80" fill="none"/>
    <text font-family="'Arial', sans-serif" font-weight="700" font-size="8.5" fill="#FFFFFF" letter-spacing="0.5" text-anchor="middle">
      <textPath href="#bottomArc" startOffset="50%">UNIVERSITY OF KOREA</textPath>
    </text>
  </g>

  <!-- Hospital Text -->
  <g transform="translate(130, 0)">
    <!-- Main Korean Title -->
    <text x="0" y="58" class="kor-title">가톨릭대학교 은평성모병원</text>
    <!-- English Subtitle -->
    <text x="0" y="88" class="eng-sub">THE CATHOLIC UNIV. OF KOREA EUNPYEONG ST. MARY'S HOSPITAL</text>
  </g>
</svg>'''

svg_logo_white = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 120" width="1440" height="240">
  <defs>
    <style>
      .kor-title-w { font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans CJK KR', sans-serif; font-weight: 800; fill: #FFFFFF; font-size: 42px; letter-spacing: -1.5px; }
      .eng-sub-w { font-family: 'Arial', 'Helvetica', sans-serif; font-weight: 600; fill: #9CA3AF; font-size: 15px; letter-spacing: 0.3px; }
    </style>
  </defs>

  <!-- Left Catholic Shield Emblem -->
  <g transform="translate(10, 8)">
    <path d="M 12 10 Q 55 2 98 10 C 104 50 100 85 55 106 C 10 85 6 50 12 10 Z" fill="#1D4ED8"/>
    <path d="M 15 13 Q 55 6 95 13 C 100 49 96 82 55 102 C 14 82 10 49 15 13 Z" fill="none" stroke="#FFFFFF" stroke-width="2.5"/>
    
    <path id="topArcW" d="M 22 28 Q 55 18 88 28" fill="none"/>
    <text font-family="'Arial', sans-serif" font-weight="800" font-size="11" fill="#FFFFFF" letter-spacing="3" text-anchor="middle">
      <textPath href="#topArcW" startOffset="50%">CATHOLIC</textPath>
    </text>

    <g transform="translate(24, 31)">
      <rect x="0" y="0" width="62" height="42" fill="#FFFFFF" rx="2"/>
      <path d="M 6 0 L 22 0 L 22 42 L 6 42 Z" fill="#1D4ED8"/>
      <path d="M 0 10 L 62 10 L 62 20 L 0 20 Z" fill="#1D4ED8"/>
      <path d="M 26 5 L 58 5 L 58 8 L 26 8 Z" fill="#1D4ED8"/>
      <path d="M 26 24 L 58 24 L 58 27 L 26 27 Z" fill="#1D4ED8"/>
      <path d="M 26 31 L 58 31 L 58 34 L 26 34 Z" fill="#1D4ED8"/>
      <path d="M 26 37 L 58 37 L 58 40 L 26 40 Z" fill="#1D4ED8"/>
      <circle cx="14" cy="15" r="3" fill="#FFFFFF"/>
    </g>

    <path id="bottomArcW" d="M 18 80 Q 55 102 92 80" fill="none"/>
    <text font-family="'Arial', sans-serif" font-weight="700" font-size="8.5" fill="#FFFFFF" letter-spacing="0.5" text-anchor="middle">
      <textPath href="#bottomArcW" startOffset="50%">UNIVERSITY OF KOREA</textPath>
    </text>
  </g>

  <!-- Hospital Text -->
  <g transform="translate(130, 0)">
    <text x="0" y="58" class="kor-title-w">가톨릭대학교 은평성모병원</text>
    <text x="0" y="88" class="eng-sub-w">THE CATHOLIC UNIV. OF KOREA EUNPYEONG ST. MARY'S HOSPITAL</text>
  </g>
</svg>'''

with open('public/brand/eph-logo.svg', 'w', encoding='utf-8') as f:
    f.write(svg_logo)

with open('public/brand/eph-logo-white.svg', 'w', encoding='utf-8') as f:
    f.write(svg_logo_white)

# Render to PNG
subprocess.run(['ffmpeg', '-y', '-i', 'public/brand/eph-logo.svg', 'public/brand/eph-logo.png'])
subprocess.run(['ffmpeg', '-y', '-i', 'public/brand/eph-logo-white.svg', 'public/brand/eph-logo-white.png'])

# Also copy to dist if dist/brand exists
subprocess.run(['cp', '-r', 'public/brand', 'dist/'])

print('Rendered exact logo files successfully!')
