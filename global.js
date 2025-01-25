console.log('IT’S ALIVE!');

document.body.insertAdjacentHTML(
    'afterbegin',
    `
      <label class="color-scheme">
        Theme:
        <select>
          <option value="light dark">Automatic</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>
    `
  );
  
  const select = document.querySelector('.color-scheme select');
  
  select.addEventListener('input', function (event) {
    const selectedTheme = event.target.value;
    document.documentElement.style.setProperty('color-scheme', selectedTheme);
    
    localStorage.colorScheme = selectedTheme;
  });
  
  if (localStorage.colorScheme) {
    const savedTheme = localStorage.colorScheme;
    document.documentElement.style.setProperty('color-scheme', savedTheme);
    select.value = savedTheme;  
  } else {
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.style.setProperty('color-scheme', isDarkMode ? 'dark' : 'light');
    select.value = isDarkMode ? 'dark' : 'light'; 
  }
  
  let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'contact/', title: 'Contact' },
    { url: 'resume/', title: 'Resume' },
    { url: 'https://github.com/dhp003', title: 'GitHub' }
  ];

  let nav = document.createElement('nav');
  document.body.prepend(nav);
  
  // Iterate over the pages array and create links for each page
for (let p of pages) {
    let url = p.url;
    let title = p.title;
  
    // Check if it's not the home page, then add '../' to the URL
    const ARE_WE_HOME = document.documentElement.classList.contains('home');
    url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;
  
    // Create an <a> element for each link
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
  
    // Highlight the current page
    if (a.host === location.host && a.pathname === location.pathname) {
      a.classList.add('current');
    }
  
    // Open external links in a new tab
    if (a.host !== location.host) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer'; // Security measure
    }
  
    // Append the link to the nav element
    nav.append(a);
  }
  
