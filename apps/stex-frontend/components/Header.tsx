import { useMatomo } from '@jonkoops/matomo-tracker-react';
import HelpIcon from '@mui/icons-material/Help';
import NotificationsIcon from '@mui/icons-material/Notifications';
import WarningIcon from '@mui/icons-material/Warning';
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import AppBar from '@mui/material/AppBar';
import { getUserInfo, isLoggedIn, logout } from '@stex-react/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { BrowserAutocomplete } from '../components/BrowserAutocomplete';
import { SYSTEM_UPDATES } from '../system-updates';
import styles from '../styles/header.module.scss';
import { localStore } from '@stex-react/utils';

dayjs.extend(relativeTime);

const HEADER_WARNING =
  'WARNING: Research Prototype, it may misbehave, crash, delete data, ... or even make you happy without warning at any time!';
function UserButton() {
  const router = useRouter();
  // Menu crap Start
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  // Menu crap End

  const [userName, setUserName] = useState('User');
  const { pushInstruction } = useMatomo();

  useEffect(() => {
    getUserInfo().then((userInfo) => {
      if (!userInfo) return;
      setUserName(userInfo.givenName);
      pushInstruction('setUserId', userInfo.userId);
    });
  }, []);

  return (
    <Box whiteSpace="nowrap">
      <Button
        sx={{
          color: 'white',
          border: '1px solid white',
          textTransform: 'none',
        }}
        onClick={handleClick}
      >
        {userName}
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem
          onClick={() => {
            router.push('/my-profile');
            handleClose();
          }}
        >
          Profile
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            logout();
          }}
        >
          Log out
        </MenuItem>
      </Menu>
    </Box>
  );
}

function NotificationButton() {
  // System info menu crap start
  const [anchorEl, setAnchorEl] = useState<any>(null);
  const open = Boolean(anchorEl);
  const handleClose = () => setAnchorEl(null);
  // System info menu crap end
  return (
    <>
      <Tooltip title="System Updates">
        <IconButton
          onClick={(e) => {
            setAnchorEl(e.currentTarget);
            localStore?.setItem('top-system-update', SYSTEM_UPDATES[0].id);
          }}
        >
          <NotificationsIcon htmlColor="white" />
          {localStore?.getItem('top-system-update') !==
            SYSTEM_UPDATES[0].id && (
            <div
              style={{
                color: 'red',
                position: 'absolute',
                left: '20px',
                top: '-2px',
                fontSize: '30px',
              }}
            >
              &#8226;
            </div>
          )}
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {SYSTEM_UPDATES.slice(0, 9).map((update, idx) => (
          <MenuItem key={idx} onClick={handleClose}>
            <Link href={`/updates#${update.id}`}>
              <Box>
                {update.header}
                <Typography display="block" variant="body2" color="gray">
                  {update.timestamp.fromNow()}
                </Typography>
              </Box>
            </Link>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export function Header({
  showBrowserAutocomplete,
}: {
  showBrowserAutocomplete: boolean;
}) {
  const loggedIn = isLoggedIn();
  const router = useRouter();

  return (
    <AppBar position="static">
      <Toolbar className={styles['toolbar']}>
        <Link href="/" passHref>
          <Tooltip title={HEADER_WARNING}>
            <Box display="flex" flexWrap="nowrap" alignItems="baseline">
              <Image
                src="/voll-ki-courses.svg"
                alt="VoLL-KI Logo"
                width={128}
                height={40}
                style={{ cursor: 'pointer' }}
              />
              <WarningIcon
                fontSize="large"
                sx={{ cursor: 'pointer', color: '#e20' }}
              />
            </Box>
          </Tooltip>
        </Link>
        {showBrowserAutocomplete && (
          <Box sx={{ mx: '40px', maxWidth: '600px' }} flex="1">
            <BrowserAutocomplete />
          </Box>
        )}
        <Box>
          <Box display="flex" alignItems="center">
            <NotificationButton />
            <Tooltip title="Help Center">
              <Link href="/help">
                <IconButton>
                  <HelpIcon htmlColor="white" />
                </IconButton>
              </Link>
            </Tooltip>
            {loggedIn ? (
              <UserButton />
            ) : (
              <Button
                sx={{ color: 'white', border: '1px solid white' }}
                onClick={() => {
                  // Don't change target when user reclicks 'Login' button.
                  if (window.location.pathname === '/login') return;
                  router.push(
                    '/login?target=' + encodeURIComponent(window.location.href)
                  );
                }}
              >
                Login
              </Button>
            )}
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
