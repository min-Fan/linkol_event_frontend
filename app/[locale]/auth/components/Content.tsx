'use client';

import { useState } from 'react';
import CompLoginForm from './LoginForm';
import CompWalletLoginForm from './WalletLoginForm';
import CompSignUpForm from './SignUpForm';
import CompResetPasswordForm from './ResetPasswordForm';

enum AuthType {
  LOGIN,
  WALLET_LOGIN,
  SIGN_UP,
  FORGOT_PASSWORD,
}

export default function Content() {
  const [authType, setAuthType] = useState<AuthType>(AuthType.WALLET_LOGIN);

  const onLogin = () => {
    setAuthType(AuthType.LOGIN);
  };

  const onSignUp = () => {
    setAuthType(AuthType.SIGN_UP);
  };

  const onForgotPassword = () => {
    setAuthType(AuthType.FORGOT_PASSWORD);
  };

  if (authType === AuthType.SIGN_UP) {
    return <CompSignUpForm onLogin={onLogin} />;
  }

  if (authType === AuthType.FORGOT_PASSWORD) {
    return <CompResetPasswordForm onLogin={onLogin} />;
  }

  if (authType === AuthType.WALLET_LOGIN) {
    return <CompWalletLoginForm />;
  }

  return <CompLoginForm onSignUp={onSignUp} onForgotPassword={onForgotPassword} />;
}
