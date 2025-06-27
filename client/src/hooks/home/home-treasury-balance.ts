import { getWalletBalance } from '@/api/inmates';
import { env } from '@/env';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// API function to fetch treasury balance
const fetchTreasuryBalance = async (): Promise<number> => {
  try {
    const response = await getWalletBalance(env.TREASURY_WALLET_ADDRESS);
    
    // if (!response.ok) {
    //   throw new Error(`HTTP error! status: ${response.status}`);
    // }
    
    return parseFloat(response.ethBalance) || 0;
  } catch (error) {
    console.error('Error fetching treasury balance:', error);
    throw error;
  }
};

// Query key for treasury balance
export const TREASURY_BALANCE_QUERY_KEY = ['treasury-balance'] as const;

export const useTreasuryBalance = () => {
  const queryClient = useQueryClient();

  // Query for treasury balance
  const {
    data: balance = 0,
    isLoading: loading,
    error: queryError,
    refetch: fetchBalance,
  } = useQuery({
    queryKey: TREASURY_BALANCE_QUERY_KEY,
    queryFn: fetchTreasuryBalance,
    refetchInterval: 15000, // Auto-refresh every 15 seconds
    refetchIntervalInBackground: true,
    staleTime: 5000, // Consider data fresh for 5 seconds
    gcTime: 2 * 60 * 1000, // Keep in cache for 2 minutes
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  // Refresh treasury balance
  const refreshBalance = () => {
    queryClient.invalidateQueries({ queryKey: TREASURY_BALANCE_QUERY_KEY });
  };

  // Error handling
  const error = queryError ? (queryError as Error).message : null;

  return { 
    balance, 
    loading, 
    error, 
    fetchBalance, 
    refreshBalance 
  };
};