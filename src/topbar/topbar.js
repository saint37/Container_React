import React, { Component } from 'react';
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
                <Menu.Item key="1">装火车</Menu.Item>
                <Menu.Item key="2">卸火车</Menu.Item>
                <Menu.Item key="3">装集卡</Menu.Item>
                <Menu.Item key="4">卸集卡</Menu.Item>
            </Menu>
        );
    }
}

export default Topbar;