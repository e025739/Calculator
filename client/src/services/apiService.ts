import type { CalculationRequest, CalculationResult } from '../types/calculator.types';

/// Base URL from environment variable — no hardcoded addresses
const API_URL = import.meta.env.VITE_API_URL;

/**
 * Centralized API service for all calculator HTTP calls.
 * Every server interaction goes through this file.
 */

/// Sends a calculation request and returns the result
export async function calculate(request: CalculationRequest): Promise<CalculationResult> {
  const response = await fetch(`${API_URL}/api/calculator/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Calculation failed');
  }

  return response.json();
}

/// Retrieves the current memory value from the server
export async function getMemory(): Promise<number> {
  const response = await fetch(`${API_URL}/api/calculator/memory/get`);

  if (!response.ok) {
    throw new Error('Failed to get memory');
  }

  return response.json();
}

/// Adds the given value to the server-side memory
export async function addToMemory(value: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/calculator/memory/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value }),
  });

  if (!response.ok) {
    throw new Error('Failed to add to memory');
  }
}

/// Subtracts the given value from the server-side memory
export async function subtractFromMemory(value: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/calculator/memory/subtract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value }),
  });

  if (!response.ok) {
    throw new Error('Failed to subtract from memory');
  }
}
