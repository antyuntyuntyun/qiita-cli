import Calc from '../src/calc';

describe('sum test', () => {
  let c = new Calc();
  beforeEach(() => {
    c = new Calc();
  });
  it('1 + 1 = 2', () => {
    expect(c.add(1, 1)).toBe(2);
  });
  it('2 + 2 = 4', () => {
    expect(c.add(2, 2)).toBe(4);
  });
});
