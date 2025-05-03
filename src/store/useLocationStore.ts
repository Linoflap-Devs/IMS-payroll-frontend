
import { create } from "zustand";
import {
  CitiesItem,
  ProvincesItem,
  CountriesItem,
  getCitiesList,
  getProvincesList,
  getCountriesList,
} from "@/src/services/location/location.api";

interface LocationState {
  cities: CitiesItem[];
  provinces: ProvincesItem[];
  countries: CountriesItem[];
  loading: boolean;
  error: string | null;
  fetchCities: () => Promise<void>;
  fetchProvinces: () => Promise<void>;
  fetchCountries: () => Promise<void>;
}

export const useLocationStore = create<LocationState>((set) => ({
  cities: [],
  provinces: [],
  countries: [],
  loading: false,
  error: null,
  fetchCities: async () => {
    set({ loading: true, error: null });
    try {
      const res = await getCitiesList();
      set({ cities: res.data, loading: false });
    } catch (e: any) {
      set({ error: e.message || "Failed to fetch cities", loading: false });
    }
  },
  fetchProvinces: async () => {
    set({ loading: true, error: null });
    try {
      const res = await getProvincesList();
      set({ provinces: res.data, loading: false });
    } catch (e: any) {
      set({ error: e.message || "Failed to fetch provinces", loading: false });
    }
  },
  fetchCountries: async () => {
    set({ loading: true, error: null });
    try {
      const res = await getCountriesList();
      set({ countries: res.data, loading: false });
    } catch (e: any) {
      set({ error: e.message || "Failed to fetch countries", loading: false });
    }
  },
}));