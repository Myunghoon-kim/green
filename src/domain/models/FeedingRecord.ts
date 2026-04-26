/**
 * 수유 기록 1건을 표현하는 도메인 엔티티.
 *
 * 불변(Immutable). 변경이 필요하면 copyWith() 로 새 인스턴스를 얻는다.
 * 저장소 직렬화는 toJSON() / fromJSON() 을 통해서만 수행한다.
 */

// Hermes(React Native)에는 crypto.getRandomValues 가 기본 제공되지 않아
// uuid v4 가 런타임에 실패한다. 로컬 저장용 식별자는 암호학적 난수가 필요 없으므로
// timestamp + Math.random 조합으로 충분한 유일성을 확보한다.
const generateId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export type FeedingSide = 'left' | 'right' | 'both';
export type FeedingSource = 'voice' | 'manual';
export type FeedingType = 'formula' | 'breast';

/** 미지정 시 기본 수유 타입. 분유 수유가 일반적이므로 formula 기본값. */
export const DEFAULT_FEEDING_TYPE: FeedingType = 'formula';

/** 저장·전달 시 사용하는 평면 데이터 구조 (직렬화 가능). */
export type FeedingRecordData = {
  id: string;
  timestamp: number;
  durationMinutes?: number;
  amountMl?: number;
  side?: FeedingSide;
  note?: string;
  source: FeedingSource;
  feedingType: FeedingType;
};

/** 생성 시 전달하는 입력. id/timestamp/source/feedingType 는 기본값 제공. */
export type FeedingRecordInput = {
  id?: string;
  timestamp?: number;
  durationMinutes?: number;
  amountMl?: number;
  side?: FeedingSide;
  note?: string;
  source?: FeedingSource;
  feedingType?: FeedingType;
};

export class FeedingRecord {
  public readonly id: string;
  public readonly timestamp: number;
  public readonly durationMinutes?: number;
  public readonly amountMl?: number;
  public readonly side?: FeedingSide;
  public readonly note?: string;
  public readonly source: FeedingSource;
  public readonly feedingType: FeedingType;

  constructor(input: FeedingRecordInput) {
    this.id = input.id ?? generateId();
    this.timestamp = input.timestamp ?? Date.now();
    this.durationMinutes = input.durationMinutes;
    this.amountMl = input.amountMl;
    this.side = input.side;
    this.note = input.note;
    this.source = input.source ?? 'manual';
    this.feedingType = input.feedingType ?? DEFAULT_FEEDING_TYPE;

    this.validate();
  }

  /** 필수 비즈니스 불변식(invariant) 검증. 생성자에서 호출. */
  private validate(): void {
    if (this.durationMinutes !== undefined && this.durationMinutes < 0) {
      throw new Error('durationMinutes must be >= 0');
    }
    if (this.amountMl !== undefined && this.amountMl < 0) {
      throw new Error('amountMl must be >= 0');
    }
    if (this.timestamp < 0) {
      throw new Error('timestamp must be a non-negative epoch ms');
    }
  }

  /** 오늘(로컬 타임존 자정 기준) 기록인가? */
  isToday(now: number = Date.now()): boolean {
    const d1 = new Date(this.timestamp);
    const d2 = new Date(now);
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  /** 부분 필드만 바꾼 새 인스턴스 반환 (불변성 유지). */
  copyWith(partial: Partial<FeedingRecordInput>): FeedingRecord {
    return new FeedingRecord({
      id: this.id,
      timestamp: this.timestamp,
      durationMinutes: this.durationMinutes,
      amountMl: this.amountMl,
      side: this.side,
      note: this.note,
      source: this.source,
      ...partial,
    });
  }

  /** 저장/전송용 직렬화. JSON.stringify 시 자동 호출됨. */
  toJSON(): FeedingRecordData {
    return {
      id: this.id,
      timestamp: this.timestamp,
      ...(this.durationMinutes !== undefined && { durationMinutes: this.durationMinutes }),
      ...(this.amountMl !== undefined && { amountMl: this.amountMl }),
      ...(this.side !== undefined && { side: this.side }),
      ...(this.note !== undefined && { note: this.note }),
      source: this.source,
      feedingType: this.feedingType,
    };
  }

  /**
   * 저장소에서 읽은 unknown 을 엔티티로 역직렬화.
   * 스키마가 깨진 데이터는 즉시 예외를 던져 상위에서 처리하게 한다.
   */
  static fromJSON(raw: unknown): FeedingRecord {
    if (typeof raw !== 'object' || raw === null) {
      throw new Error('FeedingRecord.fromJSON: raw must be an object');
    }

    const r = raw as Record<string, unknown>;

    if (typeof r.id !== 'string' || r.id.length === 0) {
      throw new Error('FeedingRecord.fromJSON: invalid id');
    }
    if (typeof r.timestamp !== 'number') {
      throw new Error('FeedingRecord.fromJSON: invalid timestamp');
    }
    if (r.source !== 'voice' && r.source !== 'manual') {
      throw new Error('FeedingRecord.fromJSON: invalid source');
    }

    return new FeedingRecord({
      id: r.id,
      timestamp: r.timestamp,
      durationMinutes: typeof r.durationMinutes === 'number' ? r.durationMinutes : undefined,
      amountMl: typeof r.amountMl === 'number' ? r.amountMl : undefined,
      side: isFeedingSide(r.side) ? r.side : undefined,
      note: typeof r.note === 'string' ? r.note : undefined,
      source: r.source,
      // 구 저장소 호환 — feedingType 이 없던 레코드는 기본값(formula)으로 복원.
      feedingType: isFeedingType(r.feedingType) ? r.feedingType : DEFAULT_FEEDING_TYPE,
    });
  }
}

const isFeedingSide = (v: unknown): v is FeedingSide =>
  v === 'left' || v === 'right' || v === 'both';

const isFeedingType = (v: unknown): v is FeedingType => v === 'formula' || v === 'breast';
