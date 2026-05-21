async function updateStatus(client) {
  try {
    const res = await fetch(`${process.env.TELEMETRY_API_URL}/v1/stats/live`);
    const data = await res.json();
    const total = data?.totalUniques ?? 0;
    client.user.setPresence({
      activities: [{ name: `${total} souls`, type: 3 }],
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
