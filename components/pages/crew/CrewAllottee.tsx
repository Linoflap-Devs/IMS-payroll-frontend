"use client";

import { useState, useEffect, Dispatch, SetStateAction, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useCrewStore } from "@/src/store/useCrewStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AllotteeUiModel, AllotteeApiModel } from "@/types/crewAllottee";
import { deleteCrewAllottee, updateBatchAllottee } from "@/src/services/crew/crewAllottee.api";
import { toast } from "@/components/ui/use-toast";
import { useAllotteeFormStore } from "@/src/store/useAllotteeFormStore";
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, Info, MoreHorizontal, Pencil, Trash, X } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Swal from "sweetalert2";
import { useEditAllotteeStore } from "@/src/store/useEditAllotteeStore";
import { EditAllotteeDialog } from "./EditCrewAllotteeDialog";

interface ICrewAllotteeProps {
  onAdd?: () => void;
  isEditingAllottee?: boolean;
  isAdding?: boolean;
  onSave?: (allottee: AllotteeApiModel) => void;
  onCancel?: () => void;
  handleSave: () => void;
  triggerSave: boolean;
  allotteeLoading?: boolean;
  setAllotteeLoading: Dispatch<SetStateAction<boolean>>;
  setTriggerSave: Dispatch<SetStateAction<boolean>>;
  setIsEditingAllottee?: Dispatch<SetStateAction<boolean>>;
  //triggerDelete: boolean;
  //setTriggerDelete: Dispatch<SetStateAction<boolean>>;
  //setIsDeletingAllottee: Dispatch<SetStateAction<boolean>>;
}

