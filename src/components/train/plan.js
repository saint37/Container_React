import axios from 'axios';
import qs from 'qs';
import graphC from './graphC';
import { Modal, Button } from 'antd';

var PLAN = {
    clickalert:function(){
        alert('hey!');
    },

    setCurrentState:function(_self,node,grp){ //记录现有位置等
        var layer = String(node.data.layer);
        var grp = node.data.group;
        //此处应判定，是从何处拖拽
        var pos = _self.getCurrentPos(grp,layer);
        _self.setState({
          currentPos: pos,
          currentGroup: grp,
          currentLayer: layer
        });
    },

    infoAdd:function(){ //显示新增计划弹框
        Modal.info({
            title: '新增计划提示：',
            content: '请在图中进行拖拽操作',
            onOk() {},
            okText: '确认',
          })
    },

    showAdd:function(_self,node,grp){ //显示新增计划弹框
        var layer = String(node.data.layer);
        var x = node.position.x;
        var y = node.position.y;
        x = x.toFixed(2);
        y = y.toFixed(2);
        var pos = x + " " + y;
        _self.setState({
          showAdd: true,
          currentName: node.data.name,
          newPos: pos,
          newGroup: grp.key,
          newLayer: layer
        });
    },

    hideAdd:function(){
        let _self = this;
        _self.setState({
          showAdd: false,
        });
    },

    AddPlan:function(){ //提交新增计划
        let _self = this;
        var qs = require('qs');
        var postData = qs.stringify({
            name:_self.state.currentName,
            date:_self.state.planTime,
            pos:_self.state.currentPos,
            group:_self.state.currentGroup,
            layer:_self.state.currentLayer,
            newPos:_self.state.newPos,
            newGroup:_self.state.newGroup,
            newLayer:_self.state.newLayer,
        });
        console.log(postData);
        axios.post('/plan/addPlan.htm',postData)
        .then(res => {
            if(res.data != null){
                console.log(res.data);
                // const data = res.data;
                // var result = [].concat(data.areaList).concat(data.groupList);
                // var str = '{"class":"go.GraphLinksModel","nodeDataArray":' + JSON.stringify(result) + '}';
                // var modeljson = JSON.parse(str); 
                // graphC.diagramValue = modeljson;
                // this.load();
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
        var cName = _self.state.currentName;
        var qs = require('qs');
        var postData = qs.stringify({
            name:cName
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
                //set current and old state
                PLAN.setUpdateState(_self,data.planList);
            }
        });
    },

    setUpdateState(_self,clist){ //记录现有位置，原计划位置等
        var clayer = String(clist[0].layer);
        var olayer = String(clist[1].layer);
        _self.setState({
            currentPos: clist[0].pos,
            currentGroup: clist[0].group,
            currentLayer: clayer,
            oldPos: clist[1].pos,
            oldGroup: clist[1].group,
            oldLayer: olayer
        });
        console.log(clist[0].pos + " " + clist[0].group + " " + clist[0].layer);
        console.log(clist[1].pos + " " + clist[1].group + " " + clist[1].layer);
    },

    showUpdate:function(_self,node,grp){ //显示修改计划弹框
        var layer = String(node.data.layer);
        var x = node.position.x;
        var y = node.position.y;
        x = x.toFixed(2);
        y = y.toFixed(2);
        var pos = x + " " + y;
        _self.setState({
          showUpdate: true,
          currentName: node.data.name,
          newPos: pos,
          newGroup: grp.key,
          newLayer: layer
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
        var qs = require('qs');
        var postData = qs.stringify({
            name:_self.state.currentName,
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