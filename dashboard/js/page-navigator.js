
pageNavigator = {
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
    let self = this;
    
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
    this.obj = document.getElementById("page-navigation");
    this.list = document.getElementById("thumbnail-list");
    this.maxidx = document.getElementById("page-navigation-maxidx");
    this.inputwindow = document.getElementById("page-navigation-idx");
  },

  set: function (max) {
    this.maxidx.value = max;
    this.maxidx.innerHTML = " / " + max;
  },

  on: function () {
    this.obj.style.display = 'block';
    document.getElementById("page-navigation-idx").value = 1;
  },

  off: function () {
    this.obj.style.display = 'none';
    this.idx = 0;
    this.obj.value = 1;
    reactEvent.navigation.removeThumbnails();
  },

  button : function(page){
    this.list.children[page].click();
  },

  select: function (idx) {
    if(this.currentidx == (idx == -1 ? 0 : idx))  return;
       this.currentidx = idx == -1 ? 0 : idx;
    if(!this.list.children[this.currentidx]) return;

    var pre = this.list.getElementsByClassName("selected")[0];
    if (pre)
      pre.classList.remove("selected");
    this.list.children[this.currentidx].classList.add("selected");
    this.list.children[this.currentidx].scrollIntoView({ block: "center" });
    document.getElementById("page-navigation-idx").value = this.currentidx + 1;
  },
}
