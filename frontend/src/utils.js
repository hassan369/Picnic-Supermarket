import { getUserInfo } from './localStorage.js';

export const parseRequestUrl = () => {
  const address = document.location.hash.slice(1).split('?')[0]; //split by ? and take the first one which means befor ? (url without ?)
  const queryString =
    document.location.hash.slice(1).split('?').length === 2 //split by ? and if there is length 2 means there is ?
      ? document.location.hash.slice(1).split('?')[1] //take second part of ?
      : '';

  const url = address.toLowerCase() || '/';
  const r = url.split('/'); //array of splited url
  const q = queryString.split('='); //array of splited queryString

  return {
    resource: r[1], //productScreen
    id: r[2], //id of product
    verb: r[3],

    name: q[0], //?
    value: q[1], //Jam Or empty
  };
};
export const rerender = async (component, areaName = 'main') => {
  const area = document.getElementById(`${areaName}_container`);
  area.innerHTML = await component.render();
  await component.after_render();
};

export const redirectUser = () => {
  if (localStorage.getItem('cartItems')) {
    document.location.hash = '/shipping';
  } else {
    document.location.hash = '/';
  }
};
export const isLoggedIn = () => {
  return !!getUserInfo().email; //!! cast varialbe to bollean
};
export const showLoading = () => {
  document.getElementById('loading-overlay').classList.add('active');
};

export const hideLoading = () => {
  document.getElementById('loading-overlay').classList.remove('active');
};
export const showMessage = (message, callback) => {
  document.getElementById('message-overlay').innerHTML = `<div>
        <div id="message-overlay-content">${message}</div>
        <button id="message-overlay-close-button">OK</button>
      </div>`;
  document.getElementById('message-overlay').classList.add('active');
  document
    .getElementById('message-overlay-close-button')
    .addEventListener('click', () => {
      document.getElementById('message-overlay').classList.remove('active');
      if (callback) {
        callback();
      }
    });
};
