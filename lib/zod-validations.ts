import { z } from 'zod'

export const addCrewSchema = z.object({
    crewCode: z.string().min(1),
    rank: z.coerce.number(),
    vessel: z.optional(z.coerce.number()),
    status: z.coerce.number(),
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