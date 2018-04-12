import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'antd';

class Topbar extends Component {
    render() {
        return (
            <Menu
                theme="dark"
                mode="horizontal"
                defaultSelectedKeys={['1']}
                style={{ lineHeight: '64px' }}
            >
                <Menu.Item key="1"><Link to='/App/loadtrain'>装火车</Link></Menu.Item>
                <Menu.Item key="2"><Link to='/App/unloadtrain'>卸火车</Link></Menu.Item>
                <Menu.Item key="3"><Link to='/App/loadtruck'>装集卡</Link></Menu.Item>
                <Menu.Item key="4"><Link to='/App/unloadtruck'>卸集卡</Link></Menu.Item>
            </Menu>
        );
    }
}

export default Topbar;