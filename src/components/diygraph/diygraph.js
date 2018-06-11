import React, { Component } from 'react';
import axios from 'axios';
import go from 'gojs';
import './diygraph.css';
import { Row, Col, Modal, Button, InputNumber, Popover, Icon } from 'antd';
import SAVE from './save';
import MODAL from './modal';
import SIZE from './size';
import graphC from './graphC';
import truckimg from '../assets/truck.png';
import trainimg from '../assets/train.png';
import craneimg from '../assets/crane.png';

const ButtonGroup = Button.Group;
const $ = go.GraphObject.make;
//global
var CellSize = new go.Size(20, 20);
//Container
var groupFill = "rgba(233,233,233,0.2)";
var groupStroke = "rgba(128,128,128,0.4)";
var dropFill = "rgba(255,255,255,0.2)";
var dropStroke = "lightblue";
//Indicator
var gradIndicatorHoriz;
var gradIndicatorVert;
//Diagram
var myDiagram;
//palette
var myPaletteArea;
var myPaletteItems;
//Popover
const paletteInfo = (
  <div>
    <p>请拖拽箱场元素到画布上</p>
    <p>拖动完毕后可以改变大小</p>
  </div>
);
const buttonInfo = (
  <div>
    <p>选中箱区后点击按钮</p>
    <p>生成该箱区模拟箱位</p>
  </div>
);

class DiyGraph extends Component {
    renderCanvas () {
        let _self = this;
        //global
        function showMessage(s) {
            document.getElementById("diagramEventsMsg").textContent = s;
        }

        myDiagram = //定义画布
        $(go.Diagram, "myDiagramDiv",
        {
            //initialContentAlignment: go.Spot.Center, // 画布居中
            //显示网格
            grid: $(go.Panel, "Grid",
              { gridCellSize: CellSize },
              $(go.Shape, "LineH", { stroke: "lightgray" }),
              $(go.Shape, "LineV", { stroke: "lightgray" })
            ),
            scrollMode: go.Diagram.InfiniteScroll,  // 可以滚动
            padding: 0,  // 边距为0
            "undoManager.isEnabled": true, // 可以撤销
            allowZoom: true, // 可以缩放
            //initialAutoScale: go.Diagram.Uniform,
            initialScale:0.8,
            initialContentAlignment: go.Spot.Center,
            allowDrop: true, // 可以释放拖拽对象
            //allowDragOut: true, //可以拖出
            "draggingTool.isGridSnapEnabled": true, // 对齐网格拖拽
            "resizingTool.isGridSnapEnabled": true,
            //maxSelectionCount: 1, //最多选择一个节点
            "ExternalObjectsDropped": function (e) { //添加节点时，改变state记录的大小及位置
                var node = e.diagram.selection.first();
                SIZE.changeS(_self,node);
            },
            "PartResized": function (e) { //缩放区域节点时，改变state记录的大小及位置
                var node = e.subject;
                SIZE.changeS(_self,node);
            },
            "SelectionMoved": function (e) { //移动区域节点时，改变state记录的大小及位置
                var node = e.diagram.toolManager.draggingTool.currentPart;
                SIZE.changeS(_self,node);
            },
            "SelectionDeleted":function (e) { //删除节点时，更新state记录的json
                _self.save();
            },
        });

        myDiagram.groupTemplate =
            $(go.Group, "Auto",
                { 
                    // layout: $(go.GridLayout,
                    // { 
                    //   wrappingColumn:1,
                    //   cellSize: new go.Size(1, 1), 
                    //   spacing: new go.Size(0, 0),
                    // })
                },
            $(go.Panel, "Vertical",  // position header above the subgraph
                //{ padding: 10 },
                $(go.Shape, "Rectangle",  // surrounds everything
                    new go.Binding("desiredSize", "size-sm", go.Size.parse),
                    new go.Binding("fill", "color"),
                    new go.Binding("stroke", "stroke")),
                $(go.TextBlock,     // group title near top, next to button
                    { font: "10pt Sans-Serif",margin:5 },
                    new go.Binding("text", "name"))
                )
            );

        myDiagram.groupTemplateMap.add("OfGroups", //划分箱区
            $(go.Group, "Horizontal",
                {
                    layerName: "Background",
                    movable: true, //能移动
                    resizable:true, //能改变大小
                    selectionAdorned: true, //显示选中框
                    click: function(e, node) {
                       var data = node.data;
                       console.log(node);
                       SIZE.changeS(_self,node);
                       showMessage(node.key+ "-Size: " + data.size + "-Loc: " + node.position + "/" + data.pos); 
                    },
                    mouseDragEnter: function(e, grp, prev) { //不能拖拽节点到区域上
                        grp.diagram.currentCursor = "not-allowed";
                    },
                    mouseDrop: function(e, grp) {
                        showMessage("can't move"); 
                        grp.diagram.currentTool.doCancel();
                    }
                },
                new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
                new go.Binding("position", "pos", go.Point.parse).makeTwoWay(go.Point.stringify),
                $(go.Shape, "Rectangle",
                  { 
                    stroke: "rgba(128,128,128,0.4)" 
                  },
                  new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Point.stringify),
                  new go.Binding("fill", "color")),
            ));

