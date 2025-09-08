'use client';

import { ReactNode, useState } from 'react';
import { useTranslations } from 'next-intl';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@shadcn-ui/dialog';
import CompKOLPostLogin from './components/KOLPostLogin';
import Loader from '@ui/loading/loader';
import { TwitterBlue } from '@assets/svg';

export enum LoginStatusType {
  WAITING_AUTHORIZED = 'waiting_authorized',
  AUTHORIZED = 'authorized',
  AUTHORIZED_ERROR = 'authorized_error',
  POST = 'post',
}

export default function UIDialogKOLLogin(props: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  loginStatusType: LoginStatusType;
  onLoginStatusTypeChange: (value: LoginStatusType) => void;
}) {
  const t = useTranslations('common');

  const handleVerify = () => {
    // setIsOpen(false);
    props.onOpenChange(false);
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      {/* <DialogTrigger asChild>{children || <Button>{t('btn_kol_login')}</Button>}</DialogTrigger> */}
      <DialogContent className="border-border w-96 rounded-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{t('bind_email_title')}</DialogTitle>
          <DialogDescription>{t('bind_email_description')}</DialogDescription>
        </DialogHeader>
        {props.loginStatusType === LoginStatusType.WAITING_AUTHORIZED && (
          <div>
            <div className="space-y-6">
              <dl>
                <dt className="text-md text-center font-semibold capitalize">
                  {t('twitter_authorization')}
                </dt>
              </dl>
            </div>
            <div className="relative flex justify-center">
              <div className="h-[240px] w-[200px]">
                <Loader></Loader>
              </div>
            </div>
          </div>
        )}
        {props.loginStatusType === LoginStatusType.AUTHORIZED_ERROR && (
          <div className="space-y-10">
            <div className="space-y-6">
              <dl>
                <dt className="text-md text-center font-semibold capitalize">
                  {t('twitter_authorization')}
                </dt>
              </dl>
            </div>
            <div className="flex flex-col items-center justify-center gap-3">
              <TwitterBlue className="size-20"></TwitterBlue>
              <div className="text-primary text-md font-medium">
                {t('kol_twitter_auth_login_failed')}
              </div>
            </div>
            <div
              className="hover:text-primary cursor-pointer text-center text-sm font-medium underline"
              onClick={() => props.onLoginStatusTypeChange(LoginStatusType.POST)}
            >
              {t('try_other_verification_method')}
            </div>
          </div>
        )}
        {props.loginStatusType === LoginStatusType.POST && (
          <CompKOLPostLogin onVerify={handleVerify} />
        )}
      </DialogContent>
    </Dialog>
  );
}
