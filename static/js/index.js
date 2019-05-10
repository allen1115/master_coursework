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
                if(target=='gallery'){
                    setTimeout(function(){
                        $(".gallery_item").eq(0).trigger("click")
                    },500) 
                }
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
                    model_image:new FormData($("#model_image")[0]),
                    model_video:new FormData($("#model_video")[0]),
                    model_x3d:new FormData($("#model_x3d")[0]),   
                    model_texture:new FormData($("#model_texture")[0]),   
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
            // edit model
            $("#edit_model").off("click").on("click",function(){
                
                Self.updateVase({
                    id:Self.data_store.update_id,
                    description:$("#new_model_des").val()
                })
            })

            $("#gallery_button_group div").off("click").on("click",function(e){
                var name = $(e.currentTarget).attr("id");
                
            })
            $("#gallery_view_dropdown button").off("click").on("click",function(e){
                $("#gallery_view_dropdown button").removeClass("active");
                $(e.currentTarget).addClass("active");
            })
        },
        setActiveTab:function(name='home'){
            $("#navbarCollapse .nav-item").removeClass("active");
            $("main>.tab-pane").addClass("fade");
            $("#"+name).removeClass("fade");
            $(".nav-link[href='#"+name+"']").parent().addClass('active');
            if(name=='gallery'){
                Self.initGalleryPage();
                $('#gallery_dropdown div.dropdown-item:first').tab('show')
            }else if(name=='admin'){
                Self.initAdminPage()
            }            
        },
        getGalleryList:function(num=Self.data_store.listCount){
            $(".more_place").hide();
            $.ajax({
                url:"museum/findAll",
                dataType:'JSON',
                method:"get",
                success:function(res){
                    Self.renderDataToGalleryList(res)
                },
                error:function(err){
                    console.log(err)
                }
            })
        },
        renderDataToGalleryList:function(res){
            $("#home_gallery_list").empty();
            res.map((item,index)=>{
                $("#home_gallery_list").append(
                    `<div class='col-md-3 col-sm-6 col-xs-6 home_gallery_item align_center' data-id='${item.id}'>
                        <img src="${item.img}" alt="" class='w-100' />
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
            if(res.length<=Self.data_store.listCount){
                $(".more_place").remove();
            }
            
        },
        getGalleryById:function(id){
            $.ajax({
                url:"museum/findOne/" + id,
                method:"get",
                dataType:'JSON',
                success:function(res){
                    $("#gallery_view_dropdown button").removeClass("active");
                    Self.renderDataToGallery(res)
                },
                error:function(err){
                    console.log(err)
                }
            })
        },
        renderDataToGallery:function(res){
            Self.setActiveTab("gallery");
            $("#3d_model").attr("url", res.x3d);
            $('#d3_text').html(res.description);
            $('#gallery_img').attr('src', res.img);
            $('#gallery_video').attr('src', res.video);
        },
        initGalleryPage:function(){
            $.ajax({
                url:"museum/findAll",
                dataType:"json",
                method:"get",
                success:function(res){
                    Self.renderDataToGalleryPage(res)
                },
                error:function(err){

                }
            })
            
        },
        renderDataToGalleryPage:function(data){
            $("#multiple_box").empty()
            $("#multiple_box").append('<div class="multiple-items"></div>')
            data.map((item,index)=>{
                $(".multiple-items").append(`<div><img class='gallery_item w-100' src='${item.img}' alt='' data_id='${item.id}'/></div>`)
            })
            $('.multiple-items').not('.slick-initialized').slick({
                dots: true,
                infinite: false,
                speed: 300,
                slidesToShow: 4,
                slidesToScroll: 4,
                verticalSwiping:true,
                vertical:$(document).width()<768?false:true,
                responsive: [
                    {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3,
                        infinite: true,
                        arrows: true,
                    }
                    },
                    {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 2,
                        
                        arrows: false,
                    }
                    },
                    {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        
                        arrows: false,
                    }
                    }
                    // You can unslick at a given breakpoint now by adding:
                    // settings: "unslick"
                    // instead of a settings object
                ]
            });

            $(".gallery_item").off("click").on("click",function(e){
                var id= $(e.currentTarget).attr("data_id");
                $.ajax({
                url:"museum/findOne/" + id,
                method:"get",
                dataType:'JSON',
                success:function(res){
                    $("#gallery_view_dropdown .button").removeClass("active");
                    $("#3d_model").attr("url", res.x3d);
                    $('#d3_text').html(res.description);
                    $('#gallery_img').attr('src', res.img);
                    $('#gallery_video').attr('src', res.video);
                    
                },
                error:function(err){
                }
            })
            })
        },
        initAdminPage:function(){
            Self.getAdminData()
        },
        getAdminData:function(){
            $.ajax({
                url:"museum/findAll",
                method:"get",
                dataType:'JSON',
                success:function(res){
                    Self.renderAdminData(res)
                },
                error:function(err){
                    Self.renderAdminData({})

                    console.log(err)
                }
            })
        },
        renderAdminData:function(data){
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
                info:false,
                
              };

              dataTableOption.columns = [{
                  "data": "name",
                  "width": '10%',
                  render: function (data, type, full) {
                    return data
                  }
                },
                {
                  "data": "description",
                  "width": '80%',
                  render: function (data, type, full) {
                    return data
                  }
                },
                {
                  "data": "id",
                  "width": '10%',
                  render: function (data, type, full) {
                    return `<div data_id='${data}'>
                        <span class='update_admin border-right border-dark'>Edit</span><span class='delete_admin'>Delete</span>
                    </div>`
                  }
                }
              ]
              dataTableOption.data = data;
              $("#admin_table").DataTable().destroy();
              $("#admin_table").DataTable(dataTableOption);
              $(".update_admin").off("click").on("click",function(e){
                var id=$(e.currentTarget).parent().attr("data_id")
                Self.data_store.update_id = id;
                $("#editModel").modal("show")
              });
              $(".delete_admin").off("click").on("click",function(e){
                var id=$(e.currentTarget).parent().attr("data_id")
                Self.deleteVase(id)
              })
        },
        updateVase:function(param){
            $.ajax({
                url:"museum/update",
                method:"post",
                dataType:'JSON',
                data: param,
                success:function(res){
                    $("#editModel").modal("hide")
                    Self.getAdminData();
                },
                error:function(err){
                    Self.getAdminData();
                }
            })
        },
        deleteVase:function(id){
            $.ajax({
                url:"museum/delete",
                method:"post",
                data: {id: id},
                dataType:'JSON',
                success:function(res){
                    Self.getAdminData();
                },
                error:function(err){
                    Self.getAdminData();
                }
            })
        }

    };
    Self.init();
})