import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { variant: 'primary', size: 'md', children: 'Create Job' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', size: 'md', children: 'Cancel' },
};

export const Danger: Story = {
  args: { variant: 'danger', size: 'md', children: 'Delete' },
};

export const Ghost: Story = {
  args: { variant: 'ghost', size: 'md', children: 'View Details' },
};