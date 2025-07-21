import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import Papa from 'papaparse';
import { Building2, MapPin, Users, Briefcase, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BackButton, ActionButtons, ContactButton } from '@/components/ProfileInteraction';

interface ProfilePageProps {
  params: { id: string };
}

// CSV生データ用
interface RawUser {
  id: string;
  name: string;
  photo: string;
  company: string;
  companySector: string;
  attribute: string;
  stage: string;
  bio: string;
  location: string;
  connections: string;
  companyDescription: string;
  expertise: string;
  experience: string;
}

// UI用に整形されたデータ型
interface User extends Omit<RawUser, 'connections' | 'expertise' | 'attribute'> {
  connections: number;
  expertise: string[];
  attribute: 'Investor' | 'Startup' | 'Admin';
}

const attributeColors = {
  Investor: 'bg-blue-100 text-blue-800 border-blue-200',
  Startup: 'bg-green-100 text-green-800 border-green-200',
  Admin: 'bg-purple-100 text-purple-800 border-purple-200'
};

const stageColors = {
  'Pre-Seed': 'bg-orange-100 text-orange-800',
  'Seed': 'bg-yellow-100 text-yellow-800',
  'Series A': 'bg-blue-100 text-blue-800',
  'Series B': 'bg-purple-100 text-purple-800',
  'Series C': 'bg-indigo-100 text-indigo-800',
  'Series A-C': 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800',
  'Pre-Seed to Series A': 'bg-gradient-to-r from-orange-100 to-blue-100 text-orange-800',
  'Platform Management': 'bg-gray-100 text-gray-800'
};

export async function generateStaticParams() {
  const filePath = path.join(process.cwd(), 'public/data/participants.csv');
  const csv = fs.readFileSync(filePath, 'utf-8');
  const { data } = Papa.parse(csv, { header: true, skipEmptyLines: true });
  return data.map((user: any) => ({ id: user.id }));
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const filePath = path.join(process.cwd(), 'public/data/participants.csv');
  const csv = fs.readFileSync(filePath, 'utf-8');
  const { data } = Papa.parse(csv, { header: true, skipEmptyLines: true });

  const rawUser = data.find((u: any) => u.id === params.id) as RawUser;
  if (!rawUser) notFound();

  const user: User = {
    ...rawUser,
    connections: Number(rawUser.connections),
    expertise: rawUser.expertise?.split(';') ?? [],
    attribute: rawUser.attribute as 'Investor' | 'Startup' | 'Admin'
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
          <BackButton />
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-center lg:items-start">
            {/* Profile Photo & Basic Info */}
            <div className="flex flex-col items-center lg:items-start">
              <img
                src={user.photo}
                alt={user.name}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div className="mt-3 sm:mt-4 text-center lg:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{user.name}</h1>
                <div className="flex items-center gap-2 mt-2 justify-center lg:justify-start flex-wrap">
                  <Badge variant="outline" className={attributeColors[user.attribute]}>
                    {user.attribute}
                  </Badge>
                  {user.stage && (
                    <Badge variant="secondary" className={stageColors[user.stage as keyof typeof stageColors]}>
                      {user.stage}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full">
              <Card>
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-xs text-gray-600">Company</p>
                  <p className="font-semibold text-gray-900 truncate">{user.company}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-xs text-gray-600">Connections</p>
                  <p className="font-semibold text-gray-900">{user.connections.toLocaleString()}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <MapPin className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-xs text-gray-600">Location</p>
                  <p className="font-semibold text-gray-900 truncate">{user.location}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <ActionButtons />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* About */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>{user.bio}</CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold">{user.company}</p>
                <Badge variant="outline">{user.companySector}</Badge>
                <p className="mt-2">{user.companyDescription}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Experience</CardTitle>
              </CardHeader>
              <CardContent>{user.experience}</CardContent>
            </Card>
          </div>

          {/* Expertise + Funding */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Expertise</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {user.expertise.map((skill, i) => (
                  <Badge key={i} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </CardContent>
            </Card>

            {(user.attribute === 'Investor' || user.attribute === 'Startup') && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {user.attribute === 'Investor' ? 'Investment Focus' : 'Funding Stage'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className={stageColors[user.stage as keyof typeof stageColors]}>
                    {user.stage}
                  </Badge>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  {user.location}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  {user.connections.toLocaleString()} connections
                </div>
                <Separator />
                <ContactButton />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
