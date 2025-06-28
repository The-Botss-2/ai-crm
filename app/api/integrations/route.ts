// app/api/integrations/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { auth } from '@/auth'; // adjust this if your auth path is different

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  const zoomURL = `${process.env.NEXT_PUBLIC_ZOOM_URL}/zoom/zoom_user/${userId}`;
  const elevenlabsURL = `${process.env.NEXT_PUBLIC_CALLING_AGENT_URL}/api/elevenlabs/status/${userId}`;
  const twilioURL = `${process.env.NEXT_PUBLIC_CALLING_AGENT_URL}/api/twilio/status/${userId}`;
  const emailURL = `${process.env.NEXT_PUBLIC_CRM_EMAILS_URL}/user/status/${userId}`

  const [zoom, elevenlabs, twilio, email] = await Promise.allSettled([
    axios.get(zoomURL),
    axios.get(elevenlabsURL),
    axios.get(twilioURL),
    axios.get(emailURL),
  ]);

  const result = {
    zoom: zoom.status === 'fulfilled'
      ? { connected: true, ...zoom.value.data }
      : { connected: false },

    elevenlabs: elevenlabs.status === 'fulfilled'
      ? { connected: true, ...elevenlabs.value.data }
      : { connected: false },

    twilio: twilio.status === 'fulfilled'
      ? { connected: true, ...twilio.value.data }
      : { connected: false },

    email: email.status === 'fulfilled' && email.value.data.linked
      ? { connected: true, ...email.value.data }
      : { connected: false }
  };

  return NextResponse.json(result);
}
