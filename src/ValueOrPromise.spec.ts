import { ValueOrPromise } from './ValueOrPromise';
import expect from 'expect';

describe('ValueOrPromise', () => {
  it('works when instantiated with a value', () => {
    const valueOrPromise = new ValueOrPromise(() => 5);

    const value = valueOrPromise.resolve();
    expect(value).toBe(5);
  });

  it('works on initial throw', () => {
    const valueOrPromise = new ValueOrPromise(() => {
      throw new Error('Error');
    });
    expect(() => valueOrPromise.resolve()).toThrowError('Error');
  });

  it('works when instantiated with a promise', async () => {
    const valueOrPromise = new ValueOrPromise(() => Promise.resolve(5));

    const promise = valueOrPromise.resolve();
    expect(await promise).toBe(5);
  });

  it('works when calling then on a value', () => {
    const valueOrPromise = new ValueOrPromise(() => 5);

    const value = valueOrPromise.then((x) => x + 1).resolve();
    expect(value).toBe(6);
  });

  it('works when calling then after initial throw', () => {
    const valueOrPromise = new ValueOrPromise(() => {
      throw new Error('Error');
    });
    expect(() => valueOrPromise.then((x) => x + 1).resolve()).toThrowError(
      'Error'
    );
  });
});