            myDiagram.groupTemplateMap.add("OfGroupsT", //划分集卡，火车区域
            $(go.Group, "Horizontal",
                {
                    layerName: "Background",
                    movable: true, //能移动
                    resizable:true, //能改变大小
                    selectionAdorned: true, //显示选中框
                    click: function(e, node) {
                       var data = node.data;
                       console.log(data);
                       SIZE.changeS(_self,node);
                       showMessage(node.key + "-Current Loc of Group " + node.position + "/" + data.pos); 
                    },
                    mouseDragEnter: function(e, grp, prev) { //不能拖拽节点到区域上
                        grp.diagram.currentCursor = "not-allowed";
                    },
                    mouseDrop: function(e, grp) {
                        showMessage("can't move"); 
                        grp.diagram.currentTool.doCancel();
                    },
                    layout: //默认横向排列
                        $(go.GridLayout,
                          { wrappingColumn: NaN, 
                            alignment: go.GridLayout.Position,
                        })
                },
                new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
                new go.Binding("position", "pos", go.Point.parse).makeTwoWay(go.Point.stringify),
                $(go.Shape, "Rectangle",
                  { 
                    stroke: "rgba(128,128,128,0.4)"
                  },
                  new go.Binding("desiredSize", "size", go.Size.parse),
                  new go.Binding("fill", "color")),
            ));

        myDiagram.groupTemplateMap.add("OfNodes", //箱位
            $(go.Group, "Auto",
                {
                    layerName: "BoxArea",
                    resizable:  false, //不能改变大小
                    movable: false, //不能移动
                    defaultAlignment: go.Spot.Bottom,
                    selectionAdorned: false, //选中后不显示选中框
                    click: function(e, node) {
                       var data = node.data;
                       console.log(data);
                       showMessage(node.key + "-Current Loc of Group " + node.position + "/" + data.pos); 
                    },
                    mouseDragEnter: function(e, grp, prev) { //在箱场图形自定义页，箱位仅做展示作用
                        grp.diagram.currentCursor = "not-allowed";
                    },
                    mouseDrop: function(e, grp) {
                        showMessage("can't move"); 
                        grp.diagram.currentTool.doCancel();
                    }
                },
                new go.Binding("position", "pos", go.Point.parse).makeTwoWay(go.Point.stringify),
                $(go.Panel,
                    'Vertical',
                    {
                        height: 50
                    },
                    $(go.Shape, "Rectangle",
                        {
                            fill: groupFill,
                            stroke: groupStroke,
                        },
                        new go.Binding("desiredSize", "size", go.Size.parse)),
                    $(go.TextBlock,     // group title near top, next to button
                        { font: "10pt Sans-Serif", stroke:"#607d8b" },
                        new go.Binding("text", "name"))
                    )
            ));

