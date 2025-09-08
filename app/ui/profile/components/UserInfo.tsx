import { useTranslations } from 'next-intl';

export default function UserInfo(props: { username: string; email: string }) {
  const { username, email } = props;
  const t = useTranslations('common');
  const usernamePrefix = username.slice(0, 4);
  const usernameSuffix = username.slice(-4);

  return (
    <dl className="overflow-hidden">
      <dt className="truncate">{`${usernamePrefix}...${usernameSuffix}`}</dt>
      <dd className="text-muted-foreground truncate normal-case">
        {email.includes('@') ? email : t('not_bind_email')}
      </dd>
    </dl>
  );
}
