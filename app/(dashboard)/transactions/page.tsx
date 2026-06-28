"use client";

import React, { useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useTransactions from "@/hooks/useTransactions";
import { useDebounce } from "@/hooks/useDebounce";

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

// ── Format date ───────────────────────────────────────────
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ── Skeleton ──────────────────────────────────────────────
const TransactionSkeleton = ({ size }: { size: number }) => (
  <div className="space-y-0">
    {Array.from({ length: size }).map((_, i) => (
      <div key={i}>
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-4 w-24 hidden md:block" />
          <Skeleton className="h-4 w-32 hidden md:block" />
          <Skeleton className="h-4 w-20" />
        </div>
        {i < size - 1 && <div className="border-b border-[#F0EDED]" />}
      </div>
    ))}
  </div>
);

// ── Pagination ────────────────────────────────────────────
const Pagination = ({
  currentPage,
  totalPages,
  hasNext,
  hasPrevious,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onPageChange: (page: number) => void;
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-8">
      {/* Prev button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevious}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#E0DFDF] text-sm font-medium text-[#201F24] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F8F4EF] transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Prev
      </button>

      {/* Current page indicator */}
      <span className="text-sm text-gray-500">
        Page {currentPage + 1} of {totalPages}
      </span>

      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#E0DFDF] text-sm font-medium text-[#201F24] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F8F4EF] transition-colors"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};
// ── Main Transactions Page ────────────────────────────────
const Transactions = () => {
  const [page, setPage] = useState(0);
  const [size] = useState(5); // ← 5 per page
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Debounce search — waits 500ms after user stops typing
  // before hitting the DB, avoids request on every keystroke
  const debouncedSearch = useDebounce(search, 500);

  const {
    transactions,
    currentPage,
    totalPages,
    totalElements,
    hasNext,
    hasPrevious,
    isLoading,
  } = useTransactions({ page, size, search: debouncedSearch });

  // ── Client-side sort + category filter ───────────────────
  // Sort and category filter work on current page data
  // Search is the only one that hits the backend
  const displayed = [...transactions]
    .filter((tx) =>
      categoryFilter === "ALL" ? true : tx.category === categoryFilter,
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "a-z":
          return a.description.localeCompare(b.description);
        case "z-a":
          return b.description.localeCompare(a.description);
        case "highest":
          return b.amount - a.amount;
        case "lowest":
          return a.amount - b.amount;
        default: // latest
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

  // Reset to page 0 when search changes
  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const handleCategory = (value: string) => {
    setCategoryFilter(value);
    setPage(0);
  };

  return (
    <div className="">
      <h1 className="font-bold text-[26px] text-[#201F24] mb-8">
        Transactions
      </h1>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        {/* Search + filters */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
          {/* Search — hits DB via debounce */}
          <div className="relative flex-1 w-full md:max-w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-9 border-[#E0DFDF] rounded-lg"
              placeholder="Search transaction"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4 ml-auto">
            {/* Sort — client side */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 whitespace-nowrap">
                Sort by
              </span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[130px] border-[#E0DFDF]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="a-z">A to Z</SelectItem>
                  <SelectItem value="z-a">Z to A</SelectItem>
                  <SelectItem value="highest">Highest</SelectItem>
                  <SelectItem value="lowest">Lowest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category — client side */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 whitespace-nowrap">
                Category
              </span>
              <Select value={categoryFilter} onValueChange={handleCategory}>
                <SelectTrigger className="w-[160px] border-[#E0DFDF]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Transactions</SelectItem>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Table header */}
        <div className="flex items-center justify-between py-3 border-b border-[#F0EDED]">
          <span className="text-xs text-gray-400 font-medium flex-1">
            Recipient / Sender
          </span>
          <span className="text-xs text-gray-400 font-medium hidden md:block w-[180px]">
            Category
          </span>
          <span className="text-xs text-gray-400 font-medium hidden md:block w-[200px]">
            Date
          </span>
          <span className="text-xs text-gray-400 font-medium">Amount</span>
        </div>

        {/* Rows */}
        {isLoading ? (
          <TransactionSkeleton size={size} />
        ) : displayed.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-400 text-sm">
              {search
                ? `No transactions found for "${search}"`
                : categoryFilter !== "ALL"
                  ? "No transactions in this category"
                  : "No transactions yet"}
            </p>
          </div>
        ) : (
          <div>
            {displayed.map((tx, i) => {
              const color = CATEGORY_COLORS[tx.category] ?? "#97A0AC";
              const categoryLabel = CATEGORY_LABELS[tx.category] ?? tx.category;

              return (
                <div key={tx.id}>
                  <div className="flex items-center justify-between py-4">
                    {/* Avatar + name */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                        style={{ backgroundColor: color }}
                      >
                        {tx.description.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-[#201F24] text-sm truncate">
                        {tx.description}
                      </span>
                    </div>

                    {/* Category */}
                    <div className="hidden md:block w-[180px] shrink-0">
                      <span className="text-sm text-gray-500">
                        {categoryLabel}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="hidden md:block w-[200px] shrink-0">
                      <span className="text-sm text-gray-500">
                        {formatDate(tx.createdAt)}
                      </span>
                    </div>

                    {/* Amount */}
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm text-red-500">
                        -${tx.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {i < displayed.length - 1 && (
                    <div className="border-b border-[#F0EDED]" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            hasNext={hasNext}
            hasPrevious={hasPrevious}
            onPageChange={(p) => {
              setPage(p);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}

        {/* Count */}
        {!isLoading && totalElements > 0 && (
          <p className="text-xs text-gray-400 text-center mt-4">
            Showing {displayed.length} of {totalElements} transactions
          </p>
        )}
      </div>
    </div>
  );
};

export default Transactions;
