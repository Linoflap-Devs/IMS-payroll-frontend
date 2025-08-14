import {
  ChevronLeft,
  Pencil,
  Save,
  X,
  Plus,
  CircleMinus,
  CircleAlert,
} from "lucide-react";
import { TbUserCheck } from "react-icons/tb";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAllotteeFormStore } from "@/src/store/useAllotteeFormStore";

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
  handleDeleteAllottee: () => void;
  handleTriggerAdd: () => void;
  isAddLoading: boolean;
  isDeletingAllottee: boolean;
  isEditLoading: boolean;
  handleTriggerVerify: () => void;
  isVerifying: boolean;
  isCrewVerified: number | null;
  handleTriggerDecline: () => void;
  isDeclining: boolean;
  isRegistered: Date | null;
  handleSaveAllottee: () => void;
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
  handleDeleteAllottee,
  handleTriggerAdd,
  isAddLoading,
  isDeletingAllottee,
  isEditLoading,
  handleTriggerVerify,
  isVerifying,
  isCrewVerified,
  handleTriggerDecline,
  isDeclining,
  isRegistered,
  handleSaveAllottee
}: CrewHeaderProps) {
  const { isAllotteeValid, setIsAllotteeValid } = useAllotteeFormStore();
  return (
    <>
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
              className="border-gray-300 w-40"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 w-40"
              onClick={saveChanges}
              disabled={isEditLoading}
            >
              {isEditLoading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        ) : (
          activeTab === "details" && (
            <Button
              className="bg-primary hover:bg-primary/90 w-40"
              onClick={toggleEditMode}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit Crew
            </Button>
          )
        )}

        {activeTab === "allottee" && (
          <div className="px-4 pt-0 flex justify-end gap-3">
            {isEditingAllottee && !isAddingAllottee ? (
              <>
                {/* Delete button inside edit mode */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="px-6 bg-[#B63C3C] w-40"
                      disabled={!isEditingAllottee || isDeletingAllottee}
                    >
                      {isDeletingAllottee ? (
                        <>
                          <Loader2 className="animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <CircleMinus className="h-4 w-4 ml-2" />
                          Remove Allottee
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white p-10">
                    <AlertDialogHeader className="flex items-center">
                      <CircleAlert size={120} strokeWidth={1} color="orange" />
                      <AlertDialogTitle className="text-3xl">
                        Are you sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-center text-md">
                        Are you sure you want to delete this allottee? This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex items-center justify-center space-x-4 pl-8 pr-8">
                      <AlertDialogCancel className="w-1/2 bg-gray-400 hover:bg-gray-500 text-white hover:text-white">
                        No, Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="w-1/2 bg-red-500 hover:bg-red-600 text-white"
                        onClick={handleDeleteAllottee}
                        disabled={isDeletingAllottee}
                      >
                        {isDeletingAllottee ? (
                          <>
                            <Loader2 className="animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          "Yes, Delete it"
                        )}
                      </AlertDialogAction>
                    </div>
                  </AlertDialogContent>
                </AlertDialog>

                <Button
                  variant="outline"
                  onClick={toggleAllotteeEdit}
                  className="border-red-400 border-2 bg-white w-40 text-red-500 hover:text-red-500"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel Edit
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90 w-40"
                  onClick={handleSaveAllottee}
                  disabled={allotteeLoading}
                >
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
                </Button>
              </>
            ) : isAddingAllottee ? (
              <>
                <Button
                  variant="outline"
                  onClick={toggleAllotteeAdd}
                  className="border-red-400 border-2 bg-white w-40 text-red-500 hover:text-red-500"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={handleTriggerAdd}
                  disabled={isAddLoading}
                  className="bg-[#21299D] hover:bg-indigo-700 px-6 w-40 text-white hover:text-white"
                >
                  {isAddLoading ? (
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
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={toggleAllotteeEdit}
                  className="bg-[#2BA148] hover:bg-green-700 px-6 w-40"
                  disabled={!isAllotteeValid}
                >
                  <Pencil />
                  Edit
                </Button>
                <Button
                  className="bg-[#21299D] hover:bg-indigo-700 px-6 w-40"
                  onClick={toggleAllotteeAdd}
                >
                  <Plus />
                  Add Allottee
                </Button>
              </>
            )}
          </div>
        )}

        {activeTab === "validation" && (
          <div className="px-4 pt-0 flex justify-end gap-3">
            <Button
              variant="destructive"
              className="px-6 bg-[#B63C3C] w-40"
              disabled={isCrewVerified === 1 || isDeclining || !isRegistered}
              onClick={handleTriggerDecline}
            >
              {isDeclining ? (
                <>
                  <Loader2 className="animate-spin" />
                  Declining...
                </>
              ) : (
                <>
                  <CircleMinus className="h-4 w-4 ml-2" />
                  Decline Crew
                </>
              )}
            </Button>

            <Button
              className="bg-[#21299D] hover:bg-indigo-700 px-6 w-40"
              onClick={handleTriggerVerify}
              disabled={isVerifying || isCrewVerified === 1 || !isRegistered}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <TbUserCheck className="h-4 w-4 mr-2" />
                  {isCrewVerified === 1 ? <>Verified</> : <>Verify Crew</>}
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
