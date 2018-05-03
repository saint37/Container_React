var SIZE = {
    changeS:function(_self,node) {
        _self.setState({
            currentW: node.width,
            currentH: node.height,
            currentX: node.position.x,
            currentY: node.position.y,
            currentNode: node.key,
            currentName: node.data.name,
            currentNum: node.memberParts.count
        });
    }
};

export default SIZE;