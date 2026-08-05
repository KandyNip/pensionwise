/**
 * Decap CMS OAuth Proxy - 回調端點
 * 接收 GitHub 授權碼，交換 access_token，通過 postMessage 傳回 Decap CMS
 */
module.exports = async (req, res) => {
  const { code } = req.query;
  const client_id = process.env.GITHUB_OAUTH_ID;
  const client_secret = process.env.GITHUB_OAUTH_SECRET;

  if (!code) {
    return sendResult(res, 'error', { message: '缺少授權碼' });
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ client_id, client_secret, code }),
    });
    const data = await tokenRes.json();

    if (data.error) {
      return sendResult(res, 'error', data);
    }
    return sendResult(res, 'success', data);
  } catch (err) {
    return sendResult(res, 'error', { message: err.message });
  }
};

function sendResult(res, status, data) {
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>完成登入</title></head><body>
<script>
  window.opener.postMessage('authorization:github:${status}:${JSON.stringify(data).replace(/</g, '\\u003c')}', '*');
  window.close();
</script>
</body></html>`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
}
