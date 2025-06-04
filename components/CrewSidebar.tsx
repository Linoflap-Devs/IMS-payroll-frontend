import { User, Ship, Calendar, Phone, PhoneCall, Mail } from "lucide-react";
import { RiShieldStarLine } from "react-icons/ri";
import { Card, CardContent } from "@/components/ui/card";
import { Crew } from "@/types/crew";
import { calculateAge } from "@/types/crew";
import Base64Image from "./Base64Image";

interface CrewSidebarProps {
  crew: Crew;
  isEditing: boolean;
  editedCrew: Crew | null;
}

export function CrewSidebar({ crew, isEditing, editedCrew }: CrewSidebarProps) {
  console.log("CrewSidebar rendered with crew:", crew.profileImage);
  return (
    <div className="md:col-span-1">
      <Card className="h-[calc(100vh-180px)] flex flex-col overflow-hidden">
        <CardContent className="p-4 flex flex-col items-center text-center overflow-y-auto scrollbar-hide flex-1">
          <div className="w-60 h-60 min-w-[160px] bg-white rounded-md mb-3 flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
            {/* <img
              src="/image.png"
              alt="Profile Logo"
              className="w-full h-full object-contain p-1"
            /> */}

            <Base64Image
              imageType={crew.profileImage?.ContentType}
              alt="Crew Profile Image"
              base64String={crew.profileImage?.FileContent}
              width={60}
              height={60}
              className="object-cover w-full h-full"
            />
          </div>

          <h2 className="text-lg font-bold mb-1 w-full">
            {isEditing
              ? `${editedCrew?.firstName} ${editedCrew?.lastName}`
              : crew.name}
          </h2>

          <div className="flex items-center gap-3 mb-3 flex-wrap justify-center">
            <div
              className={`text-sm px-2 py-0.5 rounded-full border flex items-center gap-1 flex-shrink-0 ${
                crew.status === "On board"
                  ? "bg-[#EBF5E4] text-green-800 border-green-300"
                  : crew.status === "Off board"
                  ? "bg-[#F5ECE4] text-orange-800 border-orange-300"
                  : "bg-gray-100 text-gray-800 border-gray-300" // Default styling if status is neither
              }`}>
              {crew.status}
            </div>
          </div>

          <div className="w-full space-y-3 text-left min-w-0">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-500">Crew Code</div>
                <div className="text-sm font-medium truncate">{crew.id}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <RiShieldStarLine className="h-4 w-4 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-500">Rank</div>
                <div className="text-sm font-medium truncate">{crew.rank}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Ship className="h-4 w-4 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-500">Current Vessel</div>
                <div className="text-sm font-medium truncate">
                  {crew.vessel}
                </div>
              </div>
            </div>

            {!isEditing && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-500">Age</div>
                  <div className="text-sm font-medium truncate">
                    {calculateAge(crew.dateOfBirth)}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="w-full mt-4 pt-4 border-t min-w-0">
            <h3 className="text-md font-semibold mb-3 text-left">
              Contact Information
            </h3>
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-500">Mobile Number</div>
                  <div className="text-sm font-medium truncate">
                    {crew.phone}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <PhoneCall className="h-4 w-4 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-500">Landline Number</div>
                  <div className="text-sm font-medium truncate">
                    {crew.landline}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-500">Email Address</div>
                  <div className="text-sm font-medium truncate">
                    {crew.email}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
