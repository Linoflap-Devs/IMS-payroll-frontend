"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  addSalaryScale,
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
import { toast } from "../ui/use-toast";
import { useRouter } from "next/navigation";

const NO_AVAILABLE_YEAR_OPTION = "__NO_AVAILABLE_YEAR__";

export default function AddSalaryScale() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allItems, setAllItems] = useState<SalaryScaleItem[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedVesselType, setSelectedVesselType] = useState<number | "">("");
  const [pendingChanges, setPendingChanges] = useState<Record<string, SalaryScaleItem[]>>({});
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());
  const [activeWageType, setActiveWageType] = useState<string | null>(null);
  const [showResetWarning, setShowResetWarning] = useState(false);
  const [pendingVesselId, setPendingVesselId] = useState<number | null>(null);
  const [itemToDelete, setItemToDelete] = useState<SalaryScaleItem | null>(null);
  const [resetRequested, setResetRequested] = useState(false);
  const { vesselTypes, wageDescriptions, fetchAllReferences } = useReferenceStore();
  const [newScaleYear, setNewScaleYear] = useState<string>("");
  const isScratchMode = selectedYear === NO_AVAILABLE_YEAR_OPTION;

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
    if (isScratchMode || !selectedYear || !allItems.length) return vesselTypes;

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
  }, [allItems, isScratchMode, selectedYear, vesselTypes]);

  const currentDisplayItems = useMemo(() => {
    // console.log("Recomputing currentDisplayItems");
    // console.log({
    //   selectedYear,
    //   selectedVesselType,
    //   activeWageType,
    //   deletedIds,
    //   pendingChanges
    // });

    if (isScratchMode || !selectedYear || selectedVesselType === "" || !activeWageType)
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

    // console.log("Filtered Items:", filtered);

    const pendingForThisWage = pendingChanges[activeWageType] || [];
    const pendingMap = new Map(
      pendingForThisWage.map((p) => [p.SalaryScaleDetailID, p])
    );

    const finalItems = filtered.map(
      (item) => pendingMap.get(item.SalaryScaleDetailID) || item
    );

    // console.log("Final Display Items:", finalItems);

    return finalItems;
  }, [
    allItems,
    selectedYear,
    selectedVesselType,
    activeWageType,
    pendingChanges,
    deletedIds,
    isScratchMode,
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

  const newScaleYearOptions = useMemo(() => {
    const existingYears = new Set(availableYears);

    // example: generate years 2020–2035
    const allPossibleYears = Array.from({ length: 16 }, (_, i) => 2020 + i);

    return allPossibleYears.filter((year) => !existingYears.has(year));
  }, [availableYears]);

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
    setNewScaleYear("");

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
      vesselTypeId: Number(selectedVesselType),
      year: Number(newScaleYear),
      salaryData: Array.from(groupedByRank.entries()).map(
        ([rankId, wages]) => ({
          rankId,
          wages,
        })
      ),
    };
  };

  const handleSave = async () => {
    if (isScratchMode) {
      toast({
        title: "Scratch Mode Enabled",
        description:
          "Table display for manual input is not implemented yet.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedYear || selectedVesselType === "") {
      toast({
        title: "Missing Selection",
        description: "Please select a Year and Vessel Type first.",
        variant: "destructive",
      });
      return;
    }

    const payload = buildPayload();

    if (!payload.salaryData.length) {
      toast({
        title: "Nothing to Save",
        description: "No changes detected in the salary scale.",
        variant: "destructive",
      });
      return;
    }

    console.log("FULL PAYLOAD (all rows):", payload);

    setIsLoading(true);

    try {
      const response = await addSalaryScale(payload);

      if (!response?.success) {
        throw new Error(response?.message || "Failed to save salary scale.");
      }

      toast({
        title: "Success",
        description: "Salary scale saved successfully.",
        variant: "success",
      });

      // Reset local state after successful save
      setPendingChanges({});
      setDeletedIds(new Set());

      // Navigate after a short delay to show toast
      setTimeout(() => {
        router.push("/home/wages/salary-scale");
      }, 800);
    } catch (err: any) {
      console.error("Save error:", err);
      toast({
        title: "Error",
        description:
          err?.message ||
          "An error occurred while saving the salary scale.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
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
                <SelectValue placeholder="Select year or skip" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_AVAILABLE_YEAR_OPTION}>
                  Not selecting available year
                </SelectItem>
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
                      : isScratchMode
                        ? "Select vessel type"
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
                 No vessels available for year {selectedYear}
              </p>
            )}

          </div>

          <div className="space-y-2">
            <Label>Select Year</Label>
            <Select
              value={newScaleYear}
              onValueChange={(value) => setNewScaleYear(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Year to Add" />
              </SelectTrigger>

              <SelectContent>
                {newScaleYearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2 flex items-end justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleResetClick}
              disabled={isLoading}
            >
              Reset
            </Button>

            <Button
              onClick={handleSave}
              disabled={isLoading || !hasUnsavedChanges || isScratchMode}
            >
              {hasUnsavedChanges ? "Save Changes *" : "Save Changes"}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : isScratchMode ? (
          wageDescriptionsSorted.length === 0 ? (
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
                {wageDescriptionsSorted.map((w) => (
                  <TabsTrigger
                    key={w.WageID}
                    value={w.WageID.toString()}
                    className="flex items-center gap-1 px-4"
                  >
                    <span className="truncate max-w-[160px] sm:max-w-none">
                      {w.WageName.trim()}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {wageDescriptionsSorted.map((wageDesc) => (
                <TabsContent
                  key={wageDesc.WageID}
                  value={wageDesc.WageID.toString()}
                  className="mt-0"
                >
                  <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/30">
                    Manual input mode selected for <strong>{wageDesc.WageName.trim()}</strong>.
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )
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
                                    className={`w-32 mx-auto text-right ${isDirty ? "bg-amber-50" : ""
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
            <AlertDialogTitle className="text-primary">
              Delete Salary Entry?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="mt-4 rounded-lg border p-4 bg-muted/40 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rank</span>
                  <span className="font-medium">
                    {itemToDelete?.Rank.trim()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Wage Type</span>
                  <span className="font-medium">
                    {itemToDelete?.Wage.trim()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold text-primary">
                    $ {itemToDelete?.WageAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
            >
              Delete Permanently
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
