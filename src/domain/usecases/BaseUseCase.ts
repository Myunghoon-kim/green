/**
 * 모든 유스케이스의 추상 기반 클래스.
 *
 * Template Method 패턴에 가까운 단순한 계약:
 *   - 입력 하나를 받아 비동기로 출력 하나를 반환한다
 *   - 예외 대신 Result 를 반환하는 유스케이스도 허용 (Output 타입으로 표현)
 */

export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export abstract class BaseUseCase<Input, Output> {
  abstract execute(input: Input): Promise<Output>;
}

/** 동기 전용 유스케이스가 필요한 경우. */
export abstract class SyncUseCase<Input, Output> {
  abstract execute(input: Input): Output;
}
