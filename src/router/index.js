import React, { Component } from 'react';  
import { BrowserRouter } from 'react-router-dom';  
import { Router, Route } from 'react-router';
  
import App from '../components/App.js' 
import LoadTrain from '../components/train/loadtrain';
import UnLoadTrain from '../components/train/unloadtrain';
import LoadTruck from '../components/truck/loadtruck';
import UnLoadTruck from '../components/truck/unloadtruck';
import diygraph from '../components/diygraph/diygraph';
  
export default class RouterIndex extends Component {  
  render() {  
    return (   
        <BrowserRouter>  
            <App path="/App" component={App} >  
            	<Route path="/" exact component={LoadTrain} />
              	<Route path="/App/loadtrain" component={LoadTrain} />
              	<Route path="/App/unloadtrain" component={UnLoadTrain} />
              	<Route path="/App/loadtruck" component={LoadTruck} />
              	<Route path="/App/unloadtruck" component={UnLoadTruck} /> 
                <Route path="/App/diygraph" component={diygraph} /> 
            </App>  
        </BrowserRouter>  
    )  
  }  
}  
