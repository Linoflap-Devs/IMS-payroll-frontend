import { ChevronLeft, Pencil, Save, X, Plus, CircleMinus } from "lucide-react";
import { TbUserCheck } from "react-icons/tb";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface CrewHeaderProps {
  isEditing: boolean;
  activeTab: string;
  toggleEditMode: () => void;
  saveChanges: () => void;
  isEditingAllottee: boolean;
  toggleAllotteeEdit: () => void;
  handleDelete: (selectedAllottee: string) => void;
  isAddingAllottee: boolean;
  toggleAllotteeAdd: () => void;
  handleSave: () => void;
  allotteeLoading?: boolean;
}

export function CrewHeader({
  isEditing,
  activeTab,
  toggleEditMode,
  saveChanges,
  isEditingAllottee,
  toggleAllotteeEdit,
  isAddingAllottee,
  toggleAllotteeAdd,
  handleSave,
  allotteeLoading,
}: CrewHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Link href="/home/crew">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-semibold">Crew Details</h1>
      </div>

      {isEditing ? (
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={toggleEditMode}
            className="border-gray-300 w-40">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            className="bg-primary hover:bg-primary/90 w-40"
            onClick={saveChanges}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      ) : (
        activeTab === "details" && (
          <Button
            className="bg-primary hover:bg-primary/90 w-40"
            onClick={toggleEditMode}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit Crew
          </Button>
        )
      )}
      {activeTab === "allottee" && (
        <div className="px-4 pt-0 flex justify-end gap-3">
          <Button variant="destructive" className="px-6 bg-[#B63C3C] w-40">
            <CircleMinus />
            Remove
          </Button>
          {isEditingAllottee || isAddingAllottee ? (
            <>
              {isAddingAllottee ? (
                <>
                  <Button
                    variant="outline"
                    onClick={toggleAllotteeAdd}
                    className="border-red-400 border-2 bg-white w-40 text-red-500 hover:text-red-500">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    onClick={toggleAllotteeAdd}
                    className="bg-[#21299D] hover:bg-indigo-700 px-6 w-40 text-white hover:text-white">
                    <Plus />
                    Save Allottee
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={toggleAllotteeEdit}
                    className="border-red-400 border-2 bg-white w-40 text-red-500 hover:text-red-500">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    className="bg-primary hover:bg-primary/90 w-40"
                    onClick={() => {
                      handleSave();
                    }}
                    disabled={allotteeLoading}>
                    {allotteeLoading ? (
                      <>
                        <Loader2 className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Allottee
                      </>
                    )}
                    {/* Loader2 Save Changes */}
                  </Button>
                </>
              )}
            </>
          ) : (
            <>
              <Button
                onClick={toggleAllotteeEdit}
                className="bg-[#2BA148] hover:bg-green-700 px-6 w-40">
                <Pencil />
                Edit
              </Button>
              <Button
                className="bg-[#21299D] hover:bg-indigo-700 px-6 w-40"
                onClick={toggleAllotteeAdd}>
                <Plus />
                Add Allottee
              </Button>
            </>
          )}
        </div>
      )}
      {activeTab === "validation" && (
        <div className="px-4 pt-0 flex justify-end gap-3">
          <Button variant="destructive" className="px-6 bg-[#B63C3C] w-40">
            <CircleMinus className="h-4 w-4 mr-2" />
            Decline
          </Button>

          <Button className="bg-[#21299D] hover:bg-indigo-700 px-6 w-40">
            <TbUserCheck className="h-4 w-4 mr-2" />
            Verify Account
          </Button>
        </div>
      )}
    </div>
  );
}
