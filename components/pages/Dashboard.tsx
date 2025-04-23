"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { GrLineChart } from "react-icons/gr";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Label,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import Image from "next/image";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import React, { useEffect } from "react";
import {
  getDashboardList,
  DashboardItem,
} from "@/src/services/dashboard/dashboard.api";
import { ScrollArea } from "@/components/ui/scroll-area";

type Dashboard = {
  TotalVessels: number;
  TotalActiveCrew: number;
  TotalOnBoard: number;
  TotalOffBoard: number;
  ForexRate: number;
  MonthlyAllotmentPHP: number;
  MonthlyAllotmentUSD: number;
  PerVesselAllotmentPHP: {
    [vesselName: string]: number;
  };
  PerVesselAllotmentUSD: {
    [vesselName: string]: number;
  };
  TotalSalaryProcessed: number;
};

export default function Dashboard() {
  const [dashboardData, setDashboardData] =
    React.useState<DashboardItem | null>(null);

  useEffect(() => {
    getDashboardList()
      .then((res) => {
        if (res.success) {
          const mapped: Dashboard = {
            TotalVessels: res.data.TotalVessels,
            TotalActiveCrew: res.data.TotalActiveCrew,
            TotalOnBoard: res.data.TotalOnBoard,
            TotalOffBoard: res.data.TotalOffBoard,
            ForexRate: res.data.ForexRate,
            MonthlyAllotmentPHP: res.data.MonthlyAllotmentPHP,
            MonthlyAllotmentUSD: res.data.MonthlyAllotmentUSD,
            PerVesselAllotmentPHP: res.data.PerVesselAllotmentPHP,
            PerVesselAllotmentUSD: res.data.PerVesselAllotmentUSD,
            TotalSalaryProcessed: res.data.TotalSalaryProcessed,
          };
          setDashboardData(mapped);
        } else {
          console.error("Failed to fetch vessel principal:", res.message);
        }
      })
      .catch((err) => console.error("Error fetching vessel principal:", err));
  }, []);

  const totalPerVesselAllotmentPHP = React.useMemo(() => {
    if (!dashboardData?.PerVesselAllotmentPHP) return 0;

    return Object.values(dashboardData.PerVesselAllotmentPHP).reduce(
      (sum, current) => sum + current,
      0
    );
  }, [dashboardData?.PerVesselAllotmentPHP]);

  const totalPerVesselAllotmentUSD = React.useMemo(() => {
    if (!dashboardData?.PerVesselAllotmentUSD) return 0;

    return Object.values(dashboardData.PerVesselAllotmentUSD).reduce(
      (sum, current) => sum + current,
      0
    );
  }, [dashboardData?.PerVesselAllotmentUSD]);

  const salaryData = [
    { name: "Jan 2025", value: 3000000 },
    { name: "Feb 2025", value: 2500000 },
    { name: "March 2025", value: 2000000 },
    { name: "April 2025", value: 3500000 },
    { name: "May 2025", value: 5000000 },
  ];

  const vesselData = React.useMemo(() => {
    if (!dashboardData?.PerVesselAllotmentPHP) return [];

    // Array of colors to use for the chart segments
    const colors = [
      "#4F46E5",
      "#60A5FA",
      "#34D399",
      "#F472B6",
      "#A78BFA",
      "#FBBF24",
      "#FB923C",
      "#2DD4BF",
      "#F87171",
      "#818CF8",
      "#C084FC",
      "#FB7185",
      "#38BDF8",
      "#A3E635",
      "#FCD34D",
    ];

    // Convert the object to array format needed by the chart
    return Object.entries(dashboardData.PerVesselAllotmentPHP).map(
      ([name, value], index) => ({
        name,
        value,
        // Cycle through colors if there are more vessels than colors
        fill: colors[index % colors.length],
      })
    );
  }, [dashboardData?.PerVesselAllotmentPHP]);

  // Update the totalVisitors calculation to use the dynamic vesselData
  const totalVesselAllotment = React.useMemo(() => {
    return vesselData.reduce((acc, curr) => acc + curr.value, 0);
  }, [vesselData]);

  const chartConfig = {
    name: {
      label: "Vessel",
    },
    value: {
      label: "Value",
    },
  } satisfies ChartConfig;

  const chartData = [
    { month: "January", salary: 1078909 },
    { month: "February", salary: 1534678 },
    { month: "March", salary: 1082129 },
    { month: "April", salary: 1806540 },
    { month: "May", salary: 1390980 },
    { month: "June", salary: 1935221 },
  ];

  const chartConfig2 = {
    salary: {
      label: "Salary",
      color: "#4F46E5",
    },
  } satisfies ChartConfig;

  const CustomLegend = ({ payload }: any) => {
    if (!payload) return null;

    return (
      <ScrollArea className="h-[280px] w-full pr-4">
        <div className="grid grid-cols-2 gap-2">
          {payload.map((entry: any, index: number) => (
            <div key={`legend-${index}`} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.payload.fill }}
              />
              <span
                className="text-xs truncate max-w-[130px]"
                title={entry.value}
              >
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  };

  return (
    <div className="h-full w-full p-6 pt-3">
      <p className="text-4xl font-semibold mb-3">Dashboard</p>

      {/* Welcome Card */}
      <Card className="mb-3">
        <CardContent className="p-3 flex justify-between items-center">
          <div className="pl-6">
            <h1 className="text-3xl font-semibold text-blue-800 mb-1">
              Welcome to IMS Philippine Maritime Corp
            </h1>
            <p className="text-xl text-gray-600">
              Stay updated with the latest allotment payroll details, ensuring
              smooth
            </p>
            <p className="text-xl text-gray-600">
              {" "}
              and timely transactions for all crew members.
            </p>
          </div>
          <div className="relative w-48 h-32">
            <Image
              src="/ship-image.png"
              alt="Ship"
              fill
              style={{
                objectFit: "contain",
                transform: "scale(2.5)",
                transformOrigin: "right center",
                paddingBottom: "10px",
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
        <Card className="bg-blue-800 text-white py-3">
          <CardContent className=" pt-0 h-full flex flex-col justify-between gap-y-5">
            <p className="text-xl pt-0">Total Vessel</p>
            <h3 className="text-3xl font-bold self-end mt-4">
              {dashboardData?.TotalVessels ?? 0}
            </h3>
          </CardContent>
        </Card>

        <Card className="bg-blue-800 text-white py-3">
          <CardContent className="pt-0 h-full flex flex-col justify-between gap-y-10">
            <p className="text-xl pt-0">Total Active Crew</p>
            <h3 className="text-3xl font-bold self-end mt-4">
              {dashboardData?.TotalActiveCrew ?? 0}
            </h3>
          </CardContent>
        </Card>

        <Card className="bg-blue-800 text-white py-3">
          <CardContent className="pt-0 h-full flex flex-col justify-between gap-y-5">
            <p className="text-xl pt-0">Total On Board Crew</p>
            <h3 className="text-3xl font-bold self-end mt-4">
              {dashboardData?.TotalOnBoard ?? 0}
            </h3>
          </CardContent>
        </Card>

        <Card className="bg-blue-800 text-white py-3">
          <CardContent className="pt-0 h-full flex flex-col justify-between gap-y-5">
            <p className="text-xl pt-0">Total Off Board Crew</p>
            <h3 className="text-3xl font-bold self-end mt-4">
              {dashboardData?.TotalOffBoard ?? 0}
            </h3>
          </CardContent>
        </Card>
      </div>

      {/* Stats Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <Card>
          <CardContent className="p-0 px-4">
            <div className="flex justify-between items-center">
              <div className="flex flex-col gap-y-8">
                <p className="text-lg text-gray-600 mb-6">
                  Current Forex Rate (USD to PHP)
                </p>
                <h3 className="text-xl font-bold">
                  1 USD = {dashboardData?.ForexRate ?? 0} PHP
                </h3>
              </div>
              <div className="text-blue-600">
                <GrLineChart className="h-20 w-20 mr-5 mt-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0 px-4">
            <div className="flex justify-between items-center">
              <div className="flex flex-col gap-y-0">
                <p className="text-2xl text-primary mt-0 mb-0">MARCH 2025</p>
                <p className="text-lg text-gray-600 mb-6">
                  Total Allotment Process
                </p>
                <h3 className="text-xl font-bold">
                  $ {dashboardData?.MonthlyAllotmentPHP.toFixed(2) ?? 0}
                </h3>
              </div>
              <div className="text-blue-600">
                <GrLineChart className="h-20 w-20 mr-5 mt-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0 px-4">
            <div className="flex justify-between items-center">
              <div className="flex flex-col gap-y-8">
                <p className="text-lg text-gray-600 mb-6">
                  Total Grosss Allotment
                </p>
                <h3 className="text-xl font-bold">
                  $ {totalPerVesselAllotmentPHP.toFixed(2).toLocaleString()}
                </h3>
              </div>
              <div className="text-blue-600">
                <GrLineChart className="h-20 w-20 mr-5 mt-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-1 p-3">
            <CardTitle className="text-base">
              Total Vessel Net Allottment
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[300px] w-full">
              <ChartContainer config={chartConfig} className="w-full h-full">
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={vesselData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={100}
                    outerRadius={140}
                    strokeWidth={4}
                  >
                    {vesselData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-2xl font-bold"
                              >
                                {totalVesselAllotment.toLocaleString()}
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                  <Legend
                    content={<CustomLegend />}
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    wrapperStyle={{ marginLeft: 16 }}
                  />
                </PieChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 p-3">
            <CardTitle className="text-base">
              Total Salary Processed ($)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[300px] w-full">
              <ChartContainer config={chartConfig2} className="w-full h-full">
                <AreaChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    left: 40,
                    right: 12,
                    top: 10,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient
                      id="colorDesktop"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#4F46E5"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={4}
                    tickFormatter={(value) => value.slice(0, 3)}
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickMargin={4}
                    tickFormatter={(value) => `$${value}`}
                    style={{ fontSize: "12px" }}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Area
                    dataKey="salary"
                    type="natural"
                    fill="url(#colorDesktop)"
                    stroke="#4F46E5"
                    name="Total Salary"
                    dot={{
                      fill: "#4F46E5",
                      strokeWidth: 2,
                      r: 3,
                      stroke: "white",
                    }}
                    activeDot={{
                      fill: "#4F46E5",
                      strokeWidth: 2,
                      r: 4,
                      stroke: "white",
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ marginTop: -10, fontSize: "12px" }}
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
