'use client';
import React, { useState } from 'react';
import { Card, CardContent } from '@shadcn/components/ui/card';

interface OpinionChartProps {
  data?: any;
}

export default function OpinionChart({ data }: OpinionChartProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="space-y-4">
      {/* 图表占位符 */}
      <div className="h-64 w-full sm:h-80 bg-muted">
        
      </div>

    </div>
  );
}

