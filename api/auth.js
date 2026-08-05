/**
 * Decap CMS OAuth Proxy - 授權端點
 * 接收 Decap CMS 彈窗請求，與 opener 握手後重定向到 GitHub 授權頁
 */
module.exports = (req, res) => {
  const { provider, scope } = req.query;
  const host = req.headers.host;
  const client_id = process.env.GITHUB_OAUTH_ID;
  const redirect_uri = `https://${host}/api/callback`;
  const finalScope = scope || 'repo';
  const authorizeUrl = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=${finalScope}`;

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>授權中</title></head><body>
<script>
  // 與 opener（Decap CMS 後台）握手
  window.opener.postMessage('authorizing:${provider || 'github'}', '*');
  window.addEventListener('message', function(e) {
    if (e.data === 'authorizing:${provider || 'github'}') {
      window.location.href = ${JSON.stringify(authorizeUrl)};
    }
  });
</script>
</body></html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
};
