'use client';

import { Users } from 'lucide-react';

type Props = {
  attendeeCount: number;
};

export default function NetworkHeader({ attendeeCount }: Props) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-2 py-4 flex justify-between items-center h-[120px]">
        <div className="flex items-center gap-2 ">
          <Users className="w-10 h-10 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Melt Network</h1>
            <p className="text-xs text-gray-600">*If you’d like any information hidden, please let us know.</p>
          </div>
        </div>
        {/*<div className="font-medium text-gray-700">
          <span className="text-blue-600 text-2xl font-bold">{attendeeCount}</span>{'　'}
          <span className="text-lg text-gray-700">ppl Attend This Time</span>
        </div>*/}
      </div>
    </div>
  );
}
