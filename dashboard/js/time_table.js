
DayKor = ["월" , "화", "수", "목", "금", "토", "일"];
DaySubject = [["사회" , "미술", "과학", "과학", "수학", "토", "일"],
              ["과학" , "체육", "수학", "국어", "기가", "토", "일"],
              ["영어" , "사회", "영어", "영어", "국어", "토", "일"],
              ["국어" , "역사", "국어", "도덕", "도덕", "토", "일"],
              ["진로" , "기주", "기가", "사회", "체육", "토", "일"],
              ["수학" , "소주", "체육", "음악", "역사", "토", "일"],
              ["" , "과주", "", "스클", "", "토", "일"]              
              ];
Colors = {};
Colors.names = {
    aqua: "#00ffff",
    azure: "#f0ffff",
    beige: "#f5f5dc",
    black: "#000000",
    blue: "#0000ff",
    brown: "#a52a2a",
    cyan: "#00ffff",
    darkblue: "#00008b",
    darkcyan: "#008b8b",
    darkgrey: "#a9a9a9",
    darkgreen: "#006400",
    darkkhaki: "#bdb76b",
    darkmagenta: "#8b008b",
    darkolivegreen: "#556b2f",
    darkorange: "#ff8c00",
    darkorchid: "#9932cc",
    darkred: "#8b0000",
    darksalmon: "#e9967a",
    darkviolet: "#9400d3",
    fuchsia: "#ff00ff",
    gold: "#ffd700",
    green: "#008000",
    indigo: "#4b0082",
    khaki: "#f0e68c",
    lightblue: "#add8e6",
    lightcyan: "#e0ffff",
    lightgreen: "#90ee90",
    lightgrey: "#d3d3d3",
    lightpink: "#ffb6c1",
    lightyellow: "#ffffe0",
    lime: "#00ff00",
    magenta: "#ff00ff",
    maroon: "#800000",
    navy: "#000080",
    olive: "#808000",
    orange: "#ffa500",
    pink: "#ffc0cb",
    purple: "#800080",
    violet: "#800080",
    red: "#ff0000",
    silver: "#c0c0c0",
    white: "#ffffff",
    yellow: "#ffff00"
};
Colors.random = function() {
    var result;
    var count = 0;
    for (var prop in this.names)
        if (Math.random() < 1/++count)
           result = prop;
    return result;
};
ClassList = {};
ActiveClassList = [];


MakeTimeTable("time_table", 7, 5);

function MakeTimeTable(id, time, day){
    var table = document.getElementById(id);
    var d = table.insertRow(0);
    d.insertCell(0);
    d.className = "day";

    for(var i = 0 ; i < day; i++){
        var c =  d.insertCell(d.length);
        c.innerHTML = DayKor[i];
        c.className = "time"
    }

    for(var i = 1 ; i <= time; i++){
        var row = table.insertRow(i);
        var cell = row.insertCell(0);
        cell.innerHTML = i + "교시";
        cell.className = "time";
        
        for(var z = 1 ; z <= day ; z++){
            var box = row.insertCell(z);
            
            box.className = "class";
            box.dataset.id = DayKor[z-1] + "-" + i;
            box.setAttribute("onclick", 'ClickClass(\'' + DayKor[z-1] + i + '\')');
            ClassList[DayKor[z-1] + i] = {};
            ClassList[DayKor[z-1] + i].element = box;
            //ClassList[DayKor[z-1] + i].element.innerHTML = "국어"
            box.innerHTML = DaySubject[i-1][z-1];            
        }
    }
}


function ClickClass(roomid){
    var fullName = $('#user-name').val().toString();
    if (!fullName || !fullName.replace(/ /g, '').length) {
        alertBox('이름을 입력해주세요.', '에러');
        return;
    }

    connection.extra.userFullName = fullName;

    connection.checkPresence(roomid, function (isRoomExist) {
        if (isRoomExist === true) {
            joinAHiddenRoom(roomid);
            return;
        }

        CreateClass(roomid);
    });
}

function CreateClass(roomid){
    connection.sessionid = roomid;
    connection.isInitiator = true;
    connection.session.oneway = true;
    var href = location.href + 'classroom.html?open=' + connection.isInitiator + '&sessionid=' + connection.sessionid + '&publicRoomIdentifier=' + connection.publicRoomIdentifier + '&userFullName=' + connection.extra.userFullName;
    window.open(href, "_self");
}

function ActiveClass(rooms){
    rooms.forEach(function(room){
        var id = room.sessionid;

        if(ActiveClassList.indexOf(id) != -1){
            ClassList[id].status = "OK";
            return;
        }

        ClassList[id].status = "OK";
        console.log(id + " CLASS IS OPENED");
        ActiveClassList.push(id);
        ClassList[id].element.style.background = Color();
        ClassList[id].element.innerHTML = room.extra.userFullName + " <br/>선생님의 수업";
    });
    
    ActiveClassList.forEach(function(id){
        if(ClassList[id].status == "OK"){
            ClassList[id].status = "RESET";
        }
        else{
            console.log(id + " CLASS IS CLOSED");
            ClassList[id].element.style.background = "";
            ClassList[id].element.innerHTML = "";
            ActiveClassList.splice( ActiveClassList.indexOf(id),1);
        }
    })
}

  

var Color = function(hue, sat, light) {
    // Settings
    // Play with these to change the types of colors generated
    this.minHue = 0;
    this.maxHue = 360;

    this.minSat = 75;
    this.maxSat = 100;

    this.minLight = 65;
    this.maxLight = 80;

    this.scaleLight = 15;

    this.hue = hue || randomNum(this.minHue, this.maxHue);

    if (this.hue > 288 && this.hue < 316) {
      this.hue = randomNum(316, 360);
    } else if (this.hue > 280 && this.hue < 288) {
      this.hue = randomNum(260, 280);
    }

    this.sat = sat || randomNum(this.minSat, this.maxSat);
    this.light = light || randomNum(this.minLight, this.maxLight);

    this.hsl = 'hsl(' + this.hue + ', ' + this.sat + '%, ' + this.light + '%)';
    return this.hsl;
  };

  var randomNum = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };