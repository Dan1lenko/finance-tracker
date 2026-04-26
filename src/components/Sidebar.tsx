"use client";

import { useFinanceStore } from "@/store/useFinanceStore";
import { User, Users, Plus, LayoutDashboard, LogOut, LogIn, Sparkles, X, Wallet } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MemberSearchModal from "./MemberSearchModal";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

/**
 * Компонент Sidebar (Декларативний підхід)
 * 
 * Відповідає за навігацію та перемикання контексту (Особистий / Сімейний).
 */
export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { 
    currentUser, 
    families, 
    activeContext, 
    activeFamilyId, 
    createFamily,
    logout,
    setActiveContext
  } = useFinanceStore();

  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState("");

  const handleCreateFamily = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFamilyName.trim()) {
      createFamily(newFamilyName);
      setNewFamilyName("");
      setIsCreating(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  const handleContextSwitch = (context: 'PERSONAL' | 'FAMILY', familyId?: string) => {
    setActiveContext(context, familyId);
    onClose?.();
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
     return <aside className={`w-64 sidebar ${isOpen ? 'open' : ''}`}></aside>;
  }

  if (!currentUser) {
    return (
      <aside className={`w-64 sidebar flex items-center justify-center p-6 ${isOpen ? 'open' : ''}`}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'var(--gradient-brand)' }}>
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>Ви не увійшли в систему</p>
          <Link 
            href="/auth/login"
            className="gradient-btn flex items-center gap-2 px-5 py-2.5 text-sm justify-center"
            onClick={() => onClose?.()}
          >
            <LogIn className="w-4 h-4" />
            Увійти
          </Link>
        </div>
      </aside>
    );
  }

  return (
    <aside className={`w-64 sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand */}
      <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-glass)' }}>
        <h2 className="text-lg font-bold flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-brand)' }}>
            <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
          <span className="gradient-text">FinanceApp</span>
        </h2>
        {/* Close button for mobile */}
        <button 
          onClick={onClose} 
          className="md:hidden p-1 rounded-lg transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
            Навігація
          </p>
          <Link
            href="/profile"
            onClick={() => onClose?.()}
            className="sidebar-item"
          >
            <User className="w-4 h-4" />
            Мій профіль
          </Link>
          <button
            onClick={() => handleContextSwitch('PERSONAL')}
            className={`sidebar-item ${activeContext === 'PERSONAL' ? 'sidebar-item-active' : ''}`}
          >
            <Wallet className="w-4 h-4" />
            Мій гаманець
          </button>
        </div>


        <div className="mt-8 space-y-1">
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Сімейні групи
            </p>
            <button 
              onClick={() => setIsCreating(true)}
              className="transition-colors rounded-md p-0.5"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-violet)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              title="Створити групу"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {families.length === 0 ? (
            <div className="px-3 py-2 text-sm italic" style={{ color: 'var(--text-muted)' }}>
              Груп немає
            </div>
          ) : (
            families.map((family) => (
              <div key={family.id} className="relative group">
                <button
                  onClick={() => handleContextSwitch('FAMILY', family.id)}
                  className={`sidebar-item ${
                    activeContext === 'FAMILY' && activeFamilyId === family.id
                      ? 'sidebar-item-active'
                      : ''
                  }`}
                >
                  <Users className="w-4 h-4" />
                  {family.name}
                </button>
                {activeContext === 'FAMILY' && activeFamilyId === family.id && currentUser.id === family.ownerId && (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-all rounded-md p-0.5"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-violet)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    title="Додати учасника"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {isCreating && (
          <div className="mt-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}>
            <form onSubmit={handleCreateFamily}>
              <input
                type="text"
                autoFocus
                placeholder="Назва групи..."
                value={newFamilyName}
                onChange={(e) => setNewFamilyName(e.target.value)}
                className="glass-input text-sm mb-2"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="gradient-btn flex-1 text-xs py-1.5"
                >
                  Створити
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 text-xs py-1.5 rounded-lg transition-colors"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}
                >
                  Скасувати
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* User section */}
      <div className="p-4" style={{ borderTop: '1px solid var(--border-glass)' }}>
        <div className="flex items-center justify-between px-2 py-2">
          <Link
            href="/profile"
            onClick={() => onClose?.()}
            className="flex items-center gap-3 flex-1 min-w-0 rounded-xl transition-all"
            style={{ color: 'inherit' }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 transition-all"
              style={{ background: 'var(--gradient-brand)' }}
            >
              {currentUser.name?.[0] || currentUser.email[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate max-w-[100px]" style={{ color: 'var(--text-primary)' }}>{currentUser.name}</p>
              <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>Профіль →</p>
            </div>
          </Link>
          <button 
            onClick={handleLogout}
            className="transition-colors p-1.5 rounded-lg flex-shrink-0 ml-1"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-rose)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            title="Вийти"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>


      {activeContext === 'FAMILY' && activeFamilyId && (
        <MemberSearchModal 
          isOpen={isSearchOpen} 
          onClose={() => setIsSearchOpen(false)} 
          familyId={activeFamilyId} 
        />
      )}
    </aside>
  );
}
