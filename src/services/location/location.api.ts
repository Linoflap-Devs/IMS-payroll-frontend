import axiosInstance from "@/src/lib/axios";

export interface CitiesItem {
  CityID: number;
  CityCode: string;
  CityName: string;
  ProvinceID: number;
}


export interface CitiesResponse {
  success: boolean;
  data: CitiesItem[];
  message?: string;
}
export const getCitiesList = async (): Promise<CitiesResponse> => {
  const response = await axiosInstance.get<CitiesResponse>("/locations/cities");
  return response.data;
};

export interface ProvincesItem {
  ProvinceID: number;
  ProvinceCode: string;
  ProvinceName: string;
}
export interface ProvincesResponse {
  success: boolean;
  data: ProvincesItem[];
  message?: string;
}
export const getProvincesList = async (): Promise<ProvincesResponse> => { 
  const response = await axiosInstance.get<ProvincesResponse>("/locations/provinces");
  return response.data;
}

export interface CountriesItem {
  CountryID: number;
  CountryCode: string;
  CountryName: string;
}

export interface CountriesResponse {
  success: boolean;
  data: CountriesItem[];
  message?: string;
}
export const getCountriesList = async (): Promise<CountriesResponse> => {
  const response = await axiosInstance.get<CountriesResponse>("/locations/countries");
  return response.data;
}