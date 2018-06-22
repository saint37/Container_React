import axios from 'axios';
import qs from 'qs';
import graphC from './graphC';
import { message} from 'antd';

var INIT = {
    clickalert:function(){
        alert('hey!');
    },

    setArea:function(_self,node){ //更新区域Key
        _self.setState({
            currentArea: node.key
        });
    },

    // showSingle:function(){ //显示单箱计划输入框
    //     let _self = this;
    //     _self.setState({
    //         showSingle: !_self.state.showSingle,
    //         showArea: false
    //     });
    // },
    
    // showArea:function(){ //显示区域计划输入框
    //     let _self = this;
    //     _self.setState({
    //         showSingle: false,
    //         showArea: !_self.state.showArea
    //     });
    // },

    initPlanSingle:function() {
        let _self = this;
        var cName = _self.state.currentName;
        var qs = require('qs');
        var postData = qs.stringify({
            oldContainerName:cName
        });
        console.log(postData);
        axios.post('/display/planSingle.htm',postData)
        .then(res => {
            if(res.data != null){
                console.log(res.data);
                const data = res.data;

                if(res.data.resultMsg.resultCode === "P0011"){
                    message.info('该箱场无此箱号');
                }
                else if(res.data.resultMsg.resultCode === "P0012"){
                    message.info('该箱无计划');
                }
                else if(res.data.resultMsg.resultCode === "P0010"){
                    message.info('读取计划成功');
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

    initPlanArea:function() {
        let _self = this;
        var cArea = _self.state.currentArea;
        var qs = require('qs');
        var postData = qs.stringify({
            areaKey:cArea
        });
        console.log(postData);
        axios.post('/display/planArea.htm',postData)
        .then(res => {
            if(res.data != null){
                console.log(res.data);
                const data = res.data;
                var result = [].concat(data.areaList).concat(data.groupList).concat(data.containerList).concat(data.newContainerList);
                var str;
                if(data.areaList || data.groupList){
                    str = '{"class":"go.GraphLinksModel","nodeDataArray":' + JSON.stringify(result) + '}';
                } else{ str = '{"class":"go.GraphLinksModel","nodeDataArray":[]}'; }
                var modeljson = JSON.parse(str); 
                graphC.diagramValue = modeljson;
                this.load();     
            }
        });
    },

    initDiagram:function() { // 实时展示
        let _self = this;
        var qs = require('qs');
        // var myDate = new Date();
        // var str = myDate.toLocaleString();
        // console.log(str);
        // var postData = qs.stringify({
        //     Date:str
        // });
        // console.log(postData);
        console.log("Request Data:");
        axios.post('/display/show.htm')
        .then(res => {
            if(res.data != null){
                console.log(res.data);
                const data = res.data;
                var result = [].concat(data.areaList).concat(data.groupList).concat(data.containerList);
                var str;
                if(data.areaList || data.groupList || data.containerList){
                    str = '{"class":"go.GraphLinksModel","nodeDataArray":' + JSON.stringify(result) + '}';
                } else{ str = '{"class":"go.GraphLinksModel","nodeDataArray":[]}'; }
                var modeljson = JSON.parse(str); 
                graphC.diagramValue = modeljson;
                this.load();
            }
        });
    }
};

export default INIT;