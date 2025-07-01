import { NextResponse, NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Team from '@/model/Team';
import Profile from '@/model/Profile';
import { SendEmail } from '@/lib/SendEmail';
import Credentials from '@/model/Credentials';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  await connectToDatabase();

  try {
    const id = req.nextUrl.searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing required fields.' }, { status: 400 });
    }
    const teams = await Team.find({ 'members.id': id });
    return NextResponse.json({ success: true, teams });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to fetch teams.' }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const { teamId, requesterId, email, role } = await req.json();

    if (!teamId || !requesterId || !email || !role) {
      return NextResponse.json({ success: false, error: 'Missing required fields.' }, { status: 400 });
    }

    // 1. Validate requester
    const team = await Team.findById(teamId);
    if (!team) {
      return NextResponse.json({ success: false, error: 'Team not found.' }, { status: 404 });
    }

    if (team.createdBy.toString() !== requesterId) {
      return NextResponse.json({ success: false, error: 'Only admin can add members.' }, { status: 403 });
    }

    // 2. Find user by email
    const profile = await Profile.findOne({ email });
    if (!profile) {
      return NextResponse.json({ success: false, error: 'User with this email not found.' }, { status: 404 });
    }

    // 3. Check if already a member
    const alreadyMember = team.members.some((m: { id: { toString: () => any; }; }) => m.id.toString() === profile._id.toString());
    if (alreadyMember) {
      return NextResponse.json({ success: false, error: 'User already a member of this team.' }, { status: 400 });
    }

    // 4. Add new member
    team.members.push({
      id: profile?._id, role
    });
    await team.save();

    return NextResponse.json({ success: true, team });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'Failed to add member.' }, { status: 500 });
  }
}



