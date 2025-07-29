import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { MapPin, Users, Banknote, TrendingUp, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BackButton, ActionButtons, ContactButton } from '@/components/ProfileInteraction';
import { notFound } from 'next/navigation';

/* ---------- 型 ---------- */
interface RawUser {
  id: string;
  name: string;
  photo: string;
  company: string;
  industry: string[];
  title: string;
  stage: string[];
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
interface User extends Omit<RawUser, 'raised'> {
  raised: string[];
}

/* ---------- カラー設定 ---------- */
const attributeColors = {
  Investor: 'bg-blue-100 text-blue-800 border-blue-200',
  Startup: 'bg-green-100 text-green-800 border-green-200',
  Engineer: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Corporate: 'bg-purple-100 text-purple-800 border-purple-200',
  Advisor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  Other: 'bg-gray-100 text-gray-800 border-gray-200',
} as const;

const stageColors = {
  'Pre-Seed': 'bg-orange-100 text-orange-800',
  Seed: 'bg-yellow-100 text-yellow-800',
  'Series A': 'bg-blue-100 text-blue-800',
  'Series B': 'bg-purple-100 text-purple-800',
  'Series C': 'bg-indigo-100 text-indigo-800',
  'Series A-C': 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800',
  'Pre-Seed to Series A': 'bg-gradient-to-r from-orange-100 to-blue-100 text-orange-800',
  'Platform Management': 'bg-gray-100 text-gray-800',
} as const;

/* ---------- ユーティリティ ---------- */
function classifyTitle(titleRaw: string): keyof typeof attributeColors {
  const title = titleRaw.toLowerCase();
  if (/(investor|vc|venture|angel|scout|partner|capital|lp|gp|deal flow)/.test(title)) return 'Investor';
  if (/(founder|co[-\s]?founder|ceo|cto|cxo|startup|entrepreneur)/.test(title)) return 'Startup';
  if (/(engineer|developer|software|technical|cpo|product manager)/.test(title)) return 'Engineer';
  if (/(vp|head of|manager|director|executive|lead|gm|principal)/.test(title)) return 'Corporate';
  if (/(advisor|consultant|attorney|counsel|mentor|strategist|staff)/.test(title)) return 'Advisor';
  return 'Other';
}
function getAvatarIndex(userId: string) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % 100;
}

/* ---------- ISR / SSG 用 ---------- */
export async function generateStaticParams() {
  const csv = fs.readFileSync(path.join(process.cwd(), 'public/data/participants.csv'), 'utf-8');
  const { data } = Papa.parse(csv, { header: true, skipEmptyLines: true });
  return data.map((u: any) => ({ id: u.id }));
}

/* ------------------------------------------------------------------ */
/* ここがポイント：params は Promise なので await で展開する            */
/* ------------------------------------------------------------------ */
export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // ✅ 公式型定義に完全準拠

  /* ---------- CSV 取得 ---------- */
  const csv = fs.readFileSync(path.join(process.cwd(), 'public/data/participants.csv'), 'utf-8');
  const { data } = Papa.parse(csv, { header: true, skipEmptyLines: true });

  const rawUser = data.find((u: any) => u.id === id) as RawUser | undefined;
  if (!rawUser) notFound();

  const user: User = {
    ...rawUser,
    raised: rawUser.raised || '-',
    annualapr: Array.isArray(rawUser.annualapr)
      ? rawUser.annualapr
      : ((rawUser.annualapr as unknown as string) || '')
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
  };

  const userCategory = classifyTitle(user.title);
  const avatarIndex = getAvatarIndex(user.id);
  const photoUrl = user.photo?.trim().startsWith('http') ? user.photo : `/avatar/avatar_${avatarIndex}.svg`;
  const normalizedUrl = user.linkedinurl?.startsWith('http') ? user.linkedinurl : `https://${user.linkedinurl}`;

  /* ---------- JSX ---------- */
  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* 上部バー */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
          <BackButton />
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-center lg:items-start">
            {/* アバター＋名前＋タイトル */}
            <div className="flex flex-col items-center lg:items-start">
              <img
                src={photoUrl}
                alt={user.name}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div className="mt-3 sm:mt-4 text-center lg:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{user.name}</h1>
                <div className="flex items-center gap-2 mt-2 justify-center lg:justify-start flex-wrap">
                  <Badge variant="outline" className={attributeColors[userCategory]}>{user.title}</Badge>
                  {user.stage && (
                    <Badge variant="secondary" className={stageColors[user.stage as unknown as keyof typeof stageColors]}>
                      {user.stage}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* クイック統計 */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full">
              <Card>
                <CardContent className="p-3 sm:p-4 text-center">
                  <Layers className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-600">Stage</p>
                  <p className="font-semibold text-gray-900 truncate">{user.stage}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4 text-center">
                  <Banknote className="w-5 h-5 text-green-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-600">Annual APR</p>
                  <p className="font-semibold text-gray-900">{user.annualapr.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4 text-center">
                  <TrendingUp className="w-5 h-5 text-purple-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-600">Raised</p>
                  <p className="font-semibold text-gray-900 truncate">{user.raised}</p>
                </CardContent>
              </Card>
            </div>
          </div>
          <ActionButtons linkedinurl={normalizedUrl} />
        </div>
      </div>

      {/* メイン */}
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* 左 */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader><CardTitle>Purpose of Participation</CardTitle></CardHeader>
              <CardContent>{user.objective}</CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Company Information</CardTitle></CardHeader>
              <CardContent>
                <p className="font-bold text-xl">{user.company}</p>
                <p className="font-semibold">{user.industry}</p>
                <p className="mt-2">{user.description}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Remarks</CardTitle></CardHeader>
              <CardContent>{user.remarks}</CardContent>
            </Card>
          </div>

          {/* 右 */}
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Free Card1</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {user.annualapr.map((skill, i) => (
                  <Badge key={i} variant="secondary">{skill}</Badge>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Free Card2</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4" />{user.location}</div>
                <div className="flex items-center gap-2"><Users className="w-4 h-4" />{user.raised.toLocaleString()} raised</div>
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
