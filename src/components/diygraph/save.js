import axios from 'axios';
import qs from 'qs';
import graphC from './graphC';
import { message} from 'antd';

var SAVE = {
    clickalert:function(){
        let _self = this;
        _self.save();
    },

    loadGraph:function(){
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
        axios.post('/display/showArea.htm')
        .then(res => {
            if(res.data != null){
                console.log(res.data);
                const data = res.data;
                var result = [].concat(data.areaList).concat(data.groupList);
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

    reGenPos:function(res) {
        var json = res.nodeDataArray;
        for(var i=0;i<json.length;i++){
            var num = json[i].pos.split(" ");
            var x = parseInt(num[0]).toFixed(2);
            var y = parseInt(num[1]).toFixed(2);
            json[i].pos = x + " " + y;
        }
    },

    saveGraph:function() {
        let _self = this;
        _self.save();
        var result = graphC.diagramValue; 
        SAVE.reGenPos(result);
        var str = JSON.stringify(result); //json to str
        console.log(str);
        var qs = require('qs');
        var postData = qs.stringify({
            diagramValue:str
        });
        //console.log(postData);
        axios.post('/init/initElement.htm',postData)
        .then(res => {
            console.log(res.data);
            if(res.data.msg == "init success"){
                message.info('保存箱场成功');
            }
        });
    }
};

export default SAVE;