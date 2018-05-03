import { message} from 'antd';

var MODAL = {
    showModal:function() {
        var ch = this.state.currentNode.substr(0, 1);
        if(ch !== "B") {
            message.info('请选择箱区');
        }
        else{
            this.setState({
              modalVisible: true,
            });            
        }
    },
    handleOk:function() {
        let _self = this;
        var cols = this.state.Cols; //贝
        var rows = this.state.Rows; //行
        var areaX = this.state.currentX; //区域坐标X
        var areaY = this.state.currentY; //区域坐标Y
        console.log(rows + "行" + cols + "贝");
        var groupList = []; //箱位列表
        for(var i=0; i<rows; i++){
            for(var j=0; j<cols;j++){
                var data = {};
                data.key = "G"+i+j;
                data.isGroup = true;
                data.group = this.state.currentNode;
                data.category = "OfNodes";
                data.size = "40 60";
                var x = areaX+(50*j);
                var y = areaY+(70*i);
                data.pos = x + " " + y;
                groupList.push(data);
            }
        }
        console.log(groupList);
        var result = this.state.diagramValue.nodeDataArray.concat(groupList);
        var str = '{"class":"go.GraphLinksModel","nodeDataArray":' + JSON.stringify(result) + '}';
        this.setState({
          diagramValue: str,
          modalVisible: false,
        });
        setTimeout(function(){ _self.load(); }, 500);
    },
    handleCancel:function() {
        this.setState({
          modalVisible: false,
        });
    }
};

export default MODAL;