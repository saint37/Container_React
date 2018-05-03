import axios from 'axios';
import qs from 'qs';
import graphC from './graphC';

var SAVE = {
    clickalert:function(){
        alert('hey!');
        console.log(this.state.diagramValue);
    },

    saveGraph:function() {
        let _self = this;
        _self.save();
        var result = graphC.diagramValue; 
        var str = JSON.stringify(result); //json to str
        var qs = require('qs');
        var postData = qs.stringify({
            diagramValue:str
        });
        console.log(postData);
        axios.post('http://localhost:8001/graphC/init/initElement.htm',postData)
        .then(res => {
            console.log(res.data);
        });
    }
};

export default SAVE;