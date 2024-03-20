document.addEventListener('DOMContentLoaded', function () {
  const loadingMessage = document.getElementById('loadingMessage');
  const emptyMessage = document.getElementById('empty');
  loadingMessage.style.display = 'block'; // Display the loading message initially
  var link = document.getElementById('link');
  link.addEventListener('click', function() {
      chrome.tabs.create({ url: this.href });
  });
  const navigateButton = document.getElementById('navigateButton');
  const stillnav = document.getElementById('StillNav');
  const extdesc = document.getElementById('extensionDescription');
  const ifExists = document.getElementById('ifexists');
  var extractedUserId;

  chrome.cookies.get({ url: "https://linkersdb-web.vercel.app/", name: "userId" }, (cookie) => {
    if (cookie) {
      navigateButton.style.display = 'none';
      extdesc.style.display = 'none';
      extractedUserId = cookie.value;
      showIfExists();
      getLinksByUserId(extractedUserId); // Fetch links when the extension is opened
    } else {
      navigateButton.style.display = 'flex';
      ifExists.style.display = 'none';
      loadingMessage.style.display = 'none'; // Hide loading message if no user id is found
    }
  }); 

  navigateButton.addEventListener('click', function () {
    chrome.tabs.create({ url: 'https://linkersdb-web.vercel.app/Dashboard' });
  });

  function showIfExists() {
    navigateButton.style.display = 'none';
  }

  const urlInput = document.getElementById('url');
  const noteInput = document.getElementById('note');
  const saveButton = document.getElementById('saveButton');
  const savedLinksList = document.getElementById('savedLinks');

  getCurrentTab().then(function (tab) {
    if (tab && tab.url) {
      urlInput.value = tab.url;
    }
  }).catch(function (error) {
    console.error("Error fetching current tab:", error);
  });

  saveButton.addEventListener('click', function () {
    const url = urlInput.value;
    const note = noteInput.value;
    savedLinksList.style.display='none';

    // Generate current timestamp for create date and update date
    const currentDate = new Date();
    const createDate = {
      _seconds: Math.floor(currentDate.getTime() / 1000),
      _nanoseconds: currentDate.getMilliseconds() * 1000000
    };
    const updateDate = {
      _seconds: Math.floor(currentDate.getTime() / 1000),
      _nanoseconds: currentDate.getMilliseconds() * 1000000
    };

    // Make a POST request to your Google Apps Script API
    fetch('https://script.google.com/macros/s/AKfycbz-0Dbtiyw26kTN-SVtkibKqsroAUWk4hiPrwaZaM79mKT309tn40opRha5ybwlY_mn/exec/api/save-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        createDate,
        updateDate,
        url,
        note,
        userId: extractedUserId,
      }),
    })
      .then(response => response.json())
      .then(data => {
        //console.log('Link saved successfully with ID:', data.id);
        getLinksByUserId(extractedUserId); // Fetch links after saving new link
      })
      .catch(error => {
        var er=error;
        loadingMessage.textContent = 'Loading'; // Update loading message on error
      });
      savedLinksList.style.display='block';

    // Clear input fields
    noteInput.value = '';

  });

  function getCurrentTab() {
    return new Promise(function (resolve, reject) {
      chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
      }, function (tabs) {
        resolve(tabs[0]);
      });
    });
  }

  function getLinksByUserId(userId) {
    fetch('https://script.google.com/macros/s/AKfycbz-0Dbtiyw26kTN-SVtkibKqsroAUWk4hiPrwaZaM79mKT309tn40opRha5ybwlY_mn/exec/api/get-links?userId=' + userId)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch links');
        }
        return response.json();
      })
      .then(data => {
        console.log('Response data:', data); // Log the response data
        if (Array.isArray(data)) {
          console.log('Data is an array');
          if (data.length > 0) {
              console.log('Data length is greater than 0');
              renderLinksList(data); // Render the links list
          } else {
            console.log('Data length is 0');
            emptyMessage.textContent = 'No recent links yet. Save to add.'; // Display the empty message
            emptyMessage.style.display = 'block'; // Display the empty message
            loadingMessage.style.display = 'none'; // Hide loading message
          }
        } else {
          emptyMessage.textContent = 'No recent links yet. Save to add.'; // Display the empty message
            emptyMessage.style.display = 'block'; // Display the empty message
            loadingMessage.style.display = 'none'; // Hide loading message
        }
      })
      .catch(error => {
        console.error('Error retrieving links:', error);
        loadingMessage.textContent = 'Loading'; // Update loading message on error
      })
      .finally(() => {
        console.log('getLinksByUserId completed');
      });
  }
  

  function renderLinksList(links) {
    savedLinksList.innerHTML = '';
  
    links.forEach(link => {
      console.log('Link object:', link);

      const linkWrapper = document.createElement('div');
      linkWrapper.classList.add('link-wrapper');
  
      const hrAboveContainer = document.createElement('div');
      hrAboveContainer.classList.add('hr-container');
  
      const hrAbove = document.createElement('hr');
      hrAbove.classList.add('hr-above');
      hrAbove.style.visibility = 'hidden'; // Initially hidden
      hrAboveContainer.appendChild(hrAbove);
  
      const linkContainer = document.createElement('div');
      linkContainer.classList.add('link-container');
  
      const linkItem = document.createElement('div');
      linkItem.classList.add('link-item');
      linkItem.style.textAlign = 'center'; // Center the text
      linkItem.style.maxHeight = '30px'; // Set the maximum height
      linkItem.style.overflow = 'hidden'; // Add overflow to prevent overlapping

  
      const linkContent = document.createElement('a');
      linkContent.textContent = link.note ? link.note.stringValue : 'No Title'; // Access the nested value if it exists, otherwise provide a default value
      linkContent.href = link.url.stringValue; // Access the nested value
      linkContent.target = "_blank"; // Open the link in a new tab
      linkContent.style.textDecoration = 'none'; // Remove text decoration
      linkContent.style.color = 'black'; // Set text color to black
      linkItem.appendChild(linkContent);
  
      linkContainer.appendChild(linkItem);
  
      const hrBelowContainer = document.createElement('div');
      hrBelowContainer.classList.add('hr-container');
  
      const hrBelow = document.createElement('hr');
      hrBelow.classList.add('hr-below');
      hrBelow.style.visibility = 'hidden'; // Initially hidden
      hrBelowContainer.appendChild(hrBelow);
  
      // Show hr tags on link hover
      linkItem.addEventListener('mouseenter', () => {
        hrAbove.style.visibility = 'visible';
        hrBelow.style.visibility = 'visible';
      });
  
      linkItem.addEventListener('mouseleave', () => {
        hrAbove.style.visibility = 'hidden';
        hrBelow.style.visibility = 'hidden';
      });
  
      linkWrapper.setAttribute('data-link-id', link.id); // Set the data-link-id attribute to store the link ID
      linkWrapper.appendChild(hrAboveContainer);
      linkWrapper.appendChild(linkContainer);
      linkWrapper.appendChild(hrBelowContainer);
  
      savedLinksList.appendChild(linkWrapper);
    });
  }

    

  function handleDelete(linkId) {
    fetch('https://script.google.com/macros/s/AKfycbzwgkUMDyhERI8VZMNWW-Iptujy65Wkixc4KcmGBqpQjIWT2hSx68V1CP74nSMX6ii-/exec/api/delete-link', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        linkId,
      }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Link deleted successfully:', data.message);
        getLinksByUserId(extractedUserId); // Refresh the links list after deletion
      })
      .catch(error => {
        console.error('Error deleting link:', error);
      });
  }
});
