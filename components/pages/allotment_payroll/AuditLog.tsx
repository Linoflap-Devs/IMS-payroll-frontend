"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Calendar, User, Activity, Plus, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { getAuditLogs, AuditLogEntry, AuditLogFilters } from "@/src/services/audit/audit.api";

const ITEMS_PER_PAGE = 10;

function getActionIcon(action: string, size = "h-8 w-8") {
  const actionLower = action.toLowerCase();
  if (actionLower.includes('create') || actionLower.includes('add')) {
    return <Plus className={`${size} text-blue-500`} />;
  } else if (actionLower.includes('update') || actionLower.includes('edit')) {
    return <Edit className={`${size} text-yellow-500`} />;
  } else if (actionLower.includes('delete') || actionLower.includes('remove')) {
    return <Trash2 className={`${size} text-red-500`} />;
  }
  return <Activity className={`${size} text-gray-500`} />;
}

export default function AuditLog() {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadAuditLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAuditLogs(filters);
      if (response.success) {
        const sortedLogs = response.data.sort(
          (a, b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime()
        );
        setAuditLogs(sortedLogs);
        setCurrentPage(1);
      } else {
        setError(response.message || "Failed to load audit logs");
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to load audit logs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof AuditLogFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "all" ? undefined : value,
    }));
  };

  // Pagination
  const totalItems = auditLogs.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentLogs = auditLogs.slice(startIndex, endIndex);

  // Group logs by date
  const groupedLogs = currentLogs.reduce((groups, log) => {
    const date = new Date(log.CreatedAt).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(log);
    return groups;
  }, {} as Record<string, AuditLogEntry[]>);

  const createDescription = (log: AuditLogEntry): string => {
    const user = log.UserName.includes("@") ? log.UserName.split("@")[0] : log.UserName;
    const action = log.ActionType.toLowerCase();
    if (log.TargetName && log.TargetTableName) {
      return `${user} ${action}d ${log.RecordName} to ${log.TargetName}`;
    }
    switch (action) {
      case "create":
        return `${user} added new ${log.TableName.toLowerCase()} “${log.RecordName}”`;
      case "update":
        return `${user} updated ${log.TableName.toLowerCase()} “${log.RecordName}”`;
      case "delete":
        return `${user} deleted a ${log.TableName.toLowerCase()} “${log.RecordName}”`;
      default:
        return `${user} ${action}d ${log.TableName.toLowerCase()} “${log.RecordName}”`;
    }
  };

  // Unique filter values
  const uniqueModules = [...new Set(auditLogs.map((log) => log.ModuleName).filter(Boolean))];
  const uniqueUsers = [...new Set(auditLogs.map((log) => log.UserName))];

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePrevious = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  return (
    <div className="h-full w-full p-6 pt-5 overflow-hidden bg-[#F6F8FC]">
      <div className="mb-2">
        <span className="text-xs text-[#6B7280] font-medium cursor-pointer">Audit Log</span>
      </div>
      <h1 className="text-3xl font-semibold mb-6">Audit Log</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center mb-8">
        <Select onValueChange={(value) => handleFilterChange("UserID", value)}>
          <SelectTrigger className="w-[220px] h-11 bg-white border border-[#E5E7EB] shadow-none rounded-xl">
            <User className="h-5 w-5 mr-2 text-[#6366F1]" />
            <SelectValue placeholder="Filter by users" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {uniqueUsers.map((user) => (
              <SelectItem key={user} value={user}>
                {user.includes("@") ? user.split("@")[0] : user}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={(value) => handleFilterChange("ActionType", value)}>
          <SelectTrigger className="w-[220px] h-11 bg-white border border-[#E5E7EB] shadow-none rounded-xl">
            <Activity className="h-5 w-5 mr-2 text-[#6366F1]" />
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="CREATE">Create</SelectItem>
            <SelectItem value="UPDATE">Update</SelectItem>
            <SelectItem value="DELETE">Delete</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={(value) => handleFilterChange("ModuleName", value)}>
          <SelectTrigger className="w-[220px] h-11 bg-white border border-[#E5E7EB] shadow-none rounded-xl">
            <Activity className="h-5 w-5 mr-2 text-[#6366F1]" />
            <SelectValue placeholder="Filter by module" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modules</SelectItem>
            {uniqueModules.map((module) => (
              <SelectItem key={module} value={module!}>
                {module}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          className="w-[220px] h-11 bg-white border border-[#E5E7EB] shadow-none rounded-xl text-[#6366F1] flex items-center gap-2"
          disabled
        >
          <Calendar className="h-5 w-5 mr-2" />
          Select date
        </Button>
      </div>

      {/* Audit Log Entries */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 space-y-8 overflow-y-auto scrollbar-hide">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : Object.keys(groupedLogs).length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">
                  {error ? "Unable to load audit logs." : "No audit logs found."}
                </p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedLogs).map(([date, logs]) => (
              <div key={date}>
                <h2 className="text-base font-semibold text-gray-700 mb-4">{date}</h2>
                <div className="space-y-4">
                  {logs.map((log) => (
                    <div
                      key={log.AuditLogID}
                      className="flex items-center gap-4 bg-white rounded-xl shadow-sm px-6 py-5"
                    >
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center justify-center rounded-full bg-[#EEF2FF] h-14 w-14">
                          {getActionIcon(log.ActionType, "h-8 w-8")}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-base">
                          {createDescription(log)}
                        </div>
                        {log.ModuleName && (
                          <div className="text-sm text-gray-400 mt-1">
                            {log.ModuleName.replace(" module", "")}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-400 whitespace-nowrap">
                        {new Date(log.CreatedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}{" "}
                        at{" "}
                        {new Date(log.CreatedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Card className="mt-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className="h-9"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNumber}
                          variant={currentPage === pageNumber ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNumber)}
                          className="h-9 w-9"
                        >
                          {pageNumber}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="h-9"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <div className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}