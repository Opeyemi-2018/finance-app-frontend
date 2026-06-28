/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import OverviewCard from "@/components/OverviewCard";
import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  ChevronRight,
  Loader2,
  MoreHorizontal,
  MoreVertical,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "sonner";
import useCard from "@/hooks/useCard";
import useWallet from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Link from "next/link";
import useBudget from "@/hooks/useBudget";
import useTransactions from "@/hooks/useTransactions";
import { apiClient } from "@/lib/apiClient";

const recurringBills = [
  { label: "Paid Bills", amount: 190.0, accent: "#4AA8D8" },
  { label: "Total Upcoming", amount: 194.98, accent: "#E8A97A" },
  { label: "Due Soon", amount: 59.98, accent: "#4A9E8F" },
];

const SectionHeader = ({
  title,
  href,
  linkText = "See Details",
}: {
  title: string;
  linkText?: string;
  href?: string;
}) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="font-bold text-[17px] text-[#201F24]">{title}</h2>

    {href ? (
      <Link
        href={href}
        className="flex items-center gap-1 text-sm text-[#696868] hover:text-[#201F24]"
      >
        {linkText}
        <ChevronRight className="w-4 h-4" />
      </Link>
    ) : null}
  </div>
);

const CardSection = () => {
  const [open, setOpen] = useState(false);
  const { card, isLoading, isError, toggleFreeze, isFreezeLoading } = useCard();
  const { fundMyWallet, isFunding } = useWallet();
  const [amount, setAmount] = useState<number>(0);
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [fullCardNumber, setFullCardNumber] = useState<string | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const handleFundWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      toast.error("enter a valid amount");
      return;
    }
    fundMyWallet(amount, {
      onSuccess: () => {
        setOpen(false); // 👈 close modal
        setAmount(0); // optional reset
      },
    });
  };

  const handleRevealCard = async () => {
    if (fullCardNumber) {
      setShowCardNumber(!showCardNumber);
      return;
    }

    setIsRevealing(true);
    try {
      // ✅ Use apiClient — automatically goes through proxy with token
      const data = await apiClient<{
        success: boolean;
        message: string;
        data: string;
      }>("api/card/reveal");
      setFullCardNumber(data.data);
      setShowCardNumber(true);
      setTimeout(() => setShowCardNumber(false), 30000);
    } catch {
      toast.error("Failed to reveal card number");
    } finally {
      setIsRevealing(false);
    }
  };
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <SectionHeader title="My Card" linkText="See Details" />
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-[#4A9E8F]" />
        </div>
      </div>
    );
  }

  if (isError || !card) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <SectionHeader title="My Card" linkText="See Details" />
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-sm text-red-400">Failed to load card.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-center">
        <SectionHeader title="My Card" />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <p className="cursor-pointer">fund wallet</p>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <form onSubmit={handleFundWallet}>
              <FieldGroup>
                <Field>
                  <Label htmlFor="name-1">enter the amount to be fund</Label>
                  <Input
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    id="name-1"
                    name="amount"
                    placeholder="1000"
                    className="mt-3"
                  />
                </Field>
              </FieldGroup>
              <DialogFooter>
                {/* <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose> */}
                <Button type="submit">
                  {isFunding ? <Loader2 className="animate-spin" /> : "fund"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* The Card */}
      <div
        className="relative rounded-2xl p-6 overflow-hidden flex flex-col justify-between min-h-[200px] shadow-lg"
        style={{
          background:
            "linear-gradient(135deg, #1a1a2e 0%, #2d2d44 50%, #201F24 100%)",
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -bottom-12 -left-8 w-56 h-56 rounded-full bg-white/5" />

        {/* Top row: chip + status badge */}
        <div className="flex items-start justify-between z-10">
          {/* SIM chip */}
          <div className="w-10 h-7 rounded-md bg-gradient-to-br from-yellow-300 to-yellow-500 opacity-90 grid grid-cols-2 grid-rows-2 gap-px p-1">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-yellow-600/40 rounded-sm" />
            ))}
          </div>

          {card.status === "FROZEN" ? (
            <span className="bg-white/15 text-white text-[10px] font-semibold px-3 py-1 rounded-full border border-white/10">
              {isFreezeLoading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                "❄ Frozen"
              )}
            </span>
          ) : (
            <span className="bg-white/10 text-green-400 text-[10px] font-semibold px-3 py-1 rounded-full border border-green-400/20">
              {isFreezeLoading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                "● Active"
              )}
            </span>
          )}
        </div>

        {/* Spending Limit */}
        <div className="z-10">
          <p className="text-white/40 text-[10px] uppercase tracking-[0.15em] mb-1">
            Spending Limit
          </p>
          <p className="text-white font-bold text-3xl tracking-tight">
            $
            {card.spendingLimit.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>

        {/* Bottom: card number + holder + expiry + cvv */}
        <div className="z-10 space-y-3">
          <div className="text-white/60 text-base font-mono tracking-[0.25em]">
            <div className="flex items-center justify-between">
              <p className="text-white/60 text-base font-mono tracking-[0.25em]">
                {showCardNumber && fullCardNumber
                  ? fullCardNumber.replace(/(\d{4})/g, "$1 ").trim()
                  : card.maskedCardNumber}
              </p>
              <button
                onClick={handleRevealCard}
                disabled={isRevealing}
                className="text-white/50 hover:text-white/90 text-[10px] underline transition-colors ml-2 shrink-0"
              >
                {isRevealing ? "..." : showCardNumber ? "Hide" : "Show"}
              </button>
            </div>{" "}
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-white/30 text-[9px] uppercase tracking-wider">
                Card Holder
              </p>
              <p className="text-white/90 text-xs font-medium capitalize">
                {card.cardHolderName}
              </p>
            </div>
            <div className="text-center">
              <p className="text-white/30 text-[9px] uppercase tracking-wider">
                Expires
              </p>
              <p className="text-white/90 text-xs font-mono">
                {card.expiryDate}
              </p>
            </div>
            <div className="text-right">
              <p className="text-white/30 text-[9px] uppercase tracking-wider">
                CVV
              </p>
              <p className="text-white/90 text-xs font-mono">{card.cvv}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="float-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <MoreHorizontal className="h-6 w-6 text-orange-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>action</DropdownMenuLabel>
              <DropdownMenuItem>
                <button onClick={toggleFreeze}>
                  {card?.status === "FROZEN" ? "Unfreeze Card" : "Freeze Card"}
                </button>{" "}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

const TransactionsSection = () => {
  const { transactions, isLoading } = useTransactions({
    page: 0,
    size: 5,
    search: "",
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm flex-1">
      <SectionHeader
        title="Transactions"
        linkText="View All"
        href="transactions"
      />

      {isLoading ? (
        // Skeleton
        <div className="flex flex-col gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i}>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F0EDED] animate-pulse" />
                  <div className="h-4 w-32 bg-[#F0EDED] rounded animate-pulse" />
                </div>
                <div className="space-y-1 text-right">
                  <div className="h-4 w-16 bg-[#F0EDED] rounded animate-pulse" />
                  <div className="h-3 w-20 bg-[#F0EDED] rounded animate-pulse" />
                </div>
              </div>
              {i < 5 && <div className="border-b border-[#F0EDED]" />}
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex items-center justify-center py-10">
          <p className="text-sm text-[#696868]">No transactions yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {transactions.map((tx, i) => (
            <div key={tx.id}>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  {/* Avatar circle with first letter */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{
                      backgroundColor:
                        CATEGORY_COLORS[tx.category] ?? "#97A0AC",
                    }}
                  >
                    {tx.description.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-[#201F24] text-sm">
                    {tx.description}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-red-500">
                    -${tx.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-[#696868]">
                    {formatDate(tx.createdAt)}
                  </p>
                </div>
              </div>
              {i < transactions.length - 1 && (
                <div className="border-b border-[#F0EDED]" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white shadow-md rounded-lg px-3 py-2 text-sm border border-[#F0EDED]">
        <p className="font-semibold text-[#201F24]">{payload[0].name}</p>
        <p className="text-[#696868]">${payload[0].value.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

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

const BudgetsSection = () => {
  const { budgets, isLoading } = useBudget();

  const totalSpent = budgets.reduce((sum, b) => sum + b.spentAmount, 0);
  const totalLimit = budgets.reduce((sum, b) => sum + b.limitAmount, 0);

  const chartData = budgets.map((b) => ({
    name: CATEGORY_LABELS[b.category] ?? b.category,
    amount: b.spentAmount > 0 ? b.spentAmount : b.limitAmount * 0.01,
    color: CATEGORY_COLORS[b.category] ?? "#97A0AC",
  }));

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <SectionHeader title="Budgets" href="budgets" />

      {isLoading ? (
        // Skeleton
        <div className="flex items-center gap-4">
          <div className="w-[180px] h-[180px] shrink-0 bg-[#F0EDED] rounded-full animate-pulse" />
          <div className="flex flex-col gap-3 flex-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1 h-8 rounded-full bg-[#F0EDED] animate-pulse" />
                <div className="space-y-1">
                  <div className="h-3 w-20 bg-[#F0EDED] rounded animate-pulse" />
                  <div className="h-4 w-14 bg-[#F0EDED] rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : budgets.length === 0 ? (
        // Empty state
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-sm text-[#696868]">No budgets yet.</p>
          <Link
            href="budgets"
            className="text-sm font-semibold text-[#201F24] underline mt-1"
          >
            Create one
          </Link>
        </div>
      ) : (
        // Real data
        <div className="flex items-center gap-4">
          {/* Donut chart */}
          <div className="relative w-[180px] h-[180px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="amount"
                  startAngle={90}
                  endAngle={-270}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="font-bold text-xl text-[#201F24]">
                ${totalSpent.toFixed(0)}
              </p>
              <p className="text-xs text-[#696868]">
                of ${totalLimit.toFixed(0)} limit
              </p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-3 flex-1">
            {budgets.map((b) => (
              <div key={b.id} className="flex items-center gap-2">
                <div
                  className="w-1 h-8 rounded-full shrink-0"
                  style={{
                    backgroundColor: CATEGORY_COLORS[b.category] ?? "#97A0AC",
                  }}
                />
                <div>
                  <p className="text-xs text-[#696868] leading-tight">
                    {CATEGORY_LABELS[b.category] ?? b.category}
                  </p>
                  <p className="font-bold text-sm text-[#201F24]">
                    ${b.limitAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
const RecurringBillsSection = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm">
    <SectionHeader title="Recurring Bills" href="recurring-bills" />
    <div className="flex flex-col gap-3">
      {recurringBills.map((bill) => (
        <div
          key={bill.label}
          className="flex items-center justify-between bg-[#F8F4EF] rounded-xl px-4 py-3"
          style={{ borderLeft: `4px solid ${bill.accent}` }}
        >
          <span className="text-sm text-[#696868]">{bill.label}</span>
          <span className="font-bold text-sm text-[#201F24]">
            ${bill.amount.toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const Overview = () => {
  const { user } = useAuth();
  const { wallet, fundMyWallet, isFunding } = useWallet();
  return (
    <div className="min-h-screen ">
      <h1 className="font-bold text-[26px] text-[#201F24] mb-6">Overview</h1>
      <div className="flex items-center flex-col md:flex-row justify-between gap-5 mb-6">
        <OverviewCard
          title={"Current Balance"}
          amount={`$${wallet?.balance ?? "00.0"}`}
          bg="#201F24"
          color="white"
        />
        <OverviewCard
          title="Income"
          amount={3814.25}
          bg="#ffffff"
          color="#201F24"
        />
        <OverviewCard
          title="Expenses"
          amount={1700.5}
          bg="#ffffff"
          color="#201F24"
        />
      </div>

      {/* Main grid: left column + right column */}
      <div className="flex gap-5 flex-col md:flex-row items-start">
        {/* Left column */}
        <div className="flex flex-col gap-5 flex-1 md:min-w-0 min-w-full">
          <CardSection />
          <TransactionsSection />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5 w-full md:w-[360px] shrink-0">
          <BudgetsSection />
          <RecurringBillsSection />
        </div>
      </div>
    </div>
  );
};

export default Overview;
