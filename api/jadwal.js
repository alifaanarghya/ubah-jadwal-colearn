export default async function handler(req, res) {
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzkjL5zqCQPUotl_vXVupZRGy3RIIScoGa9evcy7Qdl2srmArGeWFqYD3jseOsHKCSqlQ/exec';
  
  try {
    const response = await fetch(APPS_SCRIPT_URL, { redirect: 'follow' });
    const data = await response.json();
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
