"use client";

import {
  useState,
  useEffect,
  useMemo,
  Dispatch,
  SetStateAction,
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
import { useLocationStore } from "@/src/store/useLocationStore";
import { useBankStore } from "@/src/store/useBankStore";
import { useRelationshipStore } from "@/src/store/useRelationshipStore";
import { AllotteeUiModel, AllotteeApiModel } from "@/types/crewAllottee";
import {
  deleteCrewAllottee,
  updateCrewAllottee,
} from "@/src/services/crew/crewAllottee.api";
import { toast } from "@/components/ui/use-toast";
import { useAllotteeFormStore } from "@/src/store/useAllotteeFormStore";
import React from "react";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Swal from "sweetalert2";

// Empty UI model for initialization
const emptyAllottee: AllotteeUiModel = {
  id: "",
  name: "",
  relationship: "",
  relationshipId: 0,
  contactNumber: "",
  address: "",
  city: "",
  cityId: "",
  province: "",
  provinceId: "",
  bankName: "",
  bankId: "",
  bankBranch: "",
  branchId: "",
  accountNumber: "",
  allotment: 0,
  active: 0,
  priority: 0,
  receivePayslip: 0,
  allotmentType: 1,
  allotteeDetailID: "",
};

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
  //setTriggerDelete,
  //triggerDelete,
  // setIsDeletingAllottee,
}: ICrewAllotteeProps) {
  const searchParams = useSearchParams();
  const crewId = searchParams.get("id");
  const [allottees, setAllottees] = useState<AllotteeUiModel[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<string>("0");
  const [currentAllottee, setCurrentAllottee] = useState<AllotteeUiModel | null>(null);
  const [editingAllottee, setEditingAllottee] = useState<AllotteeUiModel | null>(null);
  const [searchCity, setSearchCity] = useState("");
  const [searchProvince, setSearchProvince] = useState("");
  const [previousAllotteeId, setPreviousAllotteeId] = useState<string>("");
  const { isAllotteeValid, setIsAllotteeValid } = useAllotteeFormStore();
  const [allotteeErrors, setAllotteeErrors] = useState<Record<string, string>>({});
  const [selectedAllotteeData, setSelectedAllotteeData] = useState<AllotteeUiModel | null>(null);
  const [editselectedAllotteeDialogOpen, setEditselectedAllotteeDialogOpen] = useState(false);
  const [deletingAllottee, setDeletingAllottee] = useState(false);

  console.log('ALLOTTEES: ', allottees);

  const {
    allottees: storeAllottees,
    isLoadingAllottees,
    allotteesError,
    fetchCrewAllottees,
    resetAllottees,
  } = useCrewStore();

  const {
    fetchBanks,
    setSelectedBankId,
    setSelectedBranchId,
    getUniqueBanks,
    getBranchesForSelectedBank,
  } = useBankStore();

  const { allRelationshipData, fetchRelationships } = useRelationshipStore();
  const { loading, cities, provinces, fetchCities, fetchProvinces } =
    useLocationStore();

  useEffect(() => {
    if (!crewId) return;
    fetchCrewAllottees(crewId);
    return () => {
      resetAllottees();
    };
  }, [crewId, fetchCrewAllottees, resetAllottees]);

  useEffect(() => {
    fetchRelationships();
  }, [fetchRelationships]);

  useEffect(() => {
    fetchBanks();
  }, [fetchBanks]);

  const uniqueBanks = getUniqueBanks();
  const branchesForSelectedBank = getBranchesForSelectedBank();

  useEffect(() => {
    const mapped = storeAllottees.map((a) => ({
      id: a.AllotteeDetailID,
      name: a.AllotteeName,
      relationship: a.RelationName,
      relationshipId: a.RelationID ?? 0, // use 0 if missing
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

    if (previousAllotteeId) {
      const previousIndex = mapped.findIndex(
        (a) => a.id === previousAllotteeId
      );
      if (previousIndex >= 0) {
        setSelectedIndex(previousIndex.toString());
      } else {
        setSelectedIndex("0");
      }
    } else {
      setSelectedIndex("0");
    }
  }, [storeAllottees, previousAllotteeId]);

  useEffect(() => {
    if (isAdding) {
      setCurrentAllottee(emptyAllottee);
      setEditingAllottee(emptyAllottee);
    } else if (allottees.length > 0) {
      const index = parseInt(selectedIndex, 10);
      setCurrentAllottee({ ...allottees[index] });

      if (isEditingAllottee) {
        setEditingAllottee({ ...allottees[index] });

        if (allottees[index].bankId) {
          setSelectedBankId(Number(allottees[index].bankId));
        }
        if (allottees[index].branchId) {
          setSelectedBranchId(Number(allottees[index].branchId));
        }
      }
    } else {
      setCurrentAllottee(null);
      setEditingAllottee(null);
    }
  }, [
    selectedIndex,
    allottees,
    isAdding,
    isEditingAllottee,
    setSelectedBankId,
    setSelectedBranchId,
  ]);

  useEffect(() => {
    fetchCities();
    fetchProvinces();
  }, [fetchCities, fetchProvinces]);

  const lastProcessedIndexRef = useRef<string | null>(null);

  // table
  const columns: ColumnDef<(typeof allottees)[number]>[] = [
    {
      accessorKey: "allotteeDetailID",
      header: () => <div className="text-justify">Allotee ID</div>,
      cell: ({ row }) => (
        <div className="text-justify">{row.getValue("allotteeDetailID")}</div>
      ),
    },
    {
      accessorKey: "name",
      header: () => <div className="text-justify">Crew Name</div>,
      cell: ({ row }) => {
        const name = row.getValue("name") as string;
        //const profileImage = row.original.ProfileImage as string | undefined;

        return (
          <div className="flex items-center space-x-3 text-justify">
            {isLoadingAllottees ? (
              <img
                //src={profileImage}
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
    {
      accessorKey: "status",
      header: () => <div className="text-left">Status</div>,
      cell: ({ row }) => {
        const status = row.getValue("status") as string;

        const badgeClass = {
          "On board": "bg-green-100 text-green-800 hover:bg-green-100/80",
          "Off board": "bg-red-100 text-red-800 hover:bg-red-100/80",
        }[status] || "bg-gray-100 text-gray-800 hover:bg-gray-100/80";

        return (
          <div className="flex text-left">
            <Badge variant="secondary" className={badgeClass}>
              {status}
            </Badge>
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
              <Button
                variant="ghost"
                className="h-7 sm:h-8 w-7 sm:w-8 p-0"
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="text-xs sm:text-sm"
            >
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
                className="text-destructive text-xs sm:text-sm"
                onClick={() => {
                  console.log("Delete button clicked for allottee:", row.original);
                  handleDeleteAllottee(row.original);
                }}                >
                <Trash className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    }
  ];

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

    console.log("handleDeleteAllottee triggered for:", allottee);

    const result = await swalWithBootstrapButtons.fire({
      title: `Delete Allottee`,
      text: `Are you sure you want to delete ${allottee.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      reverseButtons: true
    });

    if (result.isConfirmed) {
      setEditingAllottee(allottee);
      setDeletingAllottee(true);

      if (!allottee.id || !crewId) {
        console.warn("Missing allottee.id or crewId", { allotteeId: allottee.id, crewId });
        setDeletingAllottee(false);
        return;
      }

      try {
        const res = await deleteCrewAllottee(crewId.toString(), allottee.id.toString());
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

  const displayAllottee =
    isEditingAllottee || isAdding
      ? editingAllottee
      : currentAllottee;

  // validating the name form for disable only!
  useEffect(() => {
    const validateAllotteeForm = () => {
      const isValid = Boolean(displayAllottee?.name?.trim());
      setIsAllotteeValid(isValid);
    };

    validateAllotteeForm();
  }, [displayAllottee, setIsAllotteeValid]);

  const commonAllotmentType = React.useMemo(() => {
    if (!allottees || allottees.length === 0) return null;

    const hasPercentage = allottees.some((a) => a.allotmentType === 2);
    const hasAmount = allottees.some((a) => a.allotmentType === 1);

    if (hasPercentage && !hasAmount) return 2;
    if (hasAmount && !hasPercentage) return 1;

    return null; // mixed or undefined
  }, [allottees]);

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
      <div className="h-full overflow-y-auto scrollbar-hide">
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
                              commonAllotmentType !== null
                                ? commonAllotmentType.toString()
                                : displayAllottee?.allotmentType?.toString() || "1"
                            }
                          //disabled={commonAllotmentType !== null}
                          // onValueChange={(value) =>
                          //   handleInputChange("allotmentType", parseInt(value))
                          // }
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
                {/* Add Allottee  */}
              </div>
              <div className="text-center">
                <DataTable
                  columns={columns}
                  data={allottees}
                  pageSize={7}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Edit component here */}

    </div>
  );
}
