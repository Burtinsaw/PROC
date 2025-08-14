import { mergeConfig } from 'vite';

export default {
  framework: {
    name: '@storybook/react-vite',
    options: {}
  },
  stories: [
    '../src/components/common/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions'
  ],
  docs: { autodocs: true },
  viteFinal: async (config) => {
    return mergeConfig(config, {
      define: { 'process.env': {} }
    });
  }
};
