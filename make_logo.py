import subprocess
import os

svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 100" width="1040" height="200">
  <defs>
    <linearGradient id="cmcBlue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00338D"/>
      <stop offset="100%" stop-color="#0055B8"/>
    </linearGradient>
    <linearGradient id="cmcRed" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#C8102E"/>
      <stop offset="100%" stop-color="#E4002B"/>
    </linearGradient>
  </defs>

  <!-- CMC Cross Emblem -->
  <g transform="translate(15, 12)">
    <!-- Blue Vertical Ring / Arch -->
    <path d="M 38 6 C 20 6 6 20 6 38 C 6 56 20 70 38 70 C 56 70 70 56 70 38 C 70 20 56 6 38 6 Z M 38 18 C 49 18 58 27 58 38 C 58 49 49 58 38 58 C 27 58 18 49 18 38 C 18 27 27 18 38 18 Z" fill="url(#cmcBlue)"/>
    <!-- Red Central Cross -->
    <path d="M 32 12 L 44 12 L 44 32 L 64 32 L 64 44 L 44 44 L 44 64 L 32 64 L 32 44 L 12 44 L 12 32 L 32 32 Z" fill="url(#cmcRed)"/>
    <!-- Center Accent Star/Circle -->
    <circle cx="38" cy="38" r="5" fill="#FFFFFF"/>
  </g>

  <!-- Hospital Title Typography -->
  <g font-family="'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans CJK KR', sans-serif">
    <!-- Top Small Institution Name -->
    <text x="102" y="36" font-size="20" font-weight="600" fill="#00338D" letter-spacing="-0.5">가톨릭대학교</text>
    <!-- Main Hospital Name -->
    <text x="102" y="68" font-size="32" font-weight="800" fill="#111827" letter-spacing="-1">은평성모병원</text>
    <!-- English Name -->
    <text x="102" y="86" font-size="12" font-weight="500" fill="#6B7280" letter-spacing="0.2">THE CATHOLIC UNIVERSITY OF KOREA EUNPYEONG ST. MARY'S HOSPITAL</text>
  </g>
</svg>'''

svg_white_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 100" width="1040" height="200">
  <defs>
    <linearGradient id="cmcBlueW" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#0284C7"/>
    </linearGradient>
    <linearGradient id="cmcRedW" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F43F5E"/>
      <stop offset="100%" stop-color="#E11D48"/>
    </linearGradient>
  </defs>

  <g transform="translate(15, 12)">
    <path d="M 38 6 C 20 6 6 20 6 38 C 6 56 20 70 38 70 C 56 70 70 56 70 38 C 70 20 56 6 38 6 Z M 38 18 C 49 18 58 27 58 38 C 58 49 49 58 38 58 C 27 58 18 49 18 38 C 18 27 27 18 38 18 Z" fill="url(#cmcBlueW)"/>
    <path d="M 32 12 L 44 12 L 44 32 L 64 32 L 64 44 L 44 44 L 44 64 L 32 64 L 32 44 L 12 44 L 12 32 L 32 32 Z" fill="url(#cmcRedW)"/>
    <circle cx="38" cy="38" r="5" fill="#0F172A"/>
  </g>

  <g font-family="'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans CJK KR', sans-serif">
    <text x="102" y="36" font-size="20" font-weight="600" fill="#38BDF8" letter-spacing="-0.5">가톨릭대학교</text>
    <text x="102" y="68" font-size="32" font-weight="800" fill="#F8FAFC" letter-spacing="-1">은평성모병원</text>
    <text x="102" y="86" font-size="12" font-weight="500" fill="#94A3B8" letter-spacing="0.2">THE CATHOLIC UNIVERSITY OF KOREA EUNPYEONG ST. MARY'S HOSPITAL</text>
  </g>
</svg>'''

with open('public/brand/eph-logo.svg', 'w', encoding='utf-8') as f:
    f.write(svg_content)

with open('public/brand/eph-logo-white.svg', 'w', encoding='utf-8') as f:
    f.write(svg_white_content)

subprocess.run(['convert', '-background', 'none', 'public/brand/eph-logo.svg', 'public/brand/eph-logo.png'])
subprocess.run(['convert', '-background', 'none', 'public/brand/eph-logo-white.svg', 'public/brand/eph-logo-white.png'])

print('Logo files created successfully!')
