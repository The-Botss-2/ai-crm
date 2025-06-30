"use client";
import AddTeamDialog from "./AddTeamDialog";
import SignOutBtn from './SignOutBtn';

export default function Navbar({ id }: { id: string }) {
  return (
    <nav className="flex justify-between items-center px-4 py-2 bg-white/50 0 border-b  border-gray-200">
      <h1 className="text-xl font-bold">Teams</h1>
      <div className="flex items-center gap-4">
        <AddTeamDialog userId={id} />
        <SignOutBtn />
      </div>
    </nav>
  );
}
