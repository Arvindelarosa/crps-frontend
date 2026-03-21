import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const residentSchema = z.object({
  barangay_id: z.string().or(z.number()).optional(), // Provided by user/auth
  last_name: z.string().min(1, 'Last name is required'),
  first_name: z.string().min(1, 'First name is required'),
  middle_name: z.string().optional(),
  suffix: z.string().optional(),
  gender: z.enum(['male','female','prefer_not_to_say']),
  birthdate: z.string().min(1, 'Birthdate is required'),
  birthplace: z.string().optional(),
  civil_status: z.enum(['single','married','widowed','separated','annulled','live_in']),
  religion: z.string().optional(),
  nationality: z.string().default('Filipino'),
  occupation: z.string().optional(),
  monthly_income: z.preprocess((val) => Number(val) || 0, z.number().min(0).optional()),
  highest_education: z.enum(['no_formal','elementary','high_school','vocational','college','post_graduate']).optional(),
  contact_number: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  full_address: z.string().optional(),
  // Sectors
  is_senior_citizen: z.boolean().default(false),
  is_solo_parent: z.boolean().default(false),
  is_pwd: z.boolean().default(false),
  is_registered_voter: z.boolean().default(false),
  is_student: z.boolean().default(false),
  is_ofw: z.boolean().default(false),
  is_4ps_beneficiary: z.boolean().default(false),
  is_indigenous_people: z.boolean().default(false),
  is_unemployed: z.boolean().default(false),
  // Sector Details
  pwd_type: z.string().optional(),
  solo_parent_id_no: z.string().optional(),
  voter_id_no: z.string().optional(),
  school_name: z.string().optional(),
  ip_tribe: z.string().optional(),
  ofw_country: z.string().optional(),
});

export const householdSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  purok_sitio: z.string().optional(),
  house_type: z.enum(['owned','rented','shared','informal_settler','government']),
  house_material: z.enum(['concrete','semi-concrete','wood','light_material','mixed']).default('concrete'),
  socioeconomic_status: z.enum(['indigent','low_income','middle_income','high_income']).default('low_income'),
  has_electricity: z.boolean().default(false),
  has_water_supply: z.boolean().default(false),
  has_toilet: z.boolean().default(false),
});

export const requestDocumentSchema = z.object({
  resident_id: z.string().min(1, 'Resident is required'),
  document_type: z.enum(['barangay_clearance','certificate_of_residency','certificate_of_indigency','business_permit','business_clearance','good_moral_certificate','barangay_id','cedula']),
  purpose: z.string().min(1, 'Purpose is required'),
  business_name: z.string().optional(),
  business_address: z.string().optional(),
  cedula_year: z.preprocess((val) => Number(val) || undefined, z.number().optional()),
  amount_paid: z.preprocess((val) => Number(val) || 0, z.number().min(0).default(0)),
});

export const kpCaseSchema = z.object({
  complainant_name: z.string().min(1, 'Required'),
  complainant_address: z.string().optional(),
  respondent_name: z.string().min(1, 'Required'),
  respondent_address: z.string().optional(),
  nature_of_complaint: z.string().min(1, 'Required'),
  complaint_category: z.enum(['property_dispute','physical_injury','oral_defamation','theft','damage_to_property','family_dispute','noise_disturbance','trespassing','others']),
  date_filed: z.string().min(1, 'Date filed is required'),
  is_blotter: z.boolean().default(false),
});
