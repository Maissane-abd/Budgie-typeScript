export type Id = string | number;
export type Numeric = string | number;

export interface Account {
  id: Id;
  account_name: string;
  description: string | null;
  balance: Numeric;
  annual_interest_rate: Numeric | null;
  tax_rate: Numeric | null;
  created_on: string;
  currency?: string;
  forecasted_balance?: Numeric;
}

export interface AccountForm {
  id?: Id;
  account_name: string;
  description: string;
  balance: Numeric;
  annual_interest_rate: Numeric;
  tax_rate: Numeric;
  created_on: string;
}

export interface TransactionForm {
  id?: Id | null;
  transaction_name: string;
  amount: Numeric | null;
  account_id: Id | null;
  duration_type: string;
  start_date: string;
  end_date: string | null;
  interval_unit?: string | null;
  interval_count?: number | null;
  description?: string;
}

export interface Transaction extends TransactionForm {
  id: Id;
  account_id: Id;
  amount: Numeric;
  account_name?: string;
}

export interface RevenueFilters {
  account: string;
  period: string;
  type: string;
  search: string;
}

export interface MonthlyDetail {
  month: string;
  income: number;
  expense: number;
  interest: number;
  balance: number;
}

export interface AccountForecast {
  account_id: Id;
  account_name: string;
  starting_balance: number;
  forecasted_balance: number;
  monthly_details: MonthlyDetail[];
}

export interface Forecast {
  accounts: AccountForecast[];
}

export interface ApiError {
  error?: string;
  message?: string;
  limitReached?: boolean;
}

export type ListResponse<T> = T[] | { data: T[] };