export async function PATCH(req: NextRequest) {
  await connectToDatabase();
  const teamId = req.nextUrl.searchParams.get('id')

  try {
    const { requesterId, memberId, role, access } = await req.json();

    if (!requesterId || !memberId || !role) {
      return NextResponse.json({ success: false, error: 'Missing fields.' }, { status: 400 });
    }

    const team = await Team.findById(teamId);
    if (!team) return NextResponse.json({ success: false, error: 'Team not found.' }, { status: 404 });

    if (team.createdBy.toString() !== requesterId) {
      return NextResponse.json({ success: false, error: 'Only admin can update roles.' }, { status: 403 });
    }

    const member = team.members.find((m: any) => m.id.toString() === memberId);
    if (!member) return NextResponse.json({ success: false, error: 'Member not found.' }, { status: 404 });
    member.role = role;
    member.access = {
      dashboard: access.dashboard || member.access.dashboard || 'none',
      leads: access.leads || member.access.leads || 'none',
      meetings: access.meetings || member.access.meetings || 'none',
      tasks: access.tasks || member.access.tasks || 'none',
      categories: access.categories || member.access.categories || 'none',
      products: access.products || member.access.products || 'none',
      forms: access.forms || member.access.forms || 'none',
      campaigns: access.campaigns || member.access.campaigns || 'none',
      teams: access.teams || member.access.teams || 'none',
      analytics: access.analytics || member.access.analytics || 'none',
      knowledge_base: access.knowledge_base || member.access.knowledge_base || 'none',
    };
    await team.save();

    return NextResponse.json({ success: true, message: 'Role updated.' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'Update failed.' }, { status: 500 });
  }
}
export async function PUT(req: NextRequest) {
  await connectToDatabase();
  const teamId = req.nextUrl.searchParams.get('id')

  try {
    const { requesterId, email, role, access } = await req.json();
    await Credentials.findOneAndDelete({ email });
    await Profile.findOneAndDelete({ email });
    if (!requesterId || !email || !role) {
      return NextResponse.json({ success: false, error: 'Missing fields.' }, { status: 400 });
    }

    const team = await Team.findById(teamId);
    if (!team) return NextResponse.json({ success: false, error: 'Team not found.' }, { status: 404 });

    if (team.createdBy.toString() !== requesterId) {
      return NextResponse.json({ success: false, error: 'Only admin can add members.' }, { status: 403 });
    }
    const profile = await Profile.findOne({ email });

    const invitationLink = `${process.env.domain}`;
    const generatedPassword = crypto.randomBytes(8).toString('hex'); // Random 8-byte password

    // Email content
    const htmlTemplate = `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Team Invitation | AI-CRM</title>
      <style type="text/css">
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
        a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333333; background-color: #f7f7f7; }
        .email-container { width: 100%; max-width: 600px; margin: 0 auto; }
        .header { background-color:; padding: 30px 20px; text-align: center; }
        .header-logo { color: black; font-size: 24px; font-weight: bold; text-decoration: none; }
        .content { padding: 40px 30px; background-color: #ffffff; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666666; background-color: #f3f4f6; }
        .button { display: inline-block; padding: 14px 28px; background-color: #2563eb; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        h1 { color: #111827; font-size: 24px; font-weight: 600; margin-top: 0; margin-bottom: 20px; }
        p { font-size: 16px; line-height: 1.5; margin-bottom: 20px; }
        .code-block { background-color: #f3f4f6; padding: 12px; border-radius: 4px; word-break: break-all; }
        @media screen and (max-width: 600px) { .email-container { width: 100% !important; } .content { padding: 20px 15px !important; } }
      </style>
    </head>
    <body style="margin: 0; padding: 0;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td align="center" style="background-color: #f7f7f7;">
            <table class="email-container" width="600" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td class="content">
                  <h1>You've Been Invited to Join Our Team</h1>
                  <p>Hello,</p>
                  <p>You've been invited to join <strong>${team.name}</strong> on AI-CRM platform. This will give you access to collaborate with your team on projects, leads, and more.</p>
                  <p style="text-align: center;">
                    <a href="${invitationLink}" class="button">Accept Invitation</a>
                  </p>
                  <p>If the button doesn't work, copy and paste this link into your browser:</p>
                  <p class="code-block">${invitationLink}</p>
                  <p>Here are your login credentials:</p>
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Password:</strong> ${generatedPassword}</p>
                  <p>Best regards,<br/>The AI-CRM Team</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td align="center" style="background-color: #f3f4f6;">
            <table class="email-container" width="600" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td class="footer">
                  <p>© ${new Date().getFullYear()} AI-CRM. All rights reserved.</p>
                  <p><a href=${process.env.domain} style="color: #2563eb; text-decoration: none;">Visit our website</a> |</p>
                  <p>If you didn't request this invitation, please ignore this email.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    if (!profile) {

      try {
        const existing = await Credentials.findOne({ email });
        if (existing) {
          return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(generatedPassword, 12);
        await Credentials.create({ email, password: hashedPassword });

        let profile = await Profile.findOne({ email });
        if (!profile) {
          profile = await Profile.create({ email , name: email.split('@')[0] });
        }
        const emailOptions = {
          email: email,
          subject: `You've been invited to join ${team?.name} on TheBots CRM`,
          html: htmlTemplate,
          text: `You've been invited to join a team on TheBots CRM. Click here to accept: ${invitationLink}`
        };
        await SendEmail(emailOptions);
        let fetchAgainProfile = await Profile.findOne({ email });
        const already = team.members.some((m: any) => m.id.toString() === fetchAgainProfile._id.toString());
        if (already) {
          return NextResponse.json({ success: false, error: 'Already a member.' }, { status: 400 });
        }

        team.members.push({ id: fetchAgainProfile._id, role, access });
        await team.save();

        return NextResponse.json({ success: true, message: 'Invitation sent successfully' }, { status: 200 });
      } catch (err) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      }
    }

    const already = team.members.some((m: any) => m.id.toString() === profile._id.toString());
    if (already) {
      return NextResponse.json({ success: false, error: 'Already a member.' }, { status: 400 });
    }

    team.members.push({ id: profile._id, role, access });
    await team.save();

    return NextResponse.json({ success: true, message: 'Member added.' });
  } catch (err) {
    console.error(err, 'err ==== > err');
    return NextResponse.json({ success: false, error: 'Add failed.' }, { status: 500 });
  }
}
export async function DELETE(req: NextRequest) {
  await connectToDatabase();
  const teamId = req.nextUrl.searchParams.get('id')

  try {
    const { requesterId, memberId } = await req.json();

    if (!requesterId || !memberId) {
      return NextResponse.json({ success: false, error: 'Missing fields.' }, { status: 400 });
    }

    const team = await Team.findById(teamId);
    if (!team) return NextResponse.json({ success: false, error: 'Team not found.' }, { status: 404 });

    if (team.createdBy.toString() !== requesterId) {
      return NextResponse.json({ success: false, error: 'Only admin can remove members.' }, { status: 403 });
    }

    const originalLength = team.members.length;
    team.members = team.members.filter((m: any) => m.id.toString() !== memberId);

    if (team.members.length === originalLength) {
      return NextResponse.json({ success: false, error: 'Member not found.' }, { status: 404 });
    }

    await team.save();
    return NextResponse.json({ success: true, message: 'Member removed.' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'Remove failed.' }, { status: 500 });
  }
}

