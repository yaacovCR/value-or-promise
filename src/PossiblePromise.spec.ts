import { PossiblePromise } from './PossiblePromise';
import expect from 'expect';

describe('PossiblePromise', () => {
  it('works when instantiated with a value', () => {
    const pp = new PossiblePromise(() => 5);

    const promise = pp.getPromise();
    expect(promise).toBeUndefined;

    const value = pp.getValue();
    expect(value).toBe(5);
  });

  it('works on initial throw', () => {
    const pp = new PossiblePromise(() => {
      throw new Error('Error');
    });
    expect(() => pp.getValue()).toThrowError('Error');
  });

  it('works when instantiated with a promise', async () => {
    const pp = new PossiblePromise(() => Promise.resolve(5));

    const promise = pp.getPromise();
    expect(await promise).toBe(5);

    const value = pp.getValue();
    expect(value).toBeUndefined;
  });

  it('works when calling then on a value', () => {
    const pp = new PossiblePromise(() => 5);

    const value = pp.then((x) => x + 1).getValue();
    expect(value).toBe(6);
  });

  it('works when calling then after initial throw', () => {
    const pp = new PossiblePromise(() => {
      throw new Error('Error');
    });
    expect(() => pp.then((x) => x + 1).getValue()).toThrowError('Error');
  });
});
