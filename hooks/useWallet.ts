import { apiClient } from "@/lib/apiClient";
import { FundWalletRequest, WalletResponse } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const useWallet = () => {
  const queryClient = useQueryClient();
  const walletQuery = useQuery({
    queryKey: ["wallet"],
    queryFn: () => apiClient<WalletResponse>("api/wallet"),
  });

  const fundWallet = useMutation({
    mutationKey: ["wallet"],
    mutationFn: (payload: FundWalletRequest) =>
      apiClient<WalletResponse>("api/wallet/fund", {
        method: "POST",
        body: payload,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      toast.success(data.message);
    },
    onError: (err: Error) => toast.error(err.message),
  });
  const fundMyWallet = (
    amount: number,
    options?: { onSuccess?: () => void },
  ) => {
    fundWallet.mutate(
      { amount },
      {
        onSuccess: () => {
          options?.onSuccess?.();
        },
      },
    );
  };
  return {
    wallet: walletQuery.data?.data,
    fundMyWallet,
    isFunding: fundWallet.isPending,
  };
};

export default useWallet;
