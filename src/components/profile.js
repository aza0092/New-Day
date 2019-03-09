import React from 'react';
import {
  CssBaseline,
  Typography,
  Button,
  TextField,
  Paper,
  withStyles,
  Dialog,
  DialogContentText,
  DialogContent,
  DialogTitle,
  DialogActions,
  Snackbar
} from '@material-ui/core';
import axios from 'axios';
import {CustomDivider} from "./customdivider";
import {constants} from "./constants";
import {CustomSnackbar} from "./snackbarcontent";

const styles = theme => ({
  main: {
    width: 'auto',
    display: 'block',
    marginLeft: theme.spacing.unit * 2,
    marginRight: theme.spacing.unit * 2,
    [theme.breakpoints.up(400 + theme.spacing.unit * 3 * 2)]: {
      width: 400,
      marginLeft: 'auto',
      marginRight: 'auto'
    }
  },
  paper: {
    marginTop: theme.spacing.unit * 2,
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing.unit * 2
  },
  margin: {
    margin: theme.spacing.unit,
  }
});

function Profile (props) {
  const {classes} = props;
  const [oldPassword, setOldPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [newPasswordConfirmation, setNewPasswordConfirmation] = React.useState('');
  const [userInfo, setUserInfo] = React.useState({email: '', isEmailConfirmed: false});
  const [isAskingToDelete, setIsAskingToDelete] = React.useState(false);
  const [snackbarVariant, setSnackbarVariant] = React.useState('success');
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  React.useEffect(() => {
    axios.get(constants.serverWith('/api/user/info'), {headers: {token: localStorage.getItem('token')}})
      .then((res) => {
        setUserInfo(res.data.result);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }, []);

  async function sendConfirmation(){
    try {
      let res = await axios.get(constants.serverWith('/api/user/sendconfirmemail'), {headers: {token: localStorage.getItem('token')}});
      if (!res.data.error) {
        setSnackbarVariant('success');
        setSnackbarMessage('Sent confirmation email');
      } else {
        setSnackbarVariant('Error');
        setSnackbarMessage('An error happened');
      }
    } catch (e) {
      console.log(e.message);
      setSnackbarVariant('error');
      setSnackbarMessage('An error happened');
    }
  }

  async function changePassword(){
    try {
      let res = await axios.post(constants.serverWith('/api/user/setpassword'), {oldPassword, newPassword, newPasswordConfirmation}, {headers: {token: localStorage.getItem('token')}});
      if (!res.data.error) {
        setOldPassword('');
        setNewPassword('');
        setNewPasswordConfirmation('');
        setSnackbarVariant('success');
        setSnackbarMessage('Password changed');
      }
    } catch (e) {
      console.log(e.message);
      setSnackbarVariant('error');
      setSnackbarMessage('An error happened');
    }
  }

  function onDeleteCancel(){
    setIsAskingToDelete(false);
  }

  async function onDeleteConfirm(){
    try {
      setIsAskingToDelete(false);
      let res = await axios.get(constants.serverWith('/api/user/delete'), {headers: {token: localStorage.getItem('token')}});
      if (!res.data.error) {
        setSnackbarVariant('info');
        setSnackbarMessage('Successfully Deleted Account');
        props.signOut();
      }
    } catch (e) {
      console.log(e.message);
      setSnackbarVariant('error');
      setSnackbarMessage('An Error Happened');
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
        <Typography variant={'h5'}>Profile</Typography>
        <Typography variant={'h6'}>Email Address</Typography>
        <Typography>{userInfo.email}</Typography>
        {userInfo.isEmailConfirmed ?
          <Typography variant={'body1'}>Email is confirmed</Typography> :
          <React.Fragment>
          <Typography variant={'body1'}>Email is not confirmed</Typography>
          <Button className={classes.margin} variant={'contained'} color={'primary'} onClick={sendConfirmation}>Send Confirmation Email</Button>
          </React.Fragment>
        }
        <CustomDivider/>
        <Typography variant={'h6'}>Change Password</Typography>
        <TextField margin={'normal'} variant={'outlined'} type={'password'} value={oldPassword} label={'Old Password'} onChange={(e) => setOldPassword(e.target.value)}/>
        <TextField margin={'normal'} variant={'outlined'} type={'password'} value={newPassword} label={'New Password'} onChange={(e) => setNewPassword(e.target.value)}/>
        <TextField margin={'normal'} variant={'outlined'} type={'password'} value={newPasswordConfirmation} label={'New Password Confirmation'} onChange={(e) => setNewPasswordConfirmation(e.target.value)}/>
        <Button className={classes.margin} variant={'contained'} disabled={!oldPassword || !newPassword || !newPasswordConfirmation} onClick={changePassword}>Confirm</Button>
        <CustomDivider />
        <Button className={classes.margin} variant={'contained'} onClick={props.signOut}>Sign Out</Button>
        <Button className={classes.margin} variant={'contained'} color="secondary" onClick={() => setIsAskingToDelete(true)}>
          Delete Account
        </Button>
        <Dialog
          open={isAskingToDelete}
          onClose={onDeleteCancel}
        >
          <DialogTitle>Delete Your Account</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure to delete your account? This action cannot be undone
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={onDeleteCancel} color="primary">
              Cancel
            </Button>
            <Button onClick={onDeleteConfirm} color="secondary">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
        <Button className={classes.margin} variant={'contained'} onClick={props.back}>Back</Button>
      </Paper>
    </main>
  );
}

export default withStyles(styles)(Profile);