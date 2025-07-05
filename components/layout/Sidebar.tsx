'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  FolderIcon,
  CogIcon,
  BellIcon,
  MapIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon, color: 'text-blue-400' },
  { name: 'Property Search', href: '/properties', icon: MagnifyingGlassIcon, color: 'text-green-400' },
  { name: 'Deals', href: '/deals', icon: FolderIcon, color: 'text-purple-400' },
  { name: 'Market Analysis', href: '/analysis', icon: ChartBarIcon, color: 'text-yellow-400' },
  { name: 'Area Maps', href: '/maps', icon: MapIcon, color: 'text-teal-400' },
  { name: 'Alerts', href: '/alerts', icon: BellIcon, color: 'text-red-400' },
  { name: 'Settings', href: '/settings', icon: CogIcon, color: 'text-gray-400' },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-gray-800 border-r border-gray-700">
          {/* Logo */}
          <div className="flex h-16 flex-shrink-0 items-center px-4 bg-gray-900">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center">
                <BuildingOfficeIcon className="h-5 w-5 text-white" />
              </div>
              <span className="ml-3 text-white font-semibold text-lg">PropertyPro</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <nav className="flex-1 space-y-1 px-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-gray-900 text-white border-r-2 border-blue-500'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                        isActive ? item.color : `text-gray-400 group-hover:${item.color.replace('400', '500')}`
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User info */}
          <div className="flex flex-shrink-0 border-t border-gray-700 p-4">
            <div className="group block w-full flex-shrink-0">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-gray-600 rounded flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-300">U</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-300">User</p>
                  <p className="text-xs text-gray-400">Investment Analyst</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex min-h-0 flex-1 flex-col bg-gray-800 border-r border-gray-700">
          {/* Logo */}
          <div className="flex h-16 flex-shrink-0 items-center px-4 bg-gray-900">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center">
                <BuildingOfficeIcon className="h-5 w-5 text-white" />
              </div>
              <span className="ml-3 text-white font-semibold text-lg">PropertyPro</span>
            </div>
            <button
              onClick={onClose}
              className="ml-auto text-gray-400 hover:text-white"
            >
              <span className="sr-only">Close sidebar</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <nav className="flex-1 space-y-1 px-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-gray-900 text-white border-r-2 border-blue-500'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                        isActive ? item.color : `text-gray-400 group-hover:${item.color.replace('400', '500')}`
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User info */}
          <div className="flex flex-shrink-0 border-t border-gray-700 p-4">
            <div className="group block w-full flex-shrink-0">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-gray-600 rounded flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-300">U</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-300">User</p>
                  <p className="text-xs text-gray-400">Investment Analyst</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}