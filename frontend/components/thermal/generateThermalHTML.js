const generateThermalHTML = (CAMERA_URL) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    html, body {
      margin: 0; padding: 0;
      height: 100%; width: 100%;
      background: #000; overflow: hidden;
      font-family: sans-serif;
    }
    #container {
      height: 100%; width: 100%;
      display: flex; align-items: center; justify-content: center;
      aspect-ratio: 3/4;
    }
    #frame-container {
      position: relative; width: 100%; height: 100%;
    }
    #frame {
      position: absolute; width: 100%; height: 100%;
      border: none; background: #000;
    }
    #overlay {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.7); color: white;
      display: none; align-items: center; justify-content: center;
      text-align: center; padding: 20px; font-size: 18px;
    }
  </style>
</head>
<body>
  <div id="container">
    <div id="frame-container">
      <iframe id="frame" src="${CAMERA_URL}" allowfullscreen></iframe>
    </div>
    <div id="overlay"></div>
  </div>
  <script>
    window.activeRequests = [];
    const originalFetch = window.fetch;
    window.fetch = function() {
      const request = originalFetch.apply(this, arguments);
      window.activeRequests.push(request);
      return request;
    };

    function maintainAspectRatio() {
      const container = document.getElementById('container');
      const width = container.clientWidth;
      const height = (width * 4) / 3;
      container.style.height = height + 'px';
    }

    window.addEventListener('load', () => {
      maintainAspectRatio();
      setTimeout(() => {
        window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'loaded' }));
      }, 500);
    });

    window.addEventListener('resize', maintainAspectRatio);

    window.showMessage = function(msg) {
      const overlay = document.getElementById('overlay');
      overlay.textContent = msg;
      overlay.style.display = 'flex';
    };

    window.hideOverlay = function() {
      document.getElementById('overlay').style.display = 'none';
    };
  </script>
</body>
</html>
`;

export default generateThermalHTML;