export interface CalculationRequest {
  operand1: number;
  operand2: number;
  operator: string;
}

export interface CalculationResult {
  result: number;
}

export interface MemoryRequest {
  value: number;
}

export interface ApiError {
  error: string;
}
