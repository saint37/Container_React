import axios from 'axios';
import qs from 'qs';
import graphC from './graphC';
import { Modal, Button } from 'antd';

var PLAN = {
    clickalert:function(){
        alert('hey!');
    },

    // setCurrentState:function(_self,node,grp){ //记录现有位置等
    //     var layer = String(node.data.layer);
    //     var grp = node.data.group;
    //     //此处应判定，是从何处拖拽
    //     var pos = _self.getCurrentPos(grp,layer);
    //     _self.setState({
    //       currentPos: pos,
    //       currentGroup: grp,
    //       currentLayer: layer
    //     });
    // },

    infoAdd:function(){ //显示新增计划弹框
        Modal.info({
            title: '新增计划提示：',
            content: '请在图中进行拖拽操作',
            onOk() {},
            okText: '确认',
          })
    },

    showAdd:function(_self,node){ //显示新增计划弹框
        console.log(node);
        var cX = (node.position.x).toFixed(2);
        var cY = (node.position.y).toFixed(2);
        node.data.pos = cX + ' ' + cY;
        _self.setState({
          showAdd: true,
          currentName: node.data.name,
          currentId:  node.data.id,
          planFrom: "T",
          planContainer: node.data
        });
    },

    hideAdd:function(){
        let _self = this;
        _self.setState({
          showAdd: false
        });
    },

    addPlan:function(){ //提交新增计划
        let _self = this;
        var planList = {};
        planList.planType = _self.state.planType;
        planList.planDate = _self.state.planDate;
        planList.planFrom = _self.state.planFrom;
        var qs = require('qs');
        var postData = qs.stringify({
            containerId:_self.state.currentId,
            planList:planList,
            planContainer:_self.state.planContainer
        });
        console.log(postData);
        axios.post('/plan/addPlan.htm',postData)
        .then(res => {
            if(res.data != null){
                console.log(res.data);
            }
        });
    },
    
// =================================== 修改 ====================================== //

    infoUpdate:function(){ //显示修改计划弹框
        Modal.info({
            title: '修改计划提示：',
            content: '请修改或删除现有计划，图中黄色箱为计划位置',
            onOk() {},
            okText: '确认',
          })
    },

    showSingle:function(){ //显示单箱计划输入框
        let _self = this;
        _self.setState({
            showSingle: !_self.state.showSingle
        });
    },

    setSingle:function(_self,node){ //更新箱号
        _self.setState({
            currentName: node.data.name
        });
    },
    
    initPlanSingle:function() { //读取现有计划
        let _self = this;
        var qs = require('qs');
        var postData = qs.stringify({
            name:_self.state.currentName,
        });
        console.log(postData);
        axios.get('http://localhost:8001/singlePlan.htm')
        .then(res => {
            if(res.data != null){
                console.log(res.data);
                const data = res.data;
                var result = [].concat(data.areaList).concat(data.groupList).concat(data.containerList);
                var str = '{"class":"go.GraphLinksModel","nodeDataArray":' + JSON.stringify(result) + '}';
                var modeljson = JSON.parse(str); 
                graphC.diagramValue = modeljson;
                this.load();
                PLAN.infoUpdate();
            }
        });
    },

    showUpdate:function(_self,node){ //显示修改计划弹框
        console.log(node);
        var cX = (node.position.x).toFixed(2);
        var cY = (node.position.y).toFixed(2);
        node.data.pos = cX + ' ' + cY;
        _self.setState({
          showUpdate: true,
          currentName: node.data.name,
          currentId:  node.data.id,
          planFrom: "T",
          planContainer: node.data
        });
    },

    hideUpdate:function(){
        let _self = this;
        _self.setState({
          showUpdate: false,
        });
    },

    updatePlan:function(){  //提交修改计划
        let _self = this;
        var planList = {};
        planList.planType = _self.state.planType;
        planList.planDate = _self.state.planDate;
        planList.planFrom = _self.state.planFrom;
        var qs = require('qs');
        var postData = qs.stringify({
            containerId:_self.state.currentId,
            planList:planList,
            planContainer:_self.state.planContainer
        });
        console.log(postData);
        axios.post('/plan/updatePlan.htm',postData)
        .then(res => {
            if(res.data != null){
                console.log(res.data);
            }
        });
    },
};

export default PLAN;