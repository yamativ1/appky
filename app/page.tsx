'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Papa from 'papaparse';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SelectItemNoCheck } from '@/components/SelectItemNoCheck';
import UserCard from '@/components/UserCard';
import NetworkHeader from '@/components/NetworkHeader';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/** ✅ ラッパー：ここでは useSearchParams を呼ばない */
export default function HomePage() {
  return (
    <Suspense fallback={<div className="p-4">Loading…</div>}>
      <HomePageInner />
    </Suspense>
  )
}

/** ここから内側：useSearchParams/usePathname を使用 */
type User = {
  id: string;
  name: string;
  photo: string;
  company: string;
  industry: string[];
  title:
    | 'Angel Investor'
    | 'Venture Capitalist'
    | 'Limited Partner'
    | 'Startup'
    | 'Engineer'
    | 'Corporate'
    | 'Advisor'
    | 'Other';
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
  const title = (titleRaw || '').toLowerCase();
  if (/(angel)/.test(title)) return 'Angel Investor';
  if (/(vc|venture)/.test(title)) return 'Venture Capitalist';
  if (/(lp|limited)/.test(title)) return 'Limited Partner';
  if (/(founder|co[-\s]?founder|ceo|cto|cxo|startup|entrepreneur)/.test(title)) return 'Startup';
  if (/(engineer|developer|software|technical|cpo|product manager)/.test(title)) return 'Engineer';
  if (/(head of|manager|director|executive|lead|gm|principal)/.test(title)) return 'Corporate';
  if (/(advisor|consultant|attorney|counsel|mentor|strategist|staff)/.test(title)) return 'Advisor';
  return 'Other';
}

const titleOptions: User['title'][] = [
  'Angel Investor',
  'Venture Capitalist',
  'Limited Partner',
  'Startup',
  'Engineer',
  'Corporate',
  'Advisor',
  'Other',
];

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

function HomePageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL → UI 初期化（再マウントや直アクセスでも復元）
  const initial = useMemo(
    () => ({
      q: searchParams.get('q') ?? '',
      attr: searchParams.get('attr') ?? 'All',
      stage: searchParams.get('stage') ?? 'All',
    }),
    [searchParams]
  );

  const [users, setUsers] = useState<User[]>([]);
  const [searchText, setSearchText] = useState<string>(initial.q);
  const [selectedAttribute, setSelectedAttribute] = useState<string>(initial.attr);
  const [selectedStage, setSelectedStage] = useState<string>(initial.stage);

  // CSV ロード（既存仕様を温存）
  useEffect(() => {
    let alive = true;
    fetch('/data/participants.csv')
      .then((res) => res.text())
      .then((text) => {
        if (!alive) return;
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (result: Papa.ParseResult<any>) => {
            const parsedUsers: User[] = result.data.map((u: any) => ({
              id: u.id,
              name: u.name,
              photo: u.photo,
              company: u.company,
              industry: Array.isArray(u.industry) ? u.industry : (u.industry ? String(u.industry).split('|') : []),
              title: classifyTitle(u.title),
              stage: u.stage,
              objective: Array.isArray(u.objective) ? u.objective : (u.objective ? String(u.objective).split('|') : []),
              location: u.location,
              raised: Array.isArray(u.raised) ? u.raised : (u.raised ? String(u.raised).split('|') : []),
              description: u.description,
              annualapr: Array.isArray(u.annualapr) ? u.annualapr : (u.annualapr ? String(u.annualapr).split('|') : []),
              remarks: Array.isArray(u.remarks) ? u.remarks : (u.remarks ? String(u.remarks).split('|') : []),
              email: u.email,
              phone_number: u.phone_number,
              linkedinurl: u.linkedinurl,
            }));
            setUsers(parsedUsers);
          },
        });
      });
    return () => {
      alive = false;
    };
  }, []);

  /** ▼ スクロール復元ロジック（URL単位で保存/復元） */
  const urlKey = useMemo(() => {
    const qs = searchParams.toString();
    return `${pathname}${qs ? `?${qs}` : ''}`;
  }, [pathname, searchParams]);

  // スクロール保存（軽くスロットル）
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        try {
          sessionStorage.setItem(`scrollY:${urlKey}`, String(window.scrollY));
        } catch {}
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [urlKey]);

  // 復元（描画後に2フレーム待機）
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const y = Number(sessionStorage.getItem(`scrollY:${urlKey}`) || '0');
    if (Number.isFinite(y) && y > 0) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo({ top: y, left: 0, behavior: 'auto' });
        });
      });
    }
  }, [urlKey, users.length]);
  /** ▲ スクロール復元ここまで */

  // フィルタ値 → URL 同期（履歴は増やさず / スクロール維持）
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    const setParam = (key: string, val?: string) => {
      const next = val && val.trim() !== '' && val !== 'All' ? val.trim() : '';
      const cur = params.get(key) ?? '';
      if (next === '' && cur) params.delete(key);
      else if (next !== '' && cur !== next) params.set(key, next);
    };

    const before = params.toString();
    setParam('q', searchText);
    setParam('attr', selectedAttribute);
    setParam('stage', selectedStage);
    const after = params.toString();

    if (after !== before) {
      const url = `${pathname}${after ? `?${after}` : ''}`;
      router.replace(url, { scroll: false });
      try {
        sessionStorage.setItem('lastListURL', url);
        // フィルタ変更時は必要ならスクロールをリセット（不要なら削除可）
        sessionStorage.removeItem(`scrollY:${url}`);
      } catch {}
    }
  }, [searchText, selectedAttribute, selectedStage, pathname, router, searchParams]);

  // 直リンク戻りのフォールバック用：常に最後の一覧URLを保存
  useEffect(() => {
    try {
      sessionStorage.setItem('lastListURL', urlKey);
    } catch {}
  }, [urlKey]);

  // 既存フィルタ仕様は維持
  const filteredUsers = users.filter((user) => {
    const keyword = (searchText || '').toLowerCase();

    const matchesStringFields =
      user.id?.toLowerCase().includes(keyword) ||
      user.name?.toLowerCase().includes(keyword) ||
      user.company?.toLowerCase().includes(keyword) ||
      user.title?.toLowerCase().includes(keyword) ||
      user.location?.toLowerCase().includes(keyword) ||
      user.stage?.toLowerCase().includes(keyword);

    const matchesArrayFields =
      (Array.isArray(user.industry) && user.industry.some((val) => String(val).toLowerCase().includes(keyword))) ||
      (Array.isArray(user.raised) && user.raised.some((val) => String(val).toLowerCase().includes(keyword))) ||
      (Array.isArray(user.annualapr) && user.annualapr.some((val) => String(val).toLowerCase().includes(keyword)));

    const matchesAttribute = selectedAttribute === 'All' || classifyTitle(user.title) === selectedAttribute;
    const matchesStage = selectedStage === 'All' || user.stage === selectedStage;

    return (matchesStringFields || matchesArrayFields) && matchesAttribute && matchesStage;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b">
        <NetworkHeader attendeeCount={users.length} />
      </div>

      {/* Filter */}
      <div className="sticky top-[90px] z-50 bg-gray-50 border-b h-[135px] will-change-transform">
        <div className="max-w-7xl mx-auto px-4 h-full flex flex-col sm:flex-row gap-y-1 sm:gap-1 items-start justify-center py-1">
          <div className="h-full flex items-center w-full sm:w-1/2">
            <Input
              type="text"
              placeholder="Search by keyword"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="h-[40px] w-full text-sm"
            />
          </div>

          <div className="h-full flex flex-row gap-2 w-full sm:w-auto items-center">
            <Select value={selectedAttribute} onValueChange={setSelectedAttribute}>
              <SelectTrigger className="h-[40px] w-full sm:w-48 text-sm">
                <SelectValue>{selectedAttribute === 'All' ? 'Title' : selectedAttribute}</SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white shadow-lg border border-gray-200">
                <SelectItemNoCheck value="All">All</SelectItemNoCheck>
                {titleOptions.map((title) => (
                  <SelectItemNoCheck key={title} value={title}>
                    {title}
                  </SelectItemNoCheck>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger className="h-[40px] w-full sm:w-48 text-sm">
                <SelectValue>{selectedStage === 'All' ? 'Stage' : selectedStage}</SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white shadow-lg border border-gray-200">
                <SelectItem value="All">All</SelectItem>
                {stageOptions.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredUsers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      </main>
    </div>
  );
}
