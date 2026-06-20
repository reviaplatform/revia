"use client";

import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="w-full h-full animate-pulse space-y-8">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-8">
        <div className="h-8 w-48 bg-gray-200 rounded-lg" />
        <div className="flex space-x-4">
          <div className="h-10 w-10 bg-gray-200 rounded-full" />
          <div className="h-10 w-32 bg-gray-200 rounded-lg" />
        </div>
      </div>

      {/* Grid Content Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 space-y-4">
            <div className="h-40 w-full bg-gray-100 rounded-xl" />
            <div className="h-6 w-3/4 bg-gray-200 rounded" />
            <div className="h-4 w-1/2 bg-gray-100 rounded" />
            <div className="flex justify-between pt-2">
              <div className="h-8 w-20 bg-gray-100 rounded-md" />
              <div className="h-8 w-20 bg-gray-100 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
