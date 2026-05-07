"use client";

import DashboardClient from "@/components/features/dashboard/DashboardClient";
import TransactionFormClient from "@/components/features/transactions/TransactionFormClient";
import Sidebar from "@/components/layout/Sidebar";
import { useState } from "react";
import { Menu } from "lucide-react";

/**
 * HomeClient — Client Component для головної сторінки.
 * Керує станом відкритого/закритого сайдбару на мобільних.
 */
export default function HomeClient() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Mobile menu button */}
      <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar overlay for mobile */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} 
        onClick={() => setSidebarOpen(false)} 
      />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="main-content flex-1 py-10 px-4 sm:px-6 lg:px-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 animate-fade-in-up">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight lg:text-5xl mb-3 gradient-text">
              Сімейний Фінансовий Трекер
            </h1>
            <p className="max-w-xl mx-auto text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
              Курсовий проєкт, що демонструє
              <span className="font-semibold" style={{ color: '#c4b5fd' }}> Декларативну</span>, 
              <span className="font-semibold" style={{ color: '#f9a8d4' }}> Функціональну</span> та 
              <span className="font-semibold" style={{ color: '#67e8f9' }}> Реактивну</span> парадигми.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 animate-fade-in-up animate-delay-1">
              <DashboardClient />
            </div>
            <div className="lg:col-span-1 animate-fade-in-up animate-delay-2">
               <TransactionFormClient />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
