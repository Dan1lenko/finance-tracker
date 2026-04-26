"use client";

import { useFinanceStore } from "@/store/useFinanceStore";
import { useEffect, useRef } from "react";

export default function StoreInitializer() {
  const { _fetchTransactions, _fetchFamilies, currentUser } = useFinanceStore();
  useEffect(() => {
    if (currentUser) {
      _fetchTransactions();
      _fetchFamilies();
      
      const interval = setInterval(() => {
        _fetchTransactions();
        _fetchFamilies();
      }, 10000); // Poll every 10 seconds

      return () => clearInterval(interval);
    }
  }, [_fetchTransactions, _fetchFamilies, currentUser]);

  return null;
}
