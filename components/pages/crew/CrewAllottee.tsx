"use client";

import {
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  useMemo,
  useRef,
} from "react";
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
import {
  deleteCrewAllottee,
  updateBatchAllottee,
} from "@/src/services/crew/crewAllottee.api";
import { toast } from "@/components/ui/use-toast";
import { useAllotteeFormStore } from "@/src/store/useAllotteeFormStore";
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, Eye, Info, MoreHorizontal, Pencil, Plus, Trash, X } from "lucide-react";
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
import {
  DraftAllottee,
  useEditAllotteeStore,
} from "@/src/store/useEditAllotteeStore";
import { EditAllotteeDialog } from "./EditCrewAllotteeDialog";
import AddCrewAllotteeForm from "./AddCrewAllotteeForm";
import { useAddAllotteeStore } from "@/src/store/useAddAllotteeStore";
import { useAllotteeTriggerStore } from "@/src/store/usetriggerAdd";

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
  setIsAddingAllottee: Dispatch<SetStateAction<boolean>>;
  isAddingAllottee?: boolean;
}

type SavedAllotmentData = {
  allotmentType?: number;
  priority: any;
  allotments: number[];
  receivePayslips: (number | undefined)[];
};

export function CrewAllottee({
  isEditingAllottee = false,
  isAdding = false,
  triggerSave,
  setAllotteeLoading,
  setTriggerSave,
  setIsEditingAllottee = () => { },
  setIsAddingAllottee,
  isAddingAllottee,
}: ICrewAllotteeProps) {
  const searchParams = useSearchParams();
  const crewId = searchParams.get("id");
  const [allottees, setAllottees] = useState<AllotteeUiModel[]>([]);
  const [editingAllottee, setEditingAllottee] = useState<AllotteeUiModel | null>(null);
  const { isAllotteeValid, setIsAllotteeValid } = useAllotteeFormStore();
  const [selectedAllotteeData, setSelectedAllotteeData] = useState<AllotteeUiModel | null>(null);
  const [editselectedAllotteeDialogOpen, setEditselectedAllotteeDialogOpen] = useState(false);
  const [deletingAllottee, setDeletingAllottee] = useState(false);
  const [savedAllotments, setSavedAllotments] = useState<Record<number, SavedAllotmentData>>({});
  const drafts = useEditAllotteeStore((state) => state.drafts);
  const clearDraft = useEditAllotteeStore((state) => state.clearDraft);
  const [editedAllottees, setEditedAllottees] = useState<Record<number, boolean>>({});
  const newAllottee = useAddAllotteeStore((state) => state.newAllottee);
  const triggerAdd = useAllotteeTriggerStore((state) => state.triggerAdd);
  const triggerEdit = useAllotteeTriggerStore((state) => state.triggerAdd);

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
    const newStatus: Record<number, boolean> = {};

    Object.keys(drafts).forEach((key) => {
      const allotteeId = Number(key);
      const draft = drafts[allotteeId];

      newStatus[allotteeId] = draft && Object.keys(draft).length > 0;
    });

    setEditedAllottees(newStatus);
  }, [drafts]);

  const originalTypeRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (allottees.length > 0 && originalTypeRef.current === undefined) {
      originalTypeRef.current = allottees[0].allotmentType;
    }
  }, [allottees]);

  useEffect(() => {
    if (!isEditingAllottee && allottees.length > 0) {
      const firstType = originalTypeRef.current;

      if (firstType && savedAllotments[firstType]) {
        const saved = savedAllotments[firstType];
        setAllottees((prev) =>
          prev.map((a, i) => ({
            ...a,
            allotmentType: firstType,
            allotment: saved.allotments[i] ?? 0,
            receivePayslip: saved.receivePayslips[i] ?? undefined,
            priority: saved.priority[i] ?? undefined,
          }))
        );
      } else {
        console.warn(
          "No saved data found for the original type, nothing restored."
        );
      }
    }
  }, [isEditingAllottee]);

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
      priority: a.priority,
      receivePayslip: a.receivePayslip,
      active: a.active ? 1 : 0,
      allotmentType: a.AllotmentType,
      allotteeDetailID: a.AllotteeDetailID,
    }));

    setAllottees(mapped);
  }, [storeAllottees]);

  // useEffect(() => {
  //   if (allottees) {
  // setAllotteesZustand(allottees.map(a => a.allotmentType));
  //   }
  // }, [allottees]);

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
          header: () => <div className="text-center">Priority</div>,
          cell: ({ row }) => {
            const value = row.getValue<number>("priority");
            const allotteeId = row.original.id;

            return (
              <div className="flex justify-center w-full h-full">
                <Select
                  value={value?.toString() ?? ""}
                  disabled={!(isEditingAllottee || isAddingAllottee)}
                  onValueChange={(newValue) => {
                    const parsed = parseInt(newValue);
                    setAllottees((prev) =>
                      prev.map((a) =>
                        a.id === allotteeId ? { ...a, priority: parsed } : a
                      )
                    );
                  }}
                >
                  <SelectTrigger>
                    {value === 0 ? "Yes" : value === 1 ? "No" : "Select"}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Yes</SelectItem>
                    <SelectItem value="1">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            );
          },
        },
        {
          accessorKey: "receivePayslip",
          header: () => <div className="text-center">Currency</div>,
          cell: ({ row }) => {
            const value = row.getValue<number | undefined>("receivePayslip");
            const allotteeId = row.original.id;

            return (
              <div className="flex justify-center w-full h-full">
                <Select
                  value={value?.toString() ?? ""}
                  disabled={!(isEditingAllottee || isAddingAllottee)}
                  onValueChange={(newValue) => {
                    const parsed = parseInt(newValue);
                    setAllottees((prev) =>
                      prev.map((a) =>
                        a.id === allotteeId
                          ? { ...a, receivePayslip: parsed }
                          : a
                      )
                    );
                  }}
                >
                  <SelectTrigger>
                    {value === 0 ? "PHP" : value === 1 ? "USD" : "Select"}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">PHP</SelectItem>
                    <SelectItem value="1">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            );
          },
        }
      );
    }

    baseColumns.push(
      {
        accessorKey: "allotment",
        header: () => <div className="text-center">Allotment {allottees?.[0]?.allotmentType === 2 ? "%" : ""}</div>,
        cell: ({ row }) => {
          //const allotmentType = row.original.allotmentType;
          const allotteeId = row.original.id;
          const allotmentValue = row.getValue<number>("allotment") ?? 0;

          return (
            <>
            <input
              type="number"
              disabled={!(isEditingAllottee || isAddingAllottee)}
              value={allotmentValue}
              onChange={(e) => {
                const newValue = parseInt(e.target.value);
                setAllottees((prev) =>
                  prev.map((a) =>
                    a.id === allotteeId ? { ...a, allotment: newValue } : a
                  )
                );
              }}
              className="w-16 text-center border border-gray-300 rounded px-1 py-0.5 text-sm mr-1"
            />
              {allottees?.[0]?.allotmentType === 2 ? "%" : ""}
            </>
          );
        },
      },
      {
        accessorKey: "isEdited",
        header: () => <div className="items-center">Modal Status</div>,
        cell: ({ row }) => {
          const allotteeId = Number(row.original.id);
          const isEdited = editedAllottees[allotteeId];

          return (
            <div className="text-center">
              {isEdited ? (
                <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs font-semibold">
                  Edited
                </span>
              ) : (
                <span className="px-2 py-1 bg-gray-200 text-gray-500 rounded-full text-xs font-semibold">
                  Not Edited
                </span>
              )}
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
                  <>
                    <DropdownMenuItem
                      className="text-xs sm:text-sm"
                      onClick={() => {
                        setSelectedAllotteeData(row.original);
                        setEditselectedAllotteeDialogOpen(true);
                      }}
                    >
                      {isEditingAllottee ? (
                        <Pencil className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                      ) : (
                        <Eye className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                      )}
                      {isEditingAllottee || isAddingAllottee ? "Edit Allottee" : "View Allottee"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                <DropdownMenuItem
                  className="text-destructive text-xs sm:text-sm cursor-pointer"
                  onClick={() => {
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
      },
    );

    return baseColumns;
  }, [
    allottees[0]?.allotmentType,
    isLoadingAllottees,
    editedAllottees,
    isEditingAllottee,
    isAddingAllottee,
  ]);

  // --- Trigger save effect for batch allottees
  useEffect(() => {
    console.log("=== useEffect triggered for saving allottees ===");

    // Exit early if nothing to do
    if ((!triggerSave && !triggerEdit) || !crewId) {
      console.log("Nothing to do. Exiting effect.");
      return;
    }

    const saveAllottees = async () => {
      setAllotteeLoading(true);
      console.log("Saving allottees...");

      try {
        const edit: AllotteeApiModel[] = [];
        const create: AllotteeApiModel[] = [];

        console.log("Processing existing allottees:", allottees);

        // Existing allottee processing
        allottees.forEach((allottee) => {
          const draftData = drafts[Number(allottee.id)] || {};
          const isNew = !allottee.allotteeDetailID;

          const normalized: AllotteeApiModel = {
            allotteeDetailId: allottee.allotteeDetailID ?? 0,
            allotmentType: allottee.allotmentType,
            allotment: draftData.allotment ?? allottee.allotment,
            name: draftData.name ?? allottee.name,
            address: draftData.address ?? allottee.address,
            relation: Number(draftData.relationship ?? allottee.relationshipId),
            contactNumber: draftData.contactNumber
              ? String(draftData.contactNumber)
              : "",
            accountNumber: draftData.accountNumber
              ? String(draftData.accountNumber)
              : "",
            city: Number(draftData.city ?? allottee.cityId),
            province: Number(draftData.province ?? allottee.provinceId),
            bank: draftData.bank ?? 0,
            branch: draftData.branch ?? 0,
            receivePayslip: Number(
              draftData.receivePayslip ?? allottee.receivePayslip
            ),
            priority: allottee.priority ?? 0,
            active: allottee.active ?? 0,
          };

          console.log("Normalized existing allottee:", normalized);

          if (isNew) {
            create.push(normalized);
          } else {
            edit.push(normalized);
          }
        });

        // Add the single new allottee if triggerAdd is true
        if (triggerAdd && newAllottee) {
          const newItem: AllotteeApiModel = {
            allotmentType: newAllottee.allotmentType,
            allotment: newAllottee.allotment,
            name: newAllottee.name,
            address: newAllottee.address,
            relation: newAllottee.relation,
            contactNumber: newAllottee.contactNumber,
            accountNumber: newAllottee.accountNumber,
            city: newAllottee.city,
            province: newAllottee.province,
            bank: newAllottee.bank,
            branch: newAllottee.branch,
            receivePayslip: newAllottee.receivePayslip,
            priority: newAllottee.priority,
            isActive: 1,
          };
          console.log("Adding new allottee:", newItem);
          create.push(newItem);
        }

        const payload = { edit, create };
        console.log("Final payload to save:", payload);

        await updateBatchAllottee(crewId.toString(), payload);

        console.log("Allottees saved successfully!");
        toast({
          title: "Allottees saved successfully",
          description: `${edit.length} edited, ${create.length} created.`,
          variant: "success",
        });

        fetchCrewAllottees(crewId.toString());
        setIsEditingAllottee(false);

        setAllottees([]);

        // Reset store & triggers
        useAddAllotteeStore.getState().resetAllottee();
        setTriggerSave(false);
        useAllotteeTriggerStore.getState().setTriggerAdd(false);
        console.log("Reset triggerSave and triggerAdd");
      } catch (error: any) {
        console.error("Error saving allottees:", error);
        setIsEditingAllottee(true);
        setIsEditingAllottee(false);

        toast({
          title: "Error saving allottees",
          description:
            error?.response?.data?.message ||
            "There was an error saving the allottees.",
          variant: "destructive",
        });
      } finally {
        setAllotteeLoading(false);
      }
    };

    saveAllottees();
  }, [triggerSave, triggerEdit, crewId, allottees, drafts, newAllottee]);

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
        //setIsAddingAllottee(false);
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

  useEffect(() => {
    if (editselectedAllotteeDialogOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.pointerEvents = "none";
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

          /* Hide scrollbar for all scrollable elements in the component */
          .overflow-y-auto::-webkit-scrollbar,
          .overflow-auto::-webkit-scrollbar,
          .overflow-scroll::-webkit-scrollbar {
            display: none;
          }

          .overflow-y-auto,
          .overflow-auto,
          .overflow-scroll {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      <div className="h-full">
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
                              allottees[0]?.allotmentType?.toString() || ""
                            }
                            disabled={!isEditingAllottee && !isAddingAllottee}
                            onValueChange={(value) => {
                              const parsed = parseInt(value);
                              console.log("Selected value:", value, "Parsed:", parsed);

                              setAllottees((prev) => {
                                const prevType = prev[0]?.allotmentType;
                                console.log("Previous type:", prevType);
                                console.log("Current allottees before change:", prev);

                                // Save current allotments under their type
                                if (prevType) {
                                  // save the detailed allotments
                                  setSavedAllotments((prevSaved) => {
                                    const newSaved = {
                                      ...prevSaved,
                                      [prevType]: {
                                        allotments: prev.map((a) => a.allotment),
                                        receivePayslips: prev.map((a) => a.receivePayslip),
                                        priority: prev.map((a) => a.priority),
                                      },
                                    };
                                    console.log("Saved allotments:", newSaved);
                                    return newSaved;
                                  });                            
                                }


                                // Restore saved data for the new type
                                if (savedAllotments[parsed]) {
                                  console.log("Restoring saved allotments for type:", parsed);
                                  return prev.map((allottee, index) => ({
                                    ...allottee,
                                    allotmentType: parsed,
                                    allotment:
                                      savedAllotments[parsed].allotments[index] ?? 0,
                                    receivePayslip:
                                      savedAllotments[parsed].receivePayslips[index] ?? undefined,
                                    priority:
                                      savedAllotments[parsed].priority[index] ?? undefined,
                                  }));
                                }

                                // If not editing, revert to previous type
                                if (!isEditingAllottee && !isAddingAllottee) {
                                  console.log("Not editing, reverting to previous type:", prevType);
                                  return prev.map((a) => ({
                                    ...a,
                                    allotmentType: prevType,
                                  }));
                                }

                                // Otherwise, reset to defaults
                                console.log("Resetting allotments to defaults for new type:", parsed);
                                return prev.map((allottee) => ({
                                  ...allottee,
                                  allotmentType: parsed,
                                  allotment: 0,
                                  receivePayslip: undefined,
                                  priority: undefined,
                                }));
                              });
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
                <div className="w-84 text-left mt-2">
                  {isEditingAllottee ? (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full">
                      <Pencil size={16} />
                      Editing
                    </span>
                  ) : isAddingAllottee ? (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-green-700 bg-green-100 rounded-full">
                      <Plus size={16} />
                      Adding
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-full">
                      <Eye size={16} />
                      Viewing
                    </span>
                  )}
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
                <DataTable
                  columns={columns}
                  data={allottees}
                  pageSize={7}
                  pagination={false}
                />
              </div>
              {/* <div className="text-center">
                <DataTable
                  columns={draftsColumns}
                  data={Object.entries(drafts).map(([id, values]) => ({
                    allotteeId: Number(id),
                    ...values,
                  }))}
                  pageSize={7}
                  pagination={false}
                />
              </div> */}
              {isAddingAllottee && (
                <AddCrewAllotteeForm
                  allottees={allottees}
                />
              )}
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
            isEditingAllottee={isEditingAllottee}
            isAddingAllottee={isAddingAllottee ?? null} 
          />
        )}
      </div>
    </div>
  );
}