        myDiagram.groupTemplateMap.add("OfTruck", //集卡
            $(go.Group, "Auto",
                {
                    layerName: "BoxArea",
                    resizable:  false, //不能改变大小
                    movable: false, //不能移动
                    selectionAdorned: false, //选中后不显示选中框
                    click: function(e, node) {
                       var data = node.data;
                       showMessage(node.key + "-Current Loc of Group " + node.position + "/" + data.pos); 
                    }
                },
                //new go.Binding("position", "pos", go.Point.parse).makeTwoWay(go.Point.stringify),
                $(go.Shape, "Rectangle",
                  { name: "SHAPE", // 取名
                    fill: "transparent",
                    stroke: "transparent",
                  },
                  new go.Binding("desiredSize", "size", go.Size.parse),
                  new go.Binding("fill", "isHighlighted", function(h) { return h ? dropFill : "transparent"; }).ofObject()),
                $(go.Panel,
                    'Vertical',
                    {
                        height: 60
                    },
                    $(go.Picture,
                        { 
                            margin: 10, width: 80, height: 25, 
                            background: "transparent", alignment: go.Spot.BottomCenter,
                            source:truckimg
                        },
                        new go.Binding("source", "url")),
                    $(go.TextBlock,     // group title near top, next to button
                        { font: "10pt Sans-Serif", stroke:"#607d8b" },
                        new go.Binding("text", "name"))                    
                    )
            ));

        myDiagram.groupTemplateMap.add("OfTrain", //火车
            $(go.Group, "Auto",
                {
                    layerName: "BoxArea",
                    resizable:  false, //不能改变大小
                    movable: false, //不能移动
                    selectionAdorned: false, //选中后不显示选中框
                    click: function(e, node) {
                       var data = node.data;
                       showMessage(node.key + "-Current Loc of Group " + node.position + "/" + data.pos); 
                    }
                },
                new go.Binding("position", "pos", go.Point.parse).makeTwoWay(go.Point.stringify),
                $(go.Shape, "Rectangle",
                  { name: "SHAPE", // 取名
                    fill: "transparent",
                    stroke: "transparent",
                  },
                  new go.Binding("desiredSize", "size", go.Size.parse),
                  new go.Binding("fill", "isHighlighted", function(h) { return h ? dropFill : "transparent"; }).ofObject()),
                $(go.Panel,
                    'Position',
                    {
                        height: 60
                    },
                    $(go.Picture,
                        { 
                            width: 100, height: 15,  position: new go.Point(0, 25),
                            background: "transparent", alignment: go.Spot.BottomCenter,
                            source:trainimg
                        },
                        new go.Binding("source", "url")),
                    $(go.TextBlock,     // group title near top, next to button
                        { font: "10pt Sans-Serif", stroke:"#001529",position: new go.Point(20, 45), },
                        new go.Binding("text", "name"))                    
                    )
            ));

        //Palette 箱场布局
        myPaletteArea =
          $(go.Palette, "myPaletteArea",
            { // share the templates with the main Diagram
              nodeTemplate: myDiagram.nodeTemplate,
              groupTemplate: myDiagram.groupTemplate,
              //layout: $(go.GridLayout)
            });

        myPaletteArea.model = new go.GraphLinksModel([
            {"key":"BoxArea", "name":"箱区", "isGroup":true, "category":"OfGroups", 
                    "size-sm":"60 42","size":"600 420", "color":"#9bab88","stroke":"rgba(128,128,128,0.4)"},
            {"key":"TruckArea","name":"集卡", "isGroup":true, "category":"OfGroupsT", 
                    "size-sm":"122 10","size":"1220 100", "color":"#95c3bf","stroke":"rgba(128,128,128,0.4)"},
            {"key":"TrainArea", "name":"股道", "isGroup":true, "category":"OfGroupsT", 
                    "size-sm":"122 6","size":"1220 60", "color":"#758790","stroke":"rgba(128,128,128,0.4)"},
            {"key":"CraneArea", "name":"龙门吊轨道", "isGroup":true, "category":"OfGroups", 
                    "size-sm":"126 2","size":"1260 20", "color":"#333","stroke":"rgba(128,128,128,0.4)"},       
        ]);

