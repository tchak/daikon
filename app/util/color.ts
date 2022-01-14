export const Color = {
  red: 'bg-red-500' as const,
  yellow: 'bg-yellow-500' as const,
  green: 'bg-green-500' as const,
  blue: 'bg-blue-500' as const,
  indigo: 'bg-indigo-500' as const,
  purple: 'bg-purple-500' as const,
  pink: 'bg-pink-500' as const,
};

export type ColorName = keyof typeof Color;

export function getColor(color: ColorName) {
  return Color[color];
}
