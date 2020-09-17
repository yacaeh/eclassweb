
pageNavigator = {
  self: this,
  obj: undefined,
  list: undefined,
  maxidx: undefined,
  inputwindow: undefined,
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
      self.inputwindow.value = Math.max(1, --self.inputwindow.value);
      mfileViewer.updateViewer({
        cmd: "page",
        page: self.inputwindow.value
      })
    }

    this.rightbtn = function () {
      self.inputwindow.value = Math.min(this.maxidx.value, ++self.inputwindow.value);
      mfileViewer.updateViewer({
        cmd: "page",
        page: self.inputwindow.value
      })
    };

    this.lastleftbtn = function () {
      mfileViewer.updateViewer({
        cmd: "page",
        page: 0
      })
    }

    this.lastrightbtn = function () {
      mfileViewer.updateViewer({
        cmd: "page",
        page: this.maxidx.value
      })
    }

    this.inputevent = function () {
      console.log("humm?")
      var idx = Math.max(1, Math.min(self.maxidx.value, this.inputwindow.value));
      this.inputwindow.value = idx;
      mfileViewer.updateViewer({
        cmd: "page",
        page: idx
      })
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
  },
  select: function (idx) {
    if(this.list.children[idx].classList.contains("selected")){
      return;
    }

    var pre = this.list.getElementsByClassName("selected")[0];
    if (pre)
      pre.classList.remove("selected");

    this.list.children[idx].classList.add("selected");
    this.list.children[idx].scrollIntoView({ block: "center" });
    document.getElementById("epubidx").value = idx + 1;
  },
  removethumbnail: function () {
    this.idx = 0;
    while (this.list.children.length) {
      this.list.removeChild(this.list.children[0]);
    }
  }
}
