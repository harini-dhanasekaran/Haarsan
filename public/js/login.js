/* eslint-disable */
import axios from 'axios';
import Swal from 'sweetalert2';
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
      Swal.fire({
        position: 'top',
        icon: 'success',
        title: 'Logged in successfully',
        showConfirmButton: false,
        backdrop: `
    rgba(0,0,123,0.4)
    url("/img/nyan-cat.gif")
    left top
    no-repeat
  `,
      });
      // showAlert('success','Logged in successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });
    if (res.data.status === 'success') {
      Swal.fire({
        position: 'top',
        title: 'Thank you',
        icon: 'success',
        title: 'Logged out successfully',
        showConfirmButton: false,
        backdrop: `
    rgba(0,0,123,0.4)
    url("/img/nyan-cat.gif")
    left top
    no-repeat
  `,
      });
      // showAlert('success', 'Logged out successfully');
      window.setTimeout(() => {
        location.reload(true);
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', 'error logging out, try again');
    console.log(err);
  }
};