        // 画布坐标
        var gradScaleHoriz = //横坐标
          $(go.Node, "Graduated",
            { 
              graduatedTickUnit: 10, pickable: false, layerName: "Foreground",
              isInDocumentBounds: false, isAnimated: false
            },
            $(go.Shape, { geometryString: "M0 0 H400" }),
            $(go.Shape, { geometryString: "M0 0 V3", interval: 1 }),
            $(go.Shape, { geometryString: "M0 0 V15", interval: 5 }),
            $(go.TextBlock, 
              { 
                font: "10px sans-serif",
                interval: 5,
                alignmentFocus: go.Spot.TopLeft,
                segmentOffset: new go.Point(0, 7)
              }
            )
          );
        
        var gradScaleVert = //纵坐标
          $(go.Node, "Graduated",
            { 
              graduatedTickUnit: 10, pickable: false, layerName: "Foreground",
              isInDocumentBounds: false, isAnimated: false
            },
            $(go.Shape, { geometryString: "M0 0 V400" }),
            $(go.Shape, { geometryString: "M0 0 V3", interval: 1, alignmentFocus: go.Spot.Bottom }),
            $(go.Shape, { geometryString: "M0 0 V15", interval: 5, alignmentFocus: go.Spot.Bottom }),
            $(go.TextBlock, 
              { 
                font: "10px sans-serif",
                segmentOrientation: go.Link.OrientOpposite,
                interval: 5,
                alignmentFocus: go.Spot.BottomLeft,
                segmentOffset: new go.Point(0, -7)
              }
            )
          );

        // 鼠标移动位置
        gradIndicatorHoriz = //定义鼠标横坐标
          $(go.Node,
            { 
              pickable: false, layerName: "Foreground", visible: false,
              isInDocumentBounds: false, isAnimated: false,
              locationSpot: go.Spot.Top
            },
            $(go.Shape, { geometryString: "M0 0 V15", strokeWidth: 2, stroke: "red" })
          );

        gradIndicatorVert = //定义鼠标纵坐标
          $(go.Node,
            { 
              pickable: false, layerName: "Foreground", visible: false,
              isInDocumentBounds: false, isAnimated: false,
              locationSpot: go.Spot.Left
            },
            $(go.Shape, { geometryString: "M0 0 H15", strokeWidth: 2, stroke: "red" })
          );

        // 初始化标尺
        myDiagram.addDiagramListener("InitialLayoutCompleted", setupScalesAndIndicators);
        myDiagram.addDiagramListener("ViewportBoundsChanged", updateScales);
        myDiagram.addDiagramListener("ViewportBoundsChanged", updateIndicators);
        // 移动鼠标时更新
        myDiagram.toolManager.doMouseMove = function() {
          go.ToolManager.prototype.doMouseMove.call(this);
          updateIndicators();
        }
        myDiagram.toolManager.linkingTool.doMouseMove = function() {
          go.LinkingTool.prototype.doMouseMove.call(this);
          updateIndicators();
        }
        myDiagram.toolManager.draggingTool.doMouseMove = function() {
          go.DraggingTool.prototype.doMouseMove.call(this);
          updateIndicators();
        }
        myDiagram.toolManager.dragSelectingTool.doMouseMove = function() {
          go.DragSelectingTool.prototype.doMouseMove.call(this);
          updateIndicators();
        }
        // No need to override PanningTool since the ViewportBoundsChanged listener will fire

        function setupScalesAndIndicators() {
          var vb = myDiagram.viewportBounds;
          myDiagram.startTransaction("add scales");
          updateScales();
          // Add each node to the diagram
          myDiagram.add(gradScaleHoriz);
          myDiagram.add(gradScaleVert);
          myDiagram.add(gradIndicatorHoriz);
          myDiagram.add(gradIndicatorVert);
          myDiagram.commitTransaction("add scales");
        }

