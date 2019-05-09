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
                    model_image:new FormData($("#model_image")[0]),
                    model_video:new FormData($("#model_video")[0]),
                    model_x3d:new FormData($("#model_x3d")[0]),   
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

            $("#gallery_button_group div").off("click").on("click",function(e){
                var name = $(e.currentTarget).attr("id");
                
            })
        },
        setActiveTab:function(name='home'){
            $("#navbarCollapse .nav-item").removeClass("active");
            $("main>.tab-pane").addClass("fade");
            $("#"+name).removeClass("fade");
            $(".nav-link[href='#"+name+"']").parent().addClass('active');
            if(name=='gallery'){
                Self.initGalleryPage();
                $('#tab_header div:first').tab('show')
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
            res.map((item,index)=>{
                $("#home_gallery_list").append(
                    `<div class='col-md-3 col-sm-6 col-xs-6 home_gallery_item align_center' data-id='${item.id}'>
                        <img src="${item.img}" alt="" />
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
                url:"xxx",
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
            $(".multiple-items").empty()
            data.map((item,index)=>{
                $(".multiple-items").append(`<div><img class='gallery_item' src='${item.img}' alt='' data_id='${item.id}'/></div>`)
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
                  $.ajax({
                    url:"museum/findOne/" + id,
                    method:"get",
                    dataType:'JSON',
                    success:function(res){
                        $("#3d_model").attr("url", res.x3d);
                        $('#3d_text').html(res.description);
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
                info:false
              };

              dataTableOption.columns = [{
                  "data": "name",
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
                const param = {
                    id: id,
                    description: $('#description').val()
                }
                Self.updateVase(param);
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