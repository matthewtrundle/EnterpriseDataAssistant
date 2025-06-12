import { generateMockData, MockData } from './generateMockData';

let cachedData: MockData | null = null;

export function getMockData(): MockData {
  if (!cachedData) {
    cachedData = generateMockData();
  }
  return cachedData;
}

export function regenerateMockData(): MockData {
  cachedData = generateMockData();
  return cachedData;
}