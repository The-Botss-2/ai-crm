"use client";
import MemberActionDialog from "./MemberActionDialog";

export default function TeamMembersTable({ members, isAdmin, teamId, requesterId, mutate }: any) {
  return (
    <table className="w-full border rounded-md overflow-hidden bg-white mt-5">
      <thead className="">
        <tr>
          <th className="text-left px-4 py-2">Name</th>
          <th className="text-left px-4 py-2">Email</th>
          <th className="text-left px-4 py-2">Role</th>
          {isAdmin && <th className="text-left px-4 py-2">Actions</th>}
        </tr>
      </thead>
      <tbody>
        {members.map((member: any) => (
          <tr key={member.profile._id} className="border-t border-gray-200 text-sm">
            <td className="px-4 py-2">{member.profile.name}</td>
            <td className="px-4 py-2">{member.profile.email}</td>
            <td className="px-4 py-2">{member.role}</td>
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
