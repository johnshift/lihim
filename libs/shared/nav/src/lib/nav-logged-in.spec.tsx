/* eslint-disable @typescript-eslint/no-explicit-any */

import * as nextRouter from 'next/router';

import { setupServer } from 'msw/node';

import { LoggedInSession } from '@lihim/auth/core';
import { fakeSession, mockSessionResponse } from '@lihim/auth/testutils';
import { TESTID_NAV_AUTH_ACTION, TEXT_BRAND } from '@lihim/shared/core';
import { render, screen, user, waitFor } from '@lihim/shared/testutils/feature';
import { PageLayout } from '@lihim/shared/ui';

import { Nav } from './nav';

// Mock next router
jest.mock('next/router', () => ({
  __esModule: true,
  ...jest.requireActual('next/router'),
}));

// Setup msw server
const mswServer = setupServer();
beforeAll(() => mswServer.listen());
afterAll(() => mswServer.close());
afterEach(() => mswServer.resetHandlers());

// Test vars
const TESTID_APPBAR = 'appbar-testid';
const TESTID_CONTENT = 'content-testid';

// Utility functions
const checkVisibility = async () => {
  // Content/Aside
  expect(screen.getByTestId(TESTID_APPBAR)).toBeInTheDocument();
  expect(screen.getByTestId(TESTID_CONTENT)).toBeInTheDocument();

  // Common Navs
  expect(screen.getByText(TEXT_BRAND)).toBeVisible();
  expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();

  // Check loggedin navs
  await screen.findByText('Logout');
  expect(screen.getByRole('button', { name: 'Home' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Profile' })).toBeInTheDocument();

  // Clickable auth action
  const navAuthAction = await screen.findByTestId(TESTID_NAV_AUTH_ACTION);
  await waitFor(() => {
    expect(navAuthAction.firstChild).toBeEnabled();
  });
  await user.click(navAuthAction.firstChild as Element);
};

const checkActive = async (label: string) => {
  await waitFor(async () => {
    expect(await screen.findByRole('button', { name: label })).toHaveAttribute(
      'data-active',
      'true',
    );
  });
};

// Test component (render nav inside page layout)
const TestComponent = () => (
  <PageLayout nav={<Nav />} appbar={<div data-testid={TESTID_APPBAR} />}>
    <div data-testid={TESTID_CONTENT} />
  </PageLayout>
);

describe('Nav loggedIn', () => {
  test.each([
    ['/', 'Home'],
    ['/profile', 'Profile'],
    ['/search', 'Search'],
    ['/settings', 'Settings'],
  ])('loggedIn "%s"', async (pathname, label) => {
    // Mock loggedin session
    const session = fakeSession();
    mswServer.use(mockSessionResponse(200, session));

    // Spy on next router
    const push = jest.fn();

    jest
      .spyOn(nextRouter, 'useRouter')
      .mockReturnValue({
        push,
        pathname,
        query:
          label === 'Profile'
            ? { username: (session as LoggedInSession).username }
            : undefined,
      } as any);

    // Render component
    render(<TestComponent />);

    // Check component visibility
    await checkVisibility();

    // Check active nav
    await checkActive(label);

    // Click nav item
    await user.click(screen.getByRole('button', { name: label }));

    // Assert push called
    expect(push).toHaveBeenCalledWith(
      pathname === '/profile'
        ? `/profile/${(session as LoggedInSession).username}`
        : pathname,
    );
  });

  test('brand click', async () => {
    // Mock loggedin session
    const session = fakeSession();
    mswServer.use(mockSessionResponse(200, session));

    // Spy on next router
    const push = jest.fn();

    jest
      .spyOn(nextRouter, 'useRouter')
      .mockReturnValue({ push, pathname: '/' } as any);

    // Render component
    render(<TestComponent />);

    // Click nav item
    await user.click(screen.getByRole('heading', { name: TEXT_BRAND }));

    // Assert push called
    expect(push).toHaveBeenCalledWith('/');
  });
});
