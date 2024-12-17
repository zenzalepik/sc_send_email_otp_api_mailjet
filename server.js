const http = require('http');
const Mailjet = require('node-mailjet');
const cors = require('cors');

// Inisialisasi koneksi Mailjet dengan API Key dan Secret Key
const mailjet = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC || 'your_api_key_public',
  process.env.MJ_APIKEY_PRIVATE || 'your_api_key_private'
);


// Fungsi untuk mendapatkan tanggal hari ini dalam format yang diinginkan
function getFormattedDate() {
  const today = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return today.toLocaleDateString('id-ID', options);
}

// Buat server HTTP
const server = http.createServer((req, res) => {
  // Tambahkan header CORS
 res.setHeader('Access-Control-Allow-Origin', '*'); // Izinkan semua origin
 res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS'); // Metode yang diizinkan
 res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Header yang diizinkan

 // Tangani Preflight Request (OPTIONS)
 if (req.method === 'OPTIONS') {
   res.writeHead(204);
   res.end();
   return;
 }

  if (req.url === '/send-email' && req.method === 'POST') {
    let body = '';
    const todayDate = getFormattedDate(); // Dapatkan tanggal hari ini

    // Tangkap data body
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const { email, name, otp } = JSON.parse(body); // Parsing JSON

      // Validasi input email
      if (!email || !name || !otp || !/\S+@\S+\.\S+/.test(email)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'Invalid input' }));
      }

      // Konfigurasi permintaan pengiriman email
      const request = mailjet
        .post('send', { version: 'v3.1' })
        .request({
          Messages: [
            {
              From: {
                Email: "verification@htechno.id", // Ganti dengan email pengirim
                Name: "H-Jobs ERP",               // Ganti dengan nama pengirim
              },
              To: [
                {
                  Email: email,                  // Email penerima dari input
                  Name: name,                    // Nama penerima dari input
                },
              ],
              Subject: 'Kode OTP Pendaftaran Akun',
              TextPart: `Halo, ${name}! Kami mengirimkan kode OTP untuk verifikasi pendaftaran akun aplikasi H-Jobs ERP. Berikut kodenya: ${otp}`,
              HTMLPart: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OTP Email</title>
</head>
<body style="padding-top: 64px; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; margin: 40px auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <tr>
      <td style="padding: 40px; text-align: left; border-bottom: 1px solid #dddddd;">
        <div style="width: 49%; display: inline-block">
          <a href="http://htechno.id">
            <img src="https://hjobs-cms.htechno.id/logo.png" alt="H-Jobs ERP" width="120" style="">
          </a>
        </div>
        <div style="width: 50%; display: inline-block; text-align:right">
          <span style="font-size: 12px; color: #999999; text-align: right;">${todayDate}</span>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px; text-align: left; font-size: 16px; color: #333333;">
        <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">Halo, ${name}!</h1>
        <p style="margin: 0 0 40px;">Kami mengirimkan kode OTP untuk verifikasi pendaftaran akun aplikasi H-Jobs ERP, berikut kodenya:</p>
        <div style="text-align: center; margin: 80px 0;">
          <div style="display: inline-block; padding: 20px 40px; background-color: #ff4c29; color: #ffffff; font-size: 32px; font-weight: bold; border-radius: 24px; letter-spacing: 16px;">${otp}</div>
          <p style="text-align: center; color: gray; font-size: 12px; opacity: 0.72;">
            Salin kode ini secara manual untuk verifikasi.
          </p>
        </div>
        <p style="margin: 40px 0;">Hormat kami,<br>Tim IT Support H-Jobs ERP</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px; text-align: right; font-size: 12px; color: #999999; border-top: 1px solid #dddddd;">
        <p style="margin: 5px;">H-Jobs ERP</p>
        <p style="margin: 5px;">Jakarta, Indonesia</p>
      </td>
    </tr>
  </table>
</body>
</html>
`,
            },
          ],
        });

      // Kirim email
      request
        .then((result) => {
          console.log('Email sent successfully:', result.body);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: "success", message: 'Email sent successfully' }));
        })
        .catch((err) => {
          console.error('Error sending email:', err.statusCode, err.response.text);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Error sending email' }));
        });
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Route not found');
  }
});


// Jalankan server di port 3000
server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});
