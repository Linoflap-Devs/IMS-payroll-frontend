"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  getWageScale,
  SalaryScaleItem,
} from "@/src/services/wages/salaryScale.api";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReferenceStore } from "@/src/store/useAddSalaryScale";

export default function AddSalaryScale() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allItems, setAllItems] = useState<SalaryScaleItem[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedVesselType, setSelectedVesselType] = useState<number | "">("");
  const [pendingChanges, setPendingChanges] = useState<
    Record<string, SalaryScaleItem[]>
  >({});
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());
  const [activeWageType, setActiveWageType] = useState<string | null>(null);
  const [showResetWarning, setShowResetWarning] = useState(false);
  const [pendingVesselId, setPendingVesselId] = useState<number | null>(null);
  const [itemToDelete, setItemToDelete] = useState<SalaryScaleItem | null>(
    null
  );
  const [resetRequested, setResetRequested] = useState(false);
  const { vesselTypes, wageDescriptions, fetchAllReferences } =
    useReferenceStore();
  const hasFetchedRef = useRef(false);

  // ─── Derived data ────────────────────────────────────────────────────────

  const wageDescriptionsSorted = useMemo(() => {
    return wageDescriptions
      .filter((w) => w.WageName?.trim())
      .sort((a, b) => a.WageName.localeCompare(b.WageName));
  }, [wageDescriptions]);

  const availableYears = useMemo(() => {
    if (!allItems.length) return [];
    const yearSet = new Set<number>();
    allItems.forEach((item) => {
      const from = new Date(item.EffectivedateFrom).getFullYear();
      const to = new Date(item.EffectivedateTo).getFullYear();
      if (!isNaN(from)) yearSet.add(from);
      if (!isNaN(to)) yearSet.add(to);
    });
    return Array.from(yearSet).sort((a, b) => b - a);
  }, [allItems]);

  const availableVesselTypes = useMemo(() => {
    if (!selectedYear || !allItems.length) return vesselTypes;

    const yearNum = Number(selectedYear);
    const vesselIdSet = new Set<number>();

    allItems.forEach((item) => {
      const fromYear = new Date(item.EffectivedateFrom).getFullYear();
      const toYear = new Date(item.EffectivedateTo).getFullYear();

      const yearMatch =
        fromYear === yearNum ||
        toYear === yearNum ||
        (fromYear <= yearNum && toYear >= yearNum);

      if (yearMatch) {
        vesselIdSet.add(item.VesselTypeId);
      }
    });

    return vesselTypes.filter((vt) => vesselIdSet.has(vt.VesselTypeID));
  }, [allItems, selectedYear, vesselTypes]);

  const currentDisplayItems = useMemo(() => {
    if (!selectedYear || selectedVesselType === "" || !activeWageType)
      return [];

    const selectedWageID = Number(activeWageType);
    if (isNaN(selectedWageID)) return [];

    let filtered = allItems.filter((item) => {
      const fromYear = new Date(item.EffectivedateFrom).getFullYear();
      const toYear = new Date(item.EffectivedateTo).getFullYear();
      const yearNum = Number(selectedYear);

      const yearMatch =
        fromYear === yearNum ||
        toYear === yearNum ||
        (fromYear <= yearNum && toYear >= yearNum);

      return (
        yearMatch &&
        item.VesselTypeId === selectedVesselType &&
        item.WageID === selectedWageID &&
        !deletedIds.has(item.SalaryScaleDetailID)
      );
    });

    const pendingForThisWage = pendingChanges[activeWageType] || [];
    const pendingMap = new Map(
      pendingForThisWage.map((p) => [p.SalaryScaleDetailID, p])
    );

    return filtered.map(
      (item) => pendingMap.get(item.SalaryScaleDetailID) || item
    );
  }, [
    allItems,
    selectedYear,
    selectedVesselType,
    activeWageType,
    pendingChanges,
    deletedIds,
  ]);

  const hasUnsavedChanges = useMemo(() => {
    return (
      Object.values(pendingChanges).some((list) => list.length > 0) ||
      deletedIds.size > 0
    );
  }, [pendingChanges, deletedIds]);

  // ─── Fetch ───────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchAllReferences();
  }, [fetchAllReferences]);

  // Phase 1: Fetch all data once on mount (to populate initial years)
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchInitial = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await getWageScale({});
        if (res.success) {
          setAllItems(res.data ?? []);
        } else {
          setError(res.message || "Failed to load initial data");
        }
      } catch (err) {
        setError("Network/server error");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitial();
  }, []);

  // Phase 2: Refetch when year changes (even without vessel) or vessel changes
  useEffect(() => {
    if (!selectedYear) {
      setAllItems([]);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params: any = {
          year: Number(selectedYear),
        };

        if (selectedVesselType !== "") {
          params.vesselTypeId = selectedVesselType;
        }

        const res = await getWageScale(params);

        if (res.success) {
          setAllItems(res.data ?? []);
        } else {
          setError(res.message || "Failed to load data");
        }
      } catch (err) {
        setError("Network/server error");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedYear, selectedVesselType]);

  // Auto-select first wage type
  useEffect(() => {
    if (wageDescriptionsSorted.length > 0 && !activeWageType) {
      setActiveWageType(wageDescriptionsSorted[0].WageID.toString());
    }
  }, [wageDescriptionsSorted, activeWageType]);

  // Reset dependent states when year changes
  useEffect(() => {
    setSelectedVesselType("");
    setPendingChanges({});
    setDeletedIds(new Set());
    if (wageDescriptionsSorted.length > 0) {
      setActiveWageType(wageDescriptionsSorted[0].WageID.toString());
    }
  }, [selectedYear, wageDescriptionsSorted]);

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleAmountChange = (item: SalaryScaleItem, newValue: string) => {
    const num = parseFloat(newValue);
    if (isNaN(num)) return;

    const updated = { ...item, WageAmount: num };

    setPendingChanges((prev) => {
      const key = activeWageType!;
      const existing = prev[key] || [];
      const updatedList = existing.some(
        (e) => e.SalaryScaleDetailID === item.SalaryScaleDetailID
      )
        ? existing.map((e) =>
            e.SalaryScaleDetailID === item.SalaryScaleDetailID ? updated : e
          )
        : [...existing, updated];

      return { ...prev, [key]: updatedList };
    });
  };

  const handleDeleteClick = (item: SalaryScaleItem) => {
    setItemToDelete(item);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    setDeletedIds((prev) =>
      new Set(prev).add(itemToDelete.SalaryScaleDetailID)
    );
    setItemToDelete(null);
  };

  const handleVesselChange = (val: string) => {
    const newId = val ? Number(val) : "";
    if (newId === selectedVesselType) return;

    if (hasUnsavedChanges) {
      setPendingVesselId(newId as number);
      setShowResetWarning(true);
    } else {
      setSelectedVesselType(newId);
      setPendingChanges({});
      setDeletedIds(new Set());
    }
  };

  const confirmVesselChange = () => {
    if (pendingVesselId !== null) {
      setSelectedVesselType(pendingVesselId);
      setPendingChanges({});
      setDeletedIds(new Set());
      if (wageDescriptionsSorted.length > 0) {
        setActiveWageType(wageDescriptionsSorted[0].WageID.toString());
      }
    }
    setShowResetWarning(false);
    setPendingVesselId(null);
  };

  const handleReset = () => {
    setSelectedYear("");
    setSelectedVesselType("");
    setActiveWageType(null);
    setPendingChanges({});
    setDeletedIds(new Set());
    setError(null);
    setAllItems([]); // clear data

    // Optional: re-trigger initial fetch to repopulate years
    // But only if you want the years to appear immediately after reset
    const fetchInitial = async () => {
      setIsLoading(true);
      try {
        const res = await getWageScale({});
        if (res.success) {
          setAllItems(res.data ?? []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitial();
  };

  const handleResetClick = () => {
    if (hasUnsavedChanges) {
      setResetRequested(true);
      setShowResetWarning(true);
    } else {
      handleReset();
    }
  };

  const buildPayload = () => {
    let allCurrent = allItems.filter((item) => {
      const fromYear = new Date(item.EffectivedateFrom).getFullYear();
      const toYear = new Date(item.EffectivedateTo).getFullYear();
      const yearNum = Number(selectedYear);
      const yearMatch =
        fromYear === yearNum ||
        toYear === yearNum ||
        (fromYear <= yearNum && toYear >= yearNum);

      return (
        yearMatch &&
        item.VesselTypeId === selectedVesselType &&
        !deletedIds.has(item.SalaryScaleDetailID)
      );
    });

    const allPending = Object.values(pendingChanges).flat();
    const pendingMap = new Map(
      allPending.map((p) => [p.SalaryScaleDetailID, p])
    );

    allCurrent = allCurrent.map(
      (item) => pendingMap.get(item.SalaryScaleDetailID) || item
    );

    const groupedByRank = new Map<
      number,
      { wageId: number; amount: number }[]
    >();

    allCurrent.forEach((item) => {
      if (!groupedByRank.has(item.RankID)) groupedByRank.set(item.RankID, []);
      groupedByRank.get(item.RankID)!.push({
        wageId: item.WageID,
        amount: item.WageAmount,
      });
    });

    return {
      vesselTypeId: selectedVesselType,
      year: Number(selectedYear),
      salaryData: Array.from(groupedByRank.entries()).map(
        ([rankId, wages]) => ({
          rankId,
          wages,
        })
      ),
    };
  };

  const handleSave = async () => {
    if (!selectedYear || selectedVesselType === "") return;

    const payload = buildPayload();
    console.log("FULL PAYLOAD (all rows):", payload);

    // TODO: await yourUpdateApi(payload);

    alert("Save logic not implemented yet — see console");
    setPendingChanges({});
    setDeletedIds(new Set());
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="py-8 px-4">
      <CardHeader>
        <CardTitle className="text-2xl mb-4">Add Salary Scale</CardTitle>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="bg-destructive/15 text-destructive px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="space-y-2">
            <Label>Available Years</Label>
            <Select
              value={selectedYear}
              onValueChange={(v) => {
                setSelectedYear(v);
                // Reset dependent states
                setSelectedVesselType("");
                setPendingChanges({});
                setDeletedIds(new Set());
                if (wageDescriptionsSorted.length > 0) {
                  setActiveWageType(
                    wageDescriptionsSorted[0].WageID.toString()
                  );
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Vessel Type</Label>
            <Select
              value={selectedVesselType.toString()}
              onValueChange={handleVesselChange}
              disabled={isLoading || !selectedYear}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    isLoading
                      ? "Loading vessels..."
                      : !selectedYear
                      ? "Select a year first"
                      : availableVesselTypes.length === 0
                      ? `No vessels for year ${selectedYear}`
                      : "Select vessel type"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableVesselTypes.length > 0 ? (
                  availableVesselTypes.map((vt) => (
                    <SelectItem
                      key={vt.VesselTypeID}
                      value={vt.VesselTypeID.toString()}
                    >
                      {vt.VesselTypeName.trim()}
                    </SelectItem>
                  ))
                ) : selectedYear ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    No vessels available for year {selectedYear}
                  </div>
                ) : null}
              </SelectContent>
            </Select>

            {selectedYear && availableVesselTypes.length === 0 && (
              <p className="text-xs text-amber-700 mt-1">
                Walang vessel type na available para sa taong {selectedYear}
              </p>
            )}
          </div>

          <div className="flex items-end gap-3 md:col-span-2">
            <Button
              variant="outline"
              onClick={handleResetClick}
              disabled={isLoading}
            >
              Reset
            </Button>

            <Button
              onClick={handleSave}
              disabled={isLoading || !hasUnsavedChanges}
            >
              {hasUnsavedChanges ? "Save Changes *" : "Save Changes"}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : !selectedYear || selectedVesselType === "" ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/30">
            Please select <strong>year</strong> and <strong>vessel type</strong>
          </div>
        ) : wageDescriptionsSorted.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No wage types found
          </div>
        ) : (
          <Tabs
            value={activeWageType ?? undefined}
            onValueChange={setActiveWageType}
            className="w-full"
          >
            <TabsList
              className="
                mb-6
                flex
                w-full
                justify-start
                gap-3
                overflow-x-auto
                whitespace-nowrap
                scrollbar-hide
            "
            >
              {wageDescriptionsSorted.map((w) => {
                const wageIdStr = w.WageID.toString();

                return (
                  <TabsTrigger
                    key={w.WageID}
                    value={wageIdStr}
                    className="flex items-center gap-1 px-4"
                  >
                    <span className="truncate max-w-[160px] sm:max-w-none">
                      {w.WageName.trim()}
                    </span>

                    {pendingChanges[wageIdStr]?.length > 0 && (
                      <Pencil className="h-3.5 w-3.5 shrink-0" />
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {wageDescriptionsSorted.map((wageDesc) => {
              const wageIdStr = wageDesc.WageID.toString();
              return (
                <TabsContent
                  key={wageDesc.WageID}
                  value={wageIdStr}
                  className="mt-0"
                >
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Rank</TableHead>
                          <TableHead className="text-center">
                            Amount (USD)
                          </TableHead>
                          <TableHead className="text-center">Status</TableHead>
                          <TableHead className="w-20 text-center">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentDisplayItems.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="text-center py-12 text-muted-foreground"
                            >
                              No entries for this wage type
                            </TableCell>
                          </TableRow>
                        ) : (
                          currentDisplayItems.map((item) => {
                            const isDirty = pendingChanges[
                              activeWageType!
                            ]?.some(
                              (p) =>
                                p.SalaryScaleDetailID ===
                                item.SalaryScaleDetailID
                            );

                            return (
                              <TableRow
                                key={item.SalaryScaleDetailID}
                                className={
                                  deletedIds.has(item.SalaryScaleDetailID)
                                    ? "opacity-50 line-through"
                                    : ""
                                }
                              >
                                <TableCell className="font-medium">
                                  {item.Rank.trim()}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={item.WageAmount}
                                    onChange={(e) =>
                                      handleAmountChange(item, e.target.value)
                                    }
                                    className={`w-32 mx-auto text-right ${
                                      isDirty ? "bg-amber-50" : ""
                                    }`}
                                  />
                                </TableCell>
                                <TableCell className="text-center">
                                  {isDirty ? (
                                    <div className="flex items-center justify-center gap-1.5 text-amber-700 text-sm font-medium">
                                      <span>Edited</span>
                                      <Pencil className="h-4 w-4" />
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground text-sm">
                                      —
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteClick(item)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </CardContent>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={() => setItemToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
            <AlertDialogDescription>
              Rank: <strong>{itemToDelete?.Rank.trim()}</strong>
              <br />
              Wage: <strong>{itemToDelete?.Wage.trim()}</strong>
              <br />
              Amount: <strong>${itemToDelete?.WageAmount}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset / Vessel change warning */}
      <AlertDialog open={showResetWarning} onOpenChange={setShowResetWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved edits or deletions.{" "}
              {resetRequested
                ? "Resetting will clear everything."
                : "Changing vessel type will discard all current edits."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={resetRequested ? handleReset : confirmVesselChange}
            >
              {resetRequested ? "Discard & Reset" : "Discard & Change"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
