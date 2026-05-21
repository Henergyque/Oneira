async function updateStatus(client) {
  try {
    const res = await fetch(`${process.env.TELEMETRY_API_URL}/v1/stats/live`, {
      headers: { Authorization: `Bearer ${process.env.ADMIN_TOKEN}` },
    });
    const data = await res.json();
    console.log('[Status] data:', JSON.stringify(data));
    const total = data?.totalUniques ?? 0;
    client.user.setPresence({
      activities: [{ name: `${total} souls... and counting`, type: 3 }],
      status: 'dnd',
    });
  } catch (err) {
    console.error('[Status] fetch failed:', err.message);
    client.user.setPresence({
      activities: [{ name: 'with your desires 😈', type: 0 }],
      status: 'dnd',
    });
  }
}

export default {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`🟢 Oneira is online as ${client.user.tag}`);
    updateStatus(client);
    setInterval(() => updateStatus(client), 30 * 1000);
  },
};
