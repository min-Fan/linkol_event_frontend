'use client';

import { useTranslations } from 'next-intl';
import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@shadcn-ui/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@shadcn-ui/input-otp';
import { Button } from '@shadcn-ui/button';

export default function OTPCode(props: {
  email: string;
  codeType: 'register' | 'reset_password';
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const { email, isOpen, setIsOpen } = props;
  const t = useTranslations('common');

  const handleResendCode = () => {
    console.log('resend code');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader className="sr-only">
          <DialogTitle>security verification</DialogTitle>
          <DialogDescription>
            Please check email {email} for the verification code.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-6">
          <div className="space-y-1">
            <h3 className="text-xl font-bold capitalize">{t('opt_title')}</h3>
            <p className="text-muted-foreground text-sm text-balance">
              {t.rich('opt_description', {
                email: (chunks) => <strong className="text-primary">{email}</strong>,
              })}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center gap-6 py-6">
            <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS_AND_CHARS}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <Button>{t('btn_confirm')}</Button>
          </div>
          <div className="text-center text-sm">
            {t('opt_tips')}{' '}
            <span
              className="text-primary cursor-pointer underline underline-offset-4"
              onClick={handleResendCode}
            >
              {t('btn_resend_code')}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
