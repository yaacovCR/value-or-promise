function isPromiseLike<T>(object: unknown): object is PromiseLike<T> {
  return (
    object != null && typeof (object as PromiseLike<T>).then === 'function'
  );
}

interface FulfilledState<T> {
  status: 'fulfilled';
  value: T;
}

interface RejectedState {
  status: 'rejected';
  value: unknown;
}

interface PendingState<T> {
  status: 'pending';
  value: PromiseLike<T>;
}

type State<T> = FulfilledState<T> | RejectedState | PendingState<T>;

const defaultOnRejectedFn = (reason: unknown) => {
  throw reason;
};

export class ValueOrPromise<T> {
  private readonly state: State<T>;

  constructor(executor: () => T | PromiseLike<T>) {
    let value: T | PromiseLike<T>;

    try {
      value = executor();
    } catch (reason) {
      this.state = { status: 'rejected', value: reason };
      return;
    }

    if (isPromiseLike(value)) {
      this.state = { status: 'pending', value };
      return;
    }

    this.state = { status: 'fulfilled', value };
  }

  public then<TResult1 = T, TResult2 = never>(
    onFulfilled?:
      | ((value: T) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onRejected?:
      | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null
  ): ValueOrPromise<TResult1 | TResult2> {
    const state = this.state;

    if (state.status === 'pending') {
      return new ValueOrPromise(() =>
        state.value.then(onFulfilled, onRejected)
      );
    }

    const onRejectedFn =
      typeof onRejected === 'function' ? onRejected : defaultOnRejectedFn;

    if (state.status === 'rejected') {
      return new ValueOrPromise(() => onRejectedFn(state.value));
    }

    try {
      const onFulfilledFn =
        typeof onFulfilled === 'function' ? onFulfilled : undefined;

      return onFulfilledFn === undefined
        ? new ValueOrPromise(() => state.value as unknown as TResult1)
        : new ValueOrPromise(() => onFulfilledFn(state.value as T));
    } catch (e) {
      return new ValueOrPromise(() => onRejectedFn(e));
    }
  }

  public catch<TResult = never>(
    onRejected:
      | ((reason: unknown) => TResult | PromiseLike<TResult>)
      | undefined
      | null
  ): ValueOrPromise<TResult> {
    return this.then(undefined, onRejected);
  }

  public resolve(): T | Promise<T> {
    const state = this.state;

    if (state.status === 'pending') {
      return Promise.resolve(state.value);
    }

    if (state.status === 'rejected') {
      throw state.value;
    }

    return state.value;
  }

  public static all<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(
    valueOrPromises: readonly [
      ValueOrPromise<T1>,
      ValueOrPromise<T2>,
      ValueOrPromise<T3>,
      ValueOrPromise<T4>,
      ValueOrPromise<T5>,
      ValueOrPromise<T6>,
      ValueOrPromise<T7>,
      ValueOrPromise<T8>,
      ValueOrPromise<T9>,
      ValueOrPromise<T10>
    ]
  ): ValueOrPromise<[T1, T2, T3, T4, T5, T6, T7, T8, T9, T10]>;
  public static all<T1, T2, T3, T4, T5, T6, T7, T8, T9>(
    valueOrPromises: readonly [
      ValueOrPromise<T1>,
      ValueOrPromise<T2>,
      ValueOrPromise<T3>,
      ValueOrPromise<T4>,
      ValueOrPromise<T5>,
      ValueOrPromise<T6>,
      ValueOrPromise<T7>,
      ValueOrPromise<T8>,
      ValueOrPromise<T9>
    ]
  ): ValueOrPromise<[T1, T2, T3, T4, T5, T6, T7, T8, T9]>;
  public static all<T1, T2, T3, T4, T5, T6, T7, T8>(
    valueOrPromises: readonly [
      ValueOrPromise<T1>,
      ValueOrPromise<T2>,
      ValueOrPromise<T3>,
      ValueOrPromise<T4>,
      ValueOrPromise<T5>,
      ValueOrPromise<T6>,
      ValueOrPromise<T7>,
      ValueOrPromise<T8>
    ]
  ): ValueOrPromise<[T1, T2, T3, T4, T5, T6, T7, T8]>;
  public static all<T1, T2, T3, T4, T5, T6, T7>(
    valueOrPromises: readonly [
      ValueOrPromise<T1>,
      ValueOrPromise<T2>,
      ValueOrPromise<T3>,
      ValueOrPromise<T4>,
      ValueOrPromise<T5>,
      ValueOrPromise<T6>,
      ValueOrPromise<T7>
    ]
  ): ValueOrPromise<[T1, T2, T3, T4, T5, T6, T7]>;
  public static all<T1, T2, T3, T4, T5, T6>(
    valueOrPromises: readonly [
      ValueOrPromise<T1>,
      ValueOrPromise<T2>,
      ValueOrPromise<T3>,
      ValueOrPromise<T4>,
      ValueOrPromise<T5>,
      ValueOrPromise<T6>
    ]
  ): ValueOrPromise<[T1, T2, T3, T4, T5, T6]>;
  public static all<T1, T2, T3, T4, T5>(
    valueOrPromises: readonly [
      ValueOrPromise<T1>,
      ValueOrPromise<T2>,
      ValueOrPromise<T3>,
      ValueOrPromise<T4>,
      ValueOrPromise<T5>
    ]
  ): ValueOrPromise<[T1, T2, T3, T4, T5]>;
  public static all<T1, T2, T3, T4>(
    valueOrPromises: readonly [
      ValueOrPromise<T1>,
      ValueOrPromise<T2>,
      ValueOrPromise<T3>,
      ValueOrPromise<T4>
    ]
  ): ValueOrPromise<[T1, T2, T3, T4]>;
  public static all<T1, T2, T3>(
    valueOrPromises: readonly [
      ValueOrPromise<T1>,
      ValueOrPromise<T2>,
      ValueOrPromise<T3>
    ]
  ): ValueOrPromise<[T1, T2, T3]>;
  public static all<T1, T2>(
    valueOrPromises: readonly [ValueOrPromise<T1>, ValueOrPromise<T2>]
  ): ValueOrPromise<[T1, T2]>;
  public static all<T>(
    valueOrPromises: ReadonlyArray<ValueOrPromise<T>>
  ): ValueOrPromise<Array<T>>;
  public static all<T>(
    valueOrPromises: ReadonlyArray<ValueOrPromise<T>>
  ): ValueOrPromise<Array<T>> {
    let containsPromise = false;

    const values: Array<T | PromiseLike<T>> = [];
    for (const valueOrPromise of valueOrPromises) {
      const state = valueOrPromise.state;

      if (state.status === 'rejected') {
        return new ValueOrPromise(() => {
          throw state.value;
        });
      }

      if (state.status === 'pending') {
        containsPromise = true;
      }

      values.push(state.value);
    }

    if (containsPromise) {
      return new ValueOrPromise(() => Promise.all(values));
    }

    return new ValueOrPromise(() => values as Array<T>);
  }
}
