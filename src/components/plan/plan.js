import axios from 'axios';
import qs from 'qs';
import graphC from './graphC';
import { Modal, Button, message } from 'antd';

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
        _self.setState({
          showAdd: true,
          currentName: node.data.name,
          currentId:  node.data.containerID,
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
        var planListStr = JSON.stringify(planList);
        
        //处理小数
        var planContainer = _self.state.planContainer;
        var pos = planContainer.pos;
        console.log(pos);
        var num = pos.split(" ");
        var x = parseInt(num[0]).toFixed(2);
        var y = parseInt(num[1]).toFixed(2);
        console.log(x);
        console.log(y);
        planContainer.pos = x + " " + y;
        var planContainerStr = JSON.stringify(_self.state.planContainer);

        var qs = require('qs');
        var postData = qs.stringify({
            containerId:_self.state.currentId,
            plan:planListStr,
            planContainer:planContainerStr
        });
        console.log(postData);
        axios.post('/plan/addPlan.htm',postData)
        .then(res => {
            if(res.data != null){
                console.log(res.data);
                if(res.data.resultMsg.resultCode === "P0001"){
                    message.info('计划添加成功');
                    PLAN.hideAdd();
                }
                else if(res.data.resultMsg.resultCode === "P0002"){
                    message.info('该箱已有计划，请勿重复添加');
                    PLAN.hideAdd();
                }
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
            oldContainerName:_self.state.currentName,
        });
        console.log(postData);
        axios.post('/display/planSingle.htm',postData)
        .then(res => {
            if(res.data != null){
                console.log(res.data);
                const data = res.data;

                if(res.data.resultMsg.resultCode === "P0011"){
                    message.info('该箱场无此箱号');
                    PLAN.hideAdd();
                }
                else if(res.data.resultMsg.resultCode === "P0012"){
                    message.info('该箱无计划');
                    PLAN.hideAdd();
                }
                else if(res.data.resultMsg.resultCode === "P0010"){
                    message.info('读取计划成功');
                    PLAN.hideAdd();
                    var result = [].concat(data.areaList).concat(data.groupList).concat(data.newContainer).concat(data.oldContainer);
                    var str;
                    if(data.areaList || data.groupList){
                        str = '{"class":"go.GraphLinksModel","nodeDataArray":' + JSON.stringify(result) + '}';
                    } else{ str = '{"class":"go.GraphLinksModel","nodeDataArray":[]}'; }
                    var modeljson = JSON.parse(str); 
                    graphC.diagramValue = modeljson;
                    this.load();                     
                }
            }
        });
    },

    showUpdate:function(_self,node){ //显示修改计划弹框
        console.log(node);
        _self.setState({
          showUpdate: true,
          currentName: node.data.name,
          currentId:  node.data.containerID,
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
        var planListStr = JSON.stringify(planList);
        
        var planContainer = _self.state.planContainer;
        var pos = planContainer.pos;
        console.log(pos);
        var num = pos.split(" ");
        var x = parseInt(num[0]).toFixed(2);
        var y = parseInt(num[1]).toFixed(2);
        console.log(x);
        console.log(y);
        planContainer.pos = x + " " + y;
        var planContainerStr = JSON.stringify(_self.state.planContainer);

        var qs = require('qs');
        var id = _self.state.currentId;
        console.log(id);
        var postData = qs.stringify({
            containerId:id,
            plan:planListStr,
            planContainer:planContainerStr
        });
        console.log(postData);
        axios.post('/plan/updatePlan.htm',postData)
        .then(res => {
            if(res.data != null){
                console.log(res.data);
                if(res.data.resultMsg.resultCode === "P0020"){
                    message.info('计划修改成功');
                    PLAN.hideUpdate();
                }
            }
        });
    },

    // =================================== 删除 ====================================== //

    showDelete:function(_self,node){ //显示修改计划弹框
        console.log(node);
        _self.setState({
          showDelete: true,
          currentName: node.data.name,
          currentId:  node.data.containerID,
          // planFrom: "T"
        });
    },

    hideDelete:function(){
        let _self = this;
        _self.setState({
          showDelete: false,
        });
    },

    deletePlan:function(){  //提交删除计划
        let _self = this;
        var qs = require('qs');
        var postData = qs.stringify({
            containerId:_self.state.currentId,
        });
        console.log(postData);
        axios.post('/plan/deletePlan.htm',postData)
        .then(res => {
            if(res.data != null){
                console.log(res.data);
                if(res.data.resultMsg.resultCode === "P0030"){
                    message.info('计划删除成功');
                    PLAN.hideDelete();
                }
            }
        });
    },   
};

export default PLAN;