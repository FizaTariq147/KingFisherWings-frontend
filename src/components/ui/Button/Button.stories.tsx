import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'back',
        'report',
        'edit',
        'create',
        'success',
        'warning',
        'danger',
        'ghost',
      ],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'icon'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { variant: 'primary', size: 'md', children: 'Save' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', size: 'md', children: 'Cancel' },
};

export const Back: Story = {
  args: { variant: 'back', size: 'sm', children: 'Back' },
};

export const Report: Story = {
  args: { variant: 'report', size: 'sm', children: 'Report' },
};

export const Edit: Story = {
  args: { variant: 'edit', size: 'sm', children: 'Edit' },
};

export const Create: Story = {
  args: { variant: 'create', size: 'sm', children: 'Create' },
};

export const Success: Story = {
  args: { variant: 'success', size: 'md', children: 'Approve' },
};

export const Warning: Story = {
  args: { variant: 'warning', size: 'md', children: 'Hold' },
};

export const Danger: Story = {
  args: { variant: 'danger', size: 'md', children: 'Delete' },
};

export const Ghost: Story = {
  args: { variant: 'ghost', size: 'md', children: 'View Details' },
};

export const Icon: Story = {
  args: { variant: 'secondary', size: 'icon', title: 'Refresh', children: '↻' },
};

export const Disabled: Story = {
  args: { variant: 'primary', size: 'md', children: 'Save', disabled: true },
};
