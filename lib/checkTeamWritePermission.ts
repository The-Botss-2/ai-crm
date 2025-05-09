import { connectToDatabase } from "./db";
import Team from "@/model/Team";

export async function checkTeamWritePermission(teamId: string, userId: string) {
  await connectToDatabase();

  const team = await Team.findById(teamId);

  if (!team) {
    throw new Error('Team not found');
  }

  const member = team.members.find((m: any) => m.id.toString() === userId.toString());

  if (!member) {
    throw new Error('User is not a member of this team');
  }

  if (member.role === 'readonly') {
    throw new Error('Permission denied: readonly users cannot perform write operations');
  }

  return true; // ✅ Passed check
}
