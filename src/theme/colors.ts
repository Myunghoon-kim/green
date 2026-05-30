/**
 * 따뜻한 톤의 공용 팔레트.
 * 그린 베이스에 크림/피치 보조색을 더해 육아 앱 특유의 부드러운 분위기.
 *
 * 모든 화면에서 이 토큰을 import 해서 사용 — 색 변경 시 한 곳만 고치면 됨.
 */

export const colors = {
  // 베이스 (배경/카드)
  background: '#FFF8F0', // 따뜻한 크림
  surface: '#FFFFFF',
  surfaceAlt: '#FBF3E7',

  // 텍스트
  text: '#2B2A26',
  textMuted: '#7A726A',
  textSubtle: '#A89E94',

  // 프라이머리 (분유/포지티브)
  primary: '#4CAF50', // 좀 더 밝고 부드러운 그린
  primaryDark: '#2E7D32',
  primarySoft: '#E8F5E9',

  // 세컨더리 (모유/엑센트)
  accent: '#EC407A',
  accentDark: '#AD1457',
  accentSoft: '#FCE4EC',

  // 보조 톤 (피치/머스타드)
  warm: '#FFB088',
  warmSoft: '#FFE7D6',

  // 시스템
  recording: '#E57373',
  recordingSoft: '#FFEBEE',
  border: '#EFE6D9',
  shadow: '#3B2A1F',
} as const;

/** 부드러운 그림자 프리셋 (RN style 객체). */
export const shadows = {
  card: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  lifted: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
} as const;

/** 일관된 모서리 반경. */
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

/** 8pt 그리드 기반 간격. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;
