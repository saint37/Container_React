import React, { Component } from 'react';
import { Layout, Menu, Breadcrumb,Button } from 'antd';
import Topbar from './topbar/topbar';
import LoadTrain from './train/loadtrain'
import './App.css';
const { Header, Content, Footer } = Layout;

class App extends Component {
    render() {
        return (
          <div className="App">
            <Layout className="layout">
                <Header>
                    <div className="logo" />
                    <Topbar />
                </Header>
                <Content style={{ padding: '0 50px' }}>
                    <LoadTrain />
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                    Rails ©2018 Created by ST
                </Footer>
            </Layout>
          </div>
        );
    }
}

export default App;