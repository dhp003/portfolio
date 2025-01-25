console.log('IT’S ALIVE!');

function $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
  }

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
    { url: '/portfolio', title: 'Home' },  
    { url: '/portfolio/projects/', title: 'Projects' },
    { url: '/portfolio/contact/', title: 'Contact' },
    { url: '/portfolio/resume/', title: 'Resume' },
    { url: 'https://github.com/dhp003', title: 'GitHub' }
  ];
  
  let nav = document.createElement('nav');
  document.body.prepend(nav);
  
  const ARE_WE_HOME = document.documentElement.classList.contains('home');
  
  for (let p of pages) {
    let url = p.url;
    const title = p.title;
  
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
  
    if (a.host === location.host && a.pathname === location.pathname) {
      a.classList.add('current');
    }
  
    if (a.host !== location.host) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
  
    nav.append(a);
  }
  
  let navLinks = $$('nav a');
  let currentLink = navLinks.find(
    (a) => a.host === location.host && a.pathname === location.pathname
  );
  currentLink?.classList.add('current');
  