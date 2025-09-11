"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Login from "@/components/Login";
import { useAuth } from "@/src/store/useAuthStore";
import Image from "next/image";
import { Loader } from "lucide-react";
import axiosInstance from "@/src/lib/axios";
import { SettingsItem } from "@/src/services/settings/settings.api";

export default function Home() {
  const router = useRouter();
  const { user, loading, initialized } = useAuth();
  const [settingsConfig, setSettingsConfig] = useState<SettingsItem[]>([]);
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    axiosInstance.get("/config").then((res) => {
      if (res.data.success) setSettingsConfig(res.data.data);
    }).finally(() => setLoadingSettings(false));
  }, []);

  //if (loadingSettings) return <div>Loading settings...</div>;

  const siteLogoRaw = settingsConfig.find((s) => s.ConfigurationKey === "CompanyLogo")?.ImageDetails?.[0];
  const siteLogo = siteLogoRaw?.Filename
      ? `/uploads/${siteLogoRaw.Filename}${siteLogoRaw.FileExtension ?? ""}`
      : "/ims-logo.png"; 
  const siteTitle = settingsConfig.find((s) => s.ConfigurationKey === "CompanyName")?.ConfigurationValue ?? "IMS Phil Payroll";
  const companyAbbreviation = settingsConfig.find((s) => s.ConfigurationKey === "CompanyAbbreviation")?.ConfigurationValue ?? "IMS";
  const sitePrimaryColor = settingsConfig.find((s) => s.ConfigurationKey === "PrimaryColor")?.ConfigurationValue ?? '1F279C';

  const formatSiteTitle = (title: string) => {
    if (title.endsWith("Maritime Corp")) {
      const withoutMaritime = title.replace(/Maritime Corp$/, "").trim();
      const lines = withoutMaritime.split(" "); // split the rest by space
      return [...lines, "Maritime Corp"]; // append the last part as one line
    }
    return title.split(" "); // fallback: split all words
  };

  if (!initialized || loading || user) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-2 text-gray-700">
        <Loader className="animate-spin w-6 h-6" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <main className="flex h-screen relative">
      <div className={`hidden lg:block lg:w-3/4 relative pl-5`} style={{ backgroundColor: sitePrimaryColor }}>
        <Image
          src="/boat-image.jpg"
          alt="Ship Background"
          fill
          className="object-cover opacity-20"
        />
        <div className="relative z-10 p-12 text-white">
          <div className="flex items-center gap-3 mb-20">
            <Image
              src={siteLogo ? siteLogo : "/ims-logo.png"}
              alt={`Company Logo`}
              width={70}
              height={70}
            />
            <span className="text-2xl font-medium">{companyAbbreviation}</span>
          </div>
          <div className="flex justify-center flex-col gap-1">
            <h1 className="text-8xl font-bold leading-tight mb-1 mt-16">
              {formatSiteTitle(siteTitle).map((line, idx) => (
                <div key={idx}>{line.toUpperCase()}</div>
              ))}
            </h1>
            <p className="font-bold text-5xl mt-0">Crew Payroll System</p>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-1/4 bg-[#E8EDF3]" />
      <div className="absolute inset-y-0 left-[75%] -translate-x-1/2 flex items-center z-20">
        <Login />
      </div>
    </main>
  );
}
