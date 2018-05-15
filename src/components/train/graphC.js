var graphC = {
    diagramValue:{
      "class": "go.GraphLinksModel",
      "nodeDataArray": [
        {"key":"CraneArea1", "isGroup":true, "category":"OfGroups", 
            "pos":"-20 110", "size":"1260 10", "color":"#333"},
        {"key":"CraneArea2", "isGroup":true, "category":"OfGroups", 
            "pos":"-20 540", "size":"1260 10", "color":"#333"},
        {"key":"TruckArea", "isGroup":true, "category":"OfGroupsT", 
            "pos":"0 0", "size":"1220 100", "color":"#95c3bf"},
        {"key":"BoxArea1", "isGroup":true, "category":"OfGroups", 
            "pos":"0 120", "size":"600 420", "color":"#9bab88"},
        {"key":"BoxArea2", "isGroup":true, "category":"OfGroups", 
            "pos":"620 120", "size":"600 420", "color":"#9bab88"},
        {"key":"TrainArea", "isGroup":true, "category":"OfGroupsT", 
            "pos":"0 560", "size":"1220 80", "color":"#758790"},
        { "key": "G1", "isGroup": true, "group":"BoxArea", "category":"OfNodes", "size": "40 60","pos":"0 120" },
        { "key": "G2", "isGroup": true, "group":"BoxArea", "category":"OfNodes", "size": "40 60","pos":"50 120" },
        { "key": "G3", "isGroup": true, "group":"BoxArea", "category":"OfNodes", "size": "40 60","pos":"0 190" },
        { "key": "G4", "isGroup": true, "group":"BoxArea", "category":"OfNodes", "size": "40 60","pos":"0 260" },
        { "key": "G5", "isGroup": true, "group":"BoxArea", "category":"OfNodes", "size": "40 60","pos":"0 330" },
        { "key": "G6", "isGroup": true, "group":"BoxArea", "category":"OfNodes", "size": "40 60","pos":"0 400" },
        { "key": "G7", "isGroup": true, "group":"BoxArea", "category":"OfNodes", "size": "40 60","pos":"0 470" },
        { "key": "T1", "isGroup": true, "group":"TruckArea", "category":"OfTruck", "size": "80 60","name":"01010101" },
        { "key": "T2", "isGroup": true, "group":"TruckArea", "category":"OfTruck", "size": "80 60","name":"01010101" },
        { "key": "T3", "isGroup": true, "group":"TruckArea", "category":"OfTruck", "size": "80 60","name":"01010101" },
        { "key": "T4", "isGroup": true, "group":"TruckArea", "category":"OfTruck", "size": "80 60","name":"01010101" },
        { "key": "R1", "isGroup": true, "group":"TrainArea", "category":"OfTrain", "size": "100 60","name":"01010101"},
        { "key": "R2", "isGroup": true, "group":"TrainArea", "category":"OfTrain", "size": "100 60","name":"01010102"},
        { "key": "B1", "id":"11111111", "group": "G1", "size": "40 20", "layer": 2,"pos":"0 140","name":"01010101","url":"http://localhost:8001/images/container-current.png" },
        { "key": "B2", "id":"22222222", "group": "G1", "size": "40 20", "layer": 1,"pos":"0 160","name":"01010102","url":"http://localhost:8001/images/container-plan.png"  },
        { "key": "B3", "id":"33333333", "group": "G4", "size": "40 20", "layer": 1,"pos":"0 300","name":"01010103" },
        { "key": "B4", "id":"44444444", "group": "G6", "size": "40 20", "layer": 1,"pos":"0 440","name":"01010104" },
        { "key": "B5", "id":"55555555", "group": "T1", "size": "40 20", "layer": 0, "pos":"30 10", "name":"01010105" },
        { "key": "B6", "id":"66666666", "group": "T2", "size": "40 20", "layer": 0, "pos":"30 10", "name":"01010106" },
        { "key": "B7", "id":"77777777", "group": "R1", "size": "40 20", "layer": 0, "pos":"10 5", "name":"01010107" },
        { "key": "B8", "id":"88888888", "group": "R1", "size": "40 20", "layer": 0, "pos":"50 5", "name":"01010108" },
        { "key": "L1", "isGroup": true, "group":"CraneArea", "category":"OfCrane", "pos":"-25 100", "size": "20 460"},
        { "key": "L2", "isGroup": true, "group":"CraneArea", "category":"OfCrane", "pos":"1000 100", "size": "20 460"}
      ],
      "linkDataArray": []
    }
};

export default graphC;