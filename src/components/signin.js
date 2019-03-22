import React from 'react';
import {
  Avatar,
  Button,
  CssBaseline,
  CircularProgress,
  TextField,
  Paper,
  Typography,
  withStyles,
  Link, Snackbar
} from '@material-ui/core'
import {LockOutlined} from '@material-ui/icons'
import axios from 'axios';
import {constants} from "./constants";
import {LoadBallAnimation} from "./loadballanimation";
import {CustomSnackbar} from "./snackbarcontent";

const styles = theme => ({
  main: {
    width: 'auto',
    display: 'block',
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    [theme.breakpoints.up(400 + theme.spacing.unit * 3 * 2)]: {
      width: 400,
      marginLeft: 'auto',
      marginRight: 'auto'
    }
  },
  paper: {
    marginTop: theme.spacing.unit * 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`
  },
  avatar: {
    margin: theme.spacing.unit,
    backgroundColor: theme.palette.secondary.main
  },
  form: {
    width: '100%',
    marginTop: theme.spacing.unit,
  },
  submit: {
    marginTop: theme.spacing.unit * 3
  },
  guest: {
    marginTop: theme.spacing.unit * 1.5,
    width: '100%'
  },
  or: {
    textAlign: 'center',
    marginTop: theme.spacing.unit * 1.5
  },
  progressWrapper: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  progress: {
    margin: theme.spacing.unit * 2
  },
  signup: {
    margin: theme.spacing.unit * 2,
    textAlign: 'center'
  }
});

function SignIn(props){
  const {classes, signIn, signInAsGuest} = props;
  const [email, _setEmail] = React.useState({value: '', error: false});
  const [password, _setPassword] = React.useState({value: '', error: false});
  const [isLoading, setIsLoading] = React.useState(false);
  const [displayAnimation, setDisplayAnimation] = React.useState(false);
  const [snackbarVariant, setSnackbarVariant] = React.useState('success');
  const [snackbarMessage, setSnackbarMessage] = React.useState('');

  function setEmail(value){
    _setEmail({value, error: false});
  }

  function setPassword(value){
    _setPassword({value, error: false});
  }

  async function handleFormSubmit(e){
    try {
      e.preventDefault();
      if (password.value.length < 6) {
        return _setPassword({value: password.value, error: 'Must be at least 6 characters'});
      }
      setIsLoading(true);
      let signinRes = await axios.post(constants.serverWith('/api/user/signin'),
        {
          email: email.value,
          password: password.value
        }
      );
      if (signinRes.data.result) {
        localStorage.setItem('token', signinRes.data.result.token);
        localStorage.setItem('maxAge', signinRes.data.result.maxAge);
        setSnackbarVariant('success');
        setSnackbarMessage('Successfully Signed In');
        setTimeout(() => setDisplayAnimation(true), 500);
        setTimeout(() => signIn(), 2000);
      } else {
        setIsLoading(false);
        setSnackbarVariant('error');
        setSnackbarMessage('An Error Happened');
      }
    } catch (e) {
      console.log(e.message);
      setIsLoading(false);
      setSnackbarVariant('error');
      setSnackbarMessage('An Error Happened');
    }
  }

  if (displayAnimation) {
    return (
      <div style={{width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <LoadBallAnimation/>
      </div>
    );
  }

  return (
    <main className={classes.main}>
      <CssBaseline/>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={!!snackbarMessage}
        autoHideDuration={6000}
        onClose={() => setSnackbarMessage('')}
      >
        <CustomSnackbar
          onClose={() => setSnackbarMessage('')}
          variant={snackbarVariant}
          message={snackbarMessage}
        />
      </Snackbar>
      <Paper className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlined/>
        </Avatar>
        <Typography component={'h1'} variant={'h5'}>
          Sign In
        </Typography>
        <form className={classes.form} onSubmit={handleFormSubmit}>
          <TextField
            type={'email'}
            placeholder={'Email Address'}
            required fullWidth error={!!email.error}
            margin={'normal'} value={email.value}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!!isLoading}
          />
          <TextField
            type={'password'}
            placeholder={'Password'}
            required fullWidth error={!!password.error}
            margin={'normal'} value={password.value}
            onChange={(e) => setPassword(e.target.value)}
            helperText={!!password.error ? <span>{password.error}</span> : null}
            disabled={!!isLoading}
          />
          {isLoading ?
            <div className={classes.progressWrapper}>
              <CircularProgress className={classes.progress}/>
            </div> :
            <React.Fragment>
            <Button className={classes.submit} type={'submit'} fullWidth variant={'contained'} color={'primary'}>
              Sign In
            </Button>
              <Typography className={classes.or}>OR</Typography>
              <Button className={classes.guest} variant={'contained'} color={'secondary'} onClick={signInAsGuest}>
                Sign In as Guest
              </Button>
            </React.Fragment>
          }
        </form>
        <Typography className={classes.signup}>
          Not signed up yet? <Link component={'button'} onClick={() => props.setStatus('signup')}>Sign Up</Link> now.
        </Typography>
      </Paper>
    </main>
  );
}

export default withStyles(styles)(SignIn);