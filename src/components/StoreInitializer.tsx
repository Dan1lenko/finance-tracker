"use client";

import { useFinanceStore } from "@/store/useFinanceStore";
import { useEffect, useRef } from "react";

export default function StoreInitializer() {
  const { _fetchTransactions, currentUser } = useFinanceStore();
  useEffect(() => {
    if (currentUser) {
      _fetchTransactions();
      
      const interval = setInterval(() => {
        _fetchTransactions();
      }, 10000); // Poll every 10 seconds

      return () => clearInterval(interval);
    }
  }, [_fetchTransactions, currentUser]);

  return null;
}
