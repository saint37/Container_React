var SIZE = {
    changeS:function(_this,node) {
        _this.setState({
            currentW: node.width,
            currentH: node.height,
            currentX: node.position.x,
            currentY: node.position.y,
            currentNode: node.key,
            currentName: node.data.name
        });
    }
};

export default SIZE;