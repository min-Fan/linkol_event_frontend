'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { LoaderCircle } from 'lucide-react';

import { Form, FormControl, FormField, FormItem, FormLabel } from '@shadcn-ui/form';
import { Input } from '@shadcn-ui/input';
import { Button } from '@shadcn-ui/button';
import { toast } from 'sonner';

import { CACHE_KEY } from '@constants/app';
import PagesRoute from '@constants/routes';
import { login } from '@libs/request';
import { useRouter } from '@libs/i18n/navigation';

const FormSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().trim(),
});

type ILoginFormValues = z.infer<typeof FormSchema>;

export default function LoginForm(props: { onSignUp: () => void; onForgotPassword: () => void }) {
  const { onSignUp, onForgotPassword } = props;
  const t = useTranslations('common');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ILoginFormValues>({
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

  const onSubmit = (params: ILoginFormValues) => {
    startTransition(async () => {
      const res = await login(params);

      console.log(res);

      if (res.code !== 200) {
        toast.error(t('login_failed'));

        return;
      }

      const { data } = res;

      document.cookie = `${CACHE_KEY.TOKEN}=${data.token}`;
      localStorage.setItem(CACHE_KEY.TOKEN, data.token);

      toast.success(t('login_success'));

      router.replace(PagesRoute.HOME);
    });
  };

  return (
    <Form {...form}>
      <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">{t('login_title')}</h1>
          <p className="text-muted-foreground text-sm text-balance">{t('login_description')}</p>
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
                  <div className="flex items-center">
                    <FormLabel className="capitalize">{t('form_password')}</FormLabel>
                    <span
                      className="hover:text-primary ml-auto cursor-pointer text-sm underline-offset-4 transition-colors hover:underline"
                      onClick={onForgotPassword}
                    >
                      {t('login_forgot_password')}
                    </span>
                  </div>

                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                </FormItem>
              );
            }}
          />
          <Button type="submit" className="w-full" disabled={!isValid || !isDirty || isPending}>
            {isPending ? <LoaderCircle className="animate-spin" /> : <span>{t('btn_log_in')}</span>}
          </Button>
        </div>
        <div className="text-center text-sm">
          {t('login_tips')}{' '}
          <span
            className="text-primary cursor-pointer underline underline-offset-4"
            onClick={onSignUp}
          >
            {t('btn_sign_up')}
          </span>
        </div>
      </form>
    </Form>
  );
}
