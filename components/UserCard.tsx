'use client';

import { User } from '@/lib/types';
import { Building2, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface UserCardProps {
  user: User;
}

// カテゴリ別バッジ色
const attributeColors = {
  Investor: 'bg-blue-100 text-blue-800 border-blue-200',
  Startup: 'bg-green-100 text-green-800 border-green-200',
  Engineer: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Corporate: 'bg-purple-100 text-purple-800 border-purple-200',
  Advisor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  Other: 'bg-gray-100 text-gray-800 border-gray-200'
};

// title 文字列から分類
function classifyTitle(titleRaw: string): keyof typeof attributeColors {
  const title = titleRaw.toLowerCase();

  if (/(investor|vc|venture|angel|scout|partner|capital|lp|gp|deal flow)/.test(title)) {
    return 'Investor';
  }
  if (/(founder|co[-\s]?founder|ceo|cto|cxo|startup|entrepreneur)/.test(title)) {
    return 'Startup';
  }
  if (/(engineer|developer|software|technical|cpo|product manager)/.test(title)) {
    return 'Engineer';
  }
  if (/(vp|head of|manager|director|executive|lead|gm|principal)/.test(title)) {
    return 'Corporate';
  }
  if (/(advisor|consultant|attorney|counsel|mentor|strategist|staff)/.test(title)) {
    return 'Advisor';
  }

  return 'Other';
}

// アバターインデックス生成
function getAvatarIndex(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 100;
}

export default function UserCard({ user }: UserCardProps) {
  const avatarIndex = getAvatarIndex(user.id);
  const photoUrl = user.photo?.trim().startsWith('http')
    ? user.photo
    : `/avatar/avatar_${avatarIndex}.svg`;

  const userCategory = classifyTitle(user.title);

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-gray-200 w-full">
      <CardContent className="p-3 sm:p-4 lg:p-6">
      <div className="flex flex-col items-center text-center space-y-4 sm:space-y-3 lg:space-y-4">
          {/* Profile Photo */}
          <div className="relative">
          <img
            src={photoUrl}
            alt={user.name}
            className="w-16 h-16 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full object-cover border-2 sm:border-4 border-white shadow-md mb-5 sm:mb-0"
          />

          <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Badge 
              variant="outline" 
              className={`text-xs px-1.5 py-0.5 sm:px-1.5 lg:px-2 lg:py-1 ${attributeColors[userCategory]} whitespace-nowrap`}
            >
              {user.title}
            </Badge>
          </div>

          </div>

          {/* User Info */}
          <div className="space-y-1 sm:space-y-2 w-full min-h-0">
            <h3 className="font-semibold text-sm sm:text-base lg:text-lg text-gray-900 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">
              {user.name}
            </h3>
            
            <div className="flex items-center justify-center text-gray-600 text-xs min-w-0">
              <Building2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="font-medium truncate min-w-0">{user.company}</span>
            </div>

            <div className="text-xs text-gray-500 truncate px-1">
              {user.industry}
            </div>

            {user.stage && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5 sm:px-2 sm:py-1 max-w-full truncate">
                {user.stage}
              </Badge>
            )}
          </div>

          {/* Description 
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed px-2 sm:px-2 lg:px-0 hidden sm:block">
            {user.description}
          </p> */}

          {/* Location & Connections
          <div className="flex items-center justify-between w-full text-xs text-gray-500 pt-2 sm:pt-2 border-t border-gray-100 px-1 sm:px-2 lg:px-0 min-w-0">
            <div className="flex items-center min-w-0 flex-1">
              <MapPin className="w-3 h-3 mr-1" />
              <span className="truncate min-w-0">{user.location}</span>
            </div>
          </div> */}

          {/* Action Button */}
          <Link href={`/profile/${user.id}`} className="w-full">
            <Button 
              variant="outline" 
              className="w-full mt-2 sm:mt-3 lg:mt-4 h-9 sm:h-9 lg:h-10 text-xs sm:text-sm group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:text-blue-600 transition-colors"
            >
              View Profile
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
