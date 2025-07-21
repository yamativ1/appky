export type User = {
  id: string;
  name: string;
  photo: string;
  company: string;
  companySector: string;
  attribute: 'Investor' | 'Startup' | 'Admin';
  stage: string;
  bio: string;
  location: string;
  connections: number;
  companyDescription: string;
  expertise: string[];
  experience: string;
  email: string; // ← ✅ これを追加
}

export interface UserCardProps {
  user: User;
}