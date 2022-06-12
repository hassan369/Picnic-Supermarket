import { getUserInfo } from '../localStorage.js';
import { parseRequestUrl } from '../utils.js';

const Header = {
  render: async () => {
    const { value } = parseRequestUrl();
    return ` 
      <div class="brand">
        <button id="aside-open-button">
          &#9776;
        </button>
        <a href="/#/" > Picnic Market</a>
      </div>
      
      <div class="search">
        <form class="search-form"  id="search-form">
          <input type="text" name="q" id="q" value="${value || ''}" /> 
          <button type="submit"><i class="fa fa-search"></i></button>
        </form>        
      </div>
      <div id="header-links" class="header-links">
        <div>
        <a href="/#/signin"><i class="far fa-user-circle"></i></a>
        <a href="/#/signin">Sign-In</a>
        </div>
        <a href="/#/cart">Cart</a>
      </div> 
        `;
  },
  after_render: async () => {
    const { name, isAdmin } = getUserInfo();
    if (name) {
      if (isAdmin) {
        document.getElementById('header-links').innerHTML = `
        <a href="/#/profile">${name}</a>
        <a href="/#/cart">Cart</a>
        <a href="/#/dashboard">Dashboard</a> `;
      } else {
        document.getElementById('header-links').innerHTML = `
        <a href="/#/profile">${name}</a>
        <a href="/#/cart">Cart</a>`;
      }
    }
    document
      .getElementById('search-form')
      .addEventListener('submit', async (e) => {
        e.preventDefault();
        const searchKeyword = document.getElementById('q').value;
        document.location.hash = `/?q=${searchKeyword}`;
      });
    document
      .getElementById('aside-open-button')
      .addEventListener('click', async () => {
        document.getElementById('aside_container').classList.add('open');
      });
  },
};

export default Header;
