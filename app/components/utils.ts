const BgColor: Record<string, string> = {
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  indigo: 'bg-indigo-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
};

export function bgColor(color: string) {
  return BgColor[color];
}

export function defaultInitials(name: string) {
  return name
    .split(/\s/)
    .map((part) => part.substring(0, 1).toUpperCase())
    .filter((v) => !!v)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
