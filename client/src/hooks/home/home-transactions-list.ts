import { getAllBlockchainTransactions } from '@/api/inmates';
import { useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export interface BlockchainTransaction {
  blockNumber: string;
  blockTime: string;
  transactionHash: string;
  from: string;
  to: string;
  value: string;
  valueInEth: string;
  gasPrice: string;
  isContractTransaction: boolean;
  isFromOperator: boolean;
}

export interface BlockchainTransactionsResponse {
  totalTransactions: number;
  transactions: BlockchainTransaction[];
  contractAddress: string;
  operatorAddress: string;
  latestBlock: string;
  message: string;
}

export interface TransactionFilters {
  showContractTransactions: boolean;
  showOperatorTransactions: boolean;
  minValueInEth: number;
  maxValueInEth: number;
}

// Query key for blockchain transactions
export const BLOCKCHAIN_TRANSACTIONS_QUERY_KEY = ['blockchain-transactions'] as const;

// Fetch function for TanStack Query
const fetchBlockchainTransactions = async (): Promise<BlockchainTransactionsResponse> => {
  const response = await getAllBlockchainTransactions();
  return response;
};

export const useHomeTransactionsList = () => {
  const queryClient = useQueryClient();
  
  // Query for blockchain transactions
  const {
    data: transactionsData,
    isLoading: loading,
    error: queryError,
    refetch: fetchTransactions,
  } = useQuery({
    queryKey: BLOCKCHAIN_TRANSACTIONS_QUERY_KEY,
    queryFn: fetchBlockchainTransactions,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    refetchIntervalInBackground: true,
    staleTime: 10000, // Consider data fresh for 10 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  // Extract data with fallbacks
  const transactions = transactionsData?.transactions ?? [];
  const contractAddress = transactionsData?.contractAddress ?? '';
  const operatorAddress = transactionsData?.operatorAddress ?? '';
  const latestBlock = transactionsData?.latestBlock ?? '';
  const lastUpdated = new Date();

  // Filters state
  const [filters, setFilters] = useState<TransactionFilters>({
    showContractTransactions: true,
    showOperatorTransactions: true,
    minValueInEth: 0,
    maxValueInEth: Infinity,
  });

  // Apply filters to transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Filter by transaction type
      if (filters.showContractTransactions && !filters.showOperatorTransactions) {
        if (!transaction.isContractTransaction) return false;
      }
      
      if (!filters.showContractTransactions && filters.showOperatorTransactions) {
        if (!transaction.isFromOperator) return false;
      }
      
      // Filter by value range
      const valueInEth = parseFloat(transaction.valueInEth);
      if (valueInEth < filters.minValueInEth || valueInEth > filters.maxValueInEth) {
        return false;
      }
      
      return true;
    });
  }, [transactions, filters]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<TransactionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Get transaction statistics
  const stats = useMemo(() => {
    const stats = {
      totalTransactions: transactions.length,
      totalValueInEth: 0,
      contractTransactions: 0,
      operatorTransactions: 0,
      averageValueInEth: 0,
      highestValueInEth: 0,
      lowestValueInEth: Infinity,
    };

    if (transactions.length > 0) {
      transactions.forEach(transaction => {
        const valueInEth = parseFloat(transaction.valueInEth);
        stats.totalValueInEth += valueInEth;
        
        if (transaction.isContractTransaction) {
          stats.contractTransactions++;
        }
        
        if (transaction.isFromOperator) {
          stats.operatorTransactions++;
        }
        
        if (valueInEth > stats.highestValueInEth) {
          stats.highestValueInEth = valueInEth;
        }
        
        if (valueInEth < stats.lowestValueInEth) {
          stats.lowestValueInEth = valueInEth;
        }
      });
      
      stats.averageValueInEth = stats.totalValueInEth / stats.totalTransactions;
    }

    return stats;
  }, [transactions]);

  // Get transactions by type
  const contractTransactions = useMemo(() => {
    return transactions.filter(t => t.isContractTransaction);
  }, [transactions]);

  const operatorTransactions = useMemo(() => {
    return transactions.filter(t => t.isFromOperator);
  }, [transactions]);

  // Get recent transactions (last 5)
  const recentTransactions = useMemo(() => {
    return transactions
      .sort((a, b) => parseInt(b.blockNumber) - parseInt(a.blockNumber))
      .slice(0, 5);
  }, [transactions]);

  // Get transactions by date range
  const getTransactionsByDateRange = useCallback((startDate: Date, endDate: Date) => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(parseInt(transaction.blockTime) * 1000);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }, [transactions]);

  // Search transactions
  const searchTransactions = useCallback((searchTerm: string) => {
    const term = searchTerm.toLowerCase();
    return transactions.filter(transaction => 
      transaction.transactionHash.toLowerCase().includes(term) ||
      transaction.from.toLowerCase().includes(term) ||
      transaction.to.toLowerCase().includes(term) ||
      transaction.blockNumber.includes(term)
    );
  }, [transactions]);

  // Refresh transactions
  const refreshTransactions = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: BLOCKCHAIN_TRANSACTIONS_QUERY_KEY });
  }, [queryClient]);

  // Error handling
  const error = queryError ? (queryError as Error).message : null;

  return {
    // State
    transactions,
    filteredTransactions,
    loading,
    error,
    lastUpdated,
    contractAddress,
    operatorAddress,
    latestBlock,
    filters,
    
    // Actions
    fetchTransactions,
    refreshTransactions,
    updateFilters,
    
    // Computed values
    stats,
    contractTransactions,
    operatorTransactions,
    recentTransactions,
    
    // Utility functions
    getTransactionsByDateRange,
    searchTransactions,
  };
};
