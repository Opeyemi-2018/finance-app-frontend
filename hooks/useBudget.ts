import { apiClient } from "@/lib/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface BudgetResponse {
  id: number;
  category: string;
  limitAmount: number;
  spentAmount: number;
  remaining: number;
  percentageUsed: number;
  month: string;
}

interface TransactionResponse {
  id: number;
  amount: number;
  description: string;
  category: string;
  status: string;
  declineReason: string | null;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface CreateBudgetPayload {
  category: string;
  limitAmount: number;
}

interface UpdateBudgetPayload {
  limitAmount: number;
}

interface PayPayload {
  amount: number;
  description: string;
  category: string;
  cardNumber: string;   // ← add
  cvv: string;          // ← add
  expiryDate: string;   // ← add
}

const useBudget = () => {
  const queryClient = useQueryClient();

  // ── Fetch budgets ─────────────────────────────────────────
  const budgetQuery = useQuery({
    queryKey: ["budgets"],
    queryFn: () => apiClient<ApiResponse<BudgetResponse[]>>("api/budget"),
  });

  // ── Create budget ─────────────────────────────────────────
  const createBudget = useMutation({
    mutationFn: (payload: CreateBudgetPayload) =>
      apiClient<ApiResponse<BudgetResponse>>("api/budget", {
        method: "POST",
        body: payload,
      }),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // ── Update budget ─────────────────────────────────────────
  const updateBudget = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateBudgetPayload }) =>
      apiClient<ApiResponse<BudgetResponse>>(`api/budget/${id}`, {
        method: "PUT",
        body: payload,
      }),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // ── Delete budget ─────────────────────────────────────────
  const deleteBudget = useMutation({
    mutationFn: (id: number) =>
      apiClient<ApiResponse<void>>(`api/budget/${id}`, { method: "DELETE" }),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // ── Make a payment ────────────────────────────────────────
  const pay = useMutation({
    mutationFn: (payload: PayPayload) =>
      apiClient<ApiResponse<TransactionResponse>>("api/transaction/pay", {
        method: "POST",
        body: payload,
      }),
    onSuccess: (data) => {
      toast.success(data.message);
      // Refetch budgets — spentAmount changed
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      // Refetch transactions for all categories
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // ── Get latest 3 transactions per category ────────────────
  const useLatestByCategory = (category: string) =>
    useQuery({
      queryKey: ["transactions", category],
      queryFn: () =>
        apiClient<ApiResponse<TransactionResponse[]>>(
          `api/transaction/category/${category}`
        ),
      enabled: !!category, // only fetch if category is provided
    });

  return {
    budgets: budgetQuery.data?.data ?? [],
    isLoading: budgetQuery.isLoading,
    isError: budgetQuery.isError,

    createBudget: (payload: CreateBudgetPayload, onSuccess?: () => void) =>
      createBudget.mutate(payload, { onSuccess }),
    updateBudget: (id: number, payload: UpdateBudgetPayload, onSuccess?: () => void) =>
      updateBudget.mutate({ id, payload }, { onSuccess }),
    deleteBudget: (id: number, onSuccess?: () => void) =>
      deleteBudget.mutate(id, { onSuccess }),
    pay: (payload: PayPayload, onSuccess?: () => void) =>
      pay.mutate(payload, { onSuccess }),

    isCreating: createBudget.isPending,
    isUpdating: updateBudget.isPending,
    isDeleting: deleteBudget.isPending,
    isPaying: pay.isPending,

    useLatestByCategory,
  };
};

export default useBudget;