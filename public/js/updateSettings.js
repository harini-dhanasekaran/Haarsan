/* eslint-disable */

import axios from 'axios';

export const updateMe = async (data) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:3000/api/v1/users/updateMe',
      data: data,
    });
    if (res.data.status === 'success') {
      alert('Your data are successfully updated');
      location.reload(true);
    }
  } catch (err) {
    alert(err.response.data.message);
    console.log(err.response.data.message);
  }
};

export const updatePassword = async (curPass, newPass, conPass) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:3000/api/v1/users/updatePassword',
      data: {
        passwordCurrent: curPass,
        password: newPass,
        passwordConfirm: conPass,
      },
    });
    if (res.data.status === 'success') {
      alert('Your password has been updated');
    }
  } catch (err) {
    alert(err.response.data.message);
    console.log(err);
  }
};
