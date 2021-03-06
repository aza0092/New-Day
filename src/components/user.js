import React from 'react';
import SignUp from './signup';
import SignIn from './signin';
import ForgotPassword from './forgotpassword';
import Welcome from './welcome';

export default function User (props){
  const {signIn, signInAsGuest} = props;
  const [status, setStatus] = React.useState('welcome');
  switch (status) {
    case 'welcome':
      return <Welcome setStatus={setStatus}/>;
    case 'signup':
      return <SignUp setStatus={setStatus} signInAsGuest={signInAsGuest}/>;
    case 'signin':
      return <SignIn setStatus={setStatus} signIn={signIn} signInAsGuest={signInAsGuest}/>;
    case 'forgotpassword':
      return <ForgotPassword setStatus={setStatus}/>;
    default:
      return <SignIn setStatus={setStatus}/>;
  }
}