/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alert.js';

export const updateMe = async (data) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: '/api/v1/users/updateMe',
      data: data,
    });
    if (res.data.status === 'success') {
      showAlert('success','Your data are successfully updated');
      window.setTimeout(() => {
        location.reload(true);
      }, 1500);
    }
  } catch (err) {
    showAlert('error',err.response.data.message);
  }
};

export const updatePassword = async (curPass, newPass, conPass) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: '/api/v1/users/updatePassword',
      data: {
        passwordCurrent: curPass,
        password: newPass,
        passwordConfirm: conPass,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success','Your password has been updated');
    }
  } catch (err) {
    showAlert('error',err.response.data.message);
  }
};
