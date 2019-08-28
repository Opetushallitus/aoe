export interface KeyValue<K, V> {
  key: K;
  value: V;
}

export interface EducationLevel {
  key: string;
  value: string;
  children: Children[];
}

export interface Children {
  key: string;
  value: string;
}
