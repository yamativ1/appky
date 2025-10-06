export type User = {
  id: string;
  name: string;
  photo: string;
  company: string;
  industry: string[];
  title: 'Angel Investor' | 'Venture Capitalist' | 'Limited Partner' | 'Startup' | 'Engineer' | 'Corporate' | 'Advisor' | 'Other';
  stage: string;
  objective: string[];
  location: string;
  raised: string[];
  description: string;
  annualapr: string[];
  remarks: string[];
  email: string;
  phone_number: string;
  linkedinurl: string;
}

export interface UserCardProps {
  user: User;
}
