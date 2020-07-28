PageNavigator = {
    obj : undefined,
    idx : 0,

    init : function(){
        this.obj = document.getElementById("epub-navi");
        var epubidxinput = document.getElementById("epubidx");
        epubidxinput.addEventListener("change", function(e){
          var idx = Math.max(1, Math.min(document.getElementById("epubmaxidx").value, this.value));
          this.value = idx;
          rendition.display(idx-1);
        })
      
        document.getElementById('prev').addEventListener('click',function () {
          rendition.prev();  
        });
      
        document.getElementById('next').addEventListener('click',function(){
          rendition.next();  
        });
      
        document.getElementById('lprev').addEventListener('click',function(){
          rendition.display(0);
        });
      
        document.getElementById('lnext').addEventListener('click',function(){
          rendition.display(document.getElementById("epubmaxidx").value-1);
        });
      
        document.getElementById("epub-collapse").addEventListener('click', function(){
          if(this.classList.contains("closed")){
            $(this.obj).animate({"height": "95%"});
            this.classList.remove("closed")
            this.style.transform = "rotate(-90deg)";
          }
          else{
            $(this.obj).animate({"height": "93px"});
            this.classList.add("closed")
            this.style.transform = "rotate(90deg)";
          }
        })
    },
    set : function(max){
        document.getElementById("epubmaxidx").value = max;
        document.getElementById("epubmaxidx").innerHTML = " / " + max;
    },
    on : function(){
        console.log(this.obj)
        this.obj.style.display = 'block';
        this.obj.value = 1;
        this.idx = 0;
    },
    off : function(){
        this.obj.style.display = 'none';
    },
    push : function(element, clickevent){
        var box = document.createElement("div");
        box.appendChild(element);
        box.className = "thumbnail";
        box.setAttribute("idx",this.idx);
        box.addEventListener("click", clickevent);
        document.getElementById("thumbnail-list").appendChild(box);
        this.idx ++;
    },
}
