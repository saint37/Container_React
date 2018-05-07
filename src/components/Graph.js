import React, { Component } from 'react';
import { Router, Route, Switch  } from 'react-router';
import { Layout } from 'antd';
import './App.css';
import Topbar from './topbar/topbar';
import LoadTrain from './train/loadtrain';
import UnLoadTrain from './train/unloadtrain';
import LoadTruck from './truck/loadtruck';
import UnLoadTruck from './truck/unloadtruck';
import DiyGraph from './diygraph/diygraph';
import ShowGraph from './showgraph/showgraph';

const { Header, Content, Footer } = Layout;

class GraphC extends Component {
    constructor(props) {
       super(props);
    }
    
    render() {
        return (
          <div className="App">
            <Layout className="layout">
                <Header>
                    <div className="logo" />
                    <Topbar />
                </Header>
                <Content style={{ padding: '0 20px' }}>
                    <Switch>
                        <Route path="/GraphC/" exact component={ShowGraph} />
                        <Route path="/GraphC/diygraph" exact component={DiyGraph} />
                        <Route path="/GraphC/showgraph" exact component={ShowGraph} />
                        <Route path="/GraphC/loadtrain" exact component={LoadTrain} />
                        <Route path="/GraphC/unloadtrain" exact component={UnLoadTrain} />
                        <Route path="/GraphC/loadtruck" exact component={LoadTruck} />
                        <Route path="/GraphC/unloadtruck" exact component={UnLoadTruck} /> 
                    </Switch>
                    {this.props.children}
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                    Rails ©2018 Created by ST
                </Footer>
            </Layout>
          </div>
        );
    }
}

export default GraphC;