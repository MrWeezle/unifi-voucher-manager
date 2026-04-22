"use client";

import Spinner from "@/components/utils/Spinner";
import VoucherCard from "@/components/VoucherCard";
import VoucherModal from "@/components/modals/VoucherModal";
import { PrintMode } from "@/app/print/page";
import { Voucher } from "@/types/voucher";
import { api } from "@/utils/api";
import { isVoucherUsedUp } from "@/utils/format";
import { notify } from "@/utils/notifications";
import { useMemo, useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";

const SHOW_USED_STORAGE_KEY = "uvm.showUsedVouchers";

export default function VouchersTab() {
  const [loading, setLoading] = useState(true);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [viewVoucher, setViewVoucher] = useState<Voucher | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [showUsed, setShowUsed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem(SHOW_USED_STORAGE_KEY);
    if (stored !== null) setShowUsed(stored === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem(SHOW_USED_STORAGE_KEY, String(showUsed));
  }, [showUsed]);

  const usedUpCount = useMemo(
    () => vouchers.filter(isVoucherUsedUp).length,
    [vouchers],
  );

  const filteredVouchers = useMemo(() => {
    const visible = showUsed
      ? vouchers
      : vouchers.filter((v) => !isVoucherUsedUp(v));

    if (!searchQuery.trim()) return visible;

    const query = searchQuery.toLowerCase().trim();
    return visible.filter((voucher) =>
      voucher.name?.toLowerCase().includes(query),
    );
  }, [vouchers, searchQuery, showUsed]);

  const expiredIds = useMemo(
    () => filteredVouchers.filter((v) => v.expired).map((v) => v.id),
    [filteredVouchers],
  );

  const selectedVouchers = useMemo(
    () => filteredVouchers.filter((v) => selectedIds.has(v.id)),
    [filteredVouchers, selectedIds],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getAllVouchers();
      setVouchers(res.data || []);
    } catch {
      notify("Failed to load vouchers", "error");
    }
    setLoading(false);
  }, []);

  const startEdit = useCallback(() => {
    setSelectedIds(new Set());
    setEditMode(true);
  }, []);

  const cancelEdit = useCallback(() => {
    setSelectedIds(new Set());
    setEditMode(false);
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((p) => {
      const s = new Set(p);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }, []);

  const clickCard = useCallback(
    (v: Voucher) => (editMode ? toggleSelect(v.id) : setViewVoucher(v)),
    [editMode, toggleSelect, setViewVoucher],
  );

  const selectAll = () => {
    if (selectedVouchers.length === filteredVouchers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredVouchers.map((v) => v.id)));
    }
  };

  const closeModal = useCallback(() => {
    setViewVoucher(null);
  }, []);

  const deleteVouchers = useCallback(
    async (kind: "selected" | "expired") => {
      setBusy(true);
      const kind_word = kind === "selected" ? "" : "expired";

      try {
        const res =
          kind === "selected"
            ? await api.deleteSelectedVouchers([...selectedVouchers.map((v) => v.id)])
            : await api.deleteSelectedVouchers([...expiredIds]);

        const count = res.vouchersDeleted || 0;
        if (count > 0) {
          notify(
            `Successfully deleted ${count} ${kind_word} voucher${count === 1 ? "" : "s"}`,
            "success",
          );
          setSelectedIds(new Set());
        } else {
          notify(`No ${kind_word} vouchers were deleted`, "info");
        }
      } catch {
        notify(`Failed to delete ${kind_word} vouchers`, "error");
      }
      setBusy(false);
      cancelEdit();
    },
    [selectedVouchers, expiredIds, cancelEdit],
  );

  useEffect(() => {
    load();
    window.addEventListener("vouchersUpdated", load);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cancelEdit();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("vouchersUpdated", load);
      window.removeEventListener("keydown", onKey);
    };
  }, [load, cancelEdit]);

  const handlePrintClick = (mode: PrintMode) => {
    // Prepare the data for the URL
    const vouchersParam = encodeURIComponent(JSON.stringify(vouchers));
    const printUrl = `/print?vouchers=${vouchersParam}&mode=${mode}`;

    router.replace(printUrl);
  };

  return (
    <div className="flex-1">
      <div className="mb-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Search vouchers by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary text-2xl hover:text-primary"
            >
              &times;
            </button>
          )}
        </div>
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {!editMode ? (
          <>
            <button onClick={startEdit} className="btn-primary">
              Edit Mode
            </button>
            <button onClick={load} className="btn-secondary">
              Refresh
            </button>
            <label className="flex-center gap-2 text-sm cursor-pointer select-none ml-1">
              <input
                type="checkbox"
                checked={showUsed}
                onChange={(e) => setShowUsed(e.target.checked)}
                className="sr-only peer"
              />
              <span
                className={`w-5 h-5 rounded-md border-2 flex-center shrink-0 peer-focus:ring-2 peer-focus:ring-primary-500
                  ${showUsed ? "bg-primary-500 border-primary-600" : "unselected-neutral"}`}
              >
                {showUsed && (
                  <svg
                    viewBox="0 0 20 20"
                    fill="white"
                    className="w-3.5 h-3.5"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </span>
              <span>
                Show used
                {usedUpCount > 0 && (
                  <span className="text-secondary"> ({usedUpCount})</span>
                )}
              </span>
            </label>
          </>
        ) : (
          <>
            <button
              onClick={selectAll}
              disabled={!filteredVouchers.length}
              className="btn-primary"
            >
              Select All
            </button>
            <button
              onClick={() => handlePrintClick("grid")}
              disabled={!selectedVouchers.length}
              className="btn-secondary"
            >
              Print (Tile)
            </button>
            <button
              onClick={() => handlePrintClick("list")}
              disabled={!selectedVouchers.length}
              className="btn-secondary"
            >
              Print (List)
            </button>
            <button
              onClick={() => deleteVouchers("selected")}
              disabled={busy || !selectedVouchers.length}
              className="btn-danger"
            >
              Delete Selected
            </button>
            <button
              onClick={() => deleteVouchers("expired")}
              disabled={busy || !expiredIds.length}
              className="btn-warning"
            >
              Delete Expired
            </button>
            <button onClick={cancelEdit} className="btn-primary">
              Cancel
            </button>
            {busy ? <Spinner /> : <></>}
            <span className="text-sm text-secondary font-bold ml-auto">
              {selectedVouchers.length} selected
            </span>
          </>
        )}
      </div>

      {searchQuery && (
        <div className="mb-4 text-sm text-secondary">
          Showing {filteredVouchers.length} of {vouchers.length} vouchers
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : !filteredVouchers.length ? (
        <div className="text-center py-8 text-secondary">
          {searchQuery
            ? "No vouchers found matching your search"
            : "No vouchers found"}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredVouchers.map((v) => (
            <VoucherCard
              key={v.id}
              voucher={v}
              editMode={editMode}
              selected={selectedVouchers.includes(v)}
              onClick={clickCard}
            />
          ))}
        </div>
      )}

      {viewVoucher && (
        <VoucherModal voucher={viewVoucher} onClose={closeModal} />
      )}
    </div>
  );
}
