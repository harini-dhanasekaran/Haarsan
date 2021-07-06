/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alert.js';

export const forgotPassword = async (email) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/forgotPassword',
      data: {
        email: email,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'The reset has been sent to your mail!');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
    console.log(err.response.data.message);
  }
};

export const resetPassword = async (password, passwordConfirm, token,email) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/users/resetPassword/${email}?token=${token}`,
      data: {
        password: password,
        passwordConfirm: passwordConfirm,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'The password has been successfully changed');
      location.assign('/');
    }
  } catch (err) { 
    showAlert('error', err.response.data.message);
    console.log(err.response);
  }
};
