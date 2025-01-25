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
  
const pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'contact/', title: 'Contact' },
  { url: 'resume/', title: 'Resume' },
  { url: 'https://github.com/dhp003', title: 'GitHub' }
];

const ARE_WE_HOME = document.documentElement.classList.contains('home');

const nav = document.createElement('nav');

document.body.prepend(nav);

for (let p of pages) {
    let url = p.url;
    const title = p.title;
  
    url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;
  
    const a = document.createElement('a');
    a.href = url;
    a.textContent = title;
  
    a.classList.toggle(
      'current',
      a.host === location.host && a.pathname === location.pathname
    );
  
    if (a.host !== location.host) {
      a.target = '_blank'; 
      a.rel = 'noopener noreferrer'; 
    }
  
    nav.append(a);
  }
