import axios from 'axios';

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
        //read json from server
        axios.get('http://localhost:8080/graphC/displayTest/init.htm')
        //axios.get('http://localhost:8888/graphC')
        .then(res => {
            if(res.data != null){
                const data = res.data;
                var result = [].concat(data.areaList).concat(data.groupList).concat(data.containerList);
                //var result = INIT.genDiagramData(data);
                var str = '{"class":"go.GraphLinksModel","nodeDataArray":' + JSON.stringify(result) + '}';
                this.setState({ diagramValue: str });
                //reload
                this.load();
            }
        });
    }
};

export default INIT;