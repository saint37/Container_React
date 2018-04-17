import axios from 'axios';

var INIT = {
    clickalert:function(){
        alert('hey!');
    },
    initDiagram:function() {
        //read json from server
        axios.get('http://localhost:8080/graphC/display/init.htm')
        .then(res => {
            if(res.data != null){
                const data = res.data;
                var result = [].concat(data.areaList).concat(data.groupList).concat(data.containerList);
                var str = '{"class":"go.GraphLinksModel","nodeDataArray":' + JSON.stringify(result) + '}';
                this.setState({ diagramValue: str });
                // //reload
                this.load();
            }
        });
    }
};

export default INIT;