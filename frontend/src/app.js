import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter, Switch, Route } from 'react-router-dom'
import { ToastContainer, Flip } from 'react-toastify'

import 'react-toastify/dist/ReactToastify.minimal.css'

import 'bulma'
import './style.scss'

import Navbar from './components/Navbar'
import Register from './components/Register'
import Login from './components/Login'
import Nodes from './components/Nodes'
import Home from './components/Home'
import Profile from './components/Profile'
import PrivateRoute from './lib/privateRoutes'

const App = () => (
  <HashRouter>
    <Navbar />
    <ToastContainer 
      transition={Flip}
      autoClose={5000}
      toastClassName="toast"
      hideProgressBar
      // progressClassName="toast-progress"
    />
    <Switch>

      <Route exact path="/" component={Home} />
      <Route exact path="/register" component={Register} />
      <Route exact path="/login" component={Login} />
      <Route exact path="/nodes" component={Nodes} />
      <PrivateRoute exact path="/profile" component={Profile} />
    </Switch>
  </HashRouter>
)

ReactDOM.render(<App />, document.getElementById('root'))