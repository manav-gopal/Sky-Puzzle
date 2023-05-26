self.addEventListener('fetch', function(event) {
    // Handle fetch event
  });
  
  self.addEventListener('beforeinstallprompt', function(event) {
    event.preventDefault(); // Prevent the default prompt
    var deferredPrompt = event; // Store the prompt event
    
    // Show your custom prompt (you can customize this as per your design)
    document.getElementById('install-prompt').style.display = 'block';
  
    document.getElementById('install-button').addEventListener('click', function() {
      document.getElementById('install-prompt').style.display = 'none'; // Hide your custom prompt
      deferredPrompt.prompt(); // Show the native installation prompt
      deferredPrompt.userChoice.then(function(choiceResult) {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the installation prompt.');
        } else {
          console.log('User dismissed the installation prompt.');
        }
  
        deferredPrompt = null; // Reset the prompt
      });
    });
  });
  