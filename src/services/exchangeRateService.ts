
export interface ExchangeRateResponse {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

export const fetchExchangeRate = async (date: string, from: string = 'USD', to: string = 'IDR'): Promise<number | null> => {
  try {
    // Try Frankfurter API (supports historical dates)
    const response = await fetch(`https://api.frankfurter.app/${date}?from=${from}&to=${to}`);
    if (response.ok) {
      const data: ExchangeRateResponse = await response.json();
      return data.rates[to] || null;
    }

    // Fallback 1: Frankfurter Latest
    const latestResponse = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`);
    if (latestResponse.ok) {
      const latestData: ExchangeRateResponse = await latestResponse.json();
      return latestData.rates[to] || null;
    }

    // Fallback 2: ExchangeRate-API (Free tier, latest only)
    const erResponse = await fetch(`https://open.er-api.com/v6/latest/${from}`);
    if (erResponse.ok) {
      const erData = await erResponse.json();
      return erData.rates[to] || null;
    }
    
    return null;
  } catch (error) {
    console.warn('Network error while fetching exchange rate, trying secondary fallback:', error);
    
    try {
      // Last ditch effort: Secondary API if Frankfurter is blocked/down
      const erResponse = await fetch(`https://open.er-api.com/v6/latest/${from}`);
      if (erResponse.ok) {
        const erData = await erResponse.json();
        return erData.rates[to] || null;
      }
    } catch (e) {
      console.error('All exchange rate APIs failed:', e);
    }
    
    return null;
  }
};
