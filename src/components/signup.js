import React from 'react';
import {
  Avatar,
  Link,
  Button,
  CssBaseline,
  CircularProgress,
  TextField,
  Paper,
  Typography,
  withStyles,
  Snackbar
} from '@material-ui/core'
import {LockOutlined} from '@material-ui/icons'
import axios from 'axios';
import {constants} from "./constants";
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
  signin: {
    margin: theme.spacing.unit * 2,
    textAlign: 'center'
  }
});

function SignUp(props){
  const {classes, signInAsGuest} = props;
  const [email, _setEmail] = React.useState({value: '', error: false});
  const [password, _setPassword] = React.useState({value: '', error: false});
  const [passwordConfirmation, _setPasswordConfirmation] = React.useState({value: '', error: false});
  const [isLoading, setIsLoading] = React.useState(false);
  const [snackbarVariant, setSnackbarVariant] = React.useState('success');
  const [snackbarMessage, setSnackbarMessage] = React.useState('');

  function setEmail(value){
    _setEmail({value, error: false});
  }

  function setPassword(value){
    _setPassword({value, error: false});
  }

  function setPasswordConfirmation(value){
    _setPasswordConfirmation({value, error: false});
  }

  async function handleFormSubmit(e){
    try {
      e.preventDefault();
      if (password.value.length < 6) {
        return _setPassword({value: password.value, error: 'Must be at least 6 characters'});
      }
      if (password.value !== passwordConfirmation.value) {
        _setPassword({value: password.value, error: 'Passwords don\'t match'});
        return _setPasswordConfirmation({value: passwordConfirmation.value, error: 'Passwords don\'t match'});
      }
      setIsLoading(true);
      let signupRes = await axios.post(constants.serverWith('/api/user/signup'),
        {
          email: email.value,
          password: password.value,
          passwordConfirmation: passwordConfirmation.value
        }
      );
      setIsLoading(false);
      if (!signupRes.data.error){
        props.setStatus('signin');
        setSnackbarVariant('success');
        setSnackbarMessage('Successfully Signed Up');
      } else {
        setSnackbarVariant('error');
        setSnackbarMessage(signupRes.data.error);
      }
    } catch (e) {
      console.log(e.message);
      setIsLoading(false);
      setSnackbarVariant('error');
      setSnackbarMessage(e.message);
    }
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
          Sign Up
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
          <TextField
            type={'password'}
            placeholder={'Password Confirmation'}
            required fullWidth error={!!passwordConfirmation.error}
            margin={'normal'} value={passwordConfirmation.value}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            helperText={!!passwordConfirmation.error ? <span>{passwordConfirmation.error}</span> : null}
            disabled={!!isLoading}
          />
          {isLoading ?
            <div className={classes.progressWrapper}>
              <CircularProgress className={classes.progress}/>
            </div> :
            <React.Fragment>
            <Button className={classes.submit} type={'submit'} fullWidth variant={'contained'} color={'primary'}>
              Sign Up
            </Button>
              <Typography className={classes.or}>OR</Typography>
              <Button className={classes.guest} variant={'contained'} color={'secondary'} onClick={signInAsGuest}>
                Sign Up as Guest
              </Button>
            </React.Fragment>
          }
        </form>
        <Typography className={classes.signin}>
          Already signed up? <Link component={'button'} onClick={() => props.setStatus('signin')}>Sign In</Link> now.
        </Typography>
      </Paper>
    </main>
  );
}

export default withStyles(styles)(SignUp);