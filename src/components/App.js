import React, { Component } from 'react';
import { Layout } from 'antd';
import Topbar from './topbar/topbar';
import './App.css';
const { Header, Content, Footer } = Layout;

class App extends Component {
    constructor(props) {
       super(props);
    }
    
    render() {
        return (
          <div className="App">
               {this.props.children}
          </div>
        );
    }
}

export default App;