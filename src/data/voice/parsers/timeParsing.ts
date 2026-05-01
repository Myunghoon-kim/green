/**
 * 음성 텍스트에서 절대/상대 시간을 추출.
 *
 * 반환:
 *   - timestamp: 추출된 epoch ms (없으면 undefined)
 *   - residual:  시간 표현이 제거된 잔여 텍스트 — 후속 파서가 "분"(duration) 와
 *                "시 N분" 의 분 부분을 혼동하지 않도록.
 *
 * 한국어 패턴:
 *   - "오전/오후/아침/저녁/새벽/밤 N시 (M분)"
 *   - "N시 M분"
 *   - "N시"
 *   - "N분 전"
 *   - "N시간 전"
 *   - "방금" / "지금"
 *
 * 영어 패턴:
 *   - "at H(:MM)? am/pm"
 *   - "H(:MM)? am/pm"
 *   - "N minutes ago"
 *   - "N hours ago"
 */

export type TimeExtractResult = {
  timestamp?: number;
  residual: string;
};

const KO_PERIOD_AM = ['오전', '아침', '새벽'] as const;
const KO_PERIOD_PM = ['오후', '저녁', '밤'] as const;

/** 1~12 시각을 period(AM/PM)/now 컨텍스트로 24시간제 시간으로 변환. */
const resolveHour = (parsedHour: number, period: 'am' | 'pm' | null, now: Date): number => {
  if (parsedHour < 0 || parsedHour > 23) return 0;
  if (parsedHour > 12) return parsedHour; // 이미 24h 표기
  if (period === 'am') return parsedHour === 12 ? 0 : parsedHour;
  if (period === 'pm') return parsedHour === 12 ? 12 : parsedHour + 12;
  // bare: 정오 컨벤션 적용 — "12시" → 12 (정오), 1~11 → 현재 시각의 AM/PM 따라.
  if (parsedHour === 12) return 12;
  return now.getHours() >= 12 ? parsedHour + 12 : parsedHour;
};

/** 주어진 시/분으로 오늘 날짜에 대한 timestamp 생성. */
const todayAt = (hour: number, minute: number, now: Date): number => {
  const d = new Date(now);
  d.setHours(hour, minute, 0, 0);
  return d.getTime();
};

/**
 * 한국어 시간 표현 추출. 매칭된 부분 문자열은 잔여 텍스트에서 제거.
 */
export const extractKoreanTime = (text: string, now: Date = new Date()): TimeExtractResult => {
  let residual = text;

  // 1) 상대 시간 — "방금" / "지금" / "조금 전"
  const justNow = residual.match(/방금|지금|조금\s*전/);
  if (justNow) {
    return { timestamp: now.getTime(), residual: residual.replace(justNow[0], ' ') };
  }

  // 2) "N분 전" / "N시간 전"
  const minutesAgo = residual.match(/(\d+)\s*분\s*전/);
  if (minutesAgo?.[1]) {
    const m = parseInt(minutesAgo[1], 10);
    return {
      timestamp: now.getTime() - m * 60_000,
      residual: residual.replace(minutesAgo[0], ' '),
    };
  }
  const hoursAgo = residual.match(/(\d+)\s*시간\s*전/);
  if (hoursAgo?.[1]) {
    const h = parseInt(hoursAgo[1], 10);
    return {
      timestamp: now.getTime() - h * 3_600_000,
      residual: residual.replace(hoursAgo[0], ' '),
    };
  }

  // 3) 절대 시간 — "오전/오후/아침/저녁 N시 (M분)?"
  const periodPattern = new RegExp(
    `(${[...KO_PERIOD_AM, ...KO_PERIOD_PM].join('|')})\\s*(\\d{1,2})\\s*시(?:\\s*(\\d{1,2})\\s*분)?`,
  );
  const periodMatch = residual.match(periodPattern);
  if (periodMatch) {
    const periodWord = periodMatch[1] as string;
    const hour = parseInt(periodMatch[2]!, 10);
    const minute = periodMatch[3] ? parseInt(periodMatch[3], 10) : 0;
    const period: 'am' | 'pm' = (KO_PERIOD_AM as readonly string[]).includes(periodWord)
      ? 'am'
      : 'pm';
    return {
      timestamp: todayAt(resolveHour(hour, period, now), minute, now),
      residual: residual.replace(periodMatch[0], ' '),
    };
  }

  // 4) "N시 M분" — bare hour with minutes
  const hourMinuteMatch = residual.match(/(\d{1,2})\s*시\s*(\d{1,2})\s*분/);
  if (hourMinuteMatch?.[1] && hourMinuteMatch[2]) {
    const hour = parseInt(hourMinuteMatch[1], 10);
    const minute = parseInt(hourMinuteMatch[2], 10);
    return {
      timestamp: todayAt(resolveHour(hour, null, now), minute, now),
      residual: residual.replace(hourMinuteMatch[0], ' '),
    };
  }

  // 5) "N시" — bare hour only
  const hourOnlyMatch = residual.match(/(\d{1,2})\s*시(?!간)/);
  if (hourOnlyMatch?.[1]) {
    const hour = parseInt(hourOnlyMatch[1], 10);
    return {
      timestamp: todayAt(resolveHour(hour, null, now), 0, now),
      residual: residual.replace(hourOnlyMatch[0], ' '),
    };
  }

  return { residual };
};

/**
 * 영어 시간 표현 추출.
 */
export const extractEnglishTime = (text: string, now: Date = new Date()): TimeExtractResult => {
  let residual = text;

  // "just now"
  if (/\bjust\s*now\b/i.test(residual)) {
    return { timestamp: now.getTime(), residual: residual.replace(/\bjust\s*now\b/i, ' ') };
  }

  // "N minutes ago"
  const minutesAgo = residual.match(/(\d+)\s*(?:min|minutes?|mins)\s*ago/i);
  if (minutesAgo?.[1]) {
    const m = parseInt(minutesAgo[1], 10);
    return {
      timestamp: now.getTime() - m * 60_000,
      residual: residual.replace(minutesAgo[0], ' '),
    };
  }

  // "N hours ago"
  const hoursAgo = residual.match(/(\d+)\s*(?:h|hr|hour|hours)\s*ago/i);
  if (hoursAgo?.[1]) {
    const h = parseInt(hoursAgo[1], 10);
    return {
      timestamp: now.getTime() - h * 3_600_000,
      residual: residual.replace(hoursAgo[0], ' '),
    };
  }

  // "(at) H(:MM)? am/pm"
  const ampmMatch = residual.match(/(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)/i);
  if (ampmMatch?.[1] && ampmMatch[3]) {
    const hour = parseInt(ampmMatch[1], 10);
    const minute = ampmMatch[2] ? parseInt(ampmMatch[2], 10) : 0;
    const period = /^p/i.test(ampmMatch[3]) ? 'pm' : 'am';
    return {
      timestamp: todayAt(resolveHour(hour, period, now), minute, now),
      residual: residual.replace(ampmMatch[0], ' '),
    };
  }

  // "at HH:MM" — 24h
  const at24 = residual.match(/\bat\s+(\d{1,2}):(\d{2})\b/i);
  if (at24?.[1] && at24[2]) {
    const hour = parseInt(at24[1], 10);
    const minute = parseInt(at24[2], 10);
    return {
      timestamp: todayAt(resolveHour(hour, null, now), minute, now),
      residual: residual.replace(at24[0], ' '),
    };
  }

  return { residual };
};
