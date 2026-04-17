// Khadan Trucks - go to khadan (sand source)
export const KHADAN_TRUCKS = [
  'RJ09GD4211',
  'RJ09GD4198',
  'RJ09GD9212',
  'MP09HH9265',
  'MP09BM5501',
  'MP09BM5006',
] as const;

// Local Trucks - take sand from stock and sell to customers
export const LOCAL_TRUCKS = [
  'MP09GE4211',
  'MP09GE4111',
  'MP09HH5412',
  'MP09HG9098',
  'MP09HH5006',
  'MP09HH5897',
  'MP09HH6866',
  'MP09HH5849',
] as const;

// Loader Tractors
export const LOADERS = [
  'MP09ZT8151',
  'MP41ZF5006',
] as const;

export const ALL_TRUCKS = [...KHADAN_TRUCKS, ...LOCAL_TRUCKS] as const;

export type KhadanTruck = typeof KHADAN_TRUCKS[number];
export type LocalTruck = typeof LOCAL_TRUCKS[number];
export type Loader = typeof LOADERS[number];
