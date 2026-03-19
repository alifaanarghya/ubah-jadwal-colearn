// api/submit.js
// Vercel serverless function: menerima data form lalu forward ke Google Apps Script

const APPS_SCRIPT_SUBMIT_URL =
  'https://script.google.com/macros/s/AKfycbxLBdJio7KcqQlqA8O6YlxHcMRM-Na5oc71Sontwdx994fMHrWmRAqT3pAL3agjW1ETkw/exec';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vercel auto-parse JSON body, tapi handle jika masih string
    let body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }

    console.log('Received body:', JSON.stringify(body));

    if (!body || !body.nama || !body.hp || !body.kelas || !body.jadwalBaru || !body.alasan) {
      return res.status(400).json({ error: 'Data tidak lengkap', received: body });
    }

    // Format timestamp WIB (UTC+7)
    const now = new Date();
    const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const timestamp = wib.toISOString().replace('T', ' ').slice(0, 19) + ' WIB';

    // HP tanpa +62
    const hp = String(body.hp).replace(/[\s\-]/g, '');

    const payload = {
      action: 'submit',
      timestamp,
      nama: body.nama,
      hp,
      kelas: body.kelas,
      jadwalBaru: body.jadwalBaru,
      alasan: body.alasan,
    };

    console.log('Sending to GAS:', JSON.stringify(payload));

    const gasResponse = await fetch(APPS_SCRIPT_SUBMIT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });

    const gasText = await gasResponse.text();
    console.log('GAS response status:', gasResponse.status);
    console.log('GAS response body:', gasText);

    return res.status(200).json({ success: true, gas: gasText });

  } catch (error) {
    console.error('Submit error:', error.message);
    return res.status(500).json({ error: 'Gagal menyimpan data: ' + error.message });
  }
}
