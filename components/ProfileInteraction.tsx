'use client';

import { ArrowLeft, Mail, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function BackButton() {
  return (
    <Link href="/">
      <Button variant="outline" className="mb-4 sm:mb-6 hover:bg-gray-50 h-9 sm:h-10 text-sm sm:text-base">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Network
      </Button>
    </Link>
  );
}

export function ActionButtons() {
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6 w-full sm:w-auto">
      <Button className="bg-blue-600 hover:bg-blue-700 h-10 sm:h-11 text-sm sm:text-base flex-1 sm:flex-none">
        <Mail className="w-4 h-4 mr-2" />
        Connect
      </Button>
      <Button variant="outline" className="h-10 sm:h-11 text-sm sm:text-base flex-1 sm:flex-none">
        <ExternalLink className="w-4 h-4 mr-2" />
        Visit Company
      </Button>
    </div>
  );
}

export function ContactButton() {
  return (
    <Button variant="outline" className="w-full h-9 sm:h-10 text-sm sm:text-base">
      <Mail className="w-4 h-4 mr-2" />
      Send Message
    </Button>
  );
}