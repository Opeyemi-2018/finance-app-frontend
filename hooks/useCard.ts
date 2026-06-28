import { apiClient } from "@/lib/apiClient";
import { CardResponse } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { toast } from "sonner";

const useCard = () => {
  const queryClient = useQueryClient();
  const cardQuery = useQuery({
    queryKey: ["card"],
    queryFn: () => apiClient<CardResponse>("api/card"),
  });

  const freezeCard = useMutation({
    mutationFn: () =>
      apiClient<CardResponse>("api/freeze/card", { method: "PATCH" }),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["card"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const unFreezeCard = useMutation({
    mutationFn: () =>
      apiClient<CardResponse>("api/unfreeze/card", { method: "PATCH" }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["card"] });
      toast.success(data.message);
    },
    onError: (err) => toast.error(err.message),
  });

  const toggleFreeze = () => {
    const status = cardQuery.data?.data.status;
    if (status === "FROZEN") unFreezeCard.mutate();
    else freezeCard.mutate();
  };

  return {
    card: cardQuery.data?.data,
    isLoading: cardQuery.isLoading,
    isError: cardQuery.isError,
    toggleFreeze,
    isFreezeLoading: freezeCard.isPending || unFreezeCard.isPending,
  };
};

export default useCard;
