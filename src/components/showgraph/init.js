import axios from 'axios';
import qs from 'qs';
import graphC from './graphC';
import { message} from 'antd';

var INIT = {
    clickalert:function(){
        alert('hey!');
    },
    // scaleData:function(data,scale){
    //     var arr = data.split(" ");
    //     var x = parseInt(arr[0]) * scale;
    //     var y = parseInt(arr[1]) * scale;
    //     var result = x + " " + y;
    //     return result;
    // },
    // genBoxPos:function(group,grouppos){

    // },
    // genPos:function(group,cispos){

    // },
    // genDiagramData:function(data){
    //     //处理区域
    //     for(var i=0;i<data.areaList.length;i++){
    //         var newsize = INIT.scaleData(data.areaList[i].size,0.5);
    //         data.areaList[i].size = newsize;
    //         var newpos = INIT.scaleData(data.areaList[i].pos,0.5);
    //         data.areaList[i].pos = newpos;
    //     }
    //     console.log(data.areaList);
    //     // //处理集卡火车箱位
    //     for(var i=0;i<data.groupList.length;i++){

    //     }
    //     // //处理箱
    //     for(var i=0;i<data.containerList.length;i++){

    //     }
    //     var result = [].concat(data.areaList).concat(data.groupList).concat(data.containerList);
    //     return result;
    // },
    setSingle:function(_self,node){ //更新箱号
        _self.setState({
            currentName: node.data.name
        });
    },

    setArea:function(_self,node){ //更新区域Key
        _self.setState({
            currentArea: node.key
        });
    },

    showSingle:function(){ //显示单箱计划输入框
        let _self = this;
        _self.setState({
            showSingle: !_self.state.showSingle,
            showArea: false
        });
    },
    
    showArea:function(){ //显示区域计划输入框
        let _self = this;
        _self.setState({
            showSingle: false,
            showArea: !_self.state.showArea
        });
    },

    initPlanSingle:function() {
        let _self = this;
        var cName = _self.state.currentName;
        var qs = require('qs');
        var postData = qs.stringify({
            name:cName
        });
        axios.post('/display/planSingle.htm',postData)
        .then(res => {
            if(res.data != null){
                console.log(res.data);
            }
        });
    },

    initPlanArea:function() {
        let _self = this;
        var cArea = _self.state.currentArea;
        var qs = require('qs');
        var postData = qs.stringify({
            name:cArea
        });
        axios.post('/display/planArea.htm',postData)
        .then(res => {
            if(res.data != null){
                console.log(res.data);
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