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
    #loading {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #000;
      color: white;
      font-size: 18px;
    }
  </style>
</head>
<body>
  <div id="container">
    <div id="frame-container">
      <div id="loading">Loading thermal camera...</div>
      <iframe id="frame" style="display: none;" allowfullscreen></iframe>
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
    
    // Custom function to load iframe with headers
    async function loadIframeWithHeaders() {
      try {
        const frame = document.getElementById('frame');
        const loading = document.getElementById('loading');
        
        // First, let's try to fetch the content with the headers
        const response = await fetch('${CAMERA_URL}', {
          headers: {
            'ngrok-skip-browser-warning': 'true',
            'User-Agent': 'Mozilla/5.0'
          }
        });
        
        if (response.ok) {
          // If we can successfully connect, show the iframe with our custom URL
          frame.onload = function() {
            frame.style.display = 'block';
            loading.style.display = 'none';
            window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'loaded' }));
          };
          
          // Create a URL with header parameters to bypass ngrok warning
          frame.src = '${CAMERA_URL}?ngrok-skip-browser-warning=69420';
        } else {
          throw new Error('Failed to load camera feed');
        }
      } catch (error) {
        document.getElementById('loading').textContent = 'Error loading thermal camera. Please try again.';
        console.error('Frame loading error:', error);
        window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'error', message: error.toString() }));
      }
    }

    window.addEventListener('load', () => {
      maintainAspectRatio();
      loadIframeWithHeaders();
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

    async function captureSnapshot() {
      const response = await fetch('http://192.168.1.18:5000/snapshot');
      const blob = await response.blob();

      const reader = new FileReader();
      reader.onloadend = function () {
        const base64data = reader.result;
        window.ReactNativeWebView.postMessage(
          JSON.stringify({ event: 'snapshot', data: base64data })
        );
      };
      reader.readAsDataURL(blob);
    }
  </script>
</body>
</html>
`;

export default generateThermalHTML;