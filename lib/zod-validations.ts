import { z } from 'zod'

export const addCrewSchema = z.object({
    crewCode: z.string().min(1),
    rank: z.coerce.number(),
    vessel: z.optional(z.coerce.number()),
    mobileNumber: z.string().min(10).max(11),
    landlineNumber: z.string().min(7).max(11).optional().or(z.literal('')),
    emailAddress: z.string().email(),
    lastName: z.string().min(2).max(50),
    firstName: z.string().min(2).max(50),
    middleName: z.string().min(2).max(50).optional().or(z.literal('')),
    sex: z.string().min(1).max(6),
    dateOfBirth: z.coerce.date(),
    city: z.string().min(2).max(50),
    province: z.string().min(1).max(50),
    sssNumber: z.string().min(10).max(10),
    tinNumber: z.string().min(9).max(12),
    philhealthNumber: z.string().min(12).max(12),
    hdmfNumber: z.string().min(12).max(12),
    passportNumber: z.string().min(7).max(9),
    passportIssueDate: z.coerce.date(),
    passportExpiryDate: z.coerce.date(),
    seamanBookNumber: z.string().min(7).max(9),
    seamanBookIssueDate: z.coerce.date(),
    seamanBookExpiryDate: z.coerce.date(),
    crewPhoto: z.optional(z.instanceof(File))
})

export const addCrewAllotteeSchema = z.object({
    allotmentType: z.preprocess(
        (val) => val === "" || val === undefined ? undefined : Number(val),
        z
            .number({
                required_error: "Please select an allotment type.",
                invalid_type_error: "Allotment type must be a number.",
            })
        // .min(1, { message: "Select either 'Amount' or 'Percentage'." })
        // .max(2, { message: "Invalid allotment type selected." })
    ),
    name: z.string().min(2, { message: "Name is required" }).max(50, { message: "Name must be less than 50 characters" }),
    relation: z.number().min(1, { message: "Relationship is required" }),
    address: z.string().min(2, { message: "Address is required" }).max(100, { message: "Address must be less than 100 characters" }),
    contactNumber: z.string().min(9, { message: "Contact number is required" }).max(11, { message: "Contact number must be between 9 and 11 characters" }),
    city: z.number().min(1, { message: "City is required" }),
    province: z.number().min(1, { message: "Province is required" }),
    bank: z.number().min(1, { message: "Bank is required" }),
    branch: z.number().min(1, { message: "Branch is required" }),
    accountNumber: z.string().min(2, { message: "Account number is required" }).max(50, { message: "Account number must be less than 50 characters" }),
    allotment: z
        .number()
        .min(0.01, { message: "Allotment must be greater than 0" }),
    receivePayslip: z.number().min(0).max(1),
    isActive: z.number().min(0).max(1),
    priority: z.boolean(),
});

export const addVesselSchema = z.object({
    vesselCode: z.string().min(1, "Please enter vessel code."),
    vesselName: z.string().min(1, "Please enter vessel name."),
    vesselType: z.string().min(1, "Please select vessel type."),
    principalName: z.string().min(1, "Please select principal name"),
});

export const editAllotteeSchema = z.object({
    name: z.string().min(1, "Name is required."),
    contactNumber: z
        .string()
        .min(1, "Contact number is required.")
        .regex(/^\d{9,}$/, "Contact number must contain at least 9 digits"),
        // .refine((val) => /^[0-9]+$/.test(val), {
        //     message: "Contact number must be digits only",
        // }),
    address: z.string().min(1, "Address is required."),
  // Make sure relationshipId is always a string (Select will send it as string)
  relationshipId: z
    .string()
    .trim()
    .min(1, "Relationship is required."),
    bankId: z.string().min(1, "Bank is required."),
    branchId: z.string().min(1, "Bank branch is required."),
    province: z.string().min(1, "Province is required."),
    accountNumber: z
        .string()
        .min(1, "Account number is required."),
        // .refine((val) => /^[0-9]+$/.test(val), {
        //     message: "Account number must be digits only",
        // }),
    allotment: z.number().min(1, "Allotment amount is required."),
    //receivePayslip: z.number().min(1, "Payslip preference is required."),
});
