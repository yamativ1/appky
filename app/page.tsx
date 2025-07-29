'use client';

import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {  Select,  SelectContent,  SelectItem,  SelectTrigger,  SelectValue} from '@/components/ui/select';
import UserCard from '@/components/UserCard';
import NetworkHeader from '@/components/NetworkHeader';
import { SelectItemNoCheck } from '@/components/SelectItemNoCheck'; 

type User = {
  id: string;
  name: string;
  photo: string;
  company: string;
  industry: string[];
  title: 'Investor' | 'Startup' | 'Engineer' | 'Corporate' | 'Advisor' | 'Other';
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
};

function classifyTitle(titleRaw: string): User['title'] {
  const title = titleRaw.toLowerCase();
  if (/(investor|vc|venture|angel|scout|partner|capital|lp|gp|deal flow)/.test(title)) return 'Investor';
  if (/(founder|co[-\s]?founder|ceo|cto|cxo|startup|entrepreneur)/.test(title)) return 'Startup';
  if (/(engineer|developer|software|technical|cpo|product manager)/.test(title)) return 'Engineer';
  if (/(vp|head of|manager|director|executive|lead|gm|principal)/.test(title)) return 'Corporate';
  if (/(advisor|consultant|attorney|counsel|mentor|strategist|staff)/.test(title)) return 'Advisor';
  return 'Other';
}

const titleOptions: User['title'][] = ['Investor', 'Startup', 'Engineer', 'Corporate', 'Advisor', 'Other'];
const stageOptions = [
  'Pre-Seed',
  'Seed',
  'Series A',
  'Series B',
  'Series C',
  'Series A-C',
  'Pre-Seed to Series A',
  'Platform Management',
];

export default function HomePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedAttribute, setSelectedAttribute] = useState<string>('All');
  const [selectedStage, setSelectedStage] = useState<string>('All');

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
              industry: user.industry,
              title: classifyTitle(user.title),
              stage: user.stage,
              objective: user.objective,
              location: user.location,
              raised: user.raised,
              description: user.description,
              annualapr: user.annualapr,
              remarks: user.remarks,
              email: user.email,
              phone_number: user.phone_number,
              linkedinurl: user.linkedinurl,
            }));
            setUsers(parsedUsers);
          },
        });
      });
  }, []);

  const filteredUsers = users.filter((user) => {
    const keyword = searchText.toLowerCase();

    const matchesStringFields =
      user.id?.toLowerCase().includes(keyword) ||
      user.name?.toLowerCase().includes(keyword) ||
      user.company?.toLowerCase().includes(keyword) ||
      user.title?.toLowerCase().includes(keyword) ||
      user.location?.toLowerCase().includes(keyword) ||
      user.stage?.toLowerCase().includes(keyword);

    const matchesArrayFields =
      (Array.isArray(user.industry) && user.industry.some(val => val.toLowerCase().includes(keyword))) ||
      (Array.isArray(user.raised) && user.raised.some(val => val.toLowerCase().includes(keyword))) ||
      (Array.isArray(user.annualapr) && user.annualapr.some(val => val.toLowerCase().includes(keyword)));

    const matchesAttribute =
      selectedAttribute === 'All' || classifyTitle(user.title) === selectedAttribute;

    const matchesStage =
      selectedStage === 'All' || user.stage === selectedStage;

    return (matchesStringFields || matchesArrayFields) && matchesAttribute && matchesStage;
  });

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <NetworkHeader attendeeCount={users.length} />
      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-wrap">
          {/* Search */}
          <Input
            type="text"
            placeholder="Search by keyword"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full sm:w-1/2"
          />

          {/* Title Filter */}
          <Select value={selectedAttribute} onValueChange={setSelectedAttribute}>
            <SelectTrigger className="w-48">
              <SelectValue>
                {selectedAttribute === 'All' ? 'Title' : selectedAttribute}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white shadow-lg rounded-md border border-gray-200">
              <SelectItemNoCheck value="All">All</SelectItemNoCheck>
              {titleOptions.map((title) => (
                <SelectItemNoCheck key={title} value={title}>
                  {title}
                </SelectItemNoCheck>
              ))}
            </SelectContent>
          </Select>

          {/* Stage Filter */}
          <Select value={selectedStage} onValueChange={setSelectedStage}>
            <SelectTrigger className="w-48">
              <SelectValue>
                {selectedStage === 'All' ? 'Stage' : selectedStage}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white shadow-lg rounded-md border border-gray-200">
              <SelectItemNoCheck value="All">All</SelectItemNoCheck>
              {stageOptions.map((stage) => (
                <SelectItemNoCheck key={stage} value={stage}>
                  {stage}
                </SelectItemNoCheck>
              ))}
            </SelectContent>

          </Select>
        </div>

        {/* User list */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredUsers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>

        {/* Load more */}
        <div className="text-center mt-10">
          <Button variant="outline">Load More Connections</Button>
        </div>
      </main>
    </div>
  );
}
