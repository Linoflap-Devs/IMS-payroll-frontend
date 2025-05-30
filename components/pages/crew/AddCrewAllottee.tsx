import React, { Dispatch, useEffect, SetStateAction, useMemo } from "react";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchParams } from "next/navigation";

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
import { addCrewAllottee } from "@/src/services/crew/crewAllottee.api";
import { IAddAllottee } from "@/types/crewAllottee";
import { Checkbox } from "@/components/ui/checkbox";

interface IAddCrewAllotteeProps {
  triggerAdd: boolean;
  setIsAddingAllottee: Dispatch<SetStateAction<boolean>>;
  setTriggerAdd: Dispatch<SetStateAction<boolean>>;
}

export default function AllotteeForm({
  triggerAdd,
  setIsAddingAllottee,
  setTriggerAdd,
}: IAddCrewAllotteeProps) {
  const defaultValues: IAddAllottee = {
    name: "",
    relation: 0,
    address: "",
    contactNumber: "",
    accountNumber: "",
    isActive: 1,
    priority: false,
    allotmentType: 0,
    city: 0,
    province: 0,
    bank: 0,
    branch: 0,
    allotment: 0,
    receivePayslip: 0,
  };
  const searchParams = useSearchParams();
  const crewId = searchParams.get("id");

  const form = useForm({
    resolver: zodResolver(addCrewAllotteeSchema),
    defaultValues,
    mode: "onChange",
  });

  const { control, watch, setValue, handleSubmit, formState } = form;
  const { errors } = formState;

  // Get current values from the form
  const province = watch("province");
  const bank = watch("bank");
  const allotmentType = watch("allotmentType");
  //   const receivePayslip = watch("receivePayslip");

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("Form errors:", errors);
    }
  }, [errors]);

  const { allRelationshipData, fetchRelationships } = useRelationshipStore();
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
    // When bankId changes, update the selected bank in the store and reset branchId
    if (bank) {
      setSelectedBankId(Number(bank));
      setValue("branch", 0);
    }
  }, [setSelectedBankId, setValue, bank]);

  useEffect(() => {
    // When province changes, reset city
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

  const onSubmit = (data: IAddAllottee) => {
    console.log("Allottee Data:", data);
    // Add your form submission logic here
  };

  useEffect(() => {
    if (triggerAdd) {
      console.log("Triggering form reset due to triggerAdd change");
      try {
        // setIsAddingAllottee(false);

        if (!crewId) return;
        // addCrewAllottee(crewId, form.getValues());
        console.log("Form values before reset:", form.getValues());

        addCrewAllottee(crewId, form.getValues())
          .then((response) => {
            console.log("Allottee added successfully:", response);
            // setIsAddingAllottee(false);
          })
          .catch((error) => {
            console.error("Error adding allottee:", error);
          })
          .finally(() => {
            setIsAddingAllottee(false);
            setTriggerAdd(false);
            form.reset(defaultValues);
          });
      } catch (error) {
        const err = error as Error;
        console.error("Error resetting form:", err.message);
      }
    }
  }, [
    triggerAdd,
    form,
    crewId,
    setIsAddingAllottee,
    defaultValues,
    setTriggerAdd,
  ]);

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Allotment Type Selection */}
        <div className="relative rounded-lg border shadow-sm overflow-hidden w-1/2">
          <div className="flex h-11 w-full">
            <div className="flex items-center px-4 bg-gray-50 border-r">
              <span className="text-gray-700 font-medium whitespace-nowrap">
                Select Allotment Type
              </span>
            </div>
            <div className="flex-1 w-full flex items-center">
              <FormField
                control={control}
                name="allotmentType"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Select
                        value={field.value === 0 ? "" : field.value.toString()}
                        onValueChange={(value) => {
                          if (value === "" || value === " ") {
                            field.onChange(0);
                          } else {
                            field.onChange(parseInt(value));
                          }
                        }}>
                        <SelectTrigger className="h-full w-full border-0 shadow-none focus:ring-0 rounded-none px-4 font-medium cursor-pointer">
                          <SelectValue placeholder="Amount" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Amount</SelectItem>
                          <SelectItem value="2">Percentage</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="absolute bottom-[-20px] left-0 text-xs text-red-500" />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Allottee Details */}
        <div className="p-4 space-y-6">
          {/* Personal Info */}
          <div>
            <div className="flex items-center justify-between mb-4 w-full">
              <h3 className="text-lg font-semibold mb-3 text-primary">
                Allottee Personal Information
              </h3>
              <div className="flex justify-end gap-10 w-1/2">
                <FormField
                  control={control}
                  name="isActive"
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
                        Is Active
                      </FormLabel>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem className="flex items-center">
                      <FormControl>
                        <Checkbox
                          checked={field.value === true}
                          onCheckedChange={(checked) => field.onChange(checked)}
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        }}>
                        <SelectTrigger
                          id="relationship"
                          className={`w-full !h-10 ${
                            fieldState.error
                              ? "border-red-500 focus:!ring-red-400/50"
                              : ""
                          }`}>
                          <SelectValue placeholder="Select a relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          {allRelationshipData.map((relationship) => (
                            <SelectItem
                              key={relationship.RelationID}
                              value={relationship.RelationID.toString()}>
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
                        }}>
                        <SelectTrigger
                          className={`w-full !h-10 ${
                            fieldState.error
                              ? "border-red-500 focus:!ring-red-400/50"
                              : ""
                          }`}>
                          <SelectValue placeholder="Select a province" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value=" " disabled>
                            Select a province
                          </SelectItem>
                          {provinces.map((province) => (
                            <SelectItem
                              key={province.ProvinceID}
                              value={province.ProvinceID.toString()}>
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
                        disabled={!province}>
                        <SelectTrigger
                          className={`w-full !h-10 ${
                            fieldState.error
                              ? "border-red-500 focus:!ring-red-400/50"
                              : ""
                          }`}>
                          <SelectValue placeholder="Select a city" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredCities.length > 0 ? (
                            filteredCities.map((city) => (
                              <SelectItem
                                key={city.CityID}
                                value={city.CityID.toString()}>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        }}>
                        <SelectTrigger
                          id="bank"
                          className={`w-full !h-10 ${
                            fieldState.error
                              ? "border-red-500 focus:!ring-red-400/50"
                              : ""
                          }`}>
                          <SelectValue placeholder="Select a bank" />
                        </SelectTrigger>
                        <SelectContent>
                          {uniqueBanks.map((bank) => (
                            <SelectItem
                              key={bank.BankID}
                              value={bank.BankID.toString()}>
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
                        disabled={!bank}>
                        <SelectTrigger
                          id="branch"
                          className={`w-full !h-10 ${
                            fieldState.error
                              ? "border-red-500 focus:!ring-red-400/50"
                              : ""
                          }`}>
                          <SelectValue placeholder="Select a branch" />
                        </SelectTrigger>
                        <SelectContent>
                          {branchesForSelectedBank.length > 0 ? (
                            branchesForSelectedBank.map((branch) => (
                              <SelectItem
                                key={branch.BankBranchID}
                                value={branch.BankBranchID.toString()}>
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
                      {/* {allotmentType === 1
                        ? "Allotment Amount in" +
                          (isDollar === 1 ? " (Dollar)" : " (Peso)")
                        : "Allotment Percentage"} */}

                      {allotmentType === 1
                        ? "Allotment Amount"
                        : "Allotment Percentage"}
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
            <div className="mt-6 flex gap-4">
              <Button type="submit" className="bg-primary">
                Submit
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                className="border-primary text-primary">
                Reset Form
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
