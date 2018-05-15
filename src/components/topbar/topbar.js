import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'antd';

const SubMenu = Menu.SubMenu;

class Topbar extends Component {
    constructor(props) {
        super(props)
        this.state = {
            current: 'Show'
        }
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(e) {
        console.log('click ', e);
        this.setState({
          current: e.key,
        });
    }

    render() {
        var url = window.location.href.split('/');
        console.log(url[4]);
        return (
            <Menu
                theme="dark"
                mode="horizontal"
                selectedKeys={[url[4]]}
                onClick={this.handleClick}
                style={{ lineHeight: '64px' }}
            >
                <Menu.Item key="diygraph"><Link to='/GraphC/diygraph'>箱场铺画</Link></Menu.Item>
                <Menu.Item key="showgraph"><Link to='/GraphC/showgraph'>箱场展示</Link></Menu.Item>

                <SubMenu key="Plan" title={<span>作业计划</span>}>
                    <Menu.Item key="loadtrain"><Link to='/GraphC/loadtrain'>装火车</Link></Menu.Item>
                    <Menu.Item key="unloadtrain"><Link to='/GraphC/unloadtrain'>卸火车</Link></Menu.Item>
                    <Menu.Item key="loadtruck"><Link to='/GraphC/loadtruck'>装集卡</Link></Menu.Item>
                    <Menu.Item key="unloadtruck"><Link to='/GraphC/unloadtruck'>卸集卡</Link></Menu.Item>
                    <Menu.Item key="Plan5">搬到箱</Menu.Item>
                </SubMenu>
            </Menu>
        );
    }
}

export default Topbar;