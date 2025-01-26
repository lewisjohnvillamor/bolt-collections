'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingCartIcon,
  CubeIcon,
  UserGroupIcon,
  TagIcon,
  TruckIcon,
  ArchiveBoxIcon,
  FolderIcon,
  EnvelopeIcon,
  ChatBubbleBottomCenterTextIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r shadow-lg transform lg:translate-x-0 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:w-64`}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
          <Link href="/admin/dashboard" className="text-lg font-semibold text-gray-700">
            Admin Dashboard
          </Link>
          <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-6">
          <ul className="space-y-4">
            {/* Temporarily removed
              <li>
                <span className="flex items-center text-gray-400 cursor-not-allowed">
                  <ShoppingCartIcon className="w-5 h-5 mr-3" />
                  Orders
                </span>
              </li>
              <li>
                <span className="flex items-center text-gray-400 cursor-not-allowed">
                  <CubeIcon className="w-5 h-5 mr-3" />
                  Products
                </span>
              </li>
            */}
            <li>
              <Link href="/admin/collections" className="flex items-center text-gray-700 hover:text-blue-600">
                <FolderIcon className="w-5 h-5 mr-3" />
                Collections
              </Link>
            </li>
            {/* Temporarily removed
              <li>
                <span className="flex items-center text-gray-400 cursor-not-allowed">
                  <UserGroupIcon className="w-5 h-5 mr-3" />
                  Customers
                </span>
              </li>
              <li>
                <span className="flex items-center text-gray-400 cursor-not-allowed">
                  <TagIcon className="w-5 h-5 mr-3" />
                  Discounts
                </span>
              </li>
              <li>
                <span className="flex items-center text-gray-400 cursor-not-allowed">
                  <ArchiveBoxIcon className="w-5 h-5 mr-3" />
                  Inventory
                </span>
              </li>
              <li>
                <span className="flex items-center text-gray-400 cursor-not-allowed">
                  <TruckIcon className="w-5 h-5 mr-3" />
                  Shipping
                </span>
              </li>
            */}
            <li>
              <Link href="/admin/emails" className="flex items-center text-gray-700 hover:text-blue-600">
                <EnvelopeIcon className="w-5 h-5 mr-3" />
                Emails
              </Link>
            </li>
            <li>
              <Link href="/admin/contact-us" className="flex items-center text-gray-700 hover:text-blue-600">
                <ChatBubbleBottomCenterTextIcon className="w-5 h-5 mr-3" />
                Contact Us
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-6 bg-white border-b shadow-md">
          <button className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
            <Bars3Icon className="w-6 h-6 text-gray-700" />
          </button>

          <div className="flex-1 flex justify-center lg:justify-start"></div>

          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Admin User</span>
            <img
              className="w-8 h-8 rounded-full object-cover"
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="Admin"
            />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto bg-gray-100">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}