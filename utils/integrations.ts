export const INTEGRATIONS = [
    {
      name: 'zoom',
      displayName: 'Zoom',
      oauthUrl: 'https://zoom.thebotss.com/zoom/oauth/start',
      fetchUrl: 'https://zoom.thebotss.com/zoom/zoom_user',
    },
    {
      name: 'elevenlabs',
      displayName: 'ElevenLabs',
      oauthUrl: 'https://callingagent.thebotss.com/api/elevenlabs/connect',
      fetchUrl: 'https://callingagent.thebotss.com/api/elevenlabs/status',
    },
    {
      name: 'twilio',
      displayName: 'Twilio',
      oauthUrl: 'https://callingagent.thebotss.com/api/twilio/connect',
      fetchUrl: 'https://callingagent.thebotss.com/api/twilio/status',
    },
    {
      name: 'email',
      displayName: 'Email',
      oauthUrl: 'https://callingagent.thebotss.com/api/twilio/connect',
      fetchUrl: 'https://callingagent.thebotss.com/api/twilio/status',
    },
  ] as const;
  