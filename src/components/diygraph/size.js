var SIZE = {
    changeS:function(_self,node) {
        var cW = (node.width/6).toFixed(2);
        var cH = (node.height/6).toFixed(2);
        var cX = (node.position.x).toFixed(2);
        var cY = (node.position.y).toFixed(2);
        node.position.x = parseFloat(cX);
        node.position.y = parseFloat(cY);
        _self.setState({
            currentW: cW,
            currentH: cH,
            currentX: cX,
            currentY: cY,
            currentNode: node.key,
            currentName: node.data.name,
            currentNum: node.memberParts.count
        });
    }
};

export default SIZE;