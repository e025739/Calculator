export type Operator = '+' | '-' | '*' | '/';

export type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

export interface CalculationRequest {
  operands: number[];
  operators: Operator[];
}

export interface CalculationResult {
  result: number;
}
