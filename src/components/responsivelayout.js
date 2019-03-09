import React from 'react';
import axios from 'axios';
import {AppBar, CssBaseline, Divider, Drawer, FormControl, InputLabel, Select, MenuItem, FormControlLabel,
  Hidden, IconButton, List, Collapse, Button, Grid,
  ListItem, ListItemIcon, ListItemText, Checkbox, Snackbar,
  Toolbar, Typography, withStyles} from '@material-ui/core';
import {AccountCircleOutlined, ExpandLess, ExpandMore, InboxOutlined, Menu, Add, ExitToAppOutlined} from '@material-ui/icons';
import {EditorState, convertFromRaw, convertToRaw} from 'draft-js';
import {DateTimePicker} from 'material-ui-pickers';
import {RichEditor} from "./richeditor";
import Profile from './profile';
import {format} from 'date-fns';
import TextField from "@material-ui/core/es/TextField/TextField";
import {constants} from "./constants";
import {CustomSnackbar} from "./snackbarcontent";

const drawerWidth = 240;

const styles = theme => ({
  root: {
    display: 'flex',
  },
  drawer: {
    [theme.breakpoints.up('sm')]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  appBar: {
    marginLeft: drawerWidth,
    [theme.breakpoints.up('sm')]: {
      width: `calc(100% - ${drawerWidth}px)`,
    },
  },
  menuButton: {
    marginRight: 20,
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
  },
  isCompleted: {
    textDecoration: 'line-through'
  },
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing.unit * 3,
  },
  nested: {
    paddingLeft: theme.spacing.unit * 4,
  },
  margin: {
    margin: theme.spacing.unit * 2
  }
});

