export async function registerInmate(data: any) {
    const res = await fetch('http://localhost:5000/api/inmates/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  
    return res.json();
  }
  