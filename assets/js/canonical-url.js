(function () {
  var path = window.location.pathname;
  var targetPath = null;

  if (path === '/index.html') {
    targetPath = '/';
  } else if (path.endsWith('/index.html')) {
    targetPath = path.slice(0, -'index.html'.length);
  }

  if (!targetPath) {
    return;
  }

  targetPath = targetPath.replace(/\/\/+/g, '/');
  if (targetPath === '') {
    targetPath = '/';
  }

  var targetUrl = window.location.origin + targetPath + window.location.search + window.location.hash;
  if (targetUrl !== window.location.href) {
    window.location.replace(targetUrl);
  }
})();
