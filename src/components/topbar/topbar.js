import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'antd';

const SubMenu = Menu.SubMenu;

class Topbar extends Component {
    state = {
        current: 'Show',
    }
    handleClick = (e) => {
        console.log('click ', e);
        this.setState({
          current: e.key,
        });
    }
    render() {
        return (
            <Menu
                theme="dark"
                mode="horizontal"
                defaultSelectedKeys={[this.state.current]}
                onClick={this.handleClick}
                style={{ lineHeight: '64px' }}
            >
                <Menu.Item key="Diy"><Link to='/GraphC/diygraph'>箱场铺画</Link></Menu.Item>
                <Menu.Item key="Show"><Link to='/GraphC/showgraph'>箱场展示</Link></Menu.Item>

                <SubMenu key="Plan" title={<span>作业计划</span>}>
                    <Menu.Item key="Plan1"><Link to='/GraphC/loadtrain'>装火车</Link></Menu.Item>
                    <Menu.Item key="Plan2"><Link to='/GraphC/unloadtrain'>卸火车</Link></Menu.Item>
                    <Menu.Item key="Plan3"><Link to='/GraphC/loadtruck'>装集卡</Link></Menu.Item>
                    <Menu.Item key="Plan4"><Link to='/GraphC/unloadtruck'>卸集卡</Link></Menu.Item>
                    <Menu.Item key="Plan5">搬到箱</Menu.Item>
                </SubMenu>
            </Menu>
        );
    }
}

export default Topbar;