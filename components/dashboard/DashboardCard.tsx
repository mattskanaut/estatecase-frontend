'use client';

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export default function DashboardCard({ title, children, className = '', action }: DashboardCardProps) {
  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-lg shadow-sm ${className}`}>
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
          {action && <div>{action}</div>}
        </div>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}