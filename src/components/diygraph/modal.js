import axios from 'axios';

var MODAL = {
    clickalert:function(){
        alert('hey!');
    },
    showModal:function() {
        this.setState({
          modalVisible: true,
        });
    },
    handleOk:function() {
        this.setState({
          modalVisible: false,
        });
    },
    handleCancel:function() {
        this.setState({
          modalVisible: false,
        });
    }
};

export default MODAL;