function ResponsiveLayout (props) {
  const { classes, tasks, dispatchTasks, signOut } = props;
  const [isProfile, setIsProfile] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [openCategory, setOpenCategory] = React.useState('');
  const [currentTask, setCurrentTask] = React.useState(null);
  const [isAddingNewTask, setIsAddingNewTask] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarVariant, setSnackbarVariant] = React.useState('success');
  const [editorState, setEditorState] = React.useState(EditorState.createEmpty());
  React.useEffect(() => {
    axios.get(constants.serverWith('/api/tasks'), {headers: {token: localStorage.getItem('token')}})
      .then((res) => {
        if (!res.data.error){
          res.data.result.forEach((taskFetched) => {
            dispatchTasks({type: 'ADD_TASK', payload: taskFetched});
          });
          setSnackbarVariant('success');
          setSnackbarMessage('Fetched Tasks');
        } else {
          setSnackbarVariant('error');
          setSnackbarMessage('Couldn\'t Fetched Tasks');
        }
      });
  }, []);
  function handleDrawerToggle(){
    setMobileOpen(!mobileOpen);
  }
  function onAllTasks(){
    if (openCategory === 'all') {
      setOpenCategory('');
    } else {
      setOpenCategory('all');
    }
  }
  function onPersonalTasks(){
    if (openCategory === 'personal') {
      setOpenCategory('');
    } else {
      setOpenCategory('personal');
    }
  }
  function onWorkTasks(){
    if (openCategory === 'work') {
      setOpenCategory('');
    } else {
      setOpenCategory('work');
    }
  }
  function onGroceryListTasks(){
    if (openCategory === 'grocery') {
      setOpenCategory('');
    } else {
      setOpenCategory('grocery');
    }
  }
  function selectTask(id){
    if (currentTask && currentTask.id === id) {
      setCurrentTask(null);
      return;
    }
    let task = tasks.find(t => t.id === id);
    if (task) {
      let newState = EditorState.createWithContent(convertFromRaw(JSON.parse(task.content)));
      setEditorState(newState);
      setCurrentTask(JSON.parse(JSON.stringify(task)));
    }
  }
  function onChangeTaskName(e){
    let newTask = Object.assign({}, currentTask);
    newTask.name = e.target.value;
    setCurrentTask(newTask);
  }
  function onChangeTaskCategory(e){
    let newTask = Object.assign({}, currentTask);
    newTask.category = e.target.value;
    setCurrentTask(newTask);
  }
  function onChangeTaskCompleted(e){
    let newTask = Object.assign({}, currentTask);
    newTask.isCompleted = e.target.checked;
    setCurrentTask(newTask);
  }
  function onChangeTaskDeadline(date){
    let newTask = Object.assign({}, currentTask);
    newTask.deadline = date;
    setCurrentTask(newTask);
  }
  function onAddTask(){
    setIsAddingNewTask(true);
    setCurrentTask({id: 999, name: 'New Task', content: EditorState.createEmpty().getCurrentContent(), category: '', isCompleted: false, deadline: null});
    setEditorState(EditorState.createEmpty());
  }
  async function confirmAddingTask(){
    try {
      setIsLoading(true);
      let content = JSON.stringify(convertToRaw(editorState.getCurrentContent()));
      let taskToAdd = Object.assign({}, currentTask, {content});
      let res = await axios.post(constants.serverWith('/api/task/add'), {...taskToAdd}, {headers: {token: localStorage.getItem('token')}});
      taskToAdd.id = res.data.result;
      dispatchTasks({type: 'ADD_TASK', payload: taskToAdd});
      setIsLoading(false);
      setSnackbarVariant('success');
      setSnackbarMessage('Added Task');
    } catch (e) {
      console.log(e.message);
      setIsLoading(false);
      setSnackbarVariant('error');
      setSnackbarMessage('Couldn\'t Add Tasks');
    }
  }
  function cancelAddingTask(){
    setIsAddingNewTask(false);
    setCurrentTask(null);
    setSnackbarVariant('info');
    setSnackbarMessage('New Task Was Canceled');
  }
  async function confirmChanges(){
    try {
      setIsLoading(true);
      let content = JSON.stringify(convertToRaw(editorState.getCurrentContent()));
      let taskToUpdate = Object.assign({}, currentTask, {content});
      let res = await axios.post(constants.serverWith('/api/task/update'), {...taskToUpdate}, {headers: {token: localStorage.getItem('token')}});
      if (!res.data.error) {
        dispatchTasks({type: 'UPDATE_TASK', payload: taskToUpdate});
      }
      setIsLoading(false);
      setSnackbarVariant('success');
      setSnackbarMessage('Updated Task');
    } catch (e) {
      console.log(e.message);
      setIsLoading(false);
      setSnackbarVariant('error');
      setSnackbarMessage('Couldn\'t Update Task');
    }
  }
  function cancelChanges(){
    selectTask(currentTask.id);
    setSnackbarVariant('info');
    setSnackbarMessage('Changes Canceled');
  }
  const drawer = (
    <div>
      <div className={classes.toolbar} />
      <Divider />
      <List>
        <ListItem button key={'Profile'} onClick={() => setIsProfile(true)}>
          <ListItemIcon><AccountCircleOutlined/></ListItemIcon>
          <ListItemText primary={'Profile'} />
        </ListItem>
        <ListItem button key={'Add Task'} disabled={isAddingNewTask} onClick={onAddTask}>
          <ListItemIcon><Add/></ListItemIcon>
          <ListItemText primary={'Add Task'} />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem button onClick={onAllTasks}>
          <ListItemIcon>
            <InboxOutlined/>
          </ListItemIcon>
          <ListItemText inset primary="All Tasks" />
          {openCategory === 'all' ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={openCategory === 'all'} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {tasks.map(task => (
              <ListItem key={task.id} button className={`${classes.nested} ${task.isCompleted && classes.isCompleted}`} onClick={() => selectTask(task.id)} selected={currentTask && currentTask.id === task.id}>
                <ListItemText inset primary={task.name} secondary={task.deadline ? format(new Date(task.deadline), 'dd MMM yyyy HH:mm') : 'No Deadline'} />
              </ListItem>))}
          </List>
        </Collapse>

        <ListItem button onClick={onPersonalTasks}>
          <ListItemIcon>
            <InboxOutlined />
          </ListItemIcon>
          <ListItemText inset primary="Personal" />
          {openCategory === 'personal' ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={openCategory === 'personal'} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {tasks.filter(task => task.category === 'personal').map(task => (
              <ListItem key={task.id} button className={`${classes.nested} ${task.isCompleted && classes.isCompleted}`} onClick={() => selectTask(task.id)} selected={currentTask && currentTask.id === task.id}>
                <ListItemText inset primary={task.name} secondary={task.deadline ? format(new Date(task.deadline), 'dd MMM yyyy HH:mm') : 'No Deadline'} />
              </ListItem>
            ))}
          </List>
        </Collapse>

        <ListItem button onClick={onWorkTasks}>
          <ListItemIcon>
            <InboxOutlined />
          </ListItemIcon>
          <ListItemText inset primary="Work" />
          {openCategory === 'work' ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={openCategory === 'work'} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {tasks.filter(task => task.category === 'work').map(task => (
              <ListItem key={task.id} button className={`${classes.nested} ${task.isCompleted && classes.isCompleted}`} onClick={() => selectTask(task.id)} selected={currentTask && currentTask.id === task.id}>
                <ListItemText inset primary={task.name} secondary={task.deadline ? format(new Date(task.deadline), 'dd MMM yyyy HH:mm') : 'No Deadline'}/>
              </ListItem>
            ))}
          </List>
        </Collapse>

        <ListItem button onClick={onGroceryListTasks}>
          <ListItemIcon>
            <InboxOutlined />
          </ListItemIcon>
          <ListItemText inset primary="Grocery List" />
          {openCategory === 'grocery' ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={openCategory === 'grocery'} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {tasks.filter(task => task.category === 'grocery').map(task => (
              <ListItem key={task.id} button className={`${classes.nested} ${task.isCompleted && classes.isCompleted}`} onClick={() => selectTask(task.id)} selected={currentTask && currentTask.id === task.id}>
                <ListItemText inset primary={task.name} secondary={task.deadline ? format(new Date(task.deadline), 'dd MMM yyyy HH:mm') : 'No Deadline'}/>
              </ListItem>
            ))}
          </List>
        </Collapse>
      </List>
    </div>
  );

  if (isProfile) return <Profile back={() => setIsProfile(false)} signOut={signOut} />;

  return (
    <div className={classes.root}>
      <CssBaseline />
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
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="Open Menu"
            onClick={handleDrawerToggle}
            className={classes.menuButton}
          >
            <Menu />
          </IconButton>
          <Typography variant="h6" color="inherit" noWrap>
            New App
          </Typography>
          <div style={{position: 'absolute', right: 15}}>
            <IconButton onClick={signOut}>
              <ExitToAppOutlined style={{color: 'white'}}/>
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      <nav className={classes.drawer}>
        <Hidden smUp implementation="css">
          <Drawer
            container={props.container}
            variant="temporary"
            anchor={'left'}
            open={mobileOpen}
            onClose={handleDrawerToggle}
            classes={{
              paper: classes.drawerPaper,
            }}
          >
            {drawer}
          </Drawer>
        </Hidden>
        <Hidden xsDown implementation="css">
          <Drawer
            classes={{
              paper: classes.drawerPaper,
            }}
            variant="permanent"
            open
          >
            {drawer}
          </Drawer>
        </Hidden>
      </nav>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        {currentTask ? (
          <div>
            <Grid container>
              <TextField className={classes.margin} value={currentTask.name} onChange={onChangeTaskName} label={'Title'}/>
              <FormControl className={classes.margin} style={{minWidth: 240}}>
                <InputLabel htmlFor="category-simple">Category</InputLabel>
                <Select
                  value={currentTask.category}
                  onChange={onChangeTaskCategory}
                  inputProps={{id: 'category-simple'}}
                >
                  <MenuItem value={''}>None</MenuItem>
                  <MenuItem value={'personal'}>Personal</MenuItem>
                  <MenuItem value={'work'}>Work</MenuItem>
                  <MenuItem value={'grocery'}>Grocery List</MenuItem>
                </Select>
              </FormControl>
              <FormControlLabel
                control={<Checkbox checked={currentTask.isCompleted} color="primary" onChange={onChangeTaskCompleted} />}
                label={'Completed'}
              />
              <DateTimePicker
                autoOk
                ampm={false}
                value={currentTask.deadline}
                label="Deadline"
                onChange={onChangeTaskDeadline}
                style={{paddingTop: 15}}
              />
            </Grid>
            <RichEditor editorState={editorState} setEditorState={setEditorState}/>
            {isAddingNewTask ? (
              <React.Fragment>
              <Button className={classes.margin} variant={'contained'} color={'secondary'} onClick={cancelAddingTask} disabled={isLoading}>Cancel</Button>
              <Button className={classes.margin} variant={'contained'} color={'primary'} onClick={confirmAddingTask} disabled={isLoading}>Add</Button>
              </React.Fragment>
            ) : (
              <React.Fragment>
              <Button className={classes.margin} variant={'contained'} color={'secondary'} onClick={cancelChanges} disabled={isLoading}>Cancel</Button>
              <Button className={classes.margin} variant={'contained'} color={'primary'} onClick={confirmChanges} disabled={isLoading}>Save</Button>
              </React.Fragment>
            )}
          </div>
        ) : (
          <Typography variant={'body1'}>Add a new task or select a task to change</Typography>
        )}
      </main>
    </div>
  );
}

export default withStyles(styles)(ResponsiveLayout);