        function updateScales() {
          var vb = myDiagram.viewportBounds;
          myDiagram.startTransaction("update scales");
          // Update properties of horizontal scale to reflect viewport
          gradScaleHoriz.location = new go.Point(vb.x, vb.y);
          gradScaleHoriz.graduatedMin = vb.x;
          gradScaleHoriz.graduatedMax = vb.x + vb.width;
          gradScaleHoriz.elt(0).width = vb.width;
          // Update properties of vertical scale to reflect viewport
          gradScaleVert.location = new go.Point(vb.x, vb.y);
          gradScaleVert.graduatedMin = vb.y;
          gradScaleVert.graduatedMax = vb.y + vb.height;
          gradScaleVert.elt(0).height = vb.height;
          myDiagram.commitTransaction("update scales");
        }

        function updateIndicators() {
          var vb = myDiagram.viewportBounds;
          var mouseCoords = myDiagram.lastInput.documentPoint;
          myDiagram.startTransaction("update indicators");
          // Keep the indicators in line with the mouse as viewport changes or mouse moves
          gradIndicatorHoriz.location = new go.Point(Math.max(mouseCoords.x, vb.x), vb.y);
          gradIndicatorVert.location = new go.Point(vb.x, Math.max(mouseCoords.y, vb.y));
          myDiagram.commitTransaction("update indicators");
        }

