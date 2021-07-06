/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alert.js';

export const signUp = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: {
        name: name,
        email: email,
        password: password,
        passwordConfirm: passwordConfirm,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success','Account created successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (err) {
    showAlert('error',err.response.data.message);
    console.log(err.response);
  }
};
