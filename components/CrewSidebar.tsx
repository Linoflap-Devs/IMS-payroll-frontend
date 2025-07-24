import { User, Ship, Calendar, Phone, PhoneCall, Mail } from "lucide-react";
import { RiShieldStarLine } from "react-icons/ri";
import { Card, CardContent } from "@/components/ui/card";
import { Crew } from "@/types/crew";
import { calculateAge } from "@/types/crew";
import Base64Image from "./Base64Image";
import Image from "next/image";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useRef, useState } from "react";

interface CrewSidebarProps {
  crew: Crew | null;
  isEditing?: boolean;
  editedCrew?: Crew | null;
  handleInputChange?: <K extends keyof Crew>(field: K, value: Crew[K]) => void;
  submitted?: boolean;
}

export function CrewSidebar({
  crew,
  isEditing,
  editedCrew,
  handleInputChange,
  submitted,
}: CrewSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null); // For triggering file input
  const [crewPhotoFile, setCrewPhotoFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>("/image.png"); // For image preview
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCrewPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      handleInputChange?.("crewPhoto", file);
    } else {
      setCrewPhotoFile(null);
      setImagePreview("");
    }
  };

  return (
    <div className="md:col-span-1">
      <Card className="h-[calc(100vh-180px)] flex flex-col overflow-hidden">
        <CardContent className="p-4 flex flex-col items-center text-center overflow-y-auto scrollbar-hide flex-1">
          <div className="w-60 h-60 min-w-[160px] bg-white rounded-md mb-3 flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
            {isEditing ? (
              imagePreview ? (
                <Image
                  width={256}
                  height={160}
                  src={imagePreview}
                  alt="Preview Photo"
                  className="object-cover w-full h-full"
                />
              ) : crew?.ProfileImage?.FileContent ? (
                <Base64Image
                  imageType={crew.ProfileImage.ContentType}
                  alt="Crew Profile Image"
                  base64String={crew.ProfileImage.FileContent}
                  width={60}
                  height={60}
                  className="object-contain w-full h-full"
                />
              ) : (
                <Image
                  width={256}
                  height={160}
                  src="/image.png"
                  alt="Selfie with ID Attachment"
                  className="object-cover w-full h-full"
                />
              )
            ) : crew?.ProfileImage ? (
              <Base64Image
                imageType={crew.ProfileImage.ContentType}
                alt="Crew Profile Image"
                base64String={crew.ProfileImage.FileContent}
                width={60}
                height={60}
                className="object-contain w-full h-full"
              />
            ) : (
              <Image
                width={256}
                height={160}
                src="/image.png"
                alt="Selfie with ID Attachment"
                className="object-cover w-full h-full"
              />
            )}
          </div>
        
          {isEditing && (
            <div>
              <Button
                variant="outline"
                size="sm"
                className="mt-1 mb-3 w-60"
                onClick={() => fileInputRef.current?.click()}
              >
                Update Photo
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*,.jpeg,.jpg,.png"
                onChange={handleFileChange}
              />
            </div>
          )}

          <h2 className="text-lg font-bold mb-1 w-full">
            {isEditing
              ? `${editedCrew?.firstName} ${editedCrew?.lastName}`
              : crew?.name}
          </h2>

          <div className="flex items-center gap-3 mb-3 flex-wrap justify-center">
            <div
              className={`text-sm px-2 py-0.5 rounded-full border flex items-center gap-1 flex-shrink-0 ${
                crew?.status === "On board"
                  ? "bg-green-100 text-green-800 border-green-300"
                  : crew?.status === "Off board"
                  ? "bg-[#F5ECE4] text-orange-800 border-orange-300"
                  : "bg-gray-100 text-gray-800 border-gray-300"
              }`}
            >
              <p
                className={`p-0.5 px-2 ${
                  crew?.status === "On board"
                    ? "text-green-800"
                    : crew?.status === "Off board"
                    ? "text-orange-800"
                    : "text-gray-800"
                }`}
              >
                {crew?.status}
              </p>
            </div>
          </div>

          <div className="w-full space-y-3 text-left min-w-0">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-500">Crew Code</div>
                <div className="text-sm font-medium truncate">{crew?.id}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <RiShieldStarLine className="h-4 w-4 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-500">Rank</div>
                <div className="text-sm font-medium truncate">{crew?.rank}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Ship className="h-4 w-4 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-500">Current Vessel</div>
                <div className="text-sm font-medium truncate">
                  {crew?.vessel || "N/A"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-500">Age</div>
                <div className="text-sm font-medium truncate">
                  {calculateAge(crew?.dateOfBirth)}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full mt-4 pt-4 border-t min-w-0">
            <h3 className="text-md font-semibold mb-3 text-left">
              Contact Information
            </h3>
            <div className="space-y-3 text-left">
              {/* Mobile Number */}
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-primary flex-shrink-0 mt-2" />
                <div className="flex-1 min-w-0">
                  <label className="text-sm text-gray-500">Mobile Number</label>
                  {isEditing ? (
                    <>
                      <Input
                        placeholder="Enter mobile number"
                        value={editedCrew?.phone || ""}
                        onChange={(e) => {
                          if (handleInputChange) {
                            handleInputChange("phone", e.target.value);
                          }
                        }}                        
                        className={`h-9 ${
                          submitted &&
                          (!editedCrew?.phone ||
                            !/^09\d{9}$/.test(editedCrew.phone))
                            ? "border-red-500 focus:!ring-red-500/50"
                            : "border-primary"
                        }`}
                      />
                      {submitted &&
                        (!editedCrew?.phone ||
                          !/^09\d{9}$/.test(editedCrew.phone)) && (
                          <p className="text-red-500 text-sm mt-1">
                            {!editedCrew?.phone
                              ? "Mobile number is required."
                              : 'Mobile number must be 11 digits and start with "09".'}
                          </p>
                        )}
                    </>
                  ) : (
                    <div className="text-sm font-medium truncate">
                      {crew?.phone || "N/A"}
                    </div>
                  )}
                </div>
              </div>

              {/* Landline Number */}
              <div className="flex items-start gap-2">
                <PhoneCall className="h-4 w-4 text-primary flex-shrink-0 mt-2" />
                <div className="flex-1 min-w-0">
                  <label className="text-sm text-gray-500">
                    Landline Number
                  </label>
                  {isEditing ? (
                    <>
                      <Input
                        placeholder="Enter landline number"
                        value={editedCrew?.landline || ""}
                        onChange={(e) => {
                          if (handleInputChange) {
                            handleInputChange("landline", e.target.value);
                          }
                        }}
                        className={`h-9 ${
                          submitted &&
                          (!editedCrew?.landline ||
                            !/^\d{7,10}$/.test(editedCrew.landline))
                            ? "border-red-500 focus:!ring-red-500/50"
                            : "border-primary"
                        }`}
                      />
                      {submitted &&
                        (!editedCrew?.landline ? (
                          <p className="text-red-500 text-sm mt-1">
                            Landline number is required.
                          </p>
                        ) : !/^\d+$/.test(editedCrew.landline) ? (
                          <p className="text-red-500 text-sm mt-1">
                            Landline must contain digits only.
                          </p>
                        ) : !/^\d{7,10}$/.test(editedCrew.landline) ? (
                          <p className="text-red-500 text-sm mt-1">
                            Landline must be 7 to 10 digits (e.g., 0281234567).
                          </p>
                        ) : null)}
                    </>
                  ) : (
                    <div className="text-sm font-medium truncate">
                      {crew?.landline || "N/A"}
                    </div>
                  )}
                </div>
              </div>

              {/* Email Address */}
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-primary flex-shrink-0 mt-2" />
                <div className="flex-1 min-w-0">
                  <label className="text-sm text-gray-500">Email Address</label>
                  {isEditing ? (
                    <>
                      <Input
                        placeholder="Enter email address"
                        value={editedCrew?.email || ""}
                        onChange={(e) => {
                          if (handleInputChange) {
                            handleInputChange("email", e.target.value);
                          }
                        }}
                        className={`h-9 ${
                          submitted &&
                          (!editedCrew?.email ||
                            !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(
                              editedCrew.email
                            ))
                            ? "border-red-500 focus:!ring-red-500/50"
                            : "border-primary"
                        }`}
                      />
                      {submitted && !editedCrew?.email && (
                        <p className="text-red-500 text-sm mt-1">
                          Email is required.
                        </p>
                      )}
                      {submitted &&
                        editedCrew?.email &&
                        !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(
                          editedCrew.email
                        ) && (
                          <p className="text-red-500 text-sm mt-1">
                            Please enter a valid email.
                          </p>
                        )}
                    </>
                  ) : (
                    <div className="text-sm font-medium truncate">
                      {crew?.email || "N/A"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
