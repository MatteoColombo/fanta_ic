
export interface Transformable<T> {
    _transform(): T;
    _assimilate(origin: T): void;
  }