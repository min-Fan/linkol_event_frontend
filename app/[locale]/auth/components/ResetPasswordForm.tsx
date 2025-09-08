'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { LoaderCircle } from 'lucide-react';

import { Form, FormControl, FormField, FormItem, FormLabel } from '@shadcn-ui/form';
import { Input } from '@shadcn-ui/input';
import { Button } from '@shadcn-ui/button';
import { toast } from 'sonner';

import CompOTPCode from './OTPCode';

const FormSchema = z
  .object({
    email: z.string().trim().email(),
    password: z.string().trim(),
    confirmPassword: z.string().trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type IResetPasswordFormValues = z.infer<typeof FormSchema>;

export default function ResetPasswordForm(props: { onLogin: () => void }) {
  const { onLogin } = props;
  const t = useTranslations('common');

  const [isPending, startTransition] = useTransition();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('');

  const form = useForm<IResetPasswordFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const {
    handleSubmit,
    control,
    formState: { isDirty, isValid },
  } = form;

  const onSubmit = (params: IResetPasswordFormValues) => {
    const { email, password } = params;

    setEmail(email);
    setPassword(password);
    setIsOpen(true);
  };

  return (
    <>
      <Form {...form}>
        <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">{t('reset_password_title')}</h1>
            <p className="text-muted-foreground text-sm text-balance">
              {t('reset_password_description')}
            </p>
          </div>
          <div className="grid gap-6">
            <FormField
              control={control}
              name="email"
              render={({ field }) => {
                return (
                  <FormItem className="grid gap-2">
                    <FormLabel className="capitalize">{t('form_email')}</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="m@example.com" />
                    </FormControl>
                  </FormItem>
                );
              }}
            />
            <FormField
              control={control}
              name="password"
              render={({ field }) => {
                return (
                  <FormItem className="grid gap-2">
                    <FormLabel className="capitalize">{t('form_password')}</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                  </FormItem>
                );
              }}
            />
            <FormField
              control={control}
              name="confirmPassword"
              render={({ field }) => {
                return (
                  <FormItem className="grid gap-2">
                    <FormLabel className="capitalize">{t('form_confirm_password')}</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                  </FormItem>
                );
              }}
            />
            <Button type="submit" className="w-full" disabled={!isValid || !isDirty || isPending}>
              {isPending ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <span>{t('btn_reset_password')}</span>
              )}
            </Button>
          </div>
          <div className="text-center text-sm">
            {t('reset_password_tips')}{' '}
            <span
              className="text-primary cursor-pointer underline underline-offset-4"
              onClick={onLogin}
            >
              {t('btn_log_in')}
            </span>
          </div>
        </form>
      </Form>
      <CompOTPCode email={email} codeType="reset_password" isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
}
