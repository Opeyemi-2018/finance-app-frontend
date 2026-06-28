import { apiClient } from "@/lib/apiClient";
import { useQuery } from "@tanstack/react-query";

interface Transaction {
  id: number;
  amount: number;
  description: string;
  category: string;
  status: string;
  declineReason: string | null;
  createdAt: string;
}

interface PagedResponse {
  transactions: Transaction[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: PagedResponse;
}

const useTransactions = ({
  page,
  size,
  search,
}: {
  page: number;
  size: number;
  search: string;
}) => {
  // Build query string
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (search.trim()) {
    params.append("search", search.trim());
  }

  const query = useQuery({
    queryKey: ["transactions", page, size, search],
    //                         ↑     ↑      ↑
    // different key for each combination — cached separately
    queryFn: () =>
      apiClient<ApiResponse>(`api/transaction?${params.toString()}`),
  });

  return {
    transactions: query.data?.data.transactions ?? [],
    currentPage: query.data?.data.currentPage ?? 0,
    totalPages: query.data?.data.totalPages ?? 0,
    totalElements: query.data?.data.totalElements ?? 0,
    size: query.data?.data.size ?? size,
    hasNext: query.data?.data.hasNext ?? false,
    hasPrevious: query.data?.data.hasPrevious ?? false,
    isLoading: query.isLoading,
    isError: query.isError,
  };
};

export default useTransactions;