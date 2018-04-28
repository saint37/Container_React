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
            <Layout className="layout">
                <Header>
                    <div className="logo" />
                    <Topbar />
                </Header>
                <Content style={{ padding: '0 20px' }}>
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

export default App;