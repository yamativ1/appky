'use client';

import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
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
  const [searchText, setSearchText] = useState('');
  const [selectedAttribute, setSelectedAttribute] = useState<'All' | 'Investor' | 'Startup' | 'Admin'>('All');

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

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchText.toLowerCase()) ||
      user.company.toLowerCase().includes(searchText.toLowerCase());

    const matchesAttribute =
      selectedAttribute === 'All' || user.attribute === selectedAttribute;

    return matchesSearch && matchesAttribute;
  });

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <NetworkHeader />
      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* 🔍 検索ボックス & 属性フィルタ */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <Input
            type="text"
            placeholder="Search by name or company"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full sm:w-1/2"
          />

          <Select value={selectedAttribute} onValueChange={(value) => setSelectedAttribute(value as any)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-md rounded-md border">
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Investor">Investor</SelectItem>
              <SelectItem value="Startup">Startup</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 👤 ユーザーリスト */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {filteredUsers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>

        {/* 🔘 Load More */}
        <div className="text-center mt-8 sm:mt-12">
          <Button variant="outline" className="px-6 sm:px-8 py-2 text-sm sm:text-base">
            Load More Connections
          </Button>
        </div>
      </main>
    </div>
  );
}
