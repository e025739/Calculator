import type { CalculationRequest, CalculationResult } from '../types/calculator.types';

/** Base URL from environment variable — no hardcoded addresses */
const API_URL = import.meta.env.VITE_API_URL;

/**
 * Centralized API service for all calculator HTTP calls.
 * Every server interaction goes through this file.
 */

/** Generic fetch wrapper — centralizes response handling and error parsing */
async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    const fallback = `Request failed (${response.status})`;
    let errorMessage = fallback;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.error || fallback;
    } catch {
      // Response body isn't JSON — use fallback message
    }
    throw new Error(errorMessage);
  }

  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

/** Sends a calculation request and returns the result */
export async function calculate(request: CalculationRequest): Promise<CalculationResult> {
  return fetchApi<CalculationResult>(`${API_URL}/api/calculator/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
}

/** Retrieves the current memory value from the server */
export async function getMemory(): Promise<number> {
  return fetchApi<number>(`${API_URL}/api/calculator/memory`);
}

/** Adds the given value to the server-side memory */
export async function addToMemory(value: number): Promise<void> {
  await fetchApi<void>(`${API_URL}/api/calculator/memory/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value }),
  });
}

/** Subtracts the given value from the server-side memory */
export async function subtractFromMemory(value: number): Promise<void> {
  await fetchApi<void>(`${API_URL}/api/calculator/memory/subtract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value }),
  });
}

/** Clears the server-side memory value */
export async function clearMemory(): Promise<void> {
  await fetchApi<void>(`${API_URL}/api/calculator/memory/clear`, {
    method: 'POST',
  });
}
