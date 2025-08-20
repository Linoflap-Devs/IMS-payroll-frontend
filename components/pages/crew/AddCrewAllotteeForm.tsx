import React, { Dispatch, SetStateAction, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useRelationshipStore } from "@/src/store/useRelationshipStore";
import { useBankStore } from "@/src/store/useBankStore";
import { useLocationStore } from "@/src/store/useLocationStore";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { addCrewAllotteeSchema } from "@/lib/zod-validations";
import { AllotteeApiModel, AllotteeUiModel, IAddAllottee } from "@/types/crewAllottee";
import { Checkbox } from "@/components/ui/checkbox";
import { useAddAllotteeStore } from "@/src/store/useAddAllotteeStore";
import { useAllotteeTriggerStore } from "@/src/store/usetriggerAdd";
import { toast } from "@/components/ui/use-toast";
import { useAddAllotteeValidationStore } from "@/src/store/useAddAllotteeValidationStore";

interface AddAllotteeFormProps {
  allottees: AllotteeUiModel[];
  setIsAddingAllottee: Dispatch<SetStateAction<boolean>>;
  newAllotmentType: string;
}

export default function AddAllotteeForm({
  allottees,
  setIsAddingAllottee,
  newAllotmentType,
}: AddAllotteeFormProps) {
  const defaultValues: IAddAllottee = useMemo(
    () => ({
      name: "",
      relation: 0,
      address: "",
      contactNumber: "",
      accountNumber: "",
      isActive: 1,
      priority: 0,
      allotmentType: 0,
      city: 0,
      province: 0,
      bank: 0,
      branch: 0,
      allotment: 0,
      receivePayslip: 0,
    }),
    []
  );
  const form = useForm<IAddAllottee>({
    resolver: zodResolver(addCrewAllotteeSchema),
    defaultValues,
    mode: "onChange",
    shouldFocusError: true,
  });

  const { control, watch, setValue, handleSubmit, formState } = form;
  const province = watch("province");
  const bank = watch("bank");
  const allotmentType = watch("allotmentType");
  const { allRelationshipData, fetchRelationships } = useRelationshipStore();
  const triggerAdd = useAllotteeTriggerStore((state) => state.triggerAdd);
  const setTriggerAdd = useAllotteeTriggerStore((state) => state.setTriggerAdd);
  const setValidationAdd = useAddAllotteeValidationStore((state) => state.setValidationAdd);
  const setTriggerEdit = useAllotteeTriggerStore((state) => state.setTriggerAdd);

  const totalAllotment = allottees?.reduce(
    (sum, allottee) => sum + Number(allottee.allotment || 0),
    0
  );  

  useEffect(() => {
    if (triggerAdd) {
      handleSubmit(handleSaveAdd)();
    }
  }, [triggerAdd, handleSubmit]);

  const {
    fetchBanks,
    setSelectedBankId,
    getUniqueBanks,
    getBranchesForSelectedBank,
  } = useBankStore();

  const { cities, provinces, fetchCities, fetchProvinces } = useLocationStore();

  useEffect(() => {
    fetchRelationships();
    fetchBanks();
    fetchProvinces();
    fetchCities();
  }, [fetchRelationships, fetchBanks, fetchProvinces, fetchCities]);

  useEffect(() => {
    if (bank) {
      setSelectedBankId(Number(bank));
      setValue("branch", 0);
    }
  }, [setSelectedBankId, setValue, bank]);

  useEffect(() => {
    if (province) {
      setValue("city", 0);
    }
  }, [province, setValue]);

  const uniqueBanks = getUniqueBanks();
  const branchesForSelectedBank = getBranchesForSelectedBank();

  const filteredCities = useMemo(() => {
    if (!province) return [];

    const provinceIdNum = province;
    const citiesInProvince = cities.filter(
      (city) => city.ProvinceID === provinceIdNum
    );

    return citiesInProvince.slice(0, 100);
  }, [cities, province]);

  const handleSaveAdd = (data: IAddAllottee) => {
    console.log("handleSaveAdd triggered with form data:", data);

    const payload: AllotteeApiModel = {
      name: data.name,
      relation: data.relation,
      address: data.address ?? "",
      contactNumber: data.contactNumber ?? "",
      city: data.city,
      province: data.province,
      bank: data.bank,
      branch: data.branch,
      accountNumber: data.accountNumber,
      allotment: data.allotment ?? 0,
      allotmentType: data.allotmentType || Number(newAllotmentType),
      priority: data.priority ? 1 : 0,
      receivePayslip: data.receivePayslip ? 1 : 0,
      isActive: 1,
    };

    //console.log("Payload ready to save:", payload);

    useAddAllotteeStore.getState().setNewAllottee(payload);
    //console.log("New allottee set in store:", useAddAllotteeStore.getState().newAllottee);

    // Only check total % if allotmentType === 2
    // if (payload.allotmentType === 2) {
      //   const updatedTotal = totalAllotment + (data.allotment ?? 0);
      //   if (updatedTotal > 100) {
    //     toast({
    //       title: "Error",
    //       description: "Allotment percentage cannot exceed 100%.",
    //       variant: "destructive",
    //     });
    //     return;
    //   }
    // }

    // Reset form
    form.reset();
    //console.log("Form reset done");

    setTriggerAdd(false);
    //console.log("TriggerAdd reset to false");
  };

  useEffect(() => {
    if (triggerAdd) {
      handleSubmit(
        (data) => {
          // Form is valid
          handleSaveAdd(data);

          // mark validation success  
          setValidationAdd(true);

          // reset trigger
          setTriggerEdit(true);
        },
        (errors) => {
          // Form has validation errors
          //console.log("Validation errors:", errors);

          // mark validation failed
          setValidationAdd(false);

          // reset trigger
          setTriggerAdd(false);
          setTriggerEdit(false);
        }
      )();
    }
  }, [triggerAdd, handleSubmit, setTriggerAdd, setValidationAdd]);

  useEffect(() => {
    if (triggerAdd) {
      form.trigger().then((isValid) => {
        if (isValid) {
          handleSaveAdd(form.getValues());
          setTriggerAdd(false); // reset lang AFTER success
        } else {
          //console.log("Validation failed");
        }
      });
    }
  }, [triggerAdd]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSaveAdd)} className="mt-0">
        <div className="px-2 pt-2 pb-0 mt-2 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3 w-full">
              <h3 className="text-lg font-semibold mb-3 text-primary">
                Add Allottee
              </h3>
              
              {( Number(newAllotmentType) === 1 || allottees.length === 0 || allottees[0]?.allotmentType === 1) && (
                <div className="flex justify-end gap-6 w-1/2">
                  <FormField
                    control={control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem className="flex items-center">
                        <FormControl>
                          <Checkbox
                            checked={Number(field.value) === 1} // cast to number
                            onCheckedChange={(checked: boolean) => {
                              let showToast = false;

                              // Count how many other allottees already have priority 1
                              const currentPriorityCount = allottees.filter(
                                (a) => a.priority === 1 && a.id !== field.name
                              ).length;

                              if (checked && currentPriorityCount >= 1) {
                                showToast = true;
                              } else {
                                field.onChange(checked ? 1 : 0);
                              }

                              if (showToast) {
                                toast({
                                  title: "Validation Error",
                                  description: "Only one allottee can have priority.",
                                  variant: "destructive",
                                });
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm text-gray-500">
                          Priority Allotment
                        </FormLabel>
                        <FormMessage className="text-xs text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="receivePayslip"
                    render={({ field }) => (
                      <FormItem className="flex items-center">
                        <FormControl>
                          <Checkbox
                            {...field}
                            checked={field.value === 1}
                            onCheckedChange={(checked) =>
                              field.onChange(checked ? 1 : 0)
                            }
                          />
                        </FormControl>
                        <FormLabel className="text-sm text-gray-500">
                          Dollar Allotment (receivePayslip)
                        </FormLabel>
                        <FormMessage className="text-xs text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-gray-500">
                      Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="w-full h-10 bg-white"
                        placeholder="Enter name"
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="relation"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-gray-500">
                      Relationship
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value === 0 ? "" : field.value.toString()}
                        onValueChange={(value) => {
                          if (value === "" || value === " ") {
                            field.onChange(0);
                          } else {
                            field.onChange(parseInt(value));
                          }
                        }}
                      >
                        <SelectTrigger
                          id="relationship"
                          className={`w-full !h-10 ${fieldState.error
                            ? "border-red-500 focus:!ring-red-400/50"
                            : ""
                            }`}
                        >
                          <SelectValue placeholder="Select a relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          {allRelationshipData.map((relationship) => (
                            <SelectItem
                              key={relationship.RelationID}
                              value={relationship.RelationID.toString()}
                            >
                              {relationship.RelationName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="contactNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-gray-500">
                      Contact Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="w-full h-10 bg-white"
                        placeholder="Enter contact number"
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-gray-500">
                      Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="w-full h-10 bg-white"
                        placeholder="Enter address"
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />

              {/* Province Field */}
              <FormField
                control={control}
                name="province"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-gray-500">
                      Province
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value === 0 ? "" : field.value.toString()}
                        onValueChange={(value) => {
                          if (value === "" || value === " ") {
                            field.onChange(0);
                          } else {
                            field.onChange(parseInt(value));
                          }
                        }}
                      >
                        <SelectTrigger
                          className={`w-full !h-10 ${fieldState.error
                            ? "border-red-500 focus:!ring-red-400/50"
                            : ""
                            }`}
                        >
                          <SelectValue placeholder="Select a province" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value=" " disabled>
                            Select a province
                          </SelectItem>
                          {provinces.map((province) => (
                            <SelectItem
                              key={province.ProvinceID}
                              value={province.ProvinceID.toString()}
                            >
                              {province.ProvinceName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />

              {/* City Field */}
              <FormField
                control={control}
                name="city"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-gray-500">
                      City
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value === 0 ? "" : field.value.toString()}
                        onValueChange={(value) => {
                          if (value === "" || value === " ") {
                            field.onChange(0);
                          } else {
                            field.onChange(parseInt(value));
                          }
                        }}
                        disabled={!province}
                      >
                        <SelectTrigger
                          className={`w-full !h-10 ${fieldState.error
                            ? "border-red-500 focus:!ring-red-400/50"
                            : ""
                            }`}
                        >
                          <SelectValue placeholder="Select a city" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredCities.length > 0 ? (
                            filteredCities.map((city) => (
                              <SelectItem
                                key={city.CityID}
                                value={city.CityID.toString()}
                              >
                                {city.CityName}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>
                              {province
                                ? "No cities found for this province"
                                : "Select a province first"}
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Bank Info */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-primary">
              Bank Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Bank field */}
              <FormField
                control={control}
                name="bank"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-gray-500">
                      Bank
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value === 0 ? "" : field.value.toString()}
                        onValueChange={(value) => {
                          if (value === "" || value === " ") {
                            field.onChange(0);
                          } else {
                            field.onChange(parseInt(value));
                          }
                        }}
                      >
                        <SelectTrigger
                          id="bank"
                          className={`w-full !h-10 ${fieldState.error
                            ? "border-red-500 focus:!ring-red-400/50"
                            : ""
                            }`}
                        >
                          <SelectValue placeholder="Select a bank" />
                        </SelectTrigger>
                        <SelectContent>
                          {uniqueBanks.map((bank) => (
                            <SelectItem
                              key={bank.BankID}
                              value={bank.BankID.toString()}
                            >
                              {bank.BankName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />

              {/* Branch field */}
              <FormField
                control={control}
                name="branch"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-gray-500">
                      Branch
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value === 0 ? "" : field.value.toString()}
                        onValueChange={(value) => {
                          if (value === "" || value === " ") {
                            field.onChange(0);
                          } else {
                            field.onChange(parseInt(value));
                          }
                        }}
                        disabled={!bank}
                      >
                        <SelectTrigger
                          id="branch"
                          className={`w-full !h-10 ${fieldState.error
                            ? "border-red-500 focus:!ring-red-400/50"
                            : ""
                            }`}
                        >
                          <SelectValue placeholder="Select a branch" />
                        </SelectTrigger>
                        <SelectContent>
                          {branchesForSelectedBank.length > 0 ? (
                            branchesForSelectedBank.map((branch) => (
                              <SelectItem
                                key={branch.BankBranchID}
                                value={branch.BankBranchID.toString()}
                              >
                                {branch.BankBranchName}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>
                              {bank
                                ? "No branches found for this bank"
                                : "Select a bank first"}
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-gray-500">
                      Account Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="w-full h-10 bg-white"
                        placeholder="Enter account number"
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="allotment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-gray-500">
                      Allotment {allottees?.[0]?.allotmentType === 2
                        ? "Percentage"
                        : allottees?.[0]?.allotmentType === 1
                          ? "Amount"
                          : "" // fallback
                      }
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                        className="w-full h-10 bg-white"
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />
            </div>
            <div className="mt-8 flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                className="border-primary text-primary"
              >
                Reset Form
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}