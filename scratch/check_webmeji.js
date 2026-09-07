import http from 'http';

function checkUrl(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      resolve({
        url,
        statusCode: res.statusCode,
        contentType: res.headers['content-type']
      });
    }).on('error', (err) => {
      resolve({
        url,
        error: err.message
      });
    });
  });
}

async function main() {
  const assets = [
    'http://localhost:5173/config.js',
    'http://localhost:5173/webmeji.js',
    'http://localhost:5173/webmeji.css',
    'http://localhost:5173/miku/shime1.png',
    'http://localhost:5173/shimeji/shime1.png'
  ];

  for (const asset of assets) {
    const res = await checkUrl(asset);
    console.log(JSON.stringify(res, null, 2));
  }
}

main();
