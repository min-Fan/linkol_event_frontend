'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@shadcn-ui/button';
import { Input } from '@shadcn-ui/input';
import { Label } from '@shadcn-ui/label';

import CompOTPCode from './OTPCode';

export default function SignUpForm(props: { onLogin: () => void }) {
  const { onLogin } = props;
  const t = useTranslations('common');

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleSignUp = () => {
    setIsOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">{t('sign_up_title')}</h1>
          <p className="text-muted-foreground text-sm text-balance">{t('sign_up_description')}</p>
        </div>
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label className="capitalize" htmlFor="email">
              {t('form_email')}
            </Label>
            <Input id="email" type="email" placeholder="m@example.com" required />
          </div>
          <div className="grid gap-2">
            <Label className="capitalize" htmlFor="password">
              {t('form_password')}
            </Label>
            <Input id="password" type="password" required />
          </div>
          <Button className="w-full" onClick={handleSignUp}>
            {t('btn_sign_up')}
          </Button>
        </div>
        <div className="text-center text-sm">
          {t('sign_up_tips')}{' '}
          <span
            className="text-primary cursor-pointer underline underline-offset-4"
            onClick={onLogin}
          >
            {t('btn_log_in')}
          </span>
        </div>
      </div>
      <CompOTPCode
        email="m@example.com"
        codeType="register"
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
    </div>
  );
}
