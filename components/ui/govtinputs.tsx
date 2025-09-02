import { Input } from "@/components/ui/input";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Info } from "lucide-react";

interface GovIDInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  isInvalid: boolean;
  //errorMessage?: string;
}

export const GovIDCardInput = ({
  label,
  value,
  onChange,
  placeholder,
  isInvalid,
  //errorMessage,
}: GovIDInputProps) => {

const tooltipMessages: Record<string, string> = {
  "SSS Number": "This field is optional. If applicable, please enter your 10-digit SSS Number.",
  "Tax Number": "This field is optional. If applicable, please enter your 9-digit Tax Identification Number (TIN) as issued by the BIR.",
  "Philhealth Number": "This field is optional. If applicable, please provide your 12-digit PhilHealth Identification Number.",
  "HDMF Number": "This field is optional. If applicable, please enter your 12-digit HDMF Number.",
  "Passport Number": "This field is required. Please enter a valid Passport Number with 6 to 7 digits.",
  "Seamans Book": "This field is required. Please enter a valid Seaman's Book Number with 6 to 7 digits."
};

  return (
    <div>
      <div className="flex items-center mb-1">
        <label className="text-sm font-semibold text-gray-600 block mr-2">
          {label}
        </label>
        
        <HoverCard openDelay={100}>
            <HoverCardTrigger asChild>
            <Info
            className={`w-4 h-4 cursor-pointer transition-colors ${
                isInvalid
                ? "text-red-500"
                : "text-gray-400 hover:text-blue-500"
                }`}
            />
            </HoverCardTrigger>

            <HoverCardContent
                side="right"
                align="center"
                className="w-72 p-4 bg-white border border-gray-200 rounded-lg shadow-xl text-sm text-gray-700 z-50"
            >
            <div className="flex">
                <Info className="text-gray-400 hover:text-blue-500 w-8 h-8 cursor-pointer mr-2" />
                <span>{tooltipMessages[label] ?? "Please enter a valid ID number."}</span>
            </div>
            </HoverCardContent>
        </HoverCard>
      </div>

      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={isInvalid ? "border-red-500 focus:!ring-red-500/50" : ""}
      />
    </div>
  );
};
