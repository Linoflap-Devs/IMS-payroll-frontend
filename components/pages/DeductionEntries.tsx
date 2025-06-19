"use client";

import {
  useState,
  useEffect,
  useCallback,
  Dispatch,
  SetStateAction,
} from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  User,
  Phone,
  PhoneCall,
  Mail,
  MoreHorizontal,
  Ship,
  Calendar,
  CircleCheck,
  CircleEllipsis,
  CircleX,
  CircleDot,
  Loader2,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { RiShieldStarLine } from "react-icons/ri";
import { AddDeductionDialog } from "@/components/dialogs/AddDeductionDialog";
import { Switch } from "@/components/ui/switch";
import {
  getDeductionEntries,
  DeductionEntries as DeductionEntriesType,
  getCrewDeductionList,
  updateCrewDeductionEntry,
  addHDMFUpgrade,
  getCrewHDMFUpgrade,
} from "@/src/services/deduction/crewDeduction.api";
import { getCrewBasic } from "@/src/services/crew/crew.api";
import Base64Image from "../Base64Image";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { toast } from "../ui/use-toast";

type Props = {
  crewCode: string | null;
  setOnSuccess: Dispatch<SetStateAction<boolean>>;
};

const apiDeductionColumns = ({
  crewCode,
  setOnSuccess,
}: Props): ColumnDef<DeductionEntriesType>[] => [
  {
    accessorKey: "Deduction",
    header: "Deduction",
  },
  {
    accessorKey: "Amount",
    header: "Amount",
    cell: ({ row }) => {
      return <div className="text-right">{row.original.Amount.toFixed(2)}</div>;
    },
  },
  {
    accessorKey: "Remarks",
    header: "Remarks",
  },
  {
    accessorKey: "Status",
    header: "Status",
    cell: ({ row }) => {
      // Map numeric status to string labels
      // const statusMap: Record<number, string> = {
      //   0: "Completed",
      //   2: "Pending",
      //   3: "Adjusted",
      //   4: "Failed",
      //   5: "On Hold",
      // };
      // console.log("Row Status:", row.original.Status);

      // const statusLabel = statusMap[row.original.Status] || "Unknown";

      // 0 - completed
      // 1 - pending
      // 2 -  declined
      // 3 - on hold

      const getStatusColor = (statusCode: string) => {
        switch (statusCode) {
          case "Completed": // Completed
            return "bg-green-100 text-green-800";
          case "Pending": // Pending
            return "bg-yellow-100 text-yellow-800";
          case "Adjusted": // Adjusted
            return "bg-blue-100 text-blue-800";
          case "Failed": // Failed
            return "bg-red-100 text-red-800";
          case "On Hold": // On Hold
            return "bg-gray-100 text-gray-800";
          default:
            return "bg-gray-100 text-gray-800";
        }
      };

      return (
        <div className="flex justify-center">
          <span
            className={`px-2 py-1 w-full rounded-full text-xs ${getStatusColor(
              row.original.Status.toString(10) // Convert numeric status to string for mapping
            )}`}>
            {row.original.Status.toString(10)}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const deductionId = row.original.DeductionDetailID;

      const statusMap: Record<number, string> = {
        1: "Completed",
        0: "Pending",
        2: "Declined",
        3: "On Hold",
      };

      const handleEdit = (status: number) => {
        // Handle edit logic here

        if (!crewCode) {
          console.error(
            "Crew code is not available for updating deduction entry."
          );
          return;
        }

        const payload = {
          status,
        };

        // const statusLabel = statusMap[status] || statusMap[1];

        updateCrewDeductionEntry(crewCode, deductionId, payload)
          .then((response) => {
            if (response.success) {
              toast({
                title: "Deduction entry updated successfully",
                description: `Status changed to ${statusMap[status]}`,
                variant: "success",
              });
              setOnSuccess(true);
            } else {
              toast({
                title: "Failed to update deduction entry",
                description: response.message || "Unknown error",
                variant: "destructive",
              });
            }
          })
          .catch((error) => {
            console.error("Error updating deduction entry:", error);
            toast({
              title: "Error updating deduction entry",
              description: error.message || "An error occurred",
              variant: "destructive",
            });
          });
      };

      return (
        <div className="text-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-7 sm:h-8 w-7 sm:w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-xs sm:text-sm">
              <DropdownMenuItem onClick={() => handleEdit(1)}>
                <CircleCheck strokeWidth={2} />
                Completed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(0)}>
                <CircleEllipsis strokeWidth={2} />
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(2)}>
                <CircleX strokeWidth={2} />
                Declined
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(3)}>
                <CircleDot strokeWidth={2} />
                On Hold
              </DropdownMenuItem>
              {/* <DropdownMenuSeparator /> */}

              {/* DELETE IS NOT NEEDED AS PER SIR WENDELL */}

              {/* <DropdownMenuItem className="text-red-600">
                <Trash className="text-red-600" />
                Delete
              </DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

export default function DeductionEntries() {
  const params = useSearchParams();
  const crewCode = params.get("crewCode");

  const [activeTab, setActiveTab] = useState("deduction-entries");
  const [selectedMonth, setSelectedMonth] = useState("August");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [isAddDeductionOpen, setIsAddDeductionOpen] = useState(false);
  const [isDollar, setIsDollar] = useState(false);
  const [crewData, setCrewData] = useState({
    name: "",
    rank: "",
    vessel: "",
    crewCode: "",
    mobileNo: "",
    landlineNo: "",
    emailAddress: "",
    birthday: "",
    profileImage: {
      FileContent: "",
      FileExtension: "",
      ContentType: "",
    },
  });
  const [loading, setLoading] = useState(false);
  const [deductionEntries, setDeductionEntries] = useState<
    DeductionEntriesType[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [onSuccess, setOnSuccess] = useState(false);
  const [HDMFUpgradeAmount, setHDMFUpgradeAmount] = useState<number>(0);
  const [hdmfLoading, setHdmfLoading] = useState(false);

  // HDMF Upgrade
  // const [currentHdmfUpgradeAmount, setCurrentHdmfUpgradeAmount] = useState<
  //   number | null
  // >(null);
  // const [currentIsDollar, setCurrentIsDollar] = useState<number>(0);
  const [onSuccessHDMF, setOnSuccessHDMF] = useState(false);

  // Function to fetch deduction entries
  const fetchDeductionEntries = useCallback(
    async (crewCode: string) => {
      if (!crewCode) return;

      setLoading(true);
      setError(null);

      try {
        const response = await getDeductionEntries(crewCode);

        if (response.success) {
          setDeductionEntries(response.data);

          // Process the years and months from the data
          if (response.data.length > 0) {
            // Extract unique years from the data
            const years = [
              ...new Set(response.data.map((entry) => entry.Year.toString())),
            ];

            // Sort years in descending order (newest first)
            years.sort((a, b) => parseInt(b) - parseInt(a));

            setAvailableYears(years);

            // Set the default selected year to the most recent one
            if (years.length > 0 && !years.includes(selectedYear)) {
              setSelectedYear(years[0]);
            }

            // Extract unique months from the data
            const months = [
              ...new Set(response.data.map((entry) => entry.Month)),
            ];

            // Sort months in calendar order
            const monthOrder = [
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ];
            months.sort(
              (a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b)
            );

            setAvailableMonths(months.length > 0 ? months : monthOrder);

            // Set default month if current selection isn't in the available months
            if (months.length > 0 && !months.includes(selectedMonth)) {
              setSelectedMonth(months[0]);
            }
          } else {
            // Default values if no data
            setAvailableYears(["2025", "2024", "2023"]);
            setAvailableMonths([
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ]);
          }
        } else {
          setError(response.message || "Failed to fetch deduction entries");
          console.error("API Error:", response.message);
        }
      } catch (err) {
        setError("Error fetching deduction entries");
        console.error("Error fetching deduction entries:", err);
      } finally {
        setLoading(false);
      }
    },
    [selectedYear, selectedMonth]
  );

  // Read the parameters from URL and fetch crew details
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    const crewCodeParam = params.get("crewCode");

    if (tabParam === "hdmf-upgrade") {
      setActiveTab("hdmf-upgrade");
    }

    // Fetch crew details if we have a crew code
    if (crewCodeParam) {
      const decodedCrewCode = decodeURIComponent(crewCodeParam);

      // Fetch both crew basic info and vessel info in parallel
      Promise.all([getCrewBasic(decodedCrewCode), getCrewDeductionList()])
        .then(([basicResponse, deductionResponse]) => {
          if (basicResponse.success) {
            const { data } = basicResponse;
            // console.log("Crew Basic Data:", data);

            // Find the crew's vessel from the deduction list
            const crewVessel = deductionResponse.success
              ? deductionResponse.data.find(
                  (item) => item.CrewCode === decodedCrewCode
                )?.VesselName
              : "";

            setCrewData({
              name: `${data.FirstName} ${
                data.MiddleName ? data.MiddleName.charAt(0) + ". " : ""
              }${data.LastName}`,
              rank: data.Rank,
              vessel: crewVessel || "",
              crewCode: decodedCrewCode,
              mobileNo: data.MobileNo,
              landlineNo: data.LandLineNo,
              emailAddress: data.EmailAddress,
              birthday: data.Birthday,
              profileImage: {
                FileContent: data.ProfileImage?.FileContent || "",
                FileExtension: data.ProfileImage?.FileExtension || "",
                ContentType: data.ProfileImage?.ContentType || "",
              },
            });

            // After getting crew info, fetch deduction entries
            fetchDeductionEntries(decodedCrewCode);
          }
        })
        .catch((error) => {
          console.error("Error fetching crew details:", error);
          setError("Failed to fetch crew details");
        });
    }
  }, [fetchDeductionEntries]);

  useEffect(() => {
    if (crewData.crewCode) {
      const fetchCrewHDMFUpgrade = async () => {
        getCrewHDMFUpgrade(crewData.crewCode)
          .then((response) => {
            if (response.success && response.data) {
              const hdmfData = response.data[0];

              // Set the current values
              // setCurrentHdmfUpgradeAmount(hdmfData.HDMFAmount ?? 0);
              // setCurrentIsDollar(hdmfData.DollarCurrency ?? 0);

              // Initialize the form fields with current values
              setHDMFUpgradeAmount(hdmfData?.HDMFAmount ?? 0);
              setIsDollar(hdmfData?.DollarCurrency === 1);
            } else {
              console.error("Failed to fetch HDMF Upgrade:", response);
            }
            console.log(response.data);
          })
          .catch((error) => {
            console.error("Error fetching HDMF Upgrade:", error);
            toast({
              title: "Error fetching HDMF Upgrade",
              description: error.message || "An error occurred",
              variant: "destructive",
            });
          });
      };

      fetchCrewHDMFUpgrade();

      if (onSuccessHDMF) {
        // Reset onSuccessHDMF state after fetching new data
        fetchCrewHDMFUpgrade();
        setOnSuccessHDMF(false);
      }
    }
  }, [crewData.crewCode, onSuccessHDMF]);

  // Re-fetch data when month or year changes
  useEffect(() => {
    if (crewData.crewCode) {
      fetchDeductionEntries(crewData.crewCode);
    }

    if (onSuccess) {
      // Reset onSuccess state after fetching new data
      fetchDeductionEntries(crewData.crewCode);
      setOnSuccess(false);
    }
  }, [
    selectedMonth,
    selectedYear,
    crewData.crewCode,
    fetchDeductionEntries,
    onSuccess,
  ]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);

    const url = new URL(window.location.href);
    url.searchParams.set("tab", value);

    window.history.pushState({}, "", url.toString());
  };

  // Filter entries by selected month and year
  const filteredEntries = deductionEntries.filter((entry) => {
    return (
      entry.Month === selectedMonth && entry.Year.toString() === selectedYear
    );
  });

  const handleSubmitHDMFUpgrade = () => {
    setHdmfLoading(true);

    addHDMFUpgrade(crewData.crewCode, HDMFUpgradeAmount, isDollar ? 1 : 0)
      .then((response) => {
        if (response.success) {
          toast({
            title: "HDMF Upgrade Amount saved successfully",
            description: `Amount: ${HDMFUpgradeAmount} ${
              isDollar ? "USD" : "PHP"
            }`,
            variant: "success",
          });
          setOnSuccess(true);
          setHDMFUpgradeAmount(0); // Reset amount after successful submission
          setOnSuccessHDMF(true);
        } else {
          toast({
            title: "Failed to save HDMF Upgrade Amount",
            description: response.message || "Unknown error",
            variant: "destructive",
          });
        }
      })
      .catch((error) => {
        toast({
          title: "Error saving HDMF Upgrade Amount",
          description: error.message || "An error occurred",
          variant: "destructive",
        });
      })
      .finally(() => {
        setHdmfLoading(false);
      });
  };

  return (
    <div className="h-full w-full p-4 pt-3">
      <div className="flex flex-col space-y-6">
        {/* Header with back button and title */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <Link href="/home/deduction">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-semibold">Crew Deduction Entries</h1>
          </div>
          {activeTab === "deduction-entries" && (
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={() => setIsAddDeductionOpen(true)}>
              Add Deduction
            </Button>
          )}
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left sidebar with crew info */}
          <div className="md:col-span-1">
            <Card className="h-[calc(100vh-180px)] flex flex-col overflow-hidden">
              <CardContent className="p-4 flex flex-col items-center text-center overflow-y-auto scrollbar-hide flex-1">
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
                <div className="w-60 h-60 min-w-[160px] bg-white rounded-md mb-3 flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
                  {!crewData.profileImage.FileContent ? (
                    <Image
                      width={256}
                      height={160}
                      src="/image.png"
                      alt="Selfie with ID Attachment"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <>
                      <Base64Image
                        imageType={crewData.profileImage?.ContentType || ""}
                        alt="Crew Profile Image"
                        base64String={crewData.profileImage?.FileContent || ""}
                        width={60}
                        height={60}
                        className="object-contain w-full h-full"
                      />
                    </>
                  )}
                </div>

                <h2 className="text-lg font-bold mb-1 w-full">
                  {crewData.name}
                </h2>
                <div className="flex items-center gap-3 mb-3 flex-wrap justify-center">
                  <div className="text-sm px-2 py-0.5 bg-green-100 text-green-800 rounded-full border-green-300 flex items-center gap-1 flex-shrink-0">
                    Active
                  </div>
                </div>

                <div className="w-full space-y-3 text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-500">Crew Code</div>
                      <div className="text-sm font-medium truncate">
                        {crewData.crewCode}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <RiShieldStarLine className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-500">Rank</div>
                      <div className="text-sm font-medium truncate">
                        {crewData.rank}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Ship className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-500">
                        Current Vessel
                      </div>
                      <div className="text-sm font-medium truncate">
                        {crewData.vessel}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-500">Age</div>
                      <div className="text-sm font-medium truncate">18</div>
                    </div>
                  </div>
                </div>

                <div className="w-full mt-4 pt-4 border-t min-w-0">
                  <h3 className="text-md font-semibold mb-3 text-left">
                    Contact Information
                  </h3>

                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-500">
                          Mobile Number
                        </div>

                        <div className="text-sm font-medium truncate">
                          {crewData.mobileNo}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <PhoneCall className="h-4 w-4 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-500">
                          Landline Number
                        </div>

                        <div className="text-sm font-medium truncate">
                          {crewData.landlineNo}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-500">
                          Email Address
                        </div>

                        <div className="text-sm font-medium truncate">
                          {crewData.emailAddress}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right content area with tabs */}
          <div className="md:col-span-3">
            <Card className="h-[calc(100vh-180px)] flex flex-col">
              <Tabs
                defaultValue={activeTab}
                value={activeTab}
                onValueChange={handleTabChange}
                className="w-full flex flex-col h-full">
                <div className="border-b">
                  <div className="px-4 pt-1">
                    <TabsList className="bg-transparent p-0 h-8 w-full flex justify-start space-x-8">
                      <TabsTrigger
                        value="deduction-entries"
                        className="px-10 pb-8 h-full text-lg w-1/4 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none cursor-pointer">
                        Deduction Entries
                      </TabsTrigger>
                      <TabsTrigger
                        value="hdmf-upgrade"
                        className="px-10 pb-8 h-full text-lg w-1/4 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none cursor-pointer">
                        HDMF Upgrade Contributions
                      </TabsTrigger>
                      <TabsTrigger
                        value="philhealth"
                        className="px-10 pb-8 h-full text-lg w-1/4 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none cursor-pointer">
                        Philhealth
                      </TabsTrigger>
                      <TabsTrigger
                        value="sss"
                        className="px-10 pb-8 h-full text-lg w-1/4 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none cursor-pointer">
                        SSS
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </div>

                <TabsContent
                  value="deduction-entries"
                  className="p-6 mt-0 overflow-y-auto flex-1">
                  <div className="space-y-6">
                    <div className="flex items-center justify-center gap-6 w-full">
                      <div className="w-1/2">
                        <Select
                          value={selectedMonth}
                          onValueChange={setSelectedMonth}>
                          <SelectTrigger className="bg-white border border-gray-200 rounded-xs h-12 w-full pl-0">
                            <div className="flex items-center w-full">
                              <span className="text-gray-500 text-base bg-[#F6F6F6] rounded-l-xs px-3 py-1.5 mr-5">
                                Select Month
                              </span>
                              <SelectValue className="text-black text-base pl-3" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {availableMonths.length > 0 ? (
                              availableMonths.map((month) => (
                                <SelectItem key={month} value={month}>
                                  {month}
                                </SelectItem>
                              ))
                            ) : (
                              <>
                                <SelectItem value="January">January</SelectItem>
                                <SelectItem value="February">
                                  February
                                </SelectItem>
                                <SelectItem value="March">March</SelectItem>
                                <SelectItem value="April">April</SelectItem>
                                <SelectItem value="May">May</SelectItem>
                                <SelectItem value="June">June</SelectItem>
                                <SelectItem value="July">July</SelectItem>
                                <SelectItem value="August">August</SelectItem>
                                <SelectItem value="September">
                                  September
                                </SelectItem>
                                <SelectItem value="October">October</SelectItem>
                                <SelectItem value="November">
                                  November
                                </SelectItem>
                                <SelectItem value="December">
                                  December
                                </SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-1/2">
                        <Select
                          value={selectedYear}
                          onValueChange={setSelectedYear}>
                          <SelectTrigger className="bg-white border border-gray-200 rounded-xs h-12 w-full pl-0">
                            <div className="flex items-center w-full">
                              <span className="text-gray-500 text-base bg-[#F6F6F6] rounded-l-xs px-3 py-1.5 mr-5">
                                Select Year
                              </span>
                              <SelectValue className="text-black text-base pl-3" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {availableYears.length > 0 ? (
                              availableYears.map((year) => (
                                <SelectItem key={year} value={year}>
                                  {year}
                                </SelectItem>
                              ))
                            ) : (
                              <>
                                <SelectItem value="2025">2025</SelectItem>
                                <SelectItem value="2024">2024</SelectItem>
                                <SelectItem value="2023">2023</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="bg-[#F9F9F9] rounded-xl border border-gray-200 overflow-hidden pb-3">
                      {loading ? (
                        <div className="flex justify-center items-center py-10">
                          <p>Loading deduction entries...</p>
                        </div>
                      ) : error ? (
                        <div className="flex justify-center items-center py-10 text-red-500">
                          <p>{error}</p>
                        </div>
                      ) : filteredEntries.length === 0 ? (
                        <div className="flex justify-center items-center py-10">
                          <p>No deduction entries found for this period.</p>
                        </div>
                      ) : (
                        <DataTable
                          columns={apiDeductionColumns({
                            crewCode,
                            setOnSuccess,
                          })}
                          data={filteredEntries}
                          pageSize={7}
                        />
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent
                  value="hdmf-upgrade"
                  className="p-6 mt-0 overflow-y-auto flex-1">
                  <div className="space-y-6">
                    {/* Current Values Section */}
                    {/* <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h3 className="text-base font-medium mb-3">
                        Current HDMF Upgrade Values
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Amount</p>
                          <p className="text-lg font-medium">
                            {currentHdmfUpgradeAmount !== null
                              ? `${currentHdmfUpgradeAmount.toFixed(2)} ${
                                  currentIsDollar === 1 ? "USD" : "PHP"
                                }`
                              : "Not set"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Currency</p>
                          <p className="text-lg font-medium">
                            {currentIsDollar === 1
                              ? "Dollar (USD)"
                              : "Peso (PHP)"}
                          </p>
                        </div>
                      </div>
                    </div> */}

                    {/* Form Section */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      {/* <h3 className="text-base font-medium mb-3">
                        Update HDMF Upgrade Amount
                      </h3> */}
                      <div className="space-y-6">
                        <div>
                          <div className="flex items-center justify-end mb-2">
                            <div className="flex items-center gap-2 mb-4">
                              <Switch
                                checked={isDollar}
                                onCheckedChange={setIsDollar}
                                className="data-[state=checked]:bg-primary"
                              />
                              <span className="text-sm text-gray-500">
                                {/* {isDollar ? "Dollar (USD)" : "Peso (PHP)"} */}
                                Dollar (USD)
                              </span>
                            </div>
                          </div>
                          <h3 className="text-sm text-gray-500 font-semibold mb-1">
                            HDMF Amount
                          </h3>
                          <Input
                            type="number"
                            placeholder="Enter HDMF Amount"
                            className="bg-white border border-gray-200 h-12"
                            value={HDMFUpgradeAmount}
                            onChange={(e) =>
                              setHDMFUpgradeAmount(Number(e.target.value))
                            }
                          />
                        </div>
                        <div className="flex justify-end">
                          {/* <Button
                            variant="outline"
                            onClick={() => {
                              // Reset to current values
                              setHDMFUpgradeAmount(
                                currentHdmfUpgradeAmount ?? 0
                              );
                              setIsDollar(currentIsDollar === 1);
                            }}
                            disabled={hdmfLoading}>
                            Reset
                          </Button> */}
                          <Button
                            className="bg-primary hover:bg-primary/90"
                            onClick={handleSubmitHDMFUpgrade}
                            disabled={hdmfLoading}>
                            {hdmfLoading ? (
                              <>
                                <Loader2 className="animate-spin mr-2" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Pencil className="mr-2" />
                                Edit Amount
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent
                  value="philhealth"
                  className="p-6 mt-0 overflow-y-auto flex-1">
                  <div className="space-y-6">
                    <div className="flex items-center justify-center gap-6 w-full">
                      <div className="w-1/2"></div>
                      <div className="w-1/2">
                        <Select
                          value={selectedYear}
                          onValueChange={setSelectedYear}>
                          <SelectTrigger className="bg-white border border-gray-200 rounded-xs h-12 w-full pl-0">
                            <div className="flex items-center w-full">
                              <span className="text-gray-500 text-base bg-[#F6F6F6] rounded-l-xs px-3 py-1.5 mr-5">
                                Select Year
                              </span>
                              <SelectValue className="text-black text-base pl-3" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {availableYears.length > 0 ? (
                              availableYears.map((year) => (
                                <SelectItem key={year} value={year}>
                                  {year}
                                </SelectItem>
                              ))
                            ) : (
                              <>
                                <SelectItem value="2025">2025</SelectItem>
                                <SelectItem value="2024">2024</SelectItem>
                                <SelectItem value="2023">2023</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* <div className="bg-[#F9F9F9] rounded-xl border border-gray-200 overflow-hidden pb-3">
                      {loading ? (
                        <div className="flex justify-center items-center py-10">
                          <p>Loading deduction entries...</p>
                        </div>
                      ) : error ? (
                        <div className="flex justify-center items-center py-10 text-red-500">
                          <p>{error}</p>
                        </div>
                      ) : filteredEntries.length === 0 ? (
                        <div className="flex justify-center items-center py-10">
                          <p>No deduction entries found for this period.</p>
                        </div>
                      ) : (
                        <DataTable
                          columns={apiDeductionColumns({
                            crewCode,
                            setOnSuccess,
                          })}
                          data={filteredEntries}
                          pageSize={7}
                        />
                      )}
                    </div> */}
                  </div>
                </TabsContent>

                <TabsContent
                  value="sss"
                  className="p-6 mt-0 overflow-y-auto flex-1">
                  <div className="space-y-6">
                    <div className="flex items-center justify-center gap-6 w-full">
                      <div className="w-1/2"></div>
                      <div className="w-1/2">
                        <Select
                          value={selectedYear}
                          onValueChange={setSelectedYear}>
                          <SelectTrigger className="bg-white border border-gray-200 rounded-xs h-12 w-full pl-0">
                            <div className="flex items-center w-full">
                              <span className="text-gray-500 text-base bg-[#F6F6F6] rounded-l-xs px-3 py-1.5 mr-5">
                                Select Year
                              </span>
                              <SelectValue className="text-black text-base pl-3" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {availableYears.length > 0 ? (
                              availableYears.map((year) => (
                                <SelectItem key={year} value={year}>
                                  {year}
                                </SelectItem>
                              ))
                            ) : (
                              <>
                                <SelectItem value="2025">2025</SelectItem>
                                <SelectItem value="2024">2024</SelectItem>
                                <SelectItem value="2023">2023</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
      <AddDeductionDialog
        open={isAddDeductionOpen}
        onOpenChange={setIsAddDeductionOpen}
        setOnSuccess={setOnSuccess}
      />
    </div>
  );
}
