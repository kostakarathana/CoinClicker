export async function clickOnBackend() {
  try {
    const res = await fetch('/click', { method: 'POST' });
    return await res.json();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }
}

export async function getStatus() {
  try {
    const res = await fetch('/status');
    if (!res.ok) throw new Error('status fetch failed')
    return await res.json();
  } catch (err: unknown) {
    // Fallback to local mock for developer testing
    try {
      const mr = await fetch('/mock_status.json')
      if (mr.ok) return await mr.json()
    } catch (_) {}
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }
}
