'use client';

import { Users } from 'lucide-react';

type Props = {
  attendeeCount: number;
};

export default function NetworkHeader({ attendeeCount }: Props) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Network</h1>
            <p className="text-sm text-gray-600">Discover and connect with innovators in your network</p>
          </div>
        </div>
        <div className="text-sm text-gray-700 font-medium">
          {attendeeCount} ppl attend this time
        </div>
      </div>
    </div>
  );
}
