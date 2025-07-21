'use client';

import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { Users, TrendingUp, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserCard from '@/components/UserCard';
import NetworkHeader from '@/components/NetworkHeader';

type User = {
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
  email: string;
};

export default function HomePage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetch('/data/participants.csv')
      .then((res) => res.text())
      .then((text) => {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (result: Papa.ParseResult<any>) => {
            const parsedUsers: User[] = result.data.map((user: any) => ({
              id: user.id,
              name: user.name,
              photo: user.photo,
              company: user.company,
              companySector: user.companySector,
              attribute: user.attribute as 'Investor' | 'Startup' | 'Admin',
              stage: user.stage,
              bio: user.bio,
              location: user.location,
              connections: Number(user.connections),
              companyDescription: user.companyDescription,
              expertise: user.expertise.split(';'),
              experience: user.experience,
              email: user.email,
            }));
            setUsers(parsedUsers);
          },
        });
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <NetworkHeader />
      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {users.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
        <div className="text-center mt-8 sm:mt-12">
          <Button variant="outline" className="px-6 sm:px-8 py-2 text-sm sm:text-base">
            Load More Connections
          </Button>
        </div>
      </main>
    </div>
  );
}
