import type { Preview } from '@storybook/react';
// @ts-ignore
import '../src/index.css'; // pulls in Tailwind + theme tokens

const preview: Preview = {
  parameters: {
    controls: { matchers: {
      color: /(background|color)$/i,
      date: /Date$/i,
    }},
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#F8FAFC' },
        { name: 'dark',  value: '#0F172A' },
      ],
    },
  },
  globalTypes: {
    theme: {
      description: 'KingFisher Tech Gold theme',
      defaultValue: 'default',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'default',     title: 'Forest Green (default)' },
          { value: 'theme-blue',  title: 'Ocean Blue' },
          { value: 'theme-red',   title: 'Crimson Red' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || 'default';
      document.documentElement.classList.remove('theme-blue', 'theme-red');
      if (theme !== 'default') document.documentElement.classList.add(theme);
      return <Story />;
    },
  ],
};

export default preview;