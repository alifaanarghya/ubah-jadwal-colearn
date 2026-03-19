// api/submit.js
// Vercel serverless function: menerima data form lalu forward ke Google Apps Script
// Google Apps Script akan menulis data ke Google Sheets

const APPS_SCRIPT_SUBMIT_URL =
  'https://script.google.com/macros/s/AKfycbxLBdJio7KcqQlqA8O6YlxHcMRM-Na5oc71Sontwdx994fMHrWmRAqT3pAL3agjW1ETkw/exec';

export default async function handler(req, res) {
  // Izinkan CORS dari origin manapun (form publik)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight OPTIONS request (CORS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;

    // Validasi field wajib
    if (!body || !body.nama || !body.hp || !body.kelas || !body.jadwalBaru || !body.alasan) {
      return res.status(400).json({ error: 'Data tidak lengkap' });
    }

    // Format timestamp WIB (UTC+7)
    const now = new Date();
    const wibOffset = 7 * 60 * 60 * 1000;
    const wib = new Date(now.getTime() + wibOffset);
    const timestamp = wib.toISOString().replace('T', ' ').slice(0, 19) + ' WIB';

    // Nomor HP disimpan tanpa +62 (apa adanya dari form, misal: 81234567890)
    const hp = String(body.hp).replace(/[\s\-]/g, '');

    // jadwalBaru format: { "Matematika": { slot: "Slot Matematika 1", label: "Senin, 14:30..." } }
    const payload = {
      action: 'submit',
      timestamp,
      nama: body.nama,
      hp,
      kelas: body.kelas,
      jadwalBaru: body.jadwalBaru,
      alasan: body.alasan,
    };

    const gasResponse = await fetch(APPS_SCRIPT_SUBMIT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });

    const gasResult = await gasResponse.text();
    console.log('GAS response:', gasResult);

    return res.status(200).json({ success: true, message: 'Data berhasil disimpan' });
  } catch (error) {
    console.error('Submit error:', error);
    return res.status(500).json({ error: 'Gagal menyimpan data: ' + error.message });
  }
}