        // read in the JSON-format data from the "mySavedModel" element
        this.load();
        //this.init();
    }

    // 监听鼠标移出画布，触发坐标隐藏
    hideIndicators() {
        myDiagram.startTransaction("hide indicators");
        gradIndicatorHoriz.visible = false;
        gradIndicatorVert.visible = false;
        myDiagram.commitTransaction("hide indicators");
      }

    // 监听鼠标移入画布，触发坐标显示
    showIndicators() {
        myDiagram.startTransaction("show indicators");
        gradIndicatorHoriz.visible = true;
        gradIndicatorVert.visible = true;
        myDiagram.commitTransaction("show indicators");
      }

    //放大缩小
    zoomOut() {
        myDiagram.commandHandler.increaseZoom();
    }

    zoomIn() {
        myDiagram.commandHandler.decreaseZoom();
    }

    zoomOri() {
        myDiagram.scale = 1;
    }

    init(){
        SAVE.loadGraph(); //read data and set graphC.diagramValue
    }

    load() {
        var modeljson = graphC.diagramValue;
        console.log("ReadDiagramData:");
        console.log(modeljson);
        myDiagram.model = go.Model.fromJson(modeljson);
    }

    save(){
        var str = myDiagram.model.toJson();
        console.log(str);
        var modeljson = JSON.parse(str); 
        graphC.diagramValue = modeljson;
        console.log("Modal Saved to Json:");
        console.log(graphC.diagramValue);
    }

    changeNum(value){ //改变区域所含节点数
      var cNode = myDiagram.findNodeForKey(this.state.currentNode);
      cNode.data.num = value.toString();
    }

    onChangeW(value) { //通过输入框更新state及节点
      this.setState({currentW: value});
      var cNode = myDiagram.findNodeForKey(this.state.currentNode);
      cNode.width = value*6;
    }

    onChangeH(value) { //通过输入框更新state及节点
      this.setState({currentH: value});
      var cNode = myDiagram.findNodeForKey(this.state.currentNode);
      cNode.height = value*6;
    }

    onChangeRows(value) { //行
      this.setState({Rows: value});
    }

    onChangeCols(value) { //贝
      this.setState({Cols: value});
    }

    constructor(props) {
        super(props);
        //状态值
        this.state = {
            mockdata:[],
            areaList:[],
            groupList:[],
            modalVisible: false,
            currentW:0,
            currentH:0,
            currentX:0,
            currentY:0,
            currentNode:'', //当前节点key
            currentName:'',
            currentNum:'', //当前节点所含子节点
            Rows: 0, //行
            Cols: 0 //贝
        }

        SAVE.clickalert = SAVE.clickalert.bind(this);
        SAVE.saveGraph = SAVE.saveGraph.bind(this);
        SAVE.loadGraph = SAVE.loadGraph.bind(this);
        MODAL.showModal = MODAL.showModal.bind(this);
        MODAL.handleOk = MODAL.handleOk.bind(this);
        MODAL.handleCancel = MODAL.handleCancel.bind(this);
        this.onChangeRows = this.onChangeRows.bind(this);
        this.onChangeCols = this.onChangeCols.bind(this);
        this.onChangeW = this.onChangeW.bind(this);
        this.onChangeH = this.onChangeH.bind(this);
        this.changeNum = this.changeNum.bind(this);
        this.save = this.save.bind(this);
    }

    componentDidMount () {
        this.renderCanvas ();
    }

    render() {
        var width = this.state.currentW;
        var height = this.state.currentH;
        var name = this.state.currentName;
        var cols = this.state.Cols;
        var rows = this.state.Rows;
        return ( 
            <div>
                <Row className="mainBack">
                    <Col span={4} className="pdRight pdLeft">
                        <Row style={{marginTop: 10,marginBottom: 10}}>
                            <Col span={12} style={{paddingRight: 2}}>
                                <Button type="primary" className="loadBtn" onClick = {SAVE.loadGraph}>读取箱场</Button>
                            </Col>
                            <Col span={12} style={{paddingLeft: 2}}>
                                <Button type="primary" className="saveBtn" onClick = {SAVE.saveGraph}>保存箱场</Button>
                            </Col>
                        </Row>
                        <Row>
                            <p className="paragraph">画布控制：</p>
                            <Col span={24}>
                                <Button type="primary" shape="circle" onClick = {this.zoomOut} icon="plus" />
                                <Button type="primary" shape="circle" onClick = {this.zoomIn} icon="minus" />
                            </Col>
                        </Row>
                        <p className="paragraph">箱场元素：</p>
                        <Popover placement="right" content={paletteInfo} title="提示信息">
                            <div id="myPaletteArea" className="paletteArea"></div>
                        </Popover>
                        <Popover placement="right" content={buttonInfo} title="提示信息">
                            <Button type="primary" className="genGroupBtn" onClick = {MODAL.showModal}>模拟箱位</Button>
                        </Popover>
                        <Modal
                            width="300px"
                            title="请输入该箱区所含行贝"
                            visible={this.state.modalVisible}
                            onOk={MODAL.handleOk}
                            onCancel={MODAL.handleCancel}
                            okText="确认"
                            cancelText="取消"
                        >
                            <div className="infoRow">
                                <InputNumber id="currentW" size="small" min={0} max={1000} value={rows} onChange={this.onChangeRows} />
                                <span>行</span>
                            </div>
                            <div className="infoRow">
                                <InputNumber id="currentH" size="small" min={0} max={1000} value={cols} onChange={this.onChangeCols} />
                                <span>贝</span>
                            </div>
                        </Modal>
                        <p className="paragraph">当前区域信息：</p>
                        <div id="" className="infoArea">
                            <p>{name}</p>
                            <div className="infoRow">
                                <span>长</span>
                                <InputNumber size="small" min={0} max={10000} value={width} onChange={this.onChangeW} />
                                <span>米</span>
                            </div>
                            <div className="infoRow">
                                <span>宽</span>
                                <InputNumber size="small" min={0} max={10000} value={height} onChange={this.onChangeH} />
                                <span>米</span>
                            </div>
                        </div>
                        <div id="diagramEventsMsg" className="hide">msg</div>
                    </Col>
                    <Col span={20}>
                        <div style={{ background: '#fff', padding: 0, minHeight: 100, width: '100%' }}>
                            <div id="myDiagramDiv" 
                                style={{'width': '100%', 'height': '700px', 'backgroundColor': '#DAE4E4'}}
                                onMouseOver={this.showIndicators} 
                                onMouseOut={this.hideIndicators}
                            ></div>
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default DiyGraph;