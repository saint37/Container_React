import { message} from 'antd';
import graphC from './graphC';

var MODAL = {
    showModal:function() {
        let _self = this;
        var ch = _self.state.currentNode.substr(0, 1);
        var num = _self.state.currentNum;
        if(ch !== "B") {
            message.info('请选择箱区');
        }
        else if(num !== 0){
            message.info('请不要重新生成箱位');
        }
        else{
            _self.setState({
              modalVisible: true,
            });            
        }
    },
    genGroupList:function(rows,cols,areaX,areaY,cNode){ //生成箱位数组
        var groupList = []; 
        for(var i=0; i<rows; i++){
            for(var j=0; j<cols;j++){
                var data = {};
                data.key = "G"+i+j;
                data.isGroup = true;
                data.group = cNode;
                data.category = "OfNodes";
                data.size = "40 40";
                var x = areaX+(50*j);
                var y = areaY+(50*i);
                data.pos = x + " " + y;
                data.groupPos = (i+1) + " " + (j+1);
                groupList.push(data);
            }
        }
        return groupList;
    },
    handleOk:function() {  //生成箱位节点
        let _self = this;
        var rows = _self.state.Rows; //行
        var cols = _self.state.Cols; //贝
        var num = rows*cols; //所含节点数
        _self.changeNum(num); //改变区域所含节点数
        _self.save();
        var areaX = parseInt(_self.state.currentX); //区域坐标X
        var areaY = parseInt(_self.state.currentY); //区域坐标Y
        var cNode = _self.state.currentNode;
        var groupList = MODAL.genGroupList(rows,cols,areaX,areaY,cNode);
        console.log(groupList);
        var result = [].concat(graphC.diagramValue.nodeDataArray).concat(groupList); //拼接数组
        var modeljson = {};
        modeljson.class = "go.GraphLinksModel";
        modeljson.nodeDataArray = result;
        graphC.diagramValue = modeljson; //改变模型json
        _self.load();
        _self.setState({
          modalVisible: false
        });
    },
    handleCancel:function() {
        let _self = this;
        _self.setState({
          modalVisible: false,
        });
    }
};

export default MODAL;