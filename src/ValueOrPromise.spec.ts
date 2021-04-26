import { ValueOrPromise } from './ValueOrPromise';
import expect from 'expect';

describe('ValueOrPromise', () => {
  it('works when instantiated with a value', () => {
    const valueOrPromise = new ValueOrPromise(() => 5);

    const promise = valueOrPromise.getPromise();
    expect(promise).toBeUndefined;

    const value = valueOrPromise.getValue();
    expect(value).toBe(5);
  });

  it('works on initial throw', () => {
    const valueOrPromise = new ValueOrPromise(() => {
      throw new Error('Error');
    });
    expect(() => valueOrPromise.getValue()).toThrowError('Error');
  });

  it('works when instantiated with a promise', async () => {
    const valueOrPromise = new ValueOrPromise(() => Promise.resolve(5));

    const promise = valueOrPromise.getPromise();
    expect(await promise).toBe(5);

    const value = valueOrPromise.getValue();
    expect(value).toBeUndefined;
  });

  it('works when calling then on a value', () => {
    const valueOrPromise = new ValueOrPromise(() => 5);

    const value = valueOrPromise.then((x) => x + 1).getValue();
    expect(value).toBe(6);
  });

  it('works when calling then after initial throw', () => {
    const valueOrPromise = new ValueOrPromise(() => {
      throw new Error('Error');
    });
    expect(() => valueOrPromise.then((x) => x + 1).getValue()).toThrowError(
      'Error'
    );
  });
});
