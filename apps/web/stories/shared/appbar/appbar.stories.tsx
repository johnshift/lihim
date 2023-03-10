/* eslint-disable testing-library/no-node-access */

import { ComponentProps } from 'react';

import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { Appbar } from '@lihim/shared/appbar';
import {
  ARIA_MOON_ICON,
  ARIA_SUN_ICON,
  ARIA_TOGGLE_THEME,
} from '@lihim/shared/core';

type Props = ComponentProps<typeof Appbar>;

export default {
  component: Appbar,
} as Meta<Props>;

export const Default: StoryObj<Props> = {
  args: {},
  async play({ canvasElement }) {
    const canvas = within(canvasElement);

    // Toggle theme (dark mode set in parameters)
    const toggleTheme = canvas.getByRole('button', {
      name: ARIA_TOGGLE_THEME,
    });
    expect(toggleTheme).toBeVisible();
    const toggleThemeIcon = await within(toggleTheme).findByRole('img', {
      name: ARIA_SUN_ICON,
    });
    expect(toggleThemeIcon).toBeVisible();
  },
};

export const ToggleTheme: StoryObj<Props> = {
  args: {},
  async play({ canvasElement }) {
    const canvas = within(canvasElement);

    // Locate theme-toggle component
    const findThemeToggle = async () =>
      canvas.findByRole('button', {
        name: ARIA_TOGGLE_THEME,
      });

    // Toggle theme and assert theme switched
    await userEvent.click(await findThemeToggle());
    expect(
      await canvas.findByRole('img', { name: ARIA_MOON_ICON }),
    ).toBeVisible();

    // Toggle and assert again
    await userEvent.click(await findThemeToggle());
    expect(
      await canvas.findByRole('img', { name: ARIA_SUN_ICON }),
    ).toBeVisible();
  },
};
