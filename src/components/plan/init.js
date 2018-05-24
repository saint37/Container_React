import axios from 'axios';
import qs from 'qs';
import graphC from './graphC';

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
    initDiagram:function() {
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