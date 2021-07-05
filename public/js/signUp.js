/* eslint-disable */

import axios from 'axios';

export const signUp = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/signup',
      data: {
        name: name,
        email: email,
        password: password,
        passwordConfirm: passwordConfirm,
      },
    });
    if (res.data.status === 'success') {
      console.log('came here');
      alert('Account created successfully');
      location.assign('/');
    }
  } catch (err) {
    alert(err.response.data.message);
    console.log(err.response);
  }
};
