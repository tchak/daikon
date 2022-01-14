import { FormEventHandler } from 'react';
import { isHotkey } from 'is-hotkey';

const isEscKey = isHotkey('esc');

export function NameForm({
  name,
  onSubmit,
  onCancel,
  data,
}: {
  name: string;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onCancel: () => void;
  data?: Record<string, string>;
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(event);
      }}
    >
      {Object.entries(data ?? {}).map(([name, value]) => (
        <input type="hidden" key={name} name={name} defaultValue={value} />
      ))}
      <input
        type="text"
        name="name"
        defaultValue={name}
        autoFocus
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        onBlur={({ currentTarget: { form } }) => form?.requestSubmit()}
        onKeyDown={({ nativeEvent }) => {
          if (isEscKey(nativeEvent)) {
            onCancel();
          }
        }}
      />
    </form>
  );
}