export function CrewAllottee({
  isEditingAllottee = false,
  isAdding = false,
  triggerSave,
  setAllotteeLoading,
  setTriggerSave,
  setIsEditingAllottee = () => { },
}: //setTriggerDelete,
  //triggerDelete,
  // setIsDeletingAllottee,
  ICrewAllotteeProps) {
  const searchParams = useSearchParams();
  const crewId = searchParams.get("id");
  const [allottees, setAllottees] = useState<AllotteeUiModel[]>([]);
  const [currentAllottee, setCurrentAllottee] =
    useState<AllotteeUiModel | null>(null);
  const [editingAllottee, setEditingAllottee] =
    useState<AllotteeUiModel | null>(null);
  const { isAllotteeValid, setIsAllotteeValid } = useAllotteeFormStore();
  const [selectedAllotteeData, setSelectedAllotteeData] =
    useState<AllotteeUiModel | null>(null);
  const [editselectedAllotteeDialogOpen, setEditselectedAllotteeDialogOpen] =
    useState(false);
  const [deletingAllottee, setDeletingAllottee] = useState(false);
  const [allotmentType, setAllotmentType] = useState<number | null>(null);
  const drafts = useEditAllotteeStore((state) => state.drafts);

  //console.log("Current drafts in store:", drafts);

  const {
    allottees: storeAllottees,
    isLoadingAllottees,
    allotteesError,
    fetchCrewAllottees,
    resetAllottees,
  } = useCrewStore();

  useEffect(() => {
    if (!crewId) return;
    fetchCrewAllottees(crewId);
    return () => {
      resetAllottees();
    };
  }, [crewId, fetchCrewAllottees, resetAllottees]);

  useEffect(() => {
    const mapped = storeAllottees.map((a) => ({
      id: a.AllotteeDetailID,
      name: a.AllotteeName,
      relationship: a.RelationName,
      relationshipId: a.RelationID ?? 0,
      contactNumber: a.ContactNumber,
      address: a.Address,
      province: a.ProvinceName,
      provinceId: a.ProvinceID?.toString() || "",
      city: a.CityName,
      cityId: a.CityID?.toString() || "",
      bankName: a.BankName,
      bankId: a.BankID?.toString() || "",
      bankBranch: a.BankBranch,
      branchId: a.BankBranchID?.toString() || "",
      accountNumber: a.AccountNumber,
      allotment: a.Allotment,

      priority: a.priority ? 1 : 0,
      receivePayslip: a.receivePayslip ? 1 : 0,
      active: a.active ? 1 : 0,

      allotmentType: a.AllotmentType,
      allotteeDetailID: a.AllotteeDetailID,
    }));

    setAllottees(mapped);
  }, [storeAllottees]);

  const columns = useMemo<ColumnDef<(typeof allottees)[number]>[]>(() => {
    const baseColumns: ColumnDef<(typeof allottees)[number]>[] = [
      {
        accessorKey: "name",
        header: () => <div className="text-justify">Crew Name</div>,
        cell: ({ row }) => {
          const name = row.getValue("name") as string;

          return (
            <div className="flex items-center space-x-3 text-justify">
              {isLoadingAllottees ? (
                <img
                  alt={name}
                  className="w-8 h-8 rounded-full object-cover border border-gray-300"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium">
                  <span>{name?.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <span>{name}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "relationship",
        header: () => <div className="text-justify">Relationship</div>,
        cell: ({ row }) => (
          <div className="text-justify">{row.getValue("relationship")}</div>
        ),
      },
      {
        accessorKey: "bankName",
        header: () => <div className="text-justify">Bank</div>,
        cell: ({ row }) => (
          <div className="text-justify">{row.getValue("bankName")}</div>
        ),
      },
      {
        accessorKey: "bankBranch",
        header: () => <div className="text-justify">Bank Branch</div>,
        cell: ({ row }) => (
          <div className="text-justify">{row.getValue("bankBranch")}</div>
        ),
      },
    ];

    // Add conditional columns
    if (allottees[0]?.allotmentType === 1) {
      baseColumns.push(
        {
          accessorKey: "priority",
          header: () => <div className="text-justify">Priority</div>,
          cell: ({ row }) => {
            const value = row.getValue("priority");
            const isHighPriority = value === 1;

            return (
              <div className="flex justify-center items-center w-full h-full">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${isHighPriority
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                    }`}
                >
                  {isHighPriority ? (
                    <>
                      <Check className="w-3 h-3" /> Yes
                    </>
                  ) : (
                    <>
                      <X className="w-3 h-3" /> No
                    </>
                  )}
                </span>
              </div>
            );
          },
        },
        {
          accessorKey: "receivePayslip",
          header: () => <div className="text-justify">Currency</div>,
          cell: ({ row }) => {
            const value = row.getValue("receivePayslip");
            const isDollar = value === 1;

            return (
              <div className="flex justify-center items-center w-full h-full">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${isDollar
                    ? "bg-blue-200 text-green-700"
                    : "bg-gray-100 text-gray-700"
                    }`}
                >
                  <Info className="w-3 h-3" />
                  {isDollar ? "USD" : "PHP"}
                </span>
              </div>
            );
          },
        }
      );
    }

    baseColumns.push(
      {
        accessorKey: "allotment",
        header: () => <div className="text-justify">Allotment</div>,
        cell: ({ row }) => {
          const allotmentValue = row.getValue<number>("allotment");
          const allotmentType = row.original.allotmentType;

          return (
            <div className="text-justify">
              {allotmentType === 2
                ? `${allotmentValue}%`
                : allotmentValue ?? "-"}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="text-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-7 sm:h-8 w-7 sm:w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="text-xs sm:text-sm">
                <DropdownMenuItem
                  className="text-xs sm:text-sm"
                  onClick={() => {
                    setSelectedAllotteeData(row.original);
                    setEditselectedAllotteeDialogOpen(true);
                  }}
                >
                  <Pencil className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                  Edit Allottee
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-xs sm:text-sm"
                  onClick={() => {
                    console.log(
                      "Delete button clicked for allottee:",
                      row.original
                    );
                    handleDeleteAllottee(row.original);
                  }}
                >
                  <Trash className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      }
    );

    return baseColumns;
  }, [allottees[0]?.allotmentType, isLoadingAllottees]);

// --- Trigger save effect for batch allottees
  useEffect(() => {
    console.log("useEffect triggered for batch save:", { triggerSave, allottees, crewId });

    if (!triggerSave || !allottees?.length || !crewId) {
      console.log("Exiting useEffect early: Missing triggerSave, allottees, or crewId");
      return;
    }

    const saveAllottees = async () => {
      console.log("Starting batch saveAllottees");
      setAllotteeLoading(true);

      try {
        // Normalize each allottee and merge draft data
        const finalAllottees: AllotteeApiModel[] = allottees.map((allottee) => {
          const draftData = drafts[Number(allottee.id)] || {};
          const normalized: AllotteeApiModel = {
            //...allottee,
            name: draftData.name ?? allottee.name,
            address: draftData.address ?? allottee.address,
            relation: Number(draftData.relationship ?? allottee.relationshipId),
            contactNumber: draftData.contactNumber ? String(draftData.contactNumber) : "",
            accountNumber: draftData.accountNumber ? String(draftData.accountNumber) : "",
            city: Number(draftData.city ?? allottee.cityId),
            province: Number(draftData.province ?? allottee.provinceId),
            bank: draftData.bank ?? 0,
            branch: draftData.branch ?? 0,
            allotment: draftData.allotment ?? allottee.allotment,
            priority: allottee.priority ?? 0,
            active: allottee.active ?? 0,
            allotteeDetailID: allottee.allotteeDetailID,
            allotmentType: allottee.allotmentType,
            //receivePayslip: allottee.receivePayslip ?? 0,
            //Percentage: allottee.Percentage ?? 0,
          };
          console.log("Normalized allottee:", normalized);
          return normalized;
        });

        console.log("Final payload to save:", finalAllottees);

        await updateBatchAllottee(crewId.toString(), finalAllottees);
        console.log("updateBatchAllottee completed successfully");

        toast({
          title: "Allottees saved successfully",
          description: `${finalAllottees.length} allottee(s) have been updated.`,
          variant: "success",
        });

        fetchCrewAllottees(crewId.toString());
        console.log("fetchCrewAllottees called");

        setIsEditingAllottee(false);
      } catch (error: any) {
        console.error("Error saving batch of allottees:", error);
        setIsEditingAllottee(true);

        toast({
          title: "Error saving allottees",
          description: error?.response?.data?.message || "There was an error saving the allottees.",
          variant: "destructive",
        });
      } finally {
        setAllotteeLoading(false);
        setTriggerSave(false);
        console.log("Finished batch saveAllottees, loading set to false, triggerSave reset");
      }
    };

    saveAllottees();
  }, [triggerSave, crewId, allottees, drafts]);

  const handleDeleteAllottee = async (allottee: AllotteeUiModel | null) => {
    if (!allottee) return;

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton:
          "bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 mx-2 rounded",
        cancelButton:
          "bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 mx-2 rounded",
      },
      buttonsStyling: false,
    });

    const result = await swalWithBootstrapButtons.fire({
      title: `Delete Allottee`,
      text: `Are you sure you want to delete ${allottee.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      setEditingAllottee(allottee);
      setDeletingAllottee(true);

      if (!allottee.id || !crewId) {
        console.warn("Missing allottee.id or crewId", {
          allotteeId: allottee.id,
          crewId,
        });
        setDeletingAllottee(false);
        return;
      }

      try {
        const res = await deleteCrewAllottee(
          crewId.toString(),
          allottee.id.toString()
        );
        const percentage = res?.data?.Percentage;

        toast({
          title: "Allottee deleted successfully",
          description: `Allottee ${allottee.name} has been removed.`,
          variant: "success",
        });

        if (percentage !== undefined) {
          toast({
            title: "Updated Allotment Percentage",
            description: `Remaining percentage: ${percentage}%`,
            variant: "default",
          });
        }

        if (allottee.allotmentType === 2 && percentage < 100) {
          toast({
            title: "Update Required.",
            description: `The total allotment percentage is now ${percentage}%, which is below the required 100%. Please update the remaining allottees.`,
            variant: "warning",
          });
        }

        await fetchCrewAllottees(crewId.toString());
      } catch (error) {
        console.error("[deleteCrewAllottee] Error deleting allottee:", error);
        toast({
          title: "Error deleting allottee",
          description: "There was an error deleting the allottee.",
          variant: "destructive",
        });
      } finally {
        setDeletingAllottee(false);
        setIsEditingAllottee(false);
      }
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      swalWithBootstrapButtons.fire({
        title: "Cancelled",
        text: "Process cancelled.",
        icon: "error",
      });
    }
  };

  if (allotteesError) {
    return (
      <div className="text-center text-red-500">Error: {allotteesError}</div>
    );
  }

  // validating the name form for disable only!
  useEffect(() => {
    const validateAllotteeForm = () => {
      const isValid = Boolean(allottees[0]?.name?.trim());
      setIsAllotteeValid(isValid);
    };

    validateAllotteeForm();
  }, [allottees[0], setIsAllotteeValid]);

  //console.log('EDITING ALLOTTEE: ', currentAllottee);

  useEffect(() => {
    if (editselectedAllotteeDialogOpen) {
      document.body.style.overflow = "hidden"; // prevent scrolling
      document.body.style.pointerEvents = "none"; // optional if needed
    } else {
      document.body.style.overflow = "";
      document.body.style.pointerEvents = "";
    }

    // Clean up when component unmounts
    return () => {
      document.body.style.overflow = "";
      document.body.style.pointerEvents = "";
    };
  }, [editselectedAllotteeDialogOpen]);

  return (
    <div className="h-full w-full pt-2">
      <style jsx global>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        /* Hide scrollbar for IE, Edge and Firefox */
        .scrollbar-hide {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>
      <div className="h-full overflow-y-auto">
        <div className="flex flex-col space-y-4 sm:space-y-5 min-h-full">
          {isLoadingAllottees ? (
            <div className="flex justify-center items-center h-32">
              Loading Allottees...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 mb-6">
                <div className="pr-8">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="relative rounded-lg border shadow-sm overflow-hidden">
                      <div className="flex h-11 w-full">
                        <div className="flex items-center px-4 bg-gray-50 border-r">
                          <span className="text-gray-700 font-medium whitespace-nowrap">
                            Allotment Type
                          </span>
                        </div>
                        <div className="flex-1 w-full flex items-center">
                          <Select
                            value={
                              (isEditingAllottee || isAdding
                                ? allottees[0]?.allotmentType
                                : allottees[0]?.allotmentType
                              )?.toString() || ""
                            }
                            onValueChange={(value) => {
                              if (isEditingAllottee || isAdding) {
                                setAllottees((prev) =>
                                  prev.map((allottee, index) =>
                                    index === 0
                                      ? {
                                        ...allottee,
                                        allotmentType: parseInt(value),
                                      }
                                      : allottee
                                  )
                                );
                              } else {
                                setAllottees((prev) =>
                                  prev.map((allottee, index) =>
                                    index === 0
                                      ? {
                                        ...allottee,
                                        allotmentType: parseInt(value),
                                      }
                                      : allottee
                                  )
                                );
                              }
                            }}
                          >
                            <SelectTrigger className="h-full w-full border-0 shadow-none focus:ring-0 rounded-none px-4 font-medium cursor-pointer">
                              <SelectValue placeholder="Amount" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Amount</SelectItem>
                              <SelectItem value="2">Percentage</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* <div className="p-3 space-y-6">
                  <div className="flex items-center justify-end mb-3">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={!!displayAllottee?.priority}
                          onChange={(e) =>
                            handleInputChange("priority", e.target.checked ? 1 : 0)
                          }
                          disabled={!isEditingAllottee && !isAdding}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label className="text-sm font-medium text-gray-900">
                          Priority Allotment
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={!!displayAllottee?.receivePayslip}
                          onChange={(e) =>
                            handleInputChange("receivePayslip", e.target.checked ? 1 : 0)
                          }
                          disabled={!isEditingAllottee && !isAdding}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label className="text-sm font-medium text-gray-900">
                          Dollar Allotment
                        </label>
                      </div>
                    </div>
                  </div>
                </div> */}
              </div>
              <div className="text-center">
                <DataTable columns={columns} data={allottees} pageSize={7} />
              </div>
            </>
          )}
        </div>
        {selectedAllotteeData && editselectedAllotteeDialogOpen && (
          <EditAllotteeDialog
            open={editselectedAllotteeDialogOpen}
            onOpenChange={(open) => {
              setEditselectedAllotteeDialogOpen(open);
            }}
            SelectedAllotteeData={selectedAllotteeData}
          />
        )}
      </div>
    </div>
  );
}
