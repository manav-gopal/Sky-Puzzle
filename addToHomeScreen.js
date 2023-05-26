// Check if the current browser supports the "beforeinstallprompt" event
if ('onbeforeinstallprompt' in window) {
    // Add event listener to your button or action
    document.getElementById('add-to-homescreen-button').addEventListener('click', function() {
      let deferredPrompt;
      console.log("working");
  
      // Display the installation prompt
      window.addEventListener('beforeinstallprompt', function(event) {
        event.preventDefault(); // Prevent the default prompt
        deferredPrompt = event; // Store the prompt event
  
        // Show your custom prompt (you can customize this as per your design)
        document.getElementById('install-prompt').style.display = 'block';
      });
  
      // Add event listener to your custom install prompt button
      document.getElementById('install-button').addEventListener('click', function() {
        // Hide your custom prompt
        document.getElementById('install-prompt').style.display = 'none';
  
        // Show the native installation prompt
        deferredPrompt.prompt();
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
  }
  