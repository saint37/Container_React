import React, { Component } from 'react';  
import { BrowserRouter } from 'react-router-dom';  
import { Router, Route, Switch } from 'react-router';
import App from '../components/App.js';
import GraphC from '../components/Graph.js';
import Login from '../components/Login.js';

export default class RouterIndex extends Component {  
  render() {  
    return (   
        <BrowserRouter>  
            <App>  
                <Switch>
                    <Route path="/" exact component={Login} />
                    <Route path="/GraphC/Login" exact component={Login} />
                    <Route path="/GraphC" component={GraphC} />
                </Switch>
            </App>  
        </BrowserRouter>  
    )  
  }  
}  
