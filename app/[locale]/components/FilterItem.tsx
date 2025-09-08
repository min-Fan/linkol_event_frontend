import { Checkbox } from '@shadcn-ui/checkbox';
import { Label } from '@shadcn-ui/label';
import { Toggle } from '@shadcn/components/ui/toggle';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { updateFilter } from '@store/reducers/userSlice';

export default function FilterItem(props: {
  label: string;
  value: string;
  name?: string;
  count?: number;
  icon?: React.ReactNode;
}) {
  const { label, value, name = 'tags', count = 0, icon } = props;
  const dispatch = useAppDispatch();
  const tags = useAppSelector((state) => state.userReducer?.filter.tags);
  const language = useAppSelector((state) => state.userReducer?.filter.language);

  const checked = name === 'language' ? language?.includes(value) : tags?.includes(Number(value));

  const handleChange = (checked: boolean) => {
    if (name === 'language') {
      // 语言选项支持多选
      if (checked) {
        dispatch(
          updateFilter({ key: 'language', value: language ? [...language, value] : [value] })
        );
      } else {
        dispatch(
          updateFilter({
            key: 'language',
            value: language ? language.filter((lang) => lang !== value) : [],
          })
        );
      }
    } else {
      // 标签可以选多个
      if (checked) {
        dispatch(
          updateFilter({ key: 'tags', value: tags ? [...tags, Number(value)] : [Number(value)] })
        );
      } else {
        dispatch(
          updateFilter({
            key: 'tags',
            value: tags ? tags.filter((tag) => tag !== Number(value)) : [],
          })
        );
      }
    }
  };

  return (
    <div className="hover:text-primary text-muted-foreground text-md flex items-center space-x-2 font-semibold capitalize transition-colors">
      {/* <Checkbox id={value} value={value} checked={checked} onCheckedChange={handleChange} />
      <Label htmlFor={value}>{label}</Label> */}
      <Toggle
        id={value}
        aria-label={`Toggle ${label}`}
        className="text-md h-auto w-fit gap-1 rounded-xl py-2 font-semibold"
        pressed={checked}
        onPressedChange={handleChange}
      >
        <span>{label}</span>
        {count !== 0 && (
          <span className="text-muted-foreground/60 text-xs font-medium">({count})</span>
        )}
        {icon}
      </Toggle>
    </div>
  );
}
