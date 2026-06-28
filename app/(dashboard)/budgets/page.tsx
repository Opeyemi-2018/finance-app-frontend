"use client";

import React, { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { MoreHorizontal, Plus, ChevronRight, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import useBudget from "@/hooks/useBudget";

// ── Category config ───────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  FOOD_AND_DINING: "#82C9D7",
  ENTERTAINMENT: "#277C78",
  BILLS: "#F2CDAC",
  PERSONAL_CARE: "#626070",
  TRANSPORT: "#C94736",
  SHOPPING: "#93674F",
  HEALTH: "#934F6F",
  EDUCATION: "#3F82B2",
  OTHERS: "#97A0AC",
};

const CATEGORY_LABELS: Record<string, string> = {
  FOOD_AND_DINING: "Food & Dining",
  ENTERTAINMENT: "Entertainment",
  BILLS: "Bills",
  PERSONAL_CARE: "Personal Care",
  TRANSPORT: "Transport",
  SHOPPING: "Shopping",
  HEALTH: "Health",
  EDUCATION: "Education",
  OTHERS: "Others",
};

const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS);

// ── Format date ───────────────────────────────────────────
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// ── Skeleton ──────────────────────────────────────────────
const BudgetSkeleton = () => (
  <div className="flex gap-6 items-start">
    <div className="w-[340px] shrink-0 bg-white rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-center">
        <Skeleton className="w-[200px] h-[200px] rounded-full" />
      </div>
      <Skeleton className="h-5 w-40" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="w-1 h-5 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-28" />
          </div>
        ))}
      </div>
    </div>
    <div className="flex-1 space-y-5">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="w-3 h-3 rounded-full" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="w-5 h-5 rounded" />
          </div>
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-8 w-full rounded-lg" />
          <div className="flex gap-6">
            {[1, 2].map((j) => (
              <div key={j} className="flex items-center gap-2">
                <Skeleton className="w-1 h-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-10" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
          <div className="bg-[#F8F4EF] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-12" />
            </div>
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ── Add Budget Modal ──────────────────────────────────────
const AddBudgetModal = ({
  open,
  onClose,
  onSubmit,
  isLoading,
  usedCategories,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (category: string, limit: number) => void;
  isLoading: boolean;
  usedCategories: string[];
}) => {
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");

  const availableCategories = ALL_CATEGORIES.filter(
    (c) => !usedCategories.includes(c),
  );

  const handleSubmit = () => {
    if (!category || !limit) return;
    onSubmit(category, parseFloat(limit));
  };

  const handleClose = () => {
    setCategory("");
    setLimit("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Add New Budget
          </DialogTitle>
          <DialogDescription>
            Choose a category to set a spending budget.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Budget Category</Label>
            <Select onValueChange={setCategory} value={category}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                      />
                      {CATEGORY_LABELS[cat]}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Maximum Spending</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                $
              </span>
              <Input
                className="pl-7"
                type="number"
                placeholder="e.g. 2000"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
              />
            </div>
          </div>
          <Button
            className="w-full bg-[#201F24] text-white hover:bg-[#2d2d3a]"
            onClick={handleSubmit}
            disabled={isLoading || !category || !limit}
          >
            {isLoading ? "Adding..." : "Add Budget"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ── Edit Budget Modal ─────────────────────────────────────
const EditBudgetModal = ({
  open,
  onClose,
  onSubmit,
  isLoading,
  currentLimit,
  category,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (limit: number) => void;
  isLoading: boolean;
  currentLimit: number;
  category: string;
}) => {
  const [limit, setLimit] = useState(currentLimit.toString());

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Edit {CATEGORY_LABELS[category]} Budget
          </DialogTitle>
          <DialogDescription>
            Update the maximum spending limit for this category.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Maximum Spending</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                $
              </span>
              <Input
                className="pl-7"
                type="number"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
              />
            </div>
          </div>
          <Button
            className="w-full bg-[#201F24] text-white hover:bg-[#2d2d3a]"
            onClick={() => onSubmit(parseFloat(limit))}
            disabled={isLoading || !limit}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ── Delete Warning Modal ──────────────────────────────────
const DeleteBudgetModal = ({
  open,
  onClose,
  onConfirm,
  isLoading,
  category,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  category: string;
}) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold">
          Delete &quot;{CATEGORY_LABELS[category]}&quot; Budget?
        </DialogTitle>
        <DialogDescription className="text-sm text-gray-500 mt-2">
          Are you sure you want to delete this budget? This action cannot be
          reversed and all the data inside it will be removed forever.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="flex flex-col gap-3 mt-4 sm:flex-col">
        <Button
          className="w-full bg-red-600 text-white hover:bg-red-700"
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? "Deleting..." : "Yes, Confirm Deletion"}
        </Button>
        <Button
          className="w-full"
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
        >
          No, Go Back
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// ── Pay Modal ─────────────────────────────────────────────
const PayModal = ({
  open,
  onClose,
  onSubmit,
  isLoading,
  category,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    amount: number,
    description: string,
    cardNumber: string,
    cvv: string,
    expiryDate: string,
  ) => void;
  isLoading: boolean;
  category: string;
}) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const handleSubmit = () => {
    if (!amount || !description || !cardNumber || !cvv || !expiryDate) return;
    onSubmit(parseFloat(amount), description, cardNumber, cvv, expiryDate);
  };

  const handleClose = () => {
    setAmount("");
    setDescription("");
    setCardNumber("");
    setCvv("");
    setExpiryDate("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Pay from {CATEGORY_LABELS[category]} Budget
          </DialogTitle>
          <DialogDescription>
            Enter your card details to make a payment.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {/* Card Number */}
          <div className="space-y-1.5">
            <Label>Card Number</Label>
            <Input
              placeholder="1234567890123456"
              value={cardNumber}
              maxLength={16}
              autoComplete="off" 
              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ""))}
            />
          </div>

          {/* CVV + Expiry side by side */}
          <div className="flex gap-3">
            <div className="space-y-1.5 flex-1">
              <Label>CVV</Label>
              <Input
                placeholder="489"
                value={cvv}
                maxLength={3}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <div className="space-y-1.5 flex-1">
              <Label>Expiry Date</Label>
              <Input
                placeholder="06/29"
                value={expiryDate}
                maxLength={5}
                onChange={(e) => {
                  // Auto-format MM/yy
                  let val = e.target.value.replace(/\D/g, "");
                  if (val.length >= 3) {
                    val = val.slice(0, 2) + "/" + val.slice(2, 4);
                  }
                  setExpiryDate(val);
                }}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Input
              placeholder="e.g. Rent payment, Netflix..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label>Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                $
              </span>
              <Input
                className="pl-7"
                type="number"
                placeholder="e.g. 100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <Button
            className="w-full bg-[#201F24] text-white hover:bg-[#2d2d3a]"
            onClick={handleSubmit}
            disabled={
              isLoading ||
              !amount ||
              !description ||
              !cardNumber ||
              !cvv ||
              !expiryDate
            }
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </div>
            ) : (
              "Make Payment"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ── Budget Card with latest transactions ──────────────────
const BudgetCard = ({
  b,
  onEdit,
  onDelete,
  onPay,
  isPaying,
}: {
  b: {
    id: number;
    category: string;
    limitAmount: number;
    spentAmount: number;
    remaining: number;
    percentageUsed: number;
  };
  onEdit: () => void;
  onDelete: () => void;
  onPay: () => void;
  isPaying: boolean;
}) => {
  const { useLatestByCategory } = useBudget();
  const { data: txData, isLoading: txLoading } = useLatestByCategory(
    b.category,
  );
  const transactions = txData?.data ?? [];

  const color = CATEGORY_COLORS[b.category] ?? "#97A0AC";
  const label = CATEGORY_LABELS[b.category] ?? b.category;
  const pct = Math.min(b.percentageUsed, 100);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <h3 className="text-lg font-bold text-[#201F24]">{label}</h3>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={onPay}>Make Payment</DropdownMenuItem>
            <DropdownMenuItem onSelect={onEdit}>Edit Budget</DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-500 focus:text-red-500"
              onSelect={onDelete}
            >
              Delete Budget
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="text-sm text-gray-400 mb-4">
        Maximum of ${b.limitAmount.toFixed(2)}
      </p>

      {/* Progress bar */}
      <div className="h-8 bg-[#F8F4EF] rounded-lg overflow-hidden mb-4">
        <div
          className="h-full rounded-lg transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>

      {/* Spent / Free */}
      <div className="flex gap-6 mb-6">
        <div className="flex items-center gap-2">
          <div
            className="w-1 h-8 rounded-full"
            style={{ backgroundColor: color }}
          />
          <div>
            <p className="text-xs text-gray-400">Spent</p>
            <p className="text-sm font-bold text-[#201F24]">
              ${b.spentAmount.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1 h-8 rounded-full bg-[#F8F4EF]" />
          <div>
            <p className="text-xs text-gray-400">Free</p>
            <p className="text-sm font-bold text-[#201F24]">
              ${b.remaining.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Latest Spending */}
      <div className="bg-[#F8F4EF] rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-[#201F24]">Latest Spending</p>
          <button className="flex items-center gap-1 text-xs font-medium text-[#201F24]">
            See All <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        {txLoading ? (
          // Transaction skeleton
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <div className="space-y-1 text-right">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">
            No transactions yet for this category
          </p>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx, i) => (
              <div key={tx.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Avatar circle with first letter */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: color }}
                    >
                      {tx.description.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-[#201F24]">
                      {tx.description}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-500">
                      -${tx.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(tx.createdAt)}
                    </p>
                  </div>
                </div>
                {i < transactions.length - 1 && (
                  <div className="border-b border-gray-100 mt-3" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main Budgets Page ─────────────────────────────────────
const Budgets = () => {
  const {
    budgets,
    isLoading,
    createBudget,
    updateBudget,
    deleteBudget,
    pay,
    isCreating,
    isUpdating,
    isDeleting,
    isPaying,
  } = useBudget();

  const [addOpen, setAddOpen] = useState(false);
  const [editBudget, setEditBudget] = useState<null | {
    id: number;
    category: string;
    limitAmount: number;
  }>(null);
  const [deleteBudgetItem, setDeleteBudgetItem] = useState<null | {
    id: number;
    category: string;
  }>(null);
  const [payBudget, setPayBudget] = useState<null | {
    id: number;
    category: string;
  }>(null);

  const totalLimit = budgets.reduce((sum, b) => sum + b.limitAmount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spentAmount, 0);

  const chartData = budgets.map((b) => ({
    name: CATEGORY_LABELS[b.category] ?? b.category,
    value: b.spentAmount > 0 ? b.spentAmount : b.limitAmount * 0.01,
    color: CATEGORY_COLORS[b.category] ?? "#97A0AC",
  }));

  const usedCategories = budgets.map((b) => b.category);

  return (
    <div className="">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-[26px] text-[#201F24] mb-6">Budget</h1>
        <Button
          className="bg-[#201F24] text-white hover:bg-[#2d2d3a] rounded-xl px-5"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Budget
        </Button>
      </div>

      {isLoading ? (
        <BudgetSkeleton />
      ) : (
        <div className="flex gap-6 items-start">
          {/* Left — chart + summary */}
          <div className="w-[340px] shrink-0 bg-white rounded-2xl p-6 shadow-sm">
            <div className="relative h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={
                      chartData.length
                        ? chartData
                        : [{ name: "Empty", value: 1, color: "#e5e7eb" }]
                    }
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    dataKey="value"
                    strokeWidth={2}
                  >
                    {(chartData.length
                      ? chartData
                      : [{ color: "#e5e7eb" }]
                    ).map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-3xl font-bold text-[#201F24]">
                  ${totalSpent.toFixed(2)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  of ${totalLimit.toFixed(2)} limit
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-base font-bold text-[#201F24] mb-4">
                Spending Summary
              </h3>
              {budgets.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  No budgets yet
                </p>
              ) : (
                <div className="space-y-3">
                  {budgets.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-1 h-5 rounded-full"
                          style={{
                            backgroundColor:
                              CATEGORY_COLORS[b.category] ?? "#97A0AC",
                          }}
                        />
                        <span className="text-sm text-gray-500">
                          {CATEGORY_LABELS[b.category] ?? b.category}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-[#201F24]">
                        ${b.spentAmount.toFixed(2)}{" "}
                        <span className="font-normal text-gray-400">
                          of ${b.limitAmount.toFixed(2)}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right — budget cards */}
          <div className="flex-1 space-y-5">
            {budgets.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center text-gray-400 shadow-sm">
                No budgets yet. Click &quot;Add New Budget&quot; to get started.
              </div>
            ) : (
              budgets.map((b) => (
                <BudgetCard
                  key={b.id}
                  b={b}
                  onEdit={() =>
                    setEditBudget({
                      id: b.id,
                      category: b.category,
                      limitAmount: b.limitAmount,
                    })
                  }
                  onDelete={() =>
                    setDeleteBudgetItem({ id: b.id, category: b.category })
                  }
                  onPay={() => setPayBudget({ id: b.id, category: b.category })}
                  isPaying={isPaying}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Add Modal */}
      <AddBudgetModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={(category, limit) =>
          createBudget({ category, limitAmount: limit }, () =>
            setAddOpen(false),
          )
        }
        isLoading={isCreating}
        usedCategories={usedCategories}
      />

      {/* Edit Modal */}
      {editBudget && (
        <EditBudgetModal
          open={!!editBudget}
          onClose={() => setEditBudget(null)}
          category={editBudget.category}
          currentLimit={editBudget.limitAmount}
          onSubmit={(limit) =>
            updateBudget(editBudget.id, { limitAmount: limit }, () =>
              setEditBudget(null),
            )
          }
          isLoading={isUpdating}
        />
      )}

      {/* Delete Modal */}
      {deleteBudgetItem && (
        <DeleteBudgetModal
          open={!!deleteBudgetItem}
          onClose={() => setDeleteBudgetItem(null)}
          category={deleteBudgetItem.category}
          onConfirm={() =>
            deleteBudget(deleteBudgetItem.id, () => setDeleteBudgetItem(null))
          }
          isLoading={isDeleting}
        />
      )}

      {/* Pay Modal */}
      {payBudget && (
        <PayModal
          open={!!payBudget}
          onClose={() => setPayBudget(null)}
          category={payBudget.category}
          onSubmit={(amount, description, cardNumber, cvv, expiryDate) =>
            pay(
              {
                amount,
                description,
                category: payBudget.category,
                cardNumber,
                cvv,
                expiryDate,
              },
              () => setPayBudget(null),
            )
          }
          isLoading={isPaying}
        />
      )}
    </div>
  );
};

export default Budgets;
