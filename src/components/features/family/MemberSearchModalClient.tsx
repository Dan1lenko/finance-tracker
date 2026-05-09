"use client";

import { useState, useEffect } from "react";
import { X, Search, UserPlus, Check } from "lucide-react";
import { User } from "@prisma/client";
import { useFinanceStore } from "@/store/useFinanceStore";

interface MemberSearchModalClientProps {
  isOpen: boolean;
  onClose: () => void;
  familyId: string;
}

export default function MemberSearchModalClient({ isOpen, onClose, familyId }: MemberSearchModalClientProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { addMemberToFamily, families } = useFinanceStore();

  const currentFamily = families.find(f => f.id === familyId);
  const currentMemberIds = new Set(currentFamily?.members?.map(m => m.id) || []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim()) {
        setIsSearching(true);
        try {
          const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
          if (res.ok) {
            const data = await res.json();
            setResults(data);
          }
        } catch (error) {
          console.error("Search error", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleAdd = async (email: string) => {
    await addMemberToFamily(familyId, email);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        {/* Header */}
        <div
          className="flex items-center justify-between p-4"
          style={{ borderBottom: '0.5px solid var(--color-border)' }}
        >
          <h3 className="font-semibold text-base" style={{ color: 'var(--color-text)' }}>Додати учасника</h3>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg transition-colors"
            style={{ color: 'var(--color-muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-muted)'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Пошук за ім'ям або email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="glass-input"
              style={{ paddingLeft: '2.5rem' }}
              autoFocus
            />
            <Search className="w-4 h-4 absolute left-3.5 top-3" style={{ color: 'var(--color-muted)' }} />
            {isSearching && (
              <div className="absolute right-3 top-3">
                <div
                  className="animate-spin h-4 w-4 rounded-full"
                  style={{ border: '2px solid var(--color-primary)', borderTopColor: 'transparent' }}
                ></div>
              </div>
            )}
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {results.length > 0 ? (
              results.map((user) => {
                const isMember = currentMemberIds.has(user.id);
                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-xl transition-colors"
                    style={{ background: 'var(--color-surface)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-surface)'}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{ background: 'var(--color-surface-2)', color: '#6b5c4e' }}
                      >
                        {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{user.name || "Без імені"}</p>
                        <p className="text-xs truncate max-w-[150px]" style={{ color: 'var(--color-muted)' }}>{user.email}</p>
                      </div>
                    </div>
                    
                    {isMember ? (
                      <span className="badge badge-emerald">
                        <Check className="w-3 h-3" /> В групі
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAdd(user.email)}
                        className="p-2 rounded-lg transition-all"
                        style={{ background: 'var(--color-primary-bg)', color: 'var(--color-primary)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-primary)'; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-primary-bg)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
                        title="Додати"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })
            ) : query && !isSearching ? (
              <p className="text-center text-sm py-4" style={{ color: 'var(--color-muted)' }}>Нікого не знайдено</p>
            ) : (
              <p className="text-center text-xs py-4" style={{ color: 'var(--color-muted)' }}>Введіть email для пошуку</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
