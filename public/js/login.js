/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert.js';
export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email: email,
        password: password,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success','Logged in successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error',err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Logged out successfully');
      window.setTimeout(() => {
        location.reload(true);
        location.assign('/');
      }, 1000);
    }
  } catch (err) {
    showAlert('error','error logging out, try again');
    console.log(err);
  }
};
