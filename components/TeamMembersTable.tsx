"use client";
import MemberActionDialog from "./MemberActionDialog";

export default function TeamMembersTable({ members, isAdmin, teamId, requesterId, mutate }: any) {
  return (
    <table className="w-full border rounded-md overflow-hidden bg-white mt-5">
      <thead>
        <tr className="bg-gray-100">
          <th className="text-left px-4 py-2 text-gray-700">Name</th>
          <th className="text-left px-4 py-2 text-gray-700">Email</th>
          <th className="text-left px-4 py-2 text-gray-700">Role</th>
          {isAdmin && <th className="text-left px-4 py-2 text-gray-700">Actions</th>}
        </tr>
      </thead>
      <tbody>
        {members.map((member: any) => (
          <tr key={member.profile?._id} className="border-t border-gray-200 text-sm text-gray-800 hover:bg-gray-50 transition">
            <td className="px-4 py-2">{member.profile?.name}</td>
            <td className="px-4 py-2">{member.profile?.email}</td>
            <td className="px-4 py-2 capitalize">{member?.role}</td>
            {isAdmin && (
              <td className="px-4 py-2">
                {member.role === 'admin' ? (
                  <span className="text-gray-400 italic">Admin</span>
                ) : (
                  <MemberActionDialog
                    member={member}
                    teamId={teamId}
                    requesterId={requesterId}
                    mutate={mutate}
                  />
                )}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
