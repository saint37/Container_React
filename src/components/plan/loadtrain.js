import React, { Component } from 'react';
import axios from 'axios';
import go from 'gojs';
import './train.css';
import { Row, Col, Button, Input, Modal, DatePicker } from 'antd';
import INIT from './init';
import PLAN from './plan';
import graphC from './graphC';
import containerimg from '../assets/container-current.png';
import truckimg from '../assets/truck.png';
import trainimg from '../assets/train.png';
import craneimg from '../assets/crane.png';

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

class LoadTrain extends Component {
    renderCanvas () {
        let _self = this;
        //global
        function showMessage(s) {
            console.log(s);
        }

        function showBox(mousePT, node){
            _self.setState({
                showBox:true
            });
            var box = document.getElementById("currentBox");
            var s = "箱号：<br/>" + node.data.name;
            box.innerHTML = s;
            box.style.left = mousePT.x + 20 + "px";
            box.style.top = mousePT.y + "px";
        }

        function hideBox(node){
            _self.setState({
                showBox:false
            });
        }

        function isBox(group, node) { //拖拽对象只能为顶层箱子
            if (node instanceof go.Group) return false;  // don't add Groups to Groups
            else if ((node.data.layer !== node.containingGroup.memberParts.count) 
                && node.data.layer !== 0 && node.data.layer !== 3 && node.data.layer !== 4) return false; 
            else return true;
        };

        function placebox(box,grp,n) {
            box.position.x = grp.position.x;
            box.position.y = grp.position.y + 20*(2-n);
            box.moveTo(box.position.x,box.position.y);
            //改变data中的pos，同position保持一致
            box.data.pos = go.Point.stringify(new go.Point(box.position.x, box.position.y));
        }

        function placetruck(box,grp,n) {
            box.position.x = grp.position.x + 30;
            box.position.y = grp.position.y + 10;
            box.moveTo(box.position.x,box.position.y);
            //改变data中的pos，同position保持一致
            box.data.pos = go.Point.stringify(new go.Point(box.position.x, box.position.y));
        }

        function placetrain(box,grp,n) {
            box.position.x = grp.position.x + 10 + (n-1)*40;
            box.position.y = grp.position.y + 5;
            box.moveTo(box.position.x,box.position.y);
            //改变data中的pos，同position保持一致
            box.data.pos = go.Point.stringify(new go.Point(box.position.x, box.position.y));
        }

        function highlightGroup(grp, show) {
          if (!grp) return;
          if (show) {  // check that the drop may really happen into the Group
              grp.isHighlighted = true;
              return;
          }
          grp.isHighlighted = false;
        }

        myDiagram = //定义画布
        $(go.Diagram, "myDiagramDiv",
        {
            //"toolManager.mouseWheelBehavior":go.ToolManager.WheelNone,//鼠标滚轮事件禁止
            //initialContentAlignment: go.Spot.Center, // 画布居中
            //显示网格
            grid: $(go.Panel, "Grid",
              { gridCellSize: CellSize },
              $(go.Shape, "LineH", { stroke: "lightgray" }),
              $(go.Shape, "LineV", { stroke: "lightgray" })
            ),
            //scrollMode: go.Diagram.InfiniteScroll,  // 可以滚动
            padding: 0,  // 边距为0
            "undoManager.isEnabled": true, // 可以撤销
            allowZoom: true, // 可以缩放
            initialAutoScale: go.Diagram.Uniform,
            initialScale:0.8,
            initialContentAlignment: go.Spot.Center,
            //allowDrop: true, // 可以释放拖拽对象
            //allowDragOut: true, //可以拖出
            //"draggingTool.isGridSnapEnabled": true, // 对齐网格拖拽
            maxSelectionCount: 1, //最多选择一个节点
            "SelectionDeleted":function (e) { //删除节点时，更新state记录的json
                var node = e.subject.first();
                //console.log(node);
                PLAN.showDelete(_self,node);
            },
        });

        myDiagram.groupTemplateMap.add("OfGroups", //划分箱区
            $(go.Group, "Horizontal",
                {
                    layerName: "Background",
                    movable: false, //不能移动
                    selectionAdorned: false, //选中后不显示选中框
                    click: function(e, node) {
                       var data = node.data;
                       showMessage(node.key + "-Current Loc of Group " + node.position + "/" + data.pos); 
                    },
                    mouseDragEnter: function(e, grp, prev) { //不能拖拽节点到区域上
                        grp.diagram.currentCursor = "not-allowed";
                    },
                    mouseDrop: function(e, grp) {
                        showMessage("can't move"); 
                        grp.diagram.currentTool.doCancel();
                    }
                },
                new go.Binding("position", "pos", go.Point.parse).makeTwoWay(go.Point.stringify),
                //Point.parse允许位置以字符串（“100 50”）的形式来指定，而不是作为一个表达式的点。
                //Point.stringify可以将位置信息输出成字符串string类型，用node.data.pos来取。
                $(go.Shape, "Rectangle",
                  { name: "SHAPE", // 取名
                    stroke: "rgba(128,128,128,0.4)"
                  },
                  new go.Binding("desiredSize", "size", go.Size.parse),
                  new go.Binding("fill", "color")),
            ));

        myDiagram.groupTemplateMap.add("OfGroupsT", //划分集卡，火车区域
            $(go.Group, "Horizontal",
                {
                    layerName: "Background",
                    movable: false, //不能移动
                    selectionAdorned: false, //选中后不显示选中框
                    click: function(e, node) {
                       var data = node.data;
                       console.log(node);
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
                            comparer: function(pa, pb) {
                                var da = pa.data;
                                var db = pb.data;
                                if (da.cisPos > db.cisPos) return 1;
                                if (da.cisPos < db.cisPos) return -1;
                                return 0;
                            }
                        })
                },
                new go.Binding("position", "pos", go.Point.parse).makeTwoWay(go.Point.stringify),
                $(go.Shape, "Rectangle",
                  { name: "SHAPE", // 取名
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
                    memberValidation: isBox, 
                    defaultAlignment: go.Spot.Bottom,
                    computesBoundsAfterDrag: true,
                    selectionAdorned: false, //选中后不显示选中框
                    click: function(e, node) {
                       var data = node.data;
                       showMessage(node.key + "-Current Loc of Group " + node.position + "/" + data.pos); 
                       console.log(node);
                    },
                    mouseDragEnter: function(e, grp, prev) { 
                        if (grp.canAddMembers(grp.diagram.selection)) {
                            highlightGroup(grp, true); 
                        }
                    },
                    mouseDragLeave: function(e, grp, next) {
                        highlightGroup(grp, false);
                        // var box = grp.diagram.toolManager.draggingTool.currentPart;
                        // PLAN.setCurrentState(_self,box,grp); 
                    },
                    mouseDrop: function(e, grp) {
                        if (grp.canAddMembers(grp.diagram.selection)) {
                            grp.addMembers(grp.diagram.selection, true); //绑定箱到新箱位
                            var box = grp.diagram.toolManager.draggingTool.currentPart; //当前箱
                            var boxnum = grp.memberParts.count; //当前箱位所含箱数
                            var type = box.data.type;
                            // console.log(boxnum);
                            // console.log(type);
                            showMessage( box.key + "-Droped at-" + grp.key + " on " + grp.position + "/" + grp.data.pos);
                            if(type === "40") {
                                var nextgrpkey = "G"+ (parseInt(grp.key.slice(1))+1);
                                var nextgrp = grp.diagram.findPartForKey(nextgrpkey);
                                //console.log(nextgrp);
                                // 40尺箱拖拽的容器后面为空容器的时，才能放置
                                if(nextgrp) {
                                    if(boxnum <= 2){
                                        placebox(box,grp,boxnum);
                                        box.data.layer = boxnum;
                                    }
                                }
                                else {
                                    grp.diagram.currentTool.doCancel();
                                }
                            }
                            else if(type === "20"){
                                var prevgrpkey = "G"+ (parseInt(grp.key.slice(1))-1);
                                var prevgrp = grp.diagram.findPartForKey(prevgrpkey);
                                //console.log(prevgrp);
                                // 20尺箱拖拽的容器前面容器含有40尺箱时，将此箱放置在第二层
                                if(prevgrp && prevgrp.memberParts.first()){
                                    var b = prevgrp.memberParts.first();
                                    //console.log(b.data.type);
                                    if(b.data.type === "40"){
                                        placebox(box,grp,2);
                                        box.data.layer = boxnum;
                                    }
                                    else{
                                        if(boxnum <= 2){
                                            placebox(box,grp,boxnum);
                                            box.data.layer = boxnum;
                                        } 
                                    }
                                }
                                else{
                                    if(boxnum <= 2){
                                        placebox(box,grp,boxnum);
                                        box.data.layer = boxnum;
                                    } 
                                }
                            }
                            else{ showMessage("can't move"); grp.diagram.currentTool.doCancel();}      
                        }
                        else {grp.diagram.currentTool.doCancel();}
                    },
                },
                new go.Binding("position", "pos", go.Point.parse).makeTwoWay(go.Point.stringify),
                //Point.parse允许位置以字符串（“100 50”）的形式来指定，而不是作为一个表达式的点。
                //Point.stringify可以将位置信息输出成字符串string类型，用node.data.pos来取。
                $(go.Panel,
                'Vertical',
                { height: 50 },
                $(go.Shape, "Rectangle",
                    {
                    fill: groupFill,
                    stroke: groupStroke,
                    },
                    new go.Binding("desiredSize", "size", go.Size.parse),
                    new go.Binding("fill", "isHighlighted", function(h) { return h ? dropFill : groupFill; }).ofObject(),
                    new go.Binding("stroke", "isHighlighted", function(h) { return h ? dropStroke: groupStroke; }).ofObject()),
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
                    memberValidation: isBox,
                    selectionAdorned: false, //选中后不显示选中框
                    click: function(e, node) {
                       var data = node.data;
                       showMessage(node.key + "-Current Loc of Group " + node.position + "/" + data.pos); 
                    },
                    mouseDragEnter: function(e, grp, prev) {
                        if (grp.canAddMembers(grp.diagram.selection)) {
                            highlightGroup(grp, true); 
                        }
                    },
                    mouseDragLeave: function(e, grp, next) { 
                        highlightGroup(grp, false); 
                        // var box = grp.diagram.toolManager.draggingTool.currentPart;
                        // PLAN.setCurrentState(_self,box,grp); 
                    },
                    mouseDrop: function(e, grp) {
                        if (grp.canAddMembers(grp.diagram.selection)) {
                            grp.addMembers(grp.diagram.selection, true); //绑定箱到集卡
                            var box = grp.diagram.toolManager.draggingTool.currentPart;
                            var boxnum = grp.memberParts.count; //当前集卡所含箱数
                            console.log(boxnum);
                            showMessage( box.key + "-Droped at-" + grp.key + " on " + grp.position + "/" + grp.data.pos);
                            if(boxnum <= 1){
                                placetruck(box,grp,boxnum);
                                box.data.layer = 0;
                            }
                            else{ showMessage("can't move"); grp.diagram.currentTool.doCancel();}      
                        }
                        else {grp.diagram.currentTool.doCancel();}
                    }
                },
                //new go.Binding("position", "pos", go.Point.parse).makeTwoWay(go.Point.stringify),
                $(go.Shape, "Rectangle",
                  { 
                    fill: "transparent",
                    stroke: "transparent",
                    desiredSize: new go.Size(80, 60),
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
                    memberValidation: isBox,
                    selectionAdorned: false, //选中后不显示选中框
                    click: function(e, node) {
                       var data = node.data;
                       showMessage(node.key + "-Current Loc of Group " + node.position + "/" + data.pos); 
                    },
                    mouseDragEnter: function(e, grp, prev) {
                        if (grp.canAddMembers(grp.diagram.selection)) {
                            highlightGroup(grp, true); 
                        }
                    },
                    mouseDragLeave: function(e, grp, next) { 
                        highlightGroup(grp, false);
                    },
                    mouseDrop: function(e, grp) {
                        if (grp.canAddMembers(grp.diagram.selection)) {
                            grp.addMembers(grp.diagram.selection, true); //绑定箱到集卡
                            var box = grp.diagram.toolManager.draggingTool.currentPart;
                            var boxnum = grp.memberParts.count; //当前集卡所含箱数
                            //console.log(box);
                            showMessage( box.key + "-Droped at-" + grp.key + " on " + grp.position + "/" + grp.data.pos);
                            if(boxnum === 1){
                                placetrain(box,grp,1);
                                box.data.layer = 3; //第一个箱
                                if(box.data.isPlan === "1"){
                                    PLAN.showUpdate(_self,box);
                                }
                                else{
                                    PLAN.showAdd(_self,box);
                                }
                            }
                            else if(boxnum === 2){
                                var cBox = grp.memberParts.first();
                                if(cBox.data.layer === 3){
                                    placetrain(box,grp,2);
                                    box.data.layer = 4;
                                }
                                else if(cBox.data.layer === 4){
                                    placetrain(box,grp,1);
                                    box.data.layer = 3;
                                }
                                if(box.data.isPlan === "1"){
                                    PLAN.showUpdate(_self,box);
                                }
                                else{
                                    PLAN.showAdd(_self,box);
                                }
                            }
                            else{ showMessage("can't move"); grp.diagram.currentTool.doCancel();}
                        }
                    },
                },
                new go.Binding("position", "pos", go.Point.parse).makeTwoWay(go.Point.stringify),
                $(go.Shape, "Rectangle",
                  {
                    fill: "transparent",
                    stroke: "transparent",
                    desiredSize: new go.Size(100, 60),
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

        myDiagram.groupTemplateMap.add("OfCrane", //龙门吊
            $(go.Group, "Auto",
                {
                    layerName: "Crane",
                    resizable:  false, //不能改变大小
                    //movable: false, //不能移动
                    selectionAdorned: false, //选中后不显示选中框
                    click: function(e, node) {
                       var data = node.data;
                       showMessage(node.key + "-Current Loc of Group " + node.position + "/" + data.pos); 
                    }
                },
                new go.Binding("position", "pos", go.Point.parse).makeTwoWay(go.Point.stringify),
                $(go.Shape, "Rectangle",
                  { name: "SHAPE", // 取名
                    fill: "#9f020a",
                    stroke: "transparent",
                  },
                  new go.Binding("desiredSize", "size", go.Size.parse)),
                $(go.Picture,
                    { 
                        margin: 0, width: 20, height: 560, 
                        background: "transparent", alignment: go.Spot.BottomCenter,
                        source:craneimg
                    }),
            ));

        myDiagram.nodeTemplate = //定义箱子
            $(go.Node, "Auto",
                {   selectionAdorned: true,
                    click: function(e, node) { 
                        var data = node.data;
                        showMessage(node.key + "-" + data.group + ":" + node.position + "/" + data.pos); 
                        //PLAN.setSingle(_self,node);
                    },
                    mouseEnter: function (e, obj) { 
                        //console.log(e.viewPoint);
                        showBox(e.viewPoint, obj.part); 
                    },
                    mouseLeave: function (e, obj) { hideBox(obj.part); },
                    mouseDrop: function(e, node) { 
                        // disallow dropping anything onto an "item"
                        showMessage("can't move");
                        node.diagram.currentTool.doCancel();
                    }
                },
                new go.Binding("position", "pos", go.Point.parse).makeTwoWay(go.Point.stringify),
                $(go.Shape, "Rectangle",
                    {
                        fill: "#1890ff",
                        stroke: "rgba(128,128,128,0.4)",
                    },
                    new go.Binding("desiredSize", "size", go.Size.parse)),
                $(go.Picture,
                    { 
                        margin: 0, height: 20, background: "gray", source:containerimg,
                        imageStretch: go.GraphObject.Fill
                    },
                    new go.Binding("source", "url")),
            );

        // show feedback during the drag in the background
        myDiagram.mouseDragOver = function(e) {
            e.diagram.currentCursor = "not-allowed";
        };
        // disallow dropping in the background
        myDiagram.mouseDrop = function(e) {
            e.diagram.currentTool.doCancel();
        };

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

    getCurrentPos(grp,n){ //获取节点原位置
      var cGrp = myDiagram.findNodeForKey(grp);
      var x = cGrp.position.x;
      var y = cGrp.position.y + 20*(3-n);
      x = x.toFixed(2);
      y = y.toFixed(2);
      var str = x + " " + y;
      return str;
    }

    init(){
        INIT.initDiagram(); //read data and set graphC.diagramValue
    }

    load() {
        //var modeljson = JSON.stringify(this.state.diagramValue);
        var modeljson = graphC.diagramValue;
        console.log("ReadDiagramData:");
        console.log(modeljson);
        myDiagram.model = go.Model.fromJson(modeljson);
    }

    onChangeTime(value, dateString) { //改变时间
        console.log('Formatted Selected Time: ', dateString);
        this.setState({
          planDate: dateString
        });
    }

    onOk(value) {
        console.log('onOk: ', value);
    }

    onChangeName(e) { //当前箱号
        this.setState({
            currentName:e.target.value
        });
    }

    //显隐操作
    showSingle(){ //显示单箱计划输入框
        let _self = this;
        _self.setState({
            showSingle: !_self.state.showSingle
        });
    }
    hideAdd(){
        let _self = this;
        _self.setState({
          showAdd: false
        });
    }
    hideUpdate(){
        let _self = this;
        _self.setState({
          showUpdate: false,
        });
    }
    hideDelete(){
        let _self = this;
        _self.setState({
          showDelete: false,
        });
    }

    constructor(props) {
        super(props)
        //状态值
        this.state = {
            mockdata:[],
            title:'装火车',
            currentName:'', //当前箱号
            currentId:'', //当前箱id
            planType:'ZM01', //ZM01:装火车、ZM03:卸火车、ZM05:装集卡、ZM07:卸集卡、ZM09:站内搬移
            planDate:'', //计划时间
            planFrom: '',
            planContainer:'',
            showAdd: false, //是否展示新增计划输入框
            showUpdate: false, //是否展示更改计划输入框
            showDelete: false, //是否展示删除计划框
            showSingle: false, //显示输入箱号
            showBox: false, //是否显示箱子信息
        }

        INIT.initDiagram = INIT.initDiagram.bind(this);
        PLAN.showAdd = PLAN.showAdd.bind(this);
        this.hideAdd = this.hideAdd.bind(this);
        PLAN.addPlan = PLAN.addPlan.bind(this);
        PLAN.updatePlan = PLAN.updatePlan.bind(this);
        PLAN.deletePlan = PLAN.deletePlan.bind(this);
        this.showSingle = this.showSingle.bind(this);
        PLAN.setSingle = PLAN.setSingle.bind(this);
        PLAN.initPlanSingle = PLAN.initPlanSingle.bind(this);
        PLAN.showUpdate = PLAN.showUpdate.bind(this);
        this.hideUpdate = this.hideUpdate.bind(this);
        PLAN.showDelete = PLAN.showDelete.bind(this);
        this.hideDelete = this.hideDelete.bind(this);
        this.onChangeTime = this.onChangeTime.bind(this);
        this.onChangeName = this.onChangeName.bind(this);
    }

    componentDidMount () {
        this.renderCanvas ();
    }

    render() {
        var title = this.state.title;
        var currentName = this.state.currentName;
        var currentId = this.state.currentId;
        var showSingle = this.state.showSingle;
        var showBox = this.state.showBox;
        return (
            <div>
                <Row className="mainBack">
                    <Col span={4} className="pdRight pdLeft">
                        <h2 className="title">{title}</h2>
                        <Row>
                            <Col span={24}>
                                <Button type="primary" className="loadBtn mgTop" onClick = {INIT.initDiagram} >实时展示箱场</Button>
                                <Button type="primary" className="fluid mgTop" onClick = {PLAN.infoAdd} >新增计划</Button>
                                <Button type="primary" className="fluid mgTop" onClick = {this.showSingle} >更新计划</Button>
                            </Col>
                        </Row>
                        <Row className="planRow">
                            <Col span={24} id="planSingle" className={showSingle ? "tlt" : "tlt hide"}>
                                <p className="paragraph">请输入箱号：</p>
                                <Input placeholder="箱号" value={currentName} onChange={this.onChangeName} />
                                <Button type="primary" className="showBtn" onClick = {PLAN.initPlanSingle} >确认</Button>
                            </Col>
                        </Row>
                        <Row>
                            <p className="paragraph">画布控制：</p>
                            <Col span={24}>
                                <Button type="primary" shape="circle" onClick = {this.zoomOut} icon="plus" />
                                <Button type="primary" shape="circle" onClick = {this.zoomIn} icon="minus" />
                            </Col>
                        </Row>
                    </Col>
                    <Col span={20}>
                        <div style={{ background: '#fff', padding: 0, minHeight: 100, width: '100%' }}>
                            <div id="myDiagramDiv" 
                                style={{'width': '100%', 'height': '700px', 'backgroundColor': '#DAE4E4'}}
                                onMouseOver={this.showIndicators} 
                                onMouseOut={this.hideIndicators}
                            >
                            </div>
                            <div id="currentBox" className={showBox ? "showBox" : "showBox hide"}></div>
                        </div>
                    </Col>
                </Row>
                <Modal
                  title="新增计划"
                  visible={this.state.showAdd}
                  onOk={PLAN.addPlan}
                  onCancel={this.hideAdd}
                  okText="确认"
                  cancelText="取消"
                >
                    <Row className="AddplanRow">
                        <Col span={6} className="lable">箱号：</Col>
                        <Col span={18}><Input placeholder="箱号" value={currentName} readOnly/></Col>
                    </Row>
                    <Row className="AddplanRow">
                        <Col span={6} className="lable">计划时间：</Col>
                        <DatePicker
                          showTime
                          format="YYYY-MM-DD HH:mm:ss"
                          placeholder="选择计划时间"
                          onChange={this.onChangeTime}
                          onOk={this.onOk}
                        />
                    </Row>
                    <Row className="AddplanRow">
                    {currentName}
                    </Row>
                </Modal>
                <Modal
                  title="修改计划"
                  visible={this.state.showUpdate}
                  onOk={PLAN.updatePlan}
                  onCancel={this.hideUpdate}
                  okText="确认"
                  cancelText="取消"
                >
                    <Row className="AddplanRow">
                        <Col span={6} className="lable">箱号：</Col>
                        <Col span={18}><Input placeholder="箱号" value={currentName} readOnly/></Col>
                    </Row>
                    <Row className="AddplanRow">
                        <Col span={6} className="lable">计划时间：</Col>
                        <DatePicker
                          showTime
                          format="YYYY-MM-DD HH:mm:ss"
                          placeholder="选择计划时间"
                          onChange={this.onChange}
                          onOk={this.onOk}
                        />
                    </Row>
                    <Row className="AddplanRow">
                    {currentName}
                    </Row>
                </Modal>
                <Modal
                  title="删除计划"
                  visible={this.state.showDelete}
                  onOk={PLAN.deletePlan}
                  onCancel={this.hideDelete}
                  okText="确认"
                  cancelText="取消"
                >
                    <Row className="AddplanRow">
                        <Col span={6} className="lable">箱号：</Col>
                        <Col span={18}><Input placeholder="箱号" value={currentName} readOnly/></Col>
                    </Row>
                    <Row className="AddplanRow">
                    {currentName}
                    </Row>
                </Modal>
            </div>
        );
    }
}

export default LoadTrain;