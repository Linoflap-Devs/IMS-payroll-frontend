import React, { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
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
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { addCrewAllotteeSchema } from "@/lib/zod-validations";

export default function AllotteeForm() {
  const defaultValues = {
    allotmentType: 1,
    name: "",
    relationshipId: "",
    address: "",
    contactNumber: "",
    cityId: "",
    provinceId: "",
    bankId: "",
    branchId: "",
    accountNumber: "",
    allotment: 0,
    isDollar: 0,
  };

  const form = useForm({
    resolver: zodResolver(addCrewAllotteeSchema),
    defaultValues,
    mode: "onChange",
  });

  const { control, watch, setValue, handleSubmit, formState } = form;
  const { errors } = formState;

  const provinceId = watch("provinceId");
  const bankId = watch("bankId");
  const allotmentType = watch("allotmentType");
  const isDollar = watch("isDollar");

  // Log errors to see if they're being generated
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
    if (bankId) {
      setSelectedBankId(Number(bankId));
      setValue("branchId", "");
    }
  }, [bankId, setSelectedBankId, setValue]);

  useEffect(() => {
    // When provinceId changes, reset cityId
    if (provinceId) {
      setValue("cityId", "");
    }
  }, [provinceId, setValue]);

  const uniqueBanks = getUniqueBanks();
  const branchesForSelectedBank = getBranchesForSelectedBank();

  const filteredCities = useMemo(() => {
    if (!provinceId) return [];

    const provinceIdNum = parseInt(provinceId);
    const citiesInProvince = cities.filter(
      (city) => city.ProvinceID === provinceIdNum
    );

    return citiesInProvince.slice(0, 100);
  }, [cities, provinceId]);

  const onSubmit = (data) => {
    console.log("Allottee Data:", data);
    // Add your form submission logic here
  };

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
                        value={field.value.toString()}
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }>
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
            <h3 className="text-lg font-semibold mb-3 text-primary">
              Allottee Personal Information
            </h3>
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
                      <Input {...field} className="w-full h-10 bg-white" />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="relationshipId"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-gray-500">
                      Relationship
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}>
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
                      <Input {...field} className="w-full h-10 bg-white" />
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
                      <Input {...field} className="w-full h-10 bg-white" />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />

              {/* Province Field */}
              <FormField
                control={control}
                name="provinceId"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-gray-500">
                      Province
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}>
                        <SelectTrigger
                          className={`w-full !h-10 ${
                            fieldState.error
                              ? "border-red-500 focus:!ring-red-400/50"
                              : ""
                          }`}>
                          <SelectValue placeholder="Select a province" />
                        </SelectTrigger>
                        <SelectContent>
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
                name="cityId"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-gray-500">
                      City
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!provinceId}>
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
                              {provinceId
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
                name="bankId"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-gray-500">
                      Bank
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}>
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
                name="branchId"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-gray-500">
                      Branch
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!bankId}>
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
                              {bankId
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
                      <Input {...field} className="w-full h-10 bg-white" />
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
                      {allotmentType === 1
                        ? "Allotment Amount in" +
                          (isDollar === 1 ? " (Dollar)" : " (Peso)")
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
