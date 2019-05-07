$(function(){
    var Self = {
        init:function(){
            Self.initEvent();
            Self.setActiveTab();
            Self.getGalleryList(); 
            
        },
        data_store:{
            listCount:4
        },
        initEvent:function(){
            $("#navbarCollapse .nav-item").off("click").on("click",function(e){
                var target = $(e.currentTarget).find(".nav-link").eq(0).attr("href").substr(1);
                
                if($(document).width()<768){
                    $(".navbar-toggler").trigger("click")
                }
                Self.setActiveTab(target);
            });
            
            //load more data;
            $(".more_button").off("click").on("click",function(){
                Self.data_store.listCount+=4;
                Self.getGalleryList()
            })

            $("#create_model").off("click").on("click",function(){
                var data = {
                    model_name:$("#model_name").val(),
                    model_des:$("#model_des").val(),
                    model_file:new FormData($("#model_file")[0])
                }
                $.ajax({
                    data:data,
                    url:"",
                    success:function(res){

                    },
                    error:function(err){

                    }
                })
            })
        },
        setActiveTab:function(name='home'){
            $("#navbarCollapse .nav-item").removeClass("active");
            $("main>.tab-pane").addClass("fade");
            $("#"+name).removeClass("fade");
            $(".nav-link[href='#"+name+"']").parent().addClass('active');
            if(name=='gallery'){
                Self.initGalleryPage()
            }else if(name=='admin'){
                Self.initAdminPage()
            }
            
        },
        getGalleryList:function(num=Self.data_store.listCount){
            $(".more_place").hide();
            $.ajax({
                url:"",
                data:{
                    num:num
                },
                dataType:JSON,
                method:"post",
                success:function(res){
                    Self.renderDataToGalleryList(res)
                },
                error:function(err){
                    console.log(err)
                }
            })
        },
        renderDataToGalleryList:function(res){
            res.data.map((item,index)=>{
                $("#home_gallery_list").append(
                    `<div class='col-md-3 col-sm-6 col-xs-6 home_gallery_item align_center' data-id='${item.id}'>
                        <img src="${item.img_url}" alt="" />
                        <div class=''>${item.name}</div>
                    </div>`
                )
            });
            $(".home_gallery_item").off("click").on("click",function(e){
                var id = $(e.currentTarget).attr("data-id");
                Self.getGalleryById(id);
            })
            $(".more_place").show();
            //if show more button
            if(res.more){
                $(".more_place").remove();
            }
            
        },
        getGalleryById:function(id){
            $.ajax({
                data:{
                    id:id
                },
                url:"",
                method:"post",
                dataType:'JSON',
                success:function(res){
                    Self.renderDataToGallery(res.data)
                },
                error:function(err){
                    console.log(err)
                }
            })
        },
        renderDataToGallery:function(data){

            setActiveTab("gallery")
        },
        initGalleryPage:function(){
            $.ajax({
                url:"",
                dataType:"json",
                method:"get",
                success:function(res){
                    Self.renderDataToGalleryPage(res.data)
                },
                error:function(err){

                }
            })
            
        },
        renderDataToGalleryPage:function(data){
            $(".multiple-items").empty()
            data.map((item,index)=>{
                $(".multiple-items").append(`<div><img class='gallery_item' src='${item.url}' alt='' data_id='${item.id}'/></div>`)
            })
            $('.multiple-items').not('.slick-initialized').slick({
                dots: true,
                infinite: false,
                speed: 300,
                slidesToShow: 4,
                slidesToScroll: 4,
                responsive: [
                    {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3,
                        infinite: true,
                        dots: true,
                        arrows: true,
                    }
                    },
                    {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 2
                    }
                    },
                    {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1
                    }
                    }
                    // You can unslick at a given breakpoint now by adding:
                    // settings: "unslick"
                    // instead of a settings object
                ]
              });

              $(".gallery_item").off("click").on("click",function(e){
                  var id= $(e.currentTarget).attr("data_id");
                    // do something after click the item
              })
        },
        initAdminPage:function(){
            Self.getAdminData()
        },
        getAdminData:function(){
            $.ajax({
                url:"xxx",
                method:"get",
                dataType:'JSON',
                success:function(res){
                    Self.renderAdminData(res.data)
                },
                error:function(err){
                    Self.renderAdminData({})

                    console.log(err)
                }
            })
        },
        renderAdminData:function(data){
            data = [
                {
                    id:"1",
                    description:"123"
                },
                {
                    id:'2',
                    description:"321"
                }
            ]
            var dataTableOption = {
                dom: '<"top"<"pull-left"l><"pull-right"f><"pull-right create">>rt<"bottom"<"pull-left"i><"pull-right"p>><"clear">',
                iDisplayLength: 10,
                bAutoWidth: false,
                responsive: true,
                bSort: true,
                bFilterOnEnter: true,
                processing: false,
                searching:false,
                lengthChangeOption:false,
                info:false
              };

              dataTableOption.columns = [{
                  "data": "id",
                  "width": '20%',
                  render: function (data, type, full) {
                    return data
                  }
                },
                {
                  "data": "description",
                  "width": '40%',
                  render: function (data, type, full) {
                    return data
                  }
                },
                {
                  "data": "id",
                  "width": '40%',
                  render: function (data, type, full) {
                    return `<div data_id='${data}'>
                        <span class='update_admin border-right border-dark'>Update</span><span class='delete_admin'>Delete</span>
                    </div>`
                  }
                }
              ]
              dataTableOption.data = data;
              $("#admin_table").DataTable().destroy();
              $("#admin_table").DataTable(dataTableOption);
              $(".update_admin").off("click").on("click",function(e){
                var id=$(e.currentTarget).parent().attr("data_id")
              });
              $(".delete_admin").off("click").on("click",function(e){
                var id=$(e.currentTarget).parent().attr("data_id")
              })
        }

    };
    Self.init();
})