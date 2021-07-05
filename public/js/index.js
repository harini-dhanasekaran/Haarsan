/* eslint-disable */
import '@babel/polyfill';
import { login, logout } from './login';
import { updateMe, updatePassword } from './updateSettings';
import { signUp } from './signUp.js';

//DOM elements
const loginForm = document.querySelector('.form-login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-settings');
const signUpForm = document.querySelector('.form--signup');

if (signUpForm) {
  signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    signUp(name, email, password, passwordConfirm);
  });
}
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    e.preventDefault();
    login(email, password);
  });
}

if (logOutBtn) {
  logOutBtn.addEventListener('click', logout);
}

if (userDataForm) {
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    console.log(form);
    updateMe(form);
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save--password').textContent = 'Updating...';
    const curPass = document.getElementById('password-current').value;
    const newPass = document.getElementById('password').value;
    const conPass = document.getElementById('password-confirm').value;
    await updatePassword(curPass, newPass, conPass);
    document.querySelector('.btn--save--password').textContent =
    'Save Password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}
