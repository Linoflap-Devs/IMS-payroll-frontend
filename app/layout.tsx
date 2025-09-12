import { Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import AppInitializer from "@/src/routes/AppInitializer";
import { getSettingsConfig } from "@/src/services/settings/settings.api";
import ThemeInitializer from "@/src/utils/ThemeInitializer";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settingsConfig = await getSettingsConfig();

  const siteTitle = settingsConfig.data.find((s) => s.ConfigurationKey === "CompanyAbbreviation") ?.ConfigurationValue ?? "IMS Payroll";
  const siteDescription = settingsConfig.data.find((s) => s.ConfigurationKey === "AppName") ?.ConfigurationValue ?? "Crew Payroll System";

  console.log(settingsConfig.data);

  return (
    <html lang="en">
      <head>
        <title>{siteTitle}</title>
        <meta name="description" content={siteDescription} />
      </head>
      <body className={`${montserrat.variable} antialiased`}>
        <ThemeInitializer settingsConfig={settingsConfig.data} />
        <AppInitializer />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
