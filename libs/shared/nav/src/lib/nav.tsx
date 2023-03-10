import { useRouter } from 'next/router';

import { createStyles } from '@mantine/core';
import type { IconType } from 'react-icons';
import { AiOutlineHome, AiOutlineUser } from 'react-icons/ai';
import { BiLogIn } from 'react-icons/bi';
import { CgFeed } from 'react-icons/cg';
import { HiOutlineSearch } from 'react-icons/hi';
import { IoMdPower } from 'react-icons/io';
import { RiSettings4Fill } from 'react-icons/ri';

import { ParsedUrlQuery } from 'node:querystring';

import { LoggedInSession } from '@lihim/auth/core';
import { TESTID_NAV_AUTH_ACTION } from '@lihim/shared/core';
import { useRootContext } from '@lihim/shared/data-access';

import { NavBrand } from './ui/nav-brand';
import { NavItem } from './ui/nav-item';

type NavItemProps = {
  icon: IconType;
  label: string;
  href: string;
};

const commonNavs: NavItemProps[] = [
  {
    icon: HiOutlineSearch,
    label: 'Search',
    href: '/search',
  },
  {
    icon: RiSettings4Fill,
    label: 'Settings',
    href: '/settings',
  },
];

const anonNavs: NavItemProps[] = [
  {
    icon: CgFeed,
    label: 'Explore',
    href: '/',
  },
  ...commonNavs,
];

const loggedInNavs: NavItemProps[] = [
  {
    icon: AiOutlineHome,
    label: 'Home',
    href: '/',
  },
  {
    icon: AiOutlineUser,
    label: 'Profile',
    href: '/profile',
  },
  ...commonNavs,
];

const getNavs = (pathname: string, isAnon: boolean, username?: string) =>
  [...(isAnon ? anonNavs : loggedInNavs)].map((nav) => ({
    ...nav,
    href: nav.label === 'Profile' ? `/profile/${username}` : nav.href,
  }));

// Manual check since query.username can be undefined
const getQueryUsername = (query: ParsedUrlQuery) => {
  let queryUsername: string | undefined;
  try {
    queryUsername = query.username as string;
  } catch {
    queryUsername = undefined;
  }

  return queryUsername;
};

const useStyles = createStyles((theme) => ({
  nav: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
    [theme.fn.largerThan(theme.breakpoints.xs)]: {
      display: 'block',
    },
  },
  logout: {
    display: 'none',
    width: '100%',
    [theme.fn.largerThan(theme.breakpoints.xs)]: {
      display: 'block',
    },
  },
  separator: {
    [theme.fn.largerThan(theme.breakpoints.xs)]: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: '90vh',
    },
  },
}));

export const Nav = () => {
  // Router
  const { push, pathname, query } = useRouter();
  const queryUsername = getQueryUsername(query);

  // Session
  const {
    isLoading: sessionIsLoading,
    session,
    authModalActions,
  } = useRootContext();
  const openAuthModal = (isAnon: boolean) => {
    isAnon ? authModalActions.openLogin() : authModalActions.openLogout();
  };

  // Styles
  const { classes } = useStyles();

  // Navs to display
  const navs = getNavs(
    pathname,
    session.isAnon,
    (session as LoggedInSession).username,
  );

  return (
    <>
      <NavBrand push={push} />
      <div className={classes.separator}>
        <div className={classes.nav}>
          {navs.map((nav) => (
            <NavItem
              key={nav.label}
              label={nav.label}
              icon={<nav.icon size={24} />}
              isActive={
                queryUsername
                  ? `/profile/${queryUsername}` ===
                      `/profile/${(session as LoggedInSession).username}` &&
                    nav.href === `/profile/${queryUsername}`
                  : nav.href === pathname
              }
              onClick={() => push(nav.href)}
            />
          ))}
        </div>
        <div className={classes.logout} data-testid={TESTID_NAV_AUTH_ACTION}>
          <NavItem
            label={session.isAnon ? 'Login' : 'Logout'}
            icon={
              session.isAnon ? <BiLogIn size={24} /> : <IoMdPower size={24} />
            }
            isDisabled={sessionIsLoading}
            onClick={() => openAuthModal(session.isAnon)}
          />
        </div>
      </div>
    </>
  );
};
