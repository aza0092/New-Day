import React from 'react';
import {withStyles, Typography, Button, CssBaseline, Paper, Grid} from '@material-ui/core';
import {LoadBallAnimation} from "./loadballanimation";
import image1 from './../media/1.jpg';
import image2 from './../media/2.jpg';
import image3 from './../media/3.jpg';

const styles = theme => ({
  main: {
    width: 'auto',
    display: 'block',
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3
  },
  paper: {
    marginTop: theme.spacing.unit * 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing.unit * 3
  },
  imageFirst: {
    width: '100%',
    height: '400px',
    objectFit: 'cover'
  },
  margin: {
    margin: theme.spacing.unit * 2
  },
  marginTopBottom: {
    margin: `${theme.spacing.unit * 4}px 0`
  }
});

function Welcome(props){
  const {classes} = props;
  const [isInTransition, setIsInTransition] = React.useState(false);

  function getStarted(){
    setIsInTransition(true);
    setTimeout(() => props.setStatus('signup'), 2000);
  }

  return (
    <main className={classes.main}>
      <CssBaseline/>
      {
        isInTransition ?
          <div style={{width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <LoadBallAnimation/>
          </div>
           :
          <Paper className={classes.paper}>
            <Grid container justify={'center'} spacing={8} xs={12}>

              <Grid container item xs={12} justify={'center'} className={classes.marginTopBottom}>
                <Grid container item xs={6} sm={3} spacing={8} alignContent={'center'}>
                  <Grid item>
                    <Typography className={classes.margin} variant={'h2'}><b>Your busy life deserves this</b></Typography>
                  </Grid>
                  <Grid item>
                    <Typography className={classes.margin} variant={'h6'}>This is an award-winning app used by millions of people to stay organized and get more done</Typography>
                  </Grid>
                  <Grid container item xs={12} justify={'center'} spacing={8}>
                    <Grid item xs={6} >
                      <Button className={classes.margin} variant={'contained'} color={'primary'} onClick={getStarted}>Get Started</Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button className={classes.margin}>Get more info</Button>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid container xs={6} sm={3} spacing={8}>
                  <img src={image1} className={classes.imageFirst} alt={'description 1'}/>
                </Grid>
              </Grid>

              <Grid container item xs={12} justify={'center'} className={classes.marginTopBottom}>
                <Grid container xs={6} sm={3} spacing={8}>
                  <img src={image2} className={classes.imageFirst} alt={'description 2'}/>
                </Grid>
                <Grid container item xs={6} sm={3} spacing={8} alignContent={'center'}>
                  <Grid item>
                    <Typography className={classes.margin} variant={'h2'}><b>Your busy life deserves this</b></Typography>
                  </Grid>
                  <Grid item>
                    <Typography className={classes.margin} variant={'h6'}>This is an award-winning app used by millions of people to stay organized and get more done</Typography>
                  </Grid>
                  <Grid item>
                    <Typography className={classes.margin} variant={'h6'}>This is an award-winning app used by millions of people to stay organized and get more done</Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid container item xs={12} justify={'center'} className={classes.marginTopBottom}>
                <Grid container item xs={6} sm={3} spacing={8} alignContent={'center'}>
                  <Grid item>
                    <Typography className={classes.margin} variant={'h2'}><b>Your busy life deserves this</b></Typography>
                  </Grid>
                  <Grid item>
                    <Typography className={classes.margin} variant={'h6'}>This is an award-winning app used by millions of people to stay organized and get more done</Typography>
                  </Grid>
                  <Grid container item xs={12} justify={'center'} spacing={8}>
                    <Grid item xs={6} >
                      <Button className={classes.margin} variant={'contained'} color={'primary'} onClick={getStarted}>Get Started</Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button className={classes.margin}>Get more info</Button>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid container xs={6} sm={3} spacing={8}>
                  <img src={image3} className={classes.imageFirst} alt={'description 3'}/>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
      }
    </main>
  );
}

export default withStyles(styles)(Welcome);