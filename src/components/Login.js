import React, { Component } from 'react';
import { Icon, Form, Input, Button, Checkbox, Row, Col} from 'antd';
import './App.css';
const FormItem = Form.Item;

class Login extends Component {
    constructor(props) {
       super(props);
       this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(e){  
        e.preventDefault();
        this.props.history.push('/GraphC');
        // let data = this.props.form.getFieldsValue()  
        // console.info("表单值：",data)  
        // let history = this.context.router.history  
        // axios.post("/users",data).then(function(res){  
        //     let resMsg = res.data.data;  
        //     if(resMsg.name === "lily" && resMsg.password==="1"){  
        //         history.push('/manage');  
        //     }else{  
        //         alert("密码错误")  
        //     }  
        // }) 
    }  

    render() {
        return (
            <div className="login-wrap">
                <Row>
                  <Col span={14}></Col>
                  <Col span={8}>
                      <Form onSubmit={this.handleSubmit} className="login-form">
                        <h2 style={{fontWeight:600}}>系统登录</h2>
                        <FormItem>
                          <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="用户名" />
                        </FormItem>
                        <FormItem>
                          <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="密码" />
                        </FormItem>
                        <FormItem className="login-form-act">
                          <Checkbox>记住密码</Checkbox>
                          <a className="login-form-forgot" href="">忘记密码</a>
                          <br />
                          <Button type="primary" htmlType="submit" className="login-form-button">
                            登录
                          </Button>
                        </FormItem>
                      </Form>
                  </Col>
                  <Col span={2}></Col>
                </Row>
            </div>
        );
    }
}

export default Login;