'use client';

import { Search, Filter, Users, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function NetworkHeader() {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              My Network
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Discover and connect with innovators in your network</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1 text-xs sm:text-sm">
              <TrendingUp className="w-3 h-3" />
              2.4K Active Today
            </Badge>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name, company, or expertise..."
              className="pl-10 h-10 sm:h-11 text-sm sm:text-base"
            />
          </div>
          
          <div className="flex gap-2 sm:gap-3">
            <Select defaultValue="all" >
              <SelectTrigger className="w-full sm:w-40 h-10 sm:h-11">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Attribute" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="investor">Investors</SelectItem>
                <SelectItem value="startup">Startups</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-40 h-10 sm:h-11">
                <SelectValue placeholder="Sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                <SelectItem value="tech">Technology</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="fintech">FinTech</SelectItem>
                <SelectItem value="cleantech">Clean Tech</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}