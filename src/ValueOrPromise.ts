function isPromiseLike<T>(object: unknown): object is PromiseLike<T> {
  return object != null && typeof (object as Promise<T>).then === 'function';
}

interface FulfilledState<T> {
  status: 'fulfilled';
  value: T | undefined | null;
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

  constructor(executor: () => T | PromiseLike<T> | undefined | null) {
    let value: T | PromiseLike<T> | undefined | null;

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

  then<TResult1 = T, TResult2 = never>(
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
        ? new ValueOrPromise(() => (state.value as unknown) as TResult1)
        : new ValueOrPromise(() => onFulfilledFn(state.value as T));
    } catch (e) {
      return new ValueOrPromise(() => onRejectedFn(e));
    }
  }

  public getPromise(): PromiseLike<T> | undefined {
    const state = this.state;

    if (state.status === 'pending') {
      return state.value;
    }

    return undefined;
  }

  public getValue(): T | undefined | null {
    const state = this.state;

    if (state.status === 'rejected') {
      throw state.value;
    }

    if (state.status === 'fulfilled') {
      return state.value;
    }

    return undefined;
  }
}
