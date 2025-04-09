const cleanupWebView = (webViewRef, thorough = false) => {
  if (!webViewRef?.current) return;

  const script = thorough ? `
    (function() {
      const frame = document.getElementById('frame');
      if (frame) frame.src = 'about:blank';
      if (window.stream) {
        window.stream.getTracks().forEach(track => track.stop());
        window.stream = null;
      }
      if (window.activeRequests) {
        window.activeRequests.forEach(request => request.abort());
        window.activeRequests = [];
      }
      window.showMessage('Disconnected from camera');
      setTimeout(() => {
        const elements = document.querySelectorAll('img, video, iframe, canvas');
        elements.forEach(el => {
          if (el.tagName === 'VIDEO') {
            el.pause();
            el.src = '';
            el.load();
          } else if (el.tagName === 'IFRAME') {
            el.src = 'about:blank';
          } else if (el.tagName === 'IMG') {
            el.src = '';
          }
          el.remove();
        });
        for (let i = 0; i < 999; i++) {
          clearInterval(i);
          clearTimeout(i);
        }
      }, 100);
    })();
  ` : `
    (function() {
      const frame = document.getElementById('frame');
      if (frame) frame.src = 'about:blank';
      window.showMessage('Disconnected from camera');
    })();
  `;

  try {
    webViewRef.current.injectJavaScript(script);
  } catch (e) {
    console.error('WebView cleanup failed:', e);
  }
};

export default cleanupWebView;