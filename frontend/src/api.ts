const API_BASE = import.meta.env.VITE_API_BASE_URL;

// GET data nilai
export async function getDataNilai() {
  const res = await fetch(`${API_BASE}/api/nilai`);
  if (!res.ok) throw new Error("Gagal mengambil data nilai");
  return await res.json();
}

// POST data nilai baru
export async function tambahNilai(data: any) {
  const res = await fetch(`${API_BASE}/api/nilai`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal menambah data nilai");
  return await res.json();
}
