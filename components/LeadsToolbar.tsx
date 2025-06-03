import React from 'react';

interface LeadsToolbarProps {
  search: string;
  sortOption: string;
  onSearchChange: (value: string) => void;
  onSortChange: (value: string) => void;
}

const LeadsToolbar: React.FC<LeadsToolbarProps> = ({ search, sortOption, onSearchChange, onSortChange }) => {
  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      <input
        type="text"
        placeholder="Search by name or email"
        className="border px-3 py-2 rounded w-full max-w-md text-xs border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <select
        className="border px-2 py-2 rounded text-xs border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={sortOption}
        onChange={(e) => onSortChange(e.target.value)}
      >
        <option value="createdAt-desc">Created (Newest First)</option>
        <option value="createdAt-asc">Created (Oldest First)</option>
        <option value="name-asc">Name (A-Z)</option>
        <option value="name-desc">Name (Z-A)</option>
        <option value="email-asc">Email (A-Z)</option>
        <option value="email-desc">Email (Z-A)</option>
      </select>
    </div>
  );
};

export default LeadsToolbar;
