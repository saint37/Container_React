import axios from 'axios';
import qs from 'qs';

var SAVE = {
    clickalert:function(){
        alert('hey!');
    },

    saveGraph:function() {
        console.log("post:");
        var json = this.state.diagramValue.nodeDataArray;
        var areaList = JSON.stringify(json);
        var qs = require('qs');
        var postData = qs.stringify({
            areaList:areaList,
            groupList:'',
        });
        console.log(postData);
        axios.post('http://localhost:8080/graphC/init/initElement.htm',postData)
        .then(res => {
            console.log(res.data);
        });
    }
};

export default SAVE;