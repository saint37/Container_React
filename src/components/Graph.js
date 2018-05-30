import React, { Component } from 'react';
import { Router, Route, Switch  } from 'react-router';
import { Layout } from 'antd';
import './App.css';
import Topbar from './topbar/topbar';
import LoadTrain from './plan/loadtrain';
import UnLoadTrain from './plan/unloadtrain';
import LoadTruck from './plan/loadtruck';
import UnLoadTruck from './plan/unloadtruck';
import InnerMove from './plan/innermove';
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
                    <div className="logo"><img src={require('./assets/logo.png')} />铁路集装箱图形化管理系统</div>
                    <Topbar />
                </Header>
                <Content>
                    <Switch>
                        <Route path="/GraphC/" exact component={ShowGraph} />
                        <Route path="/GraphC/diygraph" exact component={DiyGraph} />
                        <Route path="/GraphC/showgraph" exact component={ShowGraph} />
                        <Route path="/GraphC/loadtrain" exact component={LoadTrain} />
                        <Route path="/GraphC/unloadtrain" exact component={UnLoadTrain} />
                        <Route path="/GraphC/loadtruck" exact component={LoadTruck} />
                        <Route path="/GraphC/unloadtruck" exact component={UnLoadTruck} /> 
                        <Route path="/GraphC/innermove" exact component={InnerMove} /> 
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