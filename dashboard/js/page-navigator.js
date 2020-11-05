
pageNavigator = {
  self: this,
  obj: undefined,
  list: undefined,
  maxidx: undefined,
  inputwindow: undefined,
  currentidx : -1,
  idx: 0,

  leftbtn: undefined,
  rightbtn: undefined,
  lastleftbtn: undefined,
  lastrightbtn: undefined,
  inputevent: undefined,

  epubsetting: function () {
    this.leftbtn = function () {
      rendition.prev();
    };

    this.rightbtn = function () {
      rendition.next();
    };

    this.lastleftbtn = function () {
      rendition.display(0);
    }

    this.lastrightbtn = function () {
      rendition.display(this.maxidx.value - 1);
    }

    this.inputevent = function () {
      var idx = Math.max(1, Math.min(this.maxidx.value, this.inputwindow.value));
      this.inputwindow.value = idx;
      rendition.display(idx - 1);
    }
  },

  pdfsetting: function () {
    let self = this.self;

    this.leftbtn = function () {
      this.button(Math.max(0, this.currentidx-1));
    }

    this.rightbtn = function () {
      this.button(Math.min(this.maxidx.value-1, this.currentidx+1));
    };

    this.lastleftbtn = function () {
      this.button(0);
    }

    this.lastrightbtn = function () {
      this.button(this.maxidx.value-1);
    }

    this.inputevent = function () {
      var idx = Math.max(1, Math.min(self.maxidx.value, this.inputwindow.value)) - 1;
      this.inputwindow.value = idx;
      this.button(idx);
    }
  },

  init: function () {
    this.self = this;
    let self = this.self;


    this.obj = document.getElementById("epub-navi");
    this.list = document.getElementById("thumbnail-list");
    this.maxidx = document.getElementById("epubmaxidx");
    this.inputwindow = document.getElementById("epubidx");

    this.inputwindow.addEventListener("change", function (e) {
      self.inputevent();
    })

    document.getElementById('prev').addEventListener('click', function () {
      self.leftbtn();
    });

    document.getElementById('next').addEventListener('click', function () {
      self.rightbtn();
    });

    document.getElementById('lprev').addEventListener('click', function () {
      self.lastleftbtn();
    });

    document.getElementById('lnext').addEventListener('click', function () {
      self.lastrightbtn();
    });

    document.getElementById("epub-collapse").addEventListener('click', function () {
      if (this.classList.contains("closed")) {
        $(self.obj).animate({ "height": "95%" });
        this.classList.remove("closed")
        this.style.transform = "rotate(-90deg)";
      }
      else {
        $(self.obj).animate({ "height": "93px" });
        this.classList.add("closed")
        this.style.transform = "rotate(90deg)";
      }
    })
  },
  set: function (max) {
    this.maxidx.value = max;
    this.maxidx.innerHTML = " / " + max;
  },
  on: function () {
    this.obj.style.display = 'block';
    document.getElementById("epubidx").value = 1;
  },
  off: function () {
    this.obj.style.display = 'none';
    this.idx = 0;
    this.obj.value = 1;
    this.removethumbnail();
  },
  push: function (element, clickevent) {
    var box = document.createElement("div");
    box.appendChild(element);
    box.className = "thumbnail";
    box.setAttribute("idx", this.idx);
    box.addEventListener("click", clickevent);
    this.list.appendChild(box);
    this.idx++;

    if(!connection.extra.roomOwner && classroomInfo.allControl)
      box.style.pointerEvents = 'none';

  },

  button : function(idx){
    this.list.children[idx].click();
  },

  select: function (idx) {
    if(this.currentidx == (idx == -1 ? 0 : idx)) 
      return;

    this.currentidx = idx == -1 ? 0 : idx;

    if(!this.list.children[this.currentidx]){
      return;
    }

    var pre = this.list.getElementsByClassName("selected")[0];
    if (pre)
      pre.classList.remove("selected");
    this.list.children[this.currentidx].classList.add("selected");
    this.list.children[this.currentidx].scrollIntoView({ block: "center" });
    document.getElementById("epubidx").value = this.currentidx + 1;
  },
  removethumbnail: function () {
    this.idx = 0;
    while (this.list.children.length) {
      this.list.removeChild(this.list.children[0]);
    }
  }
